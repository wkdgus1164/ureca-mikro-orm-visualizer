"use client"

/**
 * 채팅 스레드 관리 훅
 *
 * 로컬 스토리지에 채팅 히스토리를 저장하고 스레드 관리
 */

import { useState, useCallback } from "react"
import { nanoid } from "nanoid"
import type { ChatThreadMeta } from "@/types/chat"

// 로컬 스토리지 키
const STORAGE_KEY_THREADS = "chat-threads"
const STORAGE_KEY_CURRENT = "chat-current-thread"

/**
 * 스레드 목록만 저장 (메시지 제외)
 */
function saveThreadsMeta(threads: ChatThreadMeta[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY_THREADS, JSON.stringify(threads))
}

/**
 * 스레드 목록 로드
 */
function loadThreadsMeta(): ChatThreadMeta[] {
  if (typeof window === "undefined") return []
  try {
    const data = localStorage.getItem(STORAGE_KEY_THREADS)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

/**
 * 개별 스레드 메시지 저장
 */
function saveThreadMessages(threadId: string, messages: unknown[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(`chat-thread-${threadId}`, JSON.stringify(messages))
}

/**
 * 개별 스레드 메시지 로드
 */
function loadThreadMessages(threadId: string): unknown[] {
  if (typeof window === "undefined") return []
  try {
    const data = localStorage.getItem(`chat-thread-${threadId}`)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

/**
 * 개별 스레드 메시지 삭제
 */
function deleteThreadMessages(threadId: string) {
  if (typeof window === "undefined") return
  localStorage.removeItem(`chat-thread-${threadId}`)
}

/**
 * 현재 스레드 ID 저장
 */
function saveCurrentThreadId(threadId: string | null) {
  if (typeof window === "undefined") return
  if (threadId) {
    localStorage.setItem(STORAGE_KEY_CURRENT, threadId)
  } else {
    localStorage.removeItem(STORAGE_KEY_CURRENT)
  }
}

/**
 * 현재 스레드 ID 로드
 */
function loadCurrentThreadId(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(STORAGE_KEY_CURRENT)
}

/**
 * 메시지에서 스레드 제목 추출
 */
function extractTitle(messages: unknown[]): string {
  if (messages.length === 0) return "새 대화"

  // 첫 번째 사용자 메시지에서 제목 추출
  const firstUserMsg = messages.find(
    (m) => (m as { role?: string }).role === "user"
  ) as { parts?: Array<{ type?: string; text?: string }> } | undefined

  if (firstUserMsg?.parts) {
    const textPart = firstUserMsg.parts.find((p) => p.type === "text")
    if (textPart?.text) {
      // "[계속]" 메시지 제외
      if (textPart.text === "[계속]") return "새 대화"
      // 30자로 제한
      const title = textPart.text.slice(0, 30)
      return title.length < textPart.text.length ? `${title}...` : title
    }
  }

  return "새 대화"
}

/**
 * 초기 상태 계산 (lazy initialization)
 */
function getInitialState(): {
  threads: ChatThreadMeta[]
  currentThreadId: string | null
  initialMessages: unknown[]
} {
  const savedThreads = loadThreadsMeta()
  const savedCurrentId = loadCurrentThreadId()

  if (savedCurrentId && savedThreads.some((t) => t.id === savedCurrentId)) {
    // 저장된 현재 스레드가 있으면 로드
    return {
      threads: savedThreads,
      currentThreadId: savedCurrentId,
      initialMessages: loadThreadMessages(savedCurrentId),
    }
  } else if (savedThreads.length > 0) {
    // 스레드가 있지만 현재 스레드가 없으면 가장 최근 스레드 선택
    const sorted = [...savedThreads].sort((a, b) => b.updatedAt - a.updatedAt)
    const mostRecent = sorted[0]
    saveCurrentThreadId(mostRecent.id)
    return {
      threads: savedThreads,
      currentThreadId: mostRecent.id,
      initialMessages: loadThreadMessages(mostRecent.id),
    }
  }

  return {
    threads: [],
    currentThreadId: null,
    initialMessages: [],
  }
}

export interface UseChatThreadsReturn {
  /** 스레드 목록 (메타데이터만) */
  threads: ChatThreadMeta[]
  /** 현재 스레드 ID */
  currentThreadId: string | null
  /** 현재 스레드의 초기 메시지 */
  initialMessages: unknown[]
  /** 새 스레드 생성 */
  createThread: () => string
  /** 스레드 전환 */
  switchThread: (threadId: string) => void
  /** 스레드 삭제 */
  deleteThread: (threadId: string) => void
  /** 현재 스레드 메시지 저장 */
  saveMessages: (messages: unknown[]) => void
  /** 스레드 제목 업데이트 */
  updateTitle: (threadId: string, title: string) => void
}

/**
 * 채팅 스레드 관리 훅
 */
export function useChatThreads(): UseChatThreadsReturn {
  // lazy initialization으로 초기값 계산 (SSR 안전)
  const [state, setState] = useState<{
    threads: ChatThreadMeta[]
    currentThreadId: string | null
    initialMessages: unknown[]
  }>(() => {
    // SSR에서는 빈 상태 반환
    if (typeof window === "undefined") {
      return { threads: [], currentThreadId: null, initialMessages: [] }
    }
    return getInitialState()
  })

  const { threads, currentThreadId, initialMessages } = state

  // 새 스레드 생성
  const createThread = useCallback(() => {
    const newThread: ChatThreadMeta = {
      id: nanoid(),
      title: "새 대화",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messageCount: 0,
    }

    setState((prev) => {
      const updated = [newThread, ...prev.threads]
      saveThreadsMeta(updated)
      saveCurrentThreadId(newThread.id)
      return {
        threads: updated,
        currentThreadId: newThread.id,
        initialMessages: [],
      }
    })

    return newThread.id
  }, [])

  // 스레드 전환
  const switchThread = useCallback((threadId: string) => {
    setState((prev) => {
      saveCurrentThreadId(threadId)
      return {
        ...prev,
        currentThreadId: threadId,
        initialMessages: loadThreadMessages(threadId),
      }
    })
  }, [])

  // 스레드 삭제
  const deleteThread = useCallback((threadId: string) => {
    setState((prev) => {
      const updated = prev.threads.filter((t) => t.id !== threadId)
      saveThreadsMeta(updated)
      deleteThreadMessages(threadId)

      // 삭제된 스레드가 현재 스레드면 다른 스레드로 전환
      if (threadId === prev.currentThreadId) {
        if (updated.length > 0) {
          const sorted = [...updated].sort((a, b) => b.updatedAt - a.updatedAt)
          const mostRecent = sorted[0]
          saveCurrentThreadId(mostRecent.id)
          return {
            threads: updated,
            currentThreadId: mostRecent.id,
            initialMessages: loadThreadMessages(mostRecent.id),
          }
        } else {
          saveCurrentThreadId(null)
          return {
            threads: [],
            currentThreadId: null,
            initialMessages: [],
          }
        }
      }

      return { ...prev, threads: updated }
    })
  }, [])

  // 현재 스레드 메시지 저장 (스레드가 없으면 자동 생성)
  const saveMessages = useCallback((messages: unknown[]) => {
    // 메시지가 없으면 저장하지 않음
    if (messages.length === 0) return

    setState((prev) => {
      // 스레드가 없으면 새로 생성
      if (!prev.currentThreadId) {
        const newThread: ChatThreadMeta = {
          id: nanoid(),
          title: extractTitle(messages),
          createdAt: Date.now(),
          updatedAt: Date.now(),
          messageCount: messages.length,
        }

        // 새 스레드에 메시지 저장
        saveThreadMessages(newThread.id, messages)
        const updated = [newThread, ...prev.threads]
        saveThreadsMeta(updated)
        saveCurrentThreadId(newThread.id)

        return {
          threads: updated,
          currentThreadId: newThread.id,
          initialMessages: messages,
        }
      }

      // 기존 스레드에 메시지 저장
      saveThreadMessages(prev.currentThreadId, messages)

      // 스레드 메타 업데이트
      const updated = prev.threads.map((t) =>
        t.id === prev.currentThreadId
          ? {
              ...t,
              title: extractTitle(messages),
              updatedAt: Date.now(),
              messageCount: messages.length,
            }
          : t
      )
      saveThreadsMeta(updated)

      return { ...prev, threads: updated }
    })
  }, [])

  // 스레드 제목 업데이트
  const updateTitle = useCallback((threadId: string, title: string) => {
    setState((prev) => {
      const updated = prev.threads.map((t) =>
        t.id === threadId ? { ...t, title } : t
      )
      saveThreadsMeta(updated)
      return { ...prev, threads: updated }
    })
  }, [])

  return {
    threads,
    currentThreadId,
    initialMessages,
    createThread,
    switchThread,
    deleteThread,
    saveMessages,
    updateTitle,
  }
}
