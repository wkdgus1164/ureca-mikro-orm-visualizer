"use client"

/**
 * TypeScript Export 탭 컴포넌트
 *
 * TypeScript 코드를 카테고리별 파일 트리와 함께 미리보고 복사/다운로드할 수 있는 탭
 * 카테고리: entities, embeddables, enums, interfaces
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
import JSZip from "jszip"
import type { CategorizedGeneratedCode } from "@/lib/mikro-orm/generator"

/**
 * 파일 정보 (경로 + 코드)
 */
interface FileInfo {
  /** 카테고리 (폴더명) */
  category: keyof CategorizedGeneratedCode
  /** 파일명 (확장자 제외) */
  name: string
  /** 생성된 코드 */
  code: string
}

/**
 * 카테고리별 표시 정보
 */
const CATEGORY_INFO: Record<keyof CategorizedGeneratedCode, { label: string; icon: string }> = {
  entities: { label: "entities", icon: "🗂️" },
  embeddables: { label: "embeddables", icon: "📦" },
  enums: { label: "enums", icon: "🔢" },
  interfaces: { label: "interfaces", icon: "📄" },
}

interface TypeScriptExportTabProps {
  /** 카테고리별로 분류된 생성 코드 */
  generatedCode: CategorizedGeneratedCode
}

/**
 * TypeScript Export 탭 컴포넌트
 *
 * 카테고리별 파일 트리에서 파일을 선택하고 코드를 미리보기, 복사, 다운로드할 수 있습니다.
 */
export function TypeScriptExportTab({ generatedCode }: TypeScriptExportTabProps) {
  const { resolvedTheme } = useTheme()
  const syntaxTheme = resolvedTheme === "dark" ? vscDarkPlus : oneLight

  // 선택된 파일 (category/name 형태)
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  // 복사 완료 상태
  const [copied, setCopied] = useState(false)
  // 다운로드 진행 상태
  const [isDownloading, setIsDownloading] = useState(false)

  /**
   * 모든 파일 목록 (카테고리별로 그룹화)
   */
  const filesByCategory = useMemo(() => {
    const result: Record<keyof CategorizedGeneratedCode, FileInfo[]> = {
      entities: [],
      embeddables: [],
      enums: [],
      interfaces: [],
    }

    const categories: (keyof CategorizedGeneratedCode)[] = [
      "entities",
      "embeddables",
      "enums",
      "interfaces",
    ]

    categories.forEach((category) => {
      generatedCode[category].forEach((code, name) => {
        result[category].push({ category, name, code })
      })
    })

    return result
  }, [generatedCode])

  /**
   * 전체 파일 개수
   */
  const totalFileCount = useMemo(() => {
    return (
      filesByCategory.entities.length +
      filesByCategory.embeddables.length +
      filesByCategory.enums.length +
      filesByCategory.interfaces.length
    )
  }, [filesByCategory])

  /**
   * 현재 선택된 파일 정보
   */
  const currentFile = useMemo((): FileInfo | null => {
    if (!selectedFile) {
      // 기본값: 첫 번째 파일 선택
      const categories: (keyof CategorizedGeneratedCode)[] = [
        "entities",
        "embeddables",
        "enums",
        "interfaces",
      ]
      const firstCategory = categories.find((cat) => filesByCategory[cat].length > 0)
      if (firstCategory && filesByCategory[firstCategory].length > 0) {
        return filesByCategory[firstCategory][0]
      }
      return null
    }

    const [category, name] = selectedFile.split("/") as [keyof CategorizedGeneratedCode, string]
    const file = filesByCategory[category]?.find((f) => f.name === name)
    return file ?? null
  }, [selectedFile, filesByCategory])

  /**
   * 파일 선택 핸들러
   */
  const handleSelectFile = useCallback((category: keyof CategorizedGeneratedCode, name: string) => {
    setSelectedFile(`${category}/${name}`)
  }, [])

  /**
   * 클립보드 복사 핸들러
   */
  const handleCopy = useCallback(async () => {
    if (!currentFile) return

    try {
      await navigator.clipboard.writeText(currentFile.code)
      setCopied(true)
      toast.success(`${currentFile.name}.ts copied to clipboard!`)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Failed to copy to clipboard")
    }
  }, [currentFile])

  /**
   * 단일 파일 다운로드 핸들러
   */
  const handleDownload = useCallback(() => {
    if (!currentFile) return

    const blob = new Blob([currentFile.code], { type: "text/typescript" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${currentFile.name}.ts`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success(`${currentFile.name}.ts downloaded!`)
  }, [currentFile])

  /**
   * 모든 파일 ZIP 압축 다운로드 핸들러
   */
  const handleDownloadAll = useCallback(async () => {
    setIsDownloading(true)

    try {
      const zip = new JSZip()

      // 카테고리별 폴더에 파일 추가
      const categories: (keyof CategorizedGeneratedCode)[] = [
        "entities",
        "embeddables",
        "enums",
        "interfaces",
      ]

      categories.forEach((category) => {
        const files = filesByCategory[category]
        if (files.length > 0) {
          const folder = zip.folder(category)
          files.forEach((file) => {
            folder?.file(`${file.name}.ts`, file.code)
          })
        }
      })

      // ZIP 파일 생성 및 다운로드
      const content = await zip.generateAsync({ type: "blob" })
      const url = URL.createObjectURL(content)
      const a = document.createElement("a")
      a.href = url
      a.download = "mikro-orm-entities.zip"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success(`All files downloaded as ZIP!`)
    } catch {
      toast.error("Failed to create ZIP file")
    } finally {
      setIsDownloading(false)
    }
  }, [filesByCategory])

  /**
   * 파일이 있는 카테고리만 표시하기 위한 필터
   */
  const nonEmptyCategories = useMemo(() => {
    const categories: (keyof CategorizedGeneratedCode)[] = [
      "entities",
      "embeddables",
      "enums",
      "interfaces",
    ]
    return categories.filter((cat) => filesByCategory[cat].length > 0)
  }, [filesByCategory])

  /**
   * 초기 확장할 폴더 목록
   */
  const initialExpandedItems = useMemo(() => {
    return nonEmptyCategories
  }, [nonEmptyCategories])

  /**
   * 현재 선택된 파일 ID
   */
  const selectedFileId = useMemo(() => {
    if (currentFile) {
      return `${currentFile.category}/${currentFile.name}`
    }
    return undefined
  }, [currentFile])

  return (
    <div className="flex flex-col h-full">
      <div className="flex h-[450px] min-w-0 overflow-hidden rounded-lg border">
        {/* 파일 탐색기 (왼쪽) */}
        <div className="w-56 shrink-0 border-r bg-muted/30 py-2 overflow-hidden rounded-l-lg">
          <Tree
            initialSelectedId={selectedFileId}
            initialExpandedItems={initialExpandedItems}
            indicator={false}
            className="h-full"
          >
            {nonEmptyCategories.map((category) => (
              <Folder key={category} element={CATEGORY_INFO[category].label} value={category}>
                {filesByCategory[category].map((file) => (
                  <File
                    key={`${category}/${file.name}`}
                    value={`${category}/${file.name}`}
                    fileIcon={<FileText className="size-4 text-blue-500" />}
                    onClick={() => handleSelectFile(category, file.name)}
                    isSelect={selectedFileId === `${category}/${file.name}`}
                  >
                    <span className="text-xs">{file.name}.ts</span>
                  </File>
                ))}
              </Folder>
            ))}
          </Tree>
        </div>

        {/* 코드 미리보기 (오른쪽) */}
        <div className="flex-1 min-w-0 overflow-hidden relative rounded-r-lg">
          {/* 복사 버튼 (우측 상단) */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-10 h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background"
            onClick={handleCopy}
            disabled={!currentFile}
            aria-label={copied ? "Copied" : `Copy ${currentFile?.name ?? "code"} to clipboard`}
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
                {currentFile?.code ?? ""}
              </SyntaxHighlighter>
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* 하단 액션 버튼 */}
      <div className="flex items-center justify-between py-3 border-t bg-muted/50 -mx-6 px-6 mt-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownloadAll}
          disabled={totalFileCount === 0 || isDownloading}
        >
          <Download className="h-4 w-4 mr-2" />
          {isDownloading ? "Creating ZIP..." : `Download All (${totalFileCount})`}
        </Button>

        <Button size="sm" onClick={handleDownload} disabled={!currentFile}>
          <Download className="h-4 w-4 mr-2" />
          Download {currentFile ? `${currentFile.name}.ts` : ""}
        </Button>
      </div>
    </div>
  )
}
