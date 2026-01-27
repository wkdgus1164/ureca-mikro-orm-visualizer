"use client"

/**
 * AI 채팅 상태 관리 훅
 *
 * Vercel AI SDK의 useChat를 래핑하여 에디터 상태와 연동
 */

import { useState, useMemo, useCallback, useRef, useEffect, useLayoutEffect, type FormEvent } from "react"
import { useChat as useAIChat } from "@ai-sdk/react"
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithToolCalls } from "ai"
import { useEditorContext } from "@/components/providers/editor-provider"
import { useToolExecutor } from "@/hooks/use-tool-executor"
import type { AskUserPendingData, AskUserOption } from "@/types/chat"

/**
 * askUser Tool 입력 타입
 */
interface AskUserInput {
  question: string
  type: "text" | "single-choice" | "multiple-choice"
  options?: AskUserOption[]
  defaultValue?: string
}

/**
 * 대기 중인 질문 상태
 */
export type PendingQuestion = AskUserPendingData

/**
 * useChat 옵션
 */
export interface UseChatOptions {
  /** 스레드 ID (스레드별 분리) */
  threadId?: string | null
  /** 초기 메시지 */
  initialMessages?: unknown[]
  /** 메시지 변경 시 콜백 */
  onMessagesChange?: (messages: unknown[]) => void
}

/**
 * AI 채팅 훅 반환 타입
 */
export interface UseChatReturn {
  /** 채팅 메시지 목록 */
  messages: ReturnType<typeof useAIChat>["messages"]
  /** 입력 값 */
  input: string
  /** 입력 값 설정 */
  setInput: (value: string) => void
  /** 폼 제출 핸들러 */
  handleSubmit: (e?: FormEvent) => void
  /** 로딩 상태 */
  isLoading: boolean
  /** 에러 */
  error: Error | undefined
  /** 스트리밍 중단 */
  stop: () => void
  /** 마지막 메시지 재요청 */
  reload: () => void
  /** 대기 중인 질문 (HITL) */
  pendingQuestion: PendingQuestion | null
  /** 질문에 응답 */
  answerQuestion: (response: string | string[]) => void
}

// 모듈 레벨에서 transport 인스턴스 생성 (렌더링 외부)
const transport = new DefaultChatTransport({
  api: "/api/chat",
})

/**
 * AI 채팅 상태 관리 훅
 *
 * AI SDK의 useChat를 래핑하여 다이어그램 상태 전송 및 Tool 실행 처리
 */
export function useChat(options: UseChatOptions = {}): UseChatReturn {
  const { threadId, initialMessages, onMessagesChange } = options
  const editor = useEditorContext()
  const { executeTool } = useToolExecutor()

  // 대기 중인 질문 상태 (HITL)
  const [pendingQuestion, setPendingQuestion] = useState<PendingQuestion | null>(null)
  // ref로 동기적 추적 (sendAutomaticallyWhen에서 사용)
  const pendingQuestionRef = useRef<PendingQuestion | null>(null)
  // 방금 질문에 답변했는지 추적 (수동 continuation 트리거용)
  const justAnsweredRef = useRef<boolean>(false)
  // sendAutomaticallyWhen 블로킹 (askUser 응답 후 수동 처리를 위해)
  const blockAutoSendRef = useRef<boolean>(false)

  // input 상태를 로컬에서 관리 (AI SDK 6.x에서 input이 없어짐)
  const [input, setInput] = useState("")

  // 스레드 변경 추적용 ref
  const prevThreadIdRef = useRef(threadId)
  const initialMessagesAppliedRef = useRef(false)

  // 안정적인 chat ID 관리
  // - 새 대화는 undefined로 시작
  // - 기존 스레드로 전환 시에만 해당 스레드 ID 사용
  // - 대화 중 스레드가 자동 생성되어도 chat ID는 변경하지 않음
  const [stableChatId, setStableChatId] = useState<string | undefined>(
    threadId ?? undefined
  )
  // 명시적 스레드 전환 여부 추적 (null에서 값으로 바뀌는 것은 무시)
  const isExplicitSwitchRef = useRef(false)

  // 현재 다이어그램 상태를 body로 전달하기 위한 메모이제이션
  const currentDiagram = useMemo(
    () => ({
      nodes: editor.nodes,
      edges: editor.edges,
    }),
    [editor.nodes, editor.edges]
  )

  const chat = useAIChat({
    // 안정적인 chat ID 사용 (대화 중 변경 방지)
    id: stableChatId,
    transport,
    // Tool 실행 완료 후 자동으로 대화 계속 (멀티스텝 Tool 호출)
    // 단, pendingQuestion이 있으면 자동 전송하지 않음
    sendAutomaticallyWhen: ({ messages }) => {
      // ref를 사용하여 동기적으로 체크 - 대기 중인 질문이 있으면 전송 안함
      if (pendingQuestionRef.current) return false

      // askUser 응답 후 수동 처리를 위해 블로킹
      if (blockAutoSendRef.current) return false

      // 기본 조건 체크
      const shouldContinue = lastAssistantMessageIsCompleteWithToolCalls({ messages })

      // 디버그: 개발 환경에서만 로깅
      if (process.env.NODE_ENV === "development" && messages.length > 0) {
        const lastMsg = messages[messages.length - 1]
        if (lastMsg.role === "assistant") {
          console.log("[sendAutomaticallyWhen]", {
            shouldContinue,
            hasPendingQuestion: !!pendingQuestionRef.current,
            blockAutoSend: blockAutoSendRef.current,
            lastMessageParts: lastMsg.parts?.map((p) => ({
              type: p.type,
              hasResult: "result" in p,
            })),
          })
        }
      }

      return shouldContinue
    },
    onToolCall: ({ toolCall }) => {
      // dynamic 체크로 TypeScript 타입 안전성 확보
      if (toolCall.dynamic) return

      // askUser Tool은 특별 처리 (HITL)
      if (toolCall.toolName === "askUser") {
        const input = toolCall.input as AskUserInput
        const question: PendingQuestion = {
          toolCallId: toolCall.toolCallId,
          question: input.question,
          type: input.type,
          options: input.options,
          defaultValue: input.defaultValue,
        }
        // ref와 state 모두 업데이트
        pendingQuestionRef.current = question
        setPendingQuestion(question)
        // addToolResult를 호출하지 않음 - 사용자 응답 대기
        return
      }

      // 일반 Tool 실행을 useToolExecutor에 위임
      const result = executeTool(toolCall.toolName, toolCall.input)

      // AI SDK 6.x에서는 addToolResult를 사용하여 결과 전달
      chat.addToolResult({
        tool: toolCall.toolName,
        toolCallId: toolCall.toolCallId,
        output: result,
      })
    },
  })

  // 스레드 변경 시 상태 초기화
  // 명시적 스레드 전환 시에만 chat ID 변경 (자동 생성은 무시)
  useLayoutEffect(() => {
    const prevId = prevThreadIdRef.current
    const newId = threadId

    if (prevId !== newId) {
      prevThreadIdRef.current = newId

      // 명시적 스레드 전환: 기존 스레드에서 다른 기존 스레드로 전환
      // (null -> 값: 자동 생성이므로 무시, 값 -> 다른 값: 명시적 전환)
      const isExplicitSwitch = prevId !== null && prevId !== undefined && newId !== null && newId !== undefined
      // 또는 값 -> null: 새 대화 시작 (명시적)
      const isNewConversation = (prevId !== null && prevId !== undefined) && (newId === null || newId === undefined)

      if (isExplicitSwitch || isNewConversation) {
        isExplicitSwitchRef.current = true
        initialMessagesAppliedRef.current = false
        // ref 초기화
        pendingQuestionRef.current = null
        justAnsweredRef.current = false
        blockAutoSendRef.current = false
        // state 초기화 - 스레드 전환 시 필수
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPendingQuestion(null)
        // chat ID 변경
        setStableChatId(newId ?? undefined)
      }
      // null -> 값: 자동 생성된 스레드이므로 chat ID 유지
    }
  }, [threadId])

  // 초기 메시지 설정 (스레드 전환 시)
  useLayoutEffect(() => {
    if (initialMessages && initialMessages.length > 0 && !initialMessagesAppliedRef.current) {
      initialMessagesAppliedRef.current = true
      chat.setMessages(initialMessages as ReturnType<typeof useAIChat>["messages"])
    }
  }, [initialMessages, chat])

  // 질문에 응답 (HITL)
  const answerQuestion = useCallback(
    (response: string | string[]) => {
      const question = pendingQuestionRef.current
      if (!question) return

      // ref 초기화
      pendingQuestionRef.current = null
      // 자동 전송 블로킹 (수동으로 sendMessage 호출하기 위해)
      blockAutoSendRef.current = true
      justAnsweredRef.current = true
      setPendingQuestion(null)

      // Tool 결과 전달
      chat.addToolResult({
        tool: "askUser",
        toolCallId: question.toolCallId,
        output: {
          type: "askUserResponse",
          data: {
            question: question.question,
            response,
          },
        },
      })
    },
    [chat]
  )

  // askUser 응답 후 대화 계속이 자동으로 되지 않을 때 수동 트리거
  useEffect(() => {
    // 방금 답변한 경우에만 체크
    if (!justAnsweredRef.current) return

    // 상태가 streaming/submitted면 이미 처리 중이므로 플래그 리셋하고 종료
    if (chat.status === "streaming" || chat.status === "submitted") {
      justAnsweredRef.current = false
      blockAutoSendRef.current = false
      return
    }

    // ready가 아니면 대기
    if (chat.status !== "ready") return

    // 대기 중인 질문이 있으면 처리 안함
    if (pendingQuestionRef.current) return

    // 조건 확인: 모든 tool call에 결과가 있는지
    const shouldContinue = lastAssistantMessageIsCompleteWithToolCalls({
      messages: chat.messages,
    })

    if (process.env.NODE_ENV === "development") {
      console.log("[useEffect continuation check]", {
        justAnswered: justAnsweredRef.current,
        blockAutoSend: blockAutoSendRef.current,
        status: chat.status,
        shouldContinue,
        messageCount: chat.messages.length,
      })
    }

    // 조건이 충족되면 수동으로 대화 계속
    if (shouldContinue) {
      // 딜레이 후 상태 재확인 및 sendMessage 호출
      const timer = setTimeout(() => {
        // 여전히 ready 상태이고 플래그가 설정되어 있으면 수동 처리
        if (chat.status === "ready" && justAnsweredRef.current) {
          justAnsweredRef.current = false
          blockAutoSendRef.current = false
          if (process.env.NODE_ENV === "development") {
            console.log("[Manual continuation triggered via sendMessage]")
          }
          // sendMessage로 새 대화 턴 시작
          chat.sendMessage(
            { text: "[계속]" },
            {
              body: {
                currentDiagram,
                _continuation: true,
              },
            }
          )
        }
      }, 200)

      return () => clearTimeout(timer)
    }
  }, [chat.status, chat.messages, chat, currentDiagram])

  // 메시지 변경 시 콜백 호출 (로컬 스토리지 저장용)
  const prevMessagesLengthRef = useRef(0)
  useEffect(() => {
    // 메시지 수가 변경되었을 때만 저장 (불필요한 저장 방지)
    if (chat.messages.length !== prevMessagesLengthRef.current) {
      prevMessagesLengthRef.current = chat.messages.length
      onMessagesChange?.(chat.messages)
    }
  }, [chat.messages, onMessagesChange])

  // 폼 제출 핸들러 (AI SDK 6.x에서는 sendMessage 사용, body로 다이어그램 상태 전달)
  const handleSubmit = (e?: FormEvent) => {
    e?.preventDefault()
    if (input.trim()) {
      chat.sendMessage(
        { text: input },
        {
          body: {
            currentDiagram,
          },
        }
      )
      setInput("")
    }
  }

  // status 기반 isLoading 계산
  const isLoading = chat.status === "submitted" || chat.status === "streaming"

  return {
    messages: chat.messages,
    input,
    setInput,
    handleSubmit,
    isLoading,
    error: chat.error,
    stop: chat.stop,
    reload: chat.regenerate,
    pendingQuestion,
    answerQuestion,
  }
}
