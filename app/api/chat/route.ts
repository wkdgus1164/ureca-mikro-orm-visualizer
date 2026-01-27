/**
 * AI 채팅 API 라우트
 *
 * Vercel AI SDK를 사용한 스트리밍 채팅 엔드포인트
 */

import { streamText, convertToModelMessages, type UIMessage } from "ai"
import { anthropic } from "@ai-sdk/anthropic"
import { diagramTools } from "@/lib/ai/tools"
import { generateSystemPrompt } from "@/lib/ai/system-prompt"
import type { FlowNode } from "@/hooks/use-nodes"
import type { FlowEdge } from "@/hooks/use-edges"

export const maxDuration = 30

interface ChatRequest {
  messages: UIMessage[]
  currentDiagram?: {
    nodes: FlowNode[]
    edges: FlowEdge[]
  }
  _continuation?: boolean
}

// 빈 다이어그램 기본값 (regenerate 시 body가 없을 때 사용)
const emptyDiagram = {
  nodes: [] as FlowNode[],
  edges: [] as FlowEdge[],
}

export async function POST(request: Request): Promise<Response> {
  try {
    const { messages, currentDiagram = emptyDiagram, _continuation } = (await request.json()) as ChatRequest

    // API 키 확인
    if (!process.env.ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({ error: "ANTHROPIC_API_KEY가 설정되지 않았습니다." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      )
    }

    // continuation인 경우 "[계속]" 메시지 필터링
    let processedMessages = messages
    if (_continuation && messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      // 마지막 메시지가 "[계속]"이면 제거
      if (lastMessage.role === "user") {
        const textPart = lastMessage.parts?.find(p => p.type === "text")
        if (textPart && "text" in textPart && textPart.text === "[계속]") {
          processedMessages = messages.slice(0, -1)
        }
      }
    }

    // UIMessage를 ModelMessage로 변환
    const modelMessages = await convertToModelMessages(processedMessages)

    const result = streamText({
      model: anthropic("claude-sonnet-4-20250514"),
      system: generateSystemPrompt(currentDiagram),
      messages: modelMessages,
      tools: diagramTools,
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error("Chat API error:", error)
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
