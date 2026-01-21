"use client"

/**
 * JSON Export 탭 컴포넌트
 *
 * JSON Schema를 미리보고 복사/다운로드할 수 있는 탭
 */

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Copy, Download, Check } from "lucide-react"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism"
import { toast } from "sonner"
import { useTheme } from "next-themes"

interface JsonExportTabProps {
  /** 생성된 JSON Schema 코드 */
  jsonCode: string
}

/**
 * JSON Export 탭 컴포넌트
 *
 * JSON Schema를 미리보기, 복사, 다운로드할 수 있습니다.
 */
export function JsonExportTab({ jsonCode }: JsonExportTabProps) {
  const { resolvedTheme } = useTheme()
  const syntaxTheme = resolvedTheme === "dark" ? vscDarkPlus : oneLight

  // 복사 완료 상태
  const [copied, setCopied] = useState(false)

  /**
   * 클립보드 복사 핸들러
   */
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(jsonCode)
      setCopied(true)
      toast.success("JSON Schema copied to clipboard!")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Failed to copy to clipboard")
    }
  }, [jsonCode])

  /**
   * 파일 다운로드 핸들러
   */
  const handleDownload = useCallback(() => {
    const blob = new Blob([jsonCode], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "diagram-schema.json"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success("diagram-schema.json downloaded!")
  }, [jsonCode])

  return (
    <div className="flex flex-col h-full">
      <div className="relative h-[450px] overflow-hidden rounded-lg border">
        {/* 복사 버튼 (우측 상단) */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 z-10 h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background"
          onClick={handleCopy}
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
        <ScrollArea className="h-full w-full bg-muted">
          <div className="overflow-x-auto">
            <SyntaxHighlighter
              language="json"
              style={syntaxTheme}
              customStyle={{
                margin: 0,
                borderRadius: 0,
                minHeight: "100%",
                fontSize: "13px",
                lineHeight: "1.5",
                whiteSpace: "pre",
                background: "transparent",
              }}
              showLineNumbers
              wrapLines={false}
              wrapLongLines={false}
            >
              {jsonCode}
            </SyntaxHighlighter>
          </div>
        </ScrollArea>
      </div>

      {/* 하단 액션 버튼 */}
      <div className="flex items-center justify-end gap-2 px-0 py-3 border-t bg-muted/50 -mx-6 px-6 mt-auto">
        <Button size="sm" onClick={handleDownload}>
          <Download className="h-4 w-4 mr-2" />
          Download diagram-schema.json
        </Button>
      </div>
    </div>
  )
}
