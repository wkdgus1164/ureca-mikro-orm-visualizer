"use client"

/**
 * Tool 실행 결과 시각화 컴포넌트
 */

import { Check, Link, AlertCircle, Box, Hash, FileCode, List, MessageCircle } from "lucide-react"
import type { ToolResult as ToolResultType } from "@/types/chat"

interface ToolResultProps {
  result: ToolResultType
}

/**
 * Tool 실행 결과를 시각적으로 표시
 */
export function ToolResult({ result }: ToolResultProps) {
  switch (result.type) {
    case "entityCreated":
    case "embeddableCreated":
    case "interfaceCreated": {
      const data = result.data as { name: string; propertyCount: number }
      const typeLabel =
        result.type === "entityCreated"
          ? "Entity"
          : result.type === "embeddableCreated"
            ? "Embeddable"
            : "Interface"
      return (
        <div className="flex items-center gap-2 p-2 bg-green-500/10 rounded text-xs">
          <Check className="h-3 w-3 text-green-500 shrink-0" />
          <span>
            <strong>{data.name}</strong> {typeLabel} 생성 ({data.propertyCount}개 프로퍼티)
          </span>
        </div>
      )
    }

    case "entityUpdated":
    case "embeddableUpdated":
    case "interfaceUpdated":
    case "enumUpdated": {
      const data = result.data as { name: string; changes: string[] }
      return (
        <div className="flex items-center gap-2 p-2 bg-blue-500/10 rounded text-xs">
          <Check className="h-3 w-3 text-blue-500 shrink-0" />
          <span>
            <strong>{data.name}</strong> 수정됨
          </span>
        </div>
      )
    }

    case "entityDeleted":
    case "embeddableDeleted":
    case "enumDeleted":
    case "interfaceDeleted": {
      const data = result.data as { name: string }
      return (
        <div className="flex items-center gap-2 p-2 bg-orange-500/10 rounded text-xs">
          <Check className="h-3 w-3 text-orange-500 shrink-0" />
          <span>
            <strong>{data.name}</strong> 삭제됨
          </span>
        </div>
      )
    }

    case "enumCreated": {
      const data = result.data as { name: string; valueCount: number }
      return (
        <div className="flex items-center gap-2 p-2 bg-purple-500/10 rounded text-xs">
          <Hash className="h-3 w-3 text-purple-500 shrink-0" />
          <span>
            <strong>{data.name}</strong> Enum 생성 ({data.valueCount}개 값)
          </span>
        </div>
      )
    }

    case "relationshipCreated": {
      const data = result.data as { source: string; target: string; type: string }
      return (
        <div className="flex items-center gap-2 p-2 bg-blue-500/10 rounded text-xs">
          <Link className="h-3 w-3 text-blue-500 shrink-0" />
          <span>
            {data.source} → {data.target} ({data.type})
          </span>
        </div>
      )
    }

    case "relationshipUpdated":
    case "relationshipDeleted": {
      const data = result.data as { source: string; target: string; type: string }
      return (
        <div className="flex items-center gap-2 p-2 bg-blue-500/10 rounded text-xs">
          <Link className="h-3 w-3 text-blue-500 shrink-0" />
          <span>
            {data.source} → {data.target} 관계{" "}
            {result.type === "relationshipUpdated" ? "수정됨" : "삭제됨"}
          </span>
        </div>
      )
    }

    case "propertyAdded": {
      const data = result.data as {
        nodeName: string
        propertyName: string
        propertyType: string
      }
      return (
        <div className="flex items-center gap-2 p-2 bg-green-500/10 rounded text-xs">
          <Box className="h-3 w-3 text-green-500 shrink-0" />
          <span>
            {data.nodeName}.{data.propertyName}: {data.propertyType} 추가
          </span>
        </div>
      )
    }

    case "propertyUpdated":
    case "propertyDeleted": {
      const data = result.data as { nodeName: string; propertyName: string }
      return (
        <div className="flex items-center gap-2 p-2 bg-blue-500/10 rounded text-xs">
          <Box className="h-3 w-3 text-blue-500 shrink-0" />
          <span>
            {data.nodeName}.{data.propertyName}{" "}
            {result.type === "propertyUpdated" ? "수정됨" : "삭제됨"}
          </span>
        </div>
      )
    }

    case "enumMappingCreated": {
      const data = result.data as {
        entityName: string
        propertyName: string
        enumName: string
      }
      return (
        <div className="flex items-center gap-2 p-2 bg-purple-500/10 rounded text-xs">
          <Link className="h-3 w-3 text-purple-500 shrink-0" />
          <span>
            {data.entityName}.{data.propertyName} → {data.enumName} 매핑
          </span>
        </div>
      )
    }

    case "enumMappingDeleted": {
      const data = result.data as { entityName: string; propertyName: string }
      return (
        <div className="flex items-center gap-2 p-2 bg-orange-500/10 rounded text-xs">
          <Link className="h-3 w-3 text-orange-500 shrink-0" />
          <span>
            {data.entityName}.{data.propertyName} Enum 매핑 해제
          </span>
        </div>
      )
    }

    case "diagramCleared":
      return (
        <div className="flex items-center gap-2 p-2 bg-orange-500/10 rounded text-xs">
          <Check className="h-3 w-3 text-orange-500 shrink-0" />
          <span>다이어그램 초기화 완료</span>
        </div>
      )

    case "diagramSummary": {
      const data = result.data as {
        entityCount: number
        embeddableCount: number
        enumCount: number
        interfaceCount: number
        relationshipCount: number
        enumMappingCount: number
      }
      return (
        <div className="flex items-center gap-2 p-2 bg-muted rounded text-xs">
          <List className="h-3 w-3 text-muted-foreground shrink-0" />
          <span>
            Entity: {data.entityCount}, Embeddable: {data.embeddableCount}, Enum:{" "}
            {data.enumCount}, Interface: {data.interfaceCount}, Relationship:{" "}
            {data.relationshipCount}
          </span>
        </div>
      )
    }

    case "codeGenerated":
    case "codePreview": {
      return (
        <div className="flex items-center gap-2 p-2 bg-green-500/10 rounded text-xs">
          <FileCode className="h-3 w-3 text-green-500 shrink-0" />
          <span>코드 생성 완료</span>
        </div>
      )
    }

    case "askUserResponse": {
      const data = result.data as { question: string; response: string | string[] }
      const responseText = Array.isArray(data.response)
        ? data.response.join(", ")
        : data.response
      return (
        <div className="flex items-start gap-2 p-2 bg-primary/10 rounded text-xs">
          <MessageCircle className="h-3 w-3 text-primary shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <span className="text-muted-foreground">{data.question}</span>
            <span className="font-medium">{responseText}</span>
          </div>
        </div>
      )
    }

    case "error": {
      const data = result.data as { message: string }
      return (
        <div className="flex items-center gap-2 p-2 bg-destructive/10 rounded text-xs">
          <AlertCircle className="h-3 w-3 text-destructive shrink-0" />
          <span>{data.message}</span>
        </div>
      )
    }

    default:
      return null
  }
}
