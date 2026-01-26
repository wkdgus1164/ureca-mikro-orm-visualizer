"use client"

/**
 * AI 채팅 패널 컴포넌트
 *
 * AI Elements 컴포넌트들을 최대한 활용:
 * - Message, MessageContent: 메시지 말풍선
 * - MessageResponse: Streamdown 마크다운 렌더링
 * - Conversation, ConversationContent, ConversationEmptyState: 대화 컨테이너
 * - Loader: 로딩 인디케이터
 * - PromptInput 계열: 입력 영역
 *
 * 스레드 관리:
 * - 로컬 스토리지에 채팅 히스토리 저장
 * - 새 스레드 생성 및 전환
 */

import { useMemo, useCallback } from "react"
import {
  MessageSquare,
  AlertCircle,
  Wrench,
  RefreshCw,
  CheckCircle2,
  Plus,
  History,
  Trash2,
  ChevronDown,
} from "lucide-react"
import { useChat } from "@/hooks/use-chat"
import { useChatThreads } from "@/hooks/use-chat-threads"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// AI Elements 컴포넌트들
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
} from "@/components/ai-elements/conversation"
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message"
import { Loader } from "@/components/ai-elements/loader"
import {
  PromptInput,
  PromptInputBody,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputTools,
  PromptInputSubmit,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input"

import { ToolResult } from "./tool-result"
import { QuestionPrompt } from "./question-prompt"
import type { ToolResult as ToolResultType } from "@/types/chat"

/**
 * 렌더링 블록 타입
 */
type ChatBlock =
  | { type: "user"; id: string; text: string }
  | { type: "assistant-text"; id: string; text: string }
  | { type: "tool-call"; id: string; toolName: string; state: "call" | "result"; result?: ToolResultType }
  | { type: "tool-group"; id: string; tools: Array<{ toolName: string; state: "call" | "result"; result?: ToolResultType; toolCallId: string }> }

/**
 * 메시지 part 타입 (AI SDK 6.x 호환)
 */
interface MessagePart {
  type: string
  text?: string
  toolName?: string
  toolCallId?: string
  state?: string
  output?: unknown
  result?: unknown
  input?: unknown
  [key: string]: unknown
}

interface ChatMessage {
  id: string
  role: string
  parts?: MessagePart[]
  content?: string
}

/**
 * 메시지에서 텍스트 추출
 */
function getMessageText(message: ChatMessage): string {
  if (message.parts && message.parts.length > 0) {
    return message.parts
      .filter((p) => p.type === "text")
      .map((p) => p.text ?? "")
      .join("")
  }
  if (message.content) {
    return message.content
  }
  return ""
}

/**
 * 메시지를 렌더링 블록으로 변환
 */
function messagestoBlocks(messages: ChatMessage[]): ChatBlock[] {
  const blocks: ChatBlock[] = []

  messages.forEach((message) => {
    if (message.role === "user") {
      const text = getMessageText(message)
      if (text === "[계속]") return
      if (text) {
        blocks.push({ type: "user", id: `${message.id}-user`, text })
      }
    } else if (message.role === "assistant") {
      if (message.parts && message.parts.length > 0) {
        let currentTextParts: string[] = []

        message.parts.forEach((part, partIndex) => {
          if (part.type === "text" && part.text) {
            currentTextParts.push(part.text)
          } else if (part.type?.startsWith("tool-") || part.type === "dynamic-tool") {
            if (currentTextParts.length > 0) {
              const text = currentTextParts.join("")
              if (text.trim()) {
                blocks.push({
                  type: "assistant-text",
                  id: `${message.id}-text-${partIndex}`,
                  text,
                })
              }
              currentTextParts = []
            }

            const toolName = part.toolName ?? part.type?.replace("tool-", "") ?? "Tool"
            const hasResult = part.state === "output-available" || part.state === "error" || part.state === "result"
            const toolOutput = (part.output ?? part.result) as ToolResultType | undefined

            blocks.push({
              type: "tool-call",
              id: `${message.id}-tool-${part.toolCallId ?? partIndex}`,
              toolName: String(toolName),
              state: hasResult ? "result" : "call",
              result: toolOutput,
            })
          }
        })

        if (currentTextParts.length > 0) {
          const text = currentTextParts.join("")
          if (text.trim()) {
            blocks.push({
              type: "assistant-text",
              id: `${message.id}-text-final`,
              text,
            })
          }
        }
      } else if (message.content) {
        blocks.push({
          type: "assistant-text",
          id: `${message.id}-text`,
          text: message.content,
        })
      }
    }
  })

  return blocks
}

/**
 * AI 채팅 패널
 */
export function ChatPanel() {
  const {
    threads,
    currentThreadId,
    initialMessages,
    createThread,
    switchThread,
    deleteThread,
    saveMessages,
  } = useChatThreads()

  const handleMessagesChange = useCallback(
    (messages: unknown[]) => {
      saveMessages(messages)
    },
    [saveMessages]
  )

  const {
    messages,
    input,
    setInput,
    handleSubmit,
    isLoading,
    error,
    stop,
    reload,
    pendingQuestion,
    answerQuestion,
  } = useChat({
    threadId: currentThreadId,
    initialMessages,
    onMessagesChange: handleMessagesChange,
  })

  const currentThread = threads.find((t) => t.id === currentThreadId)
  const handleNewThread = useCallback(() => createThread(), [createThread])
  const blocks = useMemo(() => messagestoBlocks(messages as ChatMessage[]), [messages])

  // PromptInput onSubmit 핸들러 (AI Elements 인터페이스 호환)
  const handlePromptSubmit = useCallback(
    (_message: PromptInputMessage, event: React.FormEvent<HTMLFormElement>) => {
      handleSubmit(event)
    },
    [handleSubmit]
  )

  return (
    <div className="flex flex-col h-full">
      {/* 스레드 헤더 */}
      <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/30">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs font-normal max-w-[160px]"
            >
              <History className="h-3 w-3 mr-1.5 shrink-0" />
              <span className="truncate">
                {currentThread?.title ?? "새 대화"}
              </span>
              <ChevronDown className="h-3 w-3 ml-1 shrink-0 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            {threads.length === 0 ? (
              <div className="px-2 py-1.5 text-xs text-muted-foreground">
                저장된 대화가 없습니다
              </div>
            ) : (
              threads.map((thread) => (
                <DropdownMenuItem
                  key={thread.id}
                  className="flex items-center justify-between group"
                  onSelect={() => switchThread(thread.id)}
                >
                  <span className="truncate text-xs">{thread.title}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 opacity-0 group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteThread(thread.id)
                    }}
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </DropdownMenuItem>
              ))
            )}
            {threads.length > 0 && <DropdownMenuSeparator />}
            <DropdownMenuItem onSelect={handleNewThread}>
              <Plus className="h-3 w-3 mr-1.5" />
              <span className="text-xs">새 대화 시작</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={handleNewThread}
          title="새 대화"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* 메시지 영역 - AI Elements Conversation */}
      <Conversation className="flex-1 min-h-0">
        <ConversationContent className="p-3 gap-3">
          {blocks.length === 0 && !pendingQuestion ? (
            <ConversationEmptyState
              icon={<MessageSquare className="h-10 w-10" />}
              title="AI에게 다이어그램 설계를 요청하세요"
              description={`"User와 Post 엔티티를 만들어줘"\n"OneToMany 관계로 연결해줘"`}
            />
          ) : (
            <>
              {blocks.map((block) => (
                <ChatBlockItem key={block.id} block={block} />
              ))}

              {/* HITL 질문 */}
              {pendingQuestion && (
                <QuestionPrompt
                  question={pendingQuestion}
                  onAnswer={answerQuestion}
                />
              )}

              {/* 로딩 - AI Elements Loader */}
              {isLoading && !pendingQuestion && (
                <div className="flex items-center gap-2 text-muted-foreground text-xs pl-8">
                  <Loader size={14} />
                  <span>AI가 응답 중...</span>
                </div>
              )}

              {/* 에러 */}
              {error && (
                <div className="flex items-center gap-2 p-2 bg-destructive/10 rounded text-xs text-destructive ml-8">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  <span className="flex-1">{error.message}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={reload}
                    className="h-6 px-2 text-xs"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    다시 시도
                  </Button>
                </div>
              )}
            </>
          )}
        </ConversationContent>
      </Conversation>

      {/* 입력 영역 - AI Elements PromptInput */}
      <div className="border-t p-3">
        {pendingQuestion ? (
          <div className="text-center text-xs text-muted-foreground py-2">
            위의 질문에 답변해주세요
          </div>
        ) : (
          <PromptInput onSubmit={handlePromptSubmit}>
            <PromptInputBody>
              <PromptInputTextarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="다이어그램 설계를 요청하세요..."
                className="min-h-[60px] max-h-[120px] text-sm"
                disabled={isLoading}
              />
            </PromptInputBody>
            <PromptInputFooter>
              <PromptInputTools>
                <span className="text-[10px] text-muted-foreground">
                  Shift+Enter로 줄바꿈
                </span>
              </PromptInputTools>
              <PromptInputSubmit
                status={isLoading ? "streaming" : "ready"}
                onStop={stop}
                className="h-7 px-3 text-xs"
              />
            </PromptInputFooter>
          </PromptInput>
        )}
      </div>
    </div>
  )
}

/**
 * 개별 블록 렌더링
 */
function ChatBlockItem({ block }: { block: ChatBlock }) {
  switch (block.type) {
    case "user":
      return (
        <Message from="user">
          <MessageContent>
            <p className="whitespace-pre-wrap">{block.text}</p>
          </MessageContent>
        </Message>
      )

    case "assistant-text":
      return (
        <Message from="assistant">
          <MessageContent>
            <MessageResponse className="text-sm [&_pre]:text-xs [&_code]:text-xs">
              {block.text}
            </MessageResponse>
          </MessageContent>
        </Message>
      )

    case "tool-call":
      return (
        <ToolCallBlock
          toolName={block.toolName}
          state={block.state}
          result={block.result}
        />
      )

    case "tool-group":
      return (
        <div className="space-y-2">
          {block.tools.map((tool) => (
            <ToolCallBlock
              key={tool.toolCallId}
              toolName={tool.toolName}
              state={tool.state}
              result={tool.result}
            />
          ))}
        </div>
      )

    default:
      return null
  }
}

/**
 * Tool 호출 블록
 */
function ToolCallBlock({
  toolName,
  state,
  result,
}: {
  toolName: string
  state: "call" | "result"
  result?: ToolResultType
}) {
  const displayName = getToolDisplayName(toolName)

  if (result?.type === "askUserResponse") {
    return (
      <div className="ml-8 space-y-1">
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <CheckCircle2 className="h-2.5 w-2.5 text-green-500" />
          <span>{displayName} 완료</span>
        </div>
        <ToolResult result={result} />
      </div>
    )
  }

  if (state === "call") {
    return (
      <div className="ml-8 py-1">
        <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 rounded-full px-2.5 py-1">
          <Loader size={12} />
          <Wrench className="h-3 w-3" />
          <span>{displayName}</span>
          <span className="text-muted-foreground/70">실행 중...</span>
        </div>
      </div>
    )
  }

  if (state === "result" && result) {
    if (result.type === "error") {
      return (
        <div className="ml-8 space-y-1">
          <div className="flex items-center gap-1.5 text-[10px] text-destructive">
            <AlertCircle className="h-2.5 w-2.5" />
            <span>{displayName} 실패</span>
          </div>
          <ToolResult result={result} />
        </div>
      )
    }

    return (
      <div className="ml-8 space-y-1">
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <CheckCircle2 className="h-2.5 w-2.5 text-green-500" />
          <span>{displayName} 완료</span>
        </div>
        <ToolResult result={result} />
      </div>
    )
  }

  return null
}

/**
 * Tool 이름 변환
 */
function getToolDisplayName(toolName: string): string {
  const names: Record<string, string> = {
    addEntity: "Entity 추가",
    updateEntity: "Entity 수정",
    deleteEntity: "Entity 삭제",
    addEmbeddable: "Embeddable 추가",
    updateEmbeddable: "Embeddable 수정",
    deleteEmbeddable: "Embeddable 삭제",
    addEnum: "Enum 추가",
    updateEnum: "Enum 수정",
    deleteEnum: "Enum 삭제",
    addInterface: "Interface 추가",
    updateInterface: "Interface 수정",
    deleteInterface: "Interface 삭제",
    addProperty: "Property 추가",
    updateProperty: "Property 수정",
    deleteProperty: "Property 삭제",
    addRelationship: "관계 추가",
    updateRelationship: "관계 수정",
    deleteRelationship: "관계 삭제",
    addEnumMapping: "Enum 매핑",
    deleteEnumMapping: "Enum 매핑 해제",
    clearDiagram: "다이어그램 초기화",
    getDiagramSummary: "다이어그램 요약",
    generateCode: "코드 생성",
    previewCode: "코드 미리보기",
    askUser: "사용자 확인",
  }
  return names[toolName] ?? toolName
}
