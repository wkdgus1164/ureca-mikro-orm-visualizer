"use client"

/**
 * TypeScript Export 탭 컴포넌트
 *
 * TypeScript 코드를 파일 트리와 함께 미리보고 복사/다운로드할 수 있는 탭
 */

import { useState, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tree, Folder, File } from "@/components/ui/file-tree"
import { Copy, Download, Check, FileText } from "lucide-react"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism"
import { toast } from "sonner"
import { useTheme } from "next-themes"

interface TypeScriptExportTabProps {
  /** 생성된 TypeScript 코드 (Entity 이름 → 코드) */
  generatedCode: Map<string, string>
}

/**
 * TypeScript Export 탭 컴포넌트
 *
 * 파일 트리에서 Entity를 선택하고 코드를 미리보기, 복사, 다운로드할 수 있습니다.
 */
export function TypeScriptExportTab({ generatedCode }: TypeScriptExportTabProps) {
  const { resolvedTheme } = useTheme()
  const syntaxTheme = resolvedTheme === "dark" ? vscDarkPlus : oneLight

  // 선택된 Entity
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null)
  // 복사 완료 상태
  const [copied, setCopied] = useState(false)

  /**
   * Entity 이름 목록
   */
  const entityNames = useMemo(
    () => Array.from(generatedCode.keys()),
    [generatedCode]
  )

  /**
   * 현재 선택된 Entity (없으면 첫 번째)
   */
  const currentEntity = useMemo(() => {
    if (selectedEntity && entityNames.includes(selectedEntity)) {
      return selectedEntity
    }
    return entityNames[0] ?? null
  }, [selectedEntity, entityNames])

  /**
   * 클립보드 복사 핸들러
   */
  const handleCopy = useCallback(
    async (entityName: string) => {
      const code = generatedCode.get(entityName)
      if (!code) return

      try {
        await navigator.clipboard.writeText(code)
        setCopied(true)
        toast.success(`${entityName}.ts copied to clipboard!`)
        setTimeout(() => setCopied(false), 2000)
      } catch {
        toast.error("Failed to copy to clipboard")
      }
    },
    [generatedCode]
  )

  /**
   * 파일 다운로드 핸들러
   */
  const handleDownload = useCallback(
    (entityName: string) => {
      const code = generatedCode.get(entityName)
      if (!code) return

      const blob = new Blob([code], { type: "text/typescript" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${entityName}.ts`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success(`${entityName}.ts downloaded!`)
    },
    [generatedCode]
  )

  /**
   * 모든 파일 다운로드 핸들러
   */
  const handleDownloadAll = useCallback(() => {
    entityNames.forEach(handleDownload)
  }, [entityNames, handleDownload])

  return (
    <div className="flex flex-col h-full">
      <div className="flex h-[450px] min-w-0 overflow-hidden rounded-lg border">
        {/* 파일 탐색기 (왼쪽) */}
        <div className="w-56 shrink-0 border-r bg-muted/30 py-2 overflow-hidden rounded-l-lg">
          <Tree
            initialSelectedId={currentEntity ?? undefined}
            initialExpandedItems={["entities"]}
            indicator={false}
            className="h-full"
          >
            <Folder element="entities" value="entities">
              {entityNames.map((name) => (
                <File
                  key={name}
                  value={name}
                  fileIcon={<FileText className="size-4 text-blue-500" />}
                  onClick={() => setSelectedEntity(name)}
                  isSelect={currentEntity === name}
                >
                  <span className="text-xs">{name}.ts</span>
                </File>
              ))}
            </Folder>
          </Tree>
        </div>

        {/* 코드 미리보기 (오른쪽) */}
        <div className="flex-1 min-w-0 overflow-hidden relative rounded-r-lg">
          {/* 복사 버튼 (우측 상단) */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-10 h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background"
            onClick={() => currentEntity && handleCopy(currentEntity)}
            disabled={!currentEntity}
            aria-label={copied ? "Copied" : `Copy ${currentEntity ?? "code"} to clipboard`}
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
                language="typescript"
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
                {currentEntity ? (generatedCode.get(currentEntity) ?? "") : ""}
              </SyntaxHighlighter>
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* 하단 액션 버튼 */}
      <div className="flex items-center justify-between py-3 border-t bg-muted/50 -mx-6 px-6 mt-auto">
        <Button variant="outline" size="sm" onClick={handleDownloadAll}>
          <Download className="h-4 w-4 mr-2" />
          Download All ({entityNames.length})
        </Button>

        <Button
          size="sm"
          onClick={() => currentEntity && handleDownload(currentEntity)}
          disabled={!currentEntity}
        >
          <Download className="h-4 w-4 mr-2" />
          Download {currentEntity ? `${currentEntity}.ts` : ""}
        </Button>
      </div>
    </div>
  )
}
