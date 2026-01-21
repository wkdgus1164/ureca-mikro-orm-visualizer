"use client"

/**
 * Export 모달 컴포넌트
 *
 * 생성된 MikroORM TypeScript 코드 또는 JSON Schema를 미리보고
 * 클립보드 복사 또는 파일 다운로드할 수 있는 모달
 *
 * Phase 2: JSON Schema export 추가
 */

import { useState, useCallback, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Copy, Download, Check, FileCode, FileJson } from "lucide-react"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"
import { toast } from "sonner"
import { useEditorContext } from "@/components/providers/editor-provider"
import { generateAllDiagramCode } from "@/lib/mikro-orm/generator"
import { exportDiagramAsJson } from "@/lib/export/json"

/**
 * Export 형식 타입
 */
type ExportFormat = "typescript" | "json"

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

  // Export 형식 (TypeScript 또는 JSON Schema)
  const [exportFormat, setExportFormat] = useState<ExportFormat>("typescript")
  // 선택된 Entity 탭 (복사/다운로드 시 사용, TypeScript 모드에서만)
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null)
  // 복사 완료 상태 (아이콘 피드백용)
  const [copied, setCopied] = useState(false)

  /**
   * 모든 다이어그램 노드 (Entity + Embeddable) TypeScript 코드 생성
   */
  const generatedTsCode = useMemo(() => {
    if (!isOpen || nodes.length === 0) return new Map<string, string>()
    return generateAllDiagramCode(nodes, edges)
  }, [isOpen, nodes, edges])

  /**
   * JSON Schema 코드 생성
   */
  const generatedJsonCode = useMemo(() => {
    if (!isOpen || nodes.length === 0) return ""
    return exportDiagramAsJson(nodes, edges)
  }, [isOpen, nodes, edges])

  /**
   * 클래스 이름 목록 (Entity + Embeddable)
   */
  const entityNames = useMemo(
    () => Array.from(generatedTsCode.keys()),
    [generatedTsCode]
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
   * 클립보드 복사 핸들러 (TypeScript)
   */
  const handleCopyTs = useCallback(
    async (entityName: string) => {
      const code = generatedTsCode.get(entityName)
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
    [generatedTsCode]
  )

  /**
   * 클립보드 복사 핸들러 (JSON)
   */
  const handleCopyJson = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(generatedJsonCode)
      setCopied(true)
      toast.success("JSON Schema copied to clipboard!")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Failed to copy to clipboard")
    }
  }, [generatedJsonCode])

  /**
   * 파일 다운로드 핸들러 (TypeScript)
   */
  const handleDownloadTs = useCallback(
    (entityName: string) => {
      const code = generatedTsCode.get(entityName)
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
    [generatedTsCode]
  )

  /**
   * 파일 다운로드 핸들러 (JSON)
   */
  const handleDownloadJson = useCallback(() => {
    const blob = new Blob([generatedJsonCode], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "diagram-schema.json"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success("diagram-schema.json downloaded!")
  }, [generatedJsonCode])

  /**
   * 모든 TypeScript 파일 다운로드
   */
  const handleDownloadAllTs = useCallback(() => {
    for (const entityName of entityNames) {
      handleDownloadTs(entityName)
    }
  }, [entityNames, handleDownloadTs])

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
              No classes to export. Create some entities or embeddables first!
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
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Export Code</DialogTitle>
              <DialogDescription>
                {exportFormat === "typescript"
                  ? `Generated MikroORM classes (${entityNames.length} files)`
                  : "Diagram exported as JSON Schema"}
              </DialogDescription>
            </div>
            {/* Format 선택 드롭다운 */}
            <Select
              value={exportFormat}
              onValueChange={(value) => setExportFormat(value as ExportFormat)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="typescript">
                  <div className="flex items-center gap-2">
                    <FileCode className="h-4 w-4" />
                    TypeScript
                  </div>
                </SelectItem>
                <SelectItem value="json">
                  <div className="flex items-center gap-2">
                    <FileJson className="h-4 w-4" />
                    JSON Schema
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </DialogHeader>

        {/* TypeScript 형식 */}
        {exportFormat === "typescript" && (
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
                    {generatedTsCode.get(name) ?? ""}
                  </SyntaxHighlighter>
                </ScrollArea>
              </TabsContent>
            ))}
          </Tabs>
        )}

        {/* JSON Schema 형식 */}
        {exportFormat === "json" && (
          <ScrollArea className="h-[400px]">
            <SyntaxHighlighter
              language="json"
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
              {generatedJsonCode}
            </SyntaxHighlighter>
          </ScrollArea>
        )}

        {/* 하단 액션 버튼 - TypeScript 형식 */}
        {exportFormat === "typescript" && (
          <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/50">
            <Button variant="outline" onClick={handleDownloadAllTs}>
              <Download className="h-4 w-4 mr-2" />
              Download All ({entityNames.length})
            </Button>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => currentEntity && handleCopyTs(currentEntity)}
                disabled={!currentEntity}
              >
                {copied ? (
                  <Check className="h-4 w-4 mr-2 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4 mr-2" />
                )}
                Copy to Clipboard
              </Button>
              <Button
                onClick={() => currentEntity && handleDownloadTs(currentEntity)}
                disabled={!currentEntity}
              >
                <Download className="h-4 w-4 mr-2" />
                Download {currentEntity}.ts
              </Button>
            </div>
          </div>
        )}

        {/* 하단 액션 버튼 - JSON Schema 형식 */}
        {exportFormat === "json" && (
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t bg-muted/50">
            <Button variant="outline" onClick={handleCopyJson}>
              {copied ? (
                <Check className="h-4 w-4 mr-2 text-green-500" />
              ) : (
                <Copy className="h-4 w-4 mr-2" />
              )}
              Copy to Clipboard
            </Button>
            <Button onClick={handleDownloadJson}>
              <Download className="h-4 w-4 mr-2" />
              Download diagram-schema.json
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
