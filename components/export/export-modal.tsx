"use client"

/**
 * Export 모달 컴포넌트
 *
 * 생성된 MikroORM TypeScript 코드 또는 이미지를 내보낼 수 있는 모달
 *
 * 탭 컴포넌트들로 분리:
 * - TypeScriptExportTab: TypeScript 코드 미리보기/복사/다운로드
 * - ImageExportTab: 이미지 형식/해상도 선택 및 다운로드
 */

import { useState, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileCode, ImageIcon } from "lucide-react"
import { useEditorContext } from "@/components/providers/editor-provider"
import { generateAllDiagramCode } from "@/lib/mikro-orm/generator"
import { TypeScriptExportTab } from "@/components/export/typescript-export-tab"
import { ImageExportTab } from "@/components/export/image-export-tab"

/**
 * Export 형식 타입
 */
type ExportFormat = "typescript" | "image"

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
 * TypeScript 코드, JSON Schema, 이미지 중 선택하여 다이어그램을 내보낼 수 있습니다.
 *
 * @param isOpen - 모달 열림 상태
 * @param onClose - 모달 닫기 핸들러
 */
export function ExportModal({ isOpen, onClose }: ExportModalProps) {
  const { nodes, edges } = useEditorContext()

  // Export 형식 (TypeScript, JSON Schema, 또는 Image)
  const [exportFormat, setExportFormat] = useState<ExportFormat>("typescript")

  /**
   * 모든 다이어그램 노드 (Entity + Embeddable) TypeScript 코드 생성
   */
  const generatedTsCode = useMemo(() => {
    if (!isOpen || nodes.length === 0) return new Map<string, string>()
    return generateAllDiagramCode(nodes, edges)
  }, [isOpen, nodes, edges])

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
          <DialogTitle>Export</DialogTitle>
          <DialogDescription>
            Export your diagram as TypeScript classes or image
          </DialogDescription>
        </DialogHeader>

        {/* 형식 선택 탭 */}
        <Tabs
          value={exportFormat}
          onValueChange={(value) => setExportFormat(value as ExportFormat)}
          className="flex flex-col min-w-0 overflow-hidden"
        >
          <div className="px-6">
            <TabsList className="h-10">
              <TabsTrigger value="typescript" className="gap-2">
                <FileCode className="h-4 w-4" />
                TypeScript
              </TabsTrigger>
              <TabsTrigger value="image" className="gap-2">
                <ImageIcon className="h-4 w-4" />
                Image
              </TabsTrigger>
            </TabsList>
          </div>

          {/* TypeScript 탭 */}
          <TabsContent value="typescript" className="m-0 flex-1 overflow-hidden px-6 pt-2">
            <TypeScriptExportTab generatedCode={generatedTsCode} />
          </TabsContent>

          {/* Image 탭 */}
          <TabsContent value="image" className="m-0">
            <ImageExportTab nodes={nodes} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
