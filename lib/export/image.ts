/**
 * ERD 이미지 Export 유틸리티
 *
 * ReactFlow 캔버스를 PNG 또는 SVG 이미지로 내보내기
 * Phase 2: ERD 이미지 Export 기능
 */

import { toPng, toSvg } from "html-to-image"
import type { Node } from "@xyflow/react"
import { getNodesBounds, getViewportForBounds } from "@xyflow/react"

/**
 * 이미지 export 형식
 */
export type ImageFormat = "png" | "svg"

/**
 * 이미지 해상도 배율
 */
export type ImageScale = 1 | 2 | 4

/**
 * 이미지 export 옵션
 */
export interface ExportImageOptions {
  /** 이미지 형식 (png 또는 svg) */
  format: ImageFormat
  /** 해상도 배율 (1x, 2x, 4x) */
  scale?: ImageScale
  /** 배경색 (기본: 투명) */
  backgroundColor?: string
  /** 패딩 (픽셀) */
  padding?: number
  /** 이미지 품질 (PNG에만 적용, 0-1) */
  quality?: number
}

const DEFAULT_OPTIONS: Required<ExportImageOptions> = {
  format: "png",
  scale: 2,
  backgroundColor: "#ffffff",
  padding: 50,
  quality: 1,
}

/**
 * Get the ReactFlow viewport DOM element.
 *
 * @returns The `.react-flow__viewport` element if present, `null` otherwise.
 */
function getViewportElement(): HTMLElement | null {
  return document.querySelector(".react-flow__viewport")
}

/**
 * Export the ReactFlow canvas containing the given nodes to an image data URL.
 *
 * @param nodes - The nodes to include in the exported image
 * @param options - Export options (format, scale, backgroundColor, padding, quality)
 * @returns The image data URL (`data:image/...`) for the exported PNG or SVG
 * @throws Error if the ReactFlow viewport element cannot be found
 * @throws Error if `nodes` is empty
 */
export async function exportAsImage(
  nodes: Node[],
  options: ExportImageOptions = { format: "png" }
): Promise<string> {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const viewportElement = getViewportElement()

  if (!viewportElement) {
    throw new Error("ReactFlow viewport element not found")
  }

  if (nodes.length === 0) {
    throw new Error("No nodes to export")
  }

  // 노드 경계 계산
  const nodesBounds = getNodesBounds(nodes)

  // 패딩 적용
  const width = nodesBounds.width + opts.padding * 2
  const height = nodesBounds.height + opts.padding * 2

  // 뷰포트 계산
  const viewport = getViewportForBounds(
    nodesBounds,
    width,
    height,
    0.5,   // minZoom
    2,     // maxZoom
    opts.padding
  )

  // html-to-image 옵션
  const imageOptions = {
    backgroundColor: opts.backgroundColor,
    width: width * opts.scale,
    height: height * opts.scale,
    style: {
      width: `${width}px`,
      height: `${height}px`,
      transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
    },
    quality: opts.quality,
    pixelRatio: opts.scale,
  }

  // 형식에 따라 export
  if (opts.format === "svg") {
    return toSvg(viewportElement, imageOptions)
  }

  return toPng(viewportElement, imageOptions)
}

/**
 * Trigger a browser download for the given data URL using the specified filename.
 *
 * @param dataUrl - The data URL of the image to download
 * @param filename - The target filename including extension
 */
export function downloadImage(dataUrl: string, filename: string): void {
  const link = document.createElement("a")
  link.download = filename
  link.href = dataUrl

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Export the ReactFlow canvas as an image and immediately download it.
 *
 * @param nodes - The nodes to include in the exported image
 * @param filename - Base filename without extension; the appropriate extension is appended automatically
 * @param options - Export options (format, scale, backgroundColor, padding, quality)
 */
export async function exportAndDownloadImage(
  nodes: Node[],
  filename: string,
  options: ExportImageOptions = { format: "png" }
): Promise<void> {
  const dataUrl = await exportAsImage(nodes, options)
  const extension = options.format === "svg" ? "svg" : "png"
  downloadImage(dataUrl, `${filename}.${extension}`)
}

/**
 * 해상도 배율 옵션 목록
 */
export const SCALE_OPTIONS: { value: ImageScale; label: string }[] = [
  { value: 1, label: "1x (Standard)" },
  { value: 2, label: "2x (Retina)" },
  { value: 4, label: "4x (High Resolution)" },
]

/**
 * 이미지 형식 옵션 목록
 */
export const FORMAT_OPTIONS: { value: ImageFormat; label: string }[] = [
  { value: "png", label: "PNG (Raster)" },
  { value: "svg", label: "SVG (Vector)" },
]