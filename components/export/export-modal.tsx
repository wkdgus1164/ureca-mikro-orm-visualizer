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
import { Tree, Folder, File } from "@/components/ui/file-tree"
import { Copy, Download, Check, FileCode, FileJson, ImageIcon, FileText } from "lucide-react"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism"
import { toast } from "sonner"
import { useTheme } from "next-themes"
import { useEditorContext } from "@/components/providers/editor-provider"
import { generateAllDiagramCode } from "@/lib/mikro-orm/generator"
import { exportDiagramAsJson } from "@/lib/export/json"
import {
  exportAndDownloadImage,
  SCALE_OPTIONS,
  FORMAT_OPTIONS,
  type ImageFormat,
  type ImageScale,
} from "@/lib/export/image"

/**
 * Export 형식 타입
 */
type ExportFormat = "typescript" | "json" | "image"

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
  const { resolvedTheme } = useTheme()

  // 테마에 따른 SyntaxHighlighter 스타일
  const syntaxTheme = resolvedTheme === "dark" ? vscDarkPlus : oneLight

  // Export 형식 (TypeScript, JSON Schema, 또는 Image)
  const [exportFormat, setExportFormat] = useState<ExportFormat>("typescript")
  // 선택된 Entity 탭 (복사/다운로드 시 사용, TypeScript 모드에서만)
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null)
  // 복사 완료 상태 (아이콘 피드백용)
  const [copied, setCopied] = useState(false)

  // 이미지 export 옵션 (Phase 2)
  const [imageFormat, setImageFormat] = useState<ImageFormat>("png")
  const [imageScale, setImageScale] = useState<ImageScale>(2)
  const [isExporting, setIsExporting] = useState(false)

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
   * 이미지 다운로드 핸들러
   */
  const handleDownloadImage = useCallback(async () => {
    setIsExporting(true)
    try {
      await exportAndDownloadImage(nodes, "diagram", {
        format: imageFormat,
        scale: imageScale,
        backgroundColor: "#ffffff",
        padding: 50,
      })
      toast.success(
        `diagram.${imageFormat} downloaded!`
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to export image"
      toast.error(message)
    } finally {
      setIsExporting(false)
    }
  }, [nodes, imageFormat, imageScale])

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
      <DialogContent className="!max-w-[800px] !w-[48vw] max-h-[85vh] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>Export Code</DialogTitle>
          <DialogDescription>
            Export your diagram as TypeScript classes, JSON schema, or image
          </DialogDescription>
        </DialogHeader>

        {/* 형식 선택 탭 */}
        <Tabs
          value={exportFormat}
          onValueChange={(value) => setExportFormat(value as ExportFormat)}
          className="flex flex-col min-w-0 overflow-hidden"
        >
          <div className="px-6 border-b">
            <TabsList className="h-10">
              <TabsTrigger value="typescript" className="gap-2">
                <FileCode className="h-4 w-4" />
                TypeScript
              </TabsTrigger>
              <TabsTrigger value="json" className="gap-2">
                <FileJson className="h-4 w-4" />
                JSON
              </TabsTrigger>
              <TabsTrigger value="image" className="gap-2">
                <ImageIcon className="h-4 w-4" />
                Image
              </TabsTrigger>
            </TabsList>
          </div>

          {/* TypeScript 형식 */}
          <TabsContent value="typescript" className="m-0 flex-1 overflow-hidden">
            <div className="flex h-[450px] min-w-0 overflow-hidden">
              {/* 파일 탐색기 (왼쪽) */}
              <div className="w-56 shrink-0 border-r bg-muted/30 py-2 overflow-hidden">
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
                        onClick={() => handleTabChange(name)}
                        isSelect={currentEntity === name}
                      >
                        <span className="text-xs">{name}.ts</span>
                      </File>
                    ))}
                  </Folder>
                </Tree>
              </div>

              {/* 코드 미리보기 (오른쪽) */}
              <div className="flex-1 min-w-0 overflow-hidden relative">
                {/* 복사 버튼 (우측 상단) */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 z-10 h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background"
                  onClick={() => currentEntity && handleCopyTs(currentEntity)}
                  disabled={!currentEntity}
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
                      {currentEntity ? (generatedTsCode.get(currentEntity) ?? "") : ""}
                    </SyntaxHighlighter>
                  </div>
                </ScrollArea>
              </div>
            </div>
          </TabsContent>

          {/* JSON Schema 형식 */}
          <TabsContent value="json" className="m-0 overflow-hidden">
            <div className="relative h-[450px] overflow-hidden">
              {/* 복사 버튼 (우측 상단) */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 z-10 h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background"
                onClick={handleCopyJson}
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
                    {generatedJsonCode}
                  </SyntaxHighlighter>
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          {/* 이미지 형식 */}
          <TabsContent value="image" className="m-0">
            <div className="px-6 py-6 flex flex-col items-center justify-center h-[350px] bg-muted/30">
              <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-base font-medium mb-4">Export Diagram as Image</p>

              <div className="flex flex-col gap-3 w-full max-w-sm">
                {/* 이미지 형식 선택 */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Format</label>
                  <Select
                    value={imageFormat}
                    onValueChange={(value) => setImageFormat(value as ImageFormat)}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FORMAT_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 해상도 선택 */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Resolution</label>
                  <Select
                    value={String(imageScale)}
                    onValueChange={(value) => setImageScale(Number(value) as ImageScale)}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SCALE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={String(option.value)}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <p className="text-xs text-muted-foreground mt-4 text-center max-w-sm">
                {imageFormat === "svg"
                  ? "SVG is vector-based and can scale to any size without quality loss."
                  : `PNG will be exported at ${imageScale}x resolution for sharp display.`}
              </p>
            </div>
          </TabsContent>

        {/* 하단 액션 버튼 - TypeScript 형식 */}
        {exportFormat === "typescript" && (
          <div className="flex items-center justify-between px-6 py-3 border-t bg-muted/50">
            <Button variant="outline" size="sm" onClick={handleDownloadAllTs}>
              <Download className="h-4 w-4 mr-2" />
              Download All ({entityNames.length})
            </Button>

            <Button
              size="sm"
              onClick={() => currentEntity && handleDownloadTs(currentEntity)}
              disabled={!currentEntity}
            >
              <Download className="h-4 w-4 mr-2" />
              Download {currentEntity}.ts
            </Button>
          </div>
        )}

        {/* 하단 액션 버튼 - JSON Schema 형식 */}
        {exportFormat === "json" && (
          <div className="flex items-center justify-end gap-2 px-6 py-3 border-t bg-muted/50">
            <Button size="sm" onClick={handleDownloadJson}>
              <Download className="h-4 w-4 mr-2" />
              Download diagram-schema.json
            </Button>
          </div>
        )}

        {/* 하단 액션 버튼 - 이미지 형식 */}
        {exportFormat === "image" && (
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t bg-muted/50">
            <Button
              onClick={handleDownloadImage}
              disabled={isExporting}
            >
              {isExporting ? (
                <>
                  <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Download diagram.{imageFormat}
                </>
              )}
            </Button>
          </div>
        )}
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
