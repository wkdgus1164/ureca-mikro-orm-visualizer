"use client"

/**
 * Export 모달 컴포넌트
 *
 * 생성된 MikroORM TypeScript 코드를 미리보고
 * 클립보드 복사 또는 파일 다운로드할 수 있는 모달
 */

import { useState, useCallback, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Copy, Download, Check, FileCode } from "lucide-react"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"
import { toast } from "sonner"
import { useEditorContext } from "@/components/providers/editor-provider"
import { generateAllEntitiesCode } from "@/lib/mikro-orm/generator"

/**
 * Export 모달 Props
 */
interface ExportModalProps {
  /** 모달 열림 상태 */
  isOpen: boolean
  /** 모달 닫기 핸들러 */
  onClose: () => void
}

/**
 * Export 모달 컴포넌트
 *
 * @example
 * ```tsx
 * <ExportModal isOpen={showExport} onClose={() => setShowExport(false)} />
 * ```
 */
export function ExportModal({ isOpen, onClose }: ExportModalProps) {
  const { nodes, edges } = useEditorContext()

  // 선택된 Entity 탭 (복사/다운로드 시 사용)
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null)
  // 복사 완료 상태 (아이콘 피드백용)
  const [copiedEntity, setCopiedEntity] = useState<string | null>(null)

  /**
   * 모든 Entity 코드 생성
   */
  const generatedCodes = useMemo(() => {
    if (!isOpen || nodes.length === 0) return new Map<string, string>()
    return generateAllEntitiesCode(nodes, edges)
  }, [isOpen, nodes, edges])

  /**
   * Entity 이름 목록
   */
  const entityNames = useMemo(
    () => Array.from(generatedCodes.keys()),
    [generatedCodes]
  )

  /**
   * 선택된 Entity (없으면 첫 번째)
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
      const code = generatedCodes.get(entityName)
      if (!code) return

      try {
        await navigator.clipboard.writeText(code)
        setCopiedEntity(entityName)
        toast.success(`${entityName}.ts copied to clipboard!`)
        // 2초 후 복사 상태 초기화
        setTimeout(() => setCopiedEntity(null), 2000)
      } catch {
        toast.error("Failed to copy to clipboard")
      }
    },
    [generatedCodes]
  )

  /**
   * 파일 다운로드 핸들러
   */
  const handleDownload = useCallback(
    (entityName: string) => {
      const code = generatedCodes.get(entityName)
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
    [generatedCodes]
  )

  /**
   * 모든 파일 다운로드
   */
  const handleDownloadAll = useCallback(() => {
    for (const entityName of entityNames) {
      handleDownload(entityName)
    }
  }, [entityNames, handleDownload])

  /**
   * 탭 변경 핸들러
   */
  const handleTabChange = useCallback((value: string) => {
    setSelectedEntity(value)
  }, [])

  // Entity가 없는 경우
  if (nodes.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={() => onClose()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Export TypeScript Code</DialogTitle>
            <DialogDescription>
              Export your entities as MikroORM TypeScript classes
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FileCode className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              No entities to export. Create some entities first!
            </p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[85vh] p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>Export TypeScript Code</DialogTitle>
          <DialogDescription>
            Generated MikroORM entity classes ({entityNames.length} entities)
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={currentEntity ?? undefined}
          onValueChange={handleTabChange}
          className="flex flex-col flex-1 min-h-0"
        >
          {/* Entity 탭 목록 */}
          <div className="px-6 border-b">
            <ScrollArea className="w-full" type="scroll">
              <TabsList className="inline-flex h-10 w-max">
                {entityNames.map((name) => (
                  <TabsTrigger key={name} value={name} className="gap-2">
                    <FileCode className="h-3.5 w-3.5" />
                    {name}.ts
                  </TabsTrigger>
                ))}
              </TabsList>
            </ScrollArea>
          </div>

          {/* 코드 미리보기 영역 */}
          {entityNames.map((name) => (
            <TabsContent
              key={name}
              value={name}
              className="flex-1 m-0 min-h-0 data-[state=inactive]:hidden"
            >
              <ScrollArea className="h-[400px]">
                <SyntaxHighlighter
                  language="typescript"
                  style={vscDarkPlus}
                  customStyle={{
                    margin: 0,
                    borderRadius: 0,
                    minHeight: "100%",
                    fontSize: "13px",
                    lineHeight: "1.5",
                  }}
                  showLineNumbers
                  wrapLines
                >
                  {generatedCodes.get(name) ?? ""}
                </SyntaxHighlighter>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>

        {/* 하단 액션 버튼 */}
        <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/50">
          <Button variant="outline" onClick={handleDownloadAll}>
            <Download className="h-4 w-4 mr-2" />
            Download All ({entityNames.length})
          </Button>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => currentEntity && handleCopy(currentEntity)}
              disabled={!currentEntity}
            >
              {copiedEntity === currentEntity ? (
                <Check className="h-4 w-4 mr-2 text-green-500" />
              ) : (
                <Copy className="h-4 w-4 mr-2" />
              )}
              Copy to Clipboard
            </Button>
            <Button
              onClick={() => currentEntity && handleDownload(currentEntity)}
              disabled={!currentEntity}
            >
              <Download className="h-4 w-4 mr-2" />
              Download {currentEntity}.ts
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
