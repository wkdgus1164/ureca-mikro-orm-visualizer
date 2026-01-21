"use client"

/**
 * 노드 카드 공통 컴포넌트
 *
 * ReactFlow 노드의 카드 스타일을 일관되게 제공
 * 테마별 색상, 선택 상태, 헤더/바디 구조 지원
 */

import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

/**
 * 노드 카드 색상 테마
 */
export type NodeCardTheme = "entity" | "embeddable" | "enum"

/**
 * 테마별 스타일 설정
 */
interface ThemeStyles {
  /** 기본 테두리 스타일 */
  border: string
  /** 선택 시 테두리 스타일 */
  selectedBorder: string
  /** 선택 시 링 스타일 */
  selectedRing: string
  /** 호버 시 테두리 스타일 */
  hoverBorder: string
  /** 헤더 배경 색상 */
  headerBg: string
  /** 헤더 테두리 색상 */
  headerBorder: string
  /** 테두리 스타일 (solid/dashed) */
  borderStyle: "border-2" | "border-2 border-dashed"
}

const THEME_STYLES: Record<NodeCardTheme, ThemeStyles> = {
  entity: {
    border: "border-blue-500",
    selectedBorder: "border-blue-600",
    selectedRing: "ring-2 ring-blue-500/30",
    hoverBorder: "hover:border-blue-400",
    headerBg: "bg-muted/50",
    headerBorder: "border-b border-border",
    borderStyle: "border-2",
  },
  embeddable: {
    border: "border-violet-500",
    selectedBorder: "border-violet-600",
    selectedRing: "ring-2 ring-violet-500/30",
    hoverBorder: "hover:border-violet-400",
    headerBg: "bg-muted/50",
    headerBorder: "border-b border-border",
    borderStyle: "border-2",
  },
  enum: {
    border: "border-amber-500",
    selectedBorder: "border-amber-600",
    selectedRing: "ring-2 ring-amber-500/30",
    hoverBorder: "hover:border-amber-400",
    headerBg: "bg-muted/50",
    headerBorder: "border-b border-border",
    borderStyle: "border-2",
  },
}

/**
 * 카드 최소/최대 너비 설정
 */
interface CardSizeConfig {
  minWidth: string
  maxWidth: string
}

const SIZE_CONFIGS: Record<NodeCardTheme, CardSizeConfig> = {
  entity: { minWidth: "min-w-[180px]", maxWidth: "max-w-[280px]" },
  embeddable: { minWidth: "min-w-[180px]", maxWidth: "max-w-[280px]" },
  enum: { minWidth: "min-w-[160px]", maxWidth: "max-w-[240px]" },
}

// =============================================================================
// NodeCard 컴포넌트
// =============================================================================

interface NodeCardProps {
  /** 카드 테마 */
  theme: NodeCardTheme
  /** 선택 상태 */
  selected?: boolean
  /** 헤더 영역 */
  header: ReactNode
  /** 바디 영역 */
  children: ReactNode
  /** 추가 CSS 클래스 */
  className?: string
}

/**
 * 노드 카드 컴포넌트
 *
 * 일관된 스타일로 노드를 렌더링하는 카드 래퍼
 *
 * @example
 * ```tsx
 * <NodeCard
 *   theme="entity"
 *   selected={selected}
 *   header={<NodeCardHeader icon={<Box />} title="User" />}
 * >
 *   <NodeCardBody>...</NodeCardBody>
 * </NodeCard>
 * ```
 */
export function NodeCard({
  theme,
  selected = false,
  header,
  children,
  className,
}: NodeCardProps) {
  const styles = THEME_STYLES[theme]
  const sizes = SIZE_CONFIGS[theme]

  return (
    <div
      className={cn(
        sizes.minWidth,
        sizes.maxWidth,
        "bg-background rounded-lg shadow-md transition-all",
        styles.borderStyle,
        selected
          ? cn(styles.selectedBorder, styles.selectedRing)
          : cn(styles.border, styles.hoverBorder),
        className
      )}
    >
      {/* 헤더 영역 */}
      <div
        className={cn(
          "px-3 py-2 rounded-t-md",
          styles.headerBg,
          styles.headerBorder
        )}
      >
        {header}
      </div>

      {/* 바디 영역 */}
      {children}
    </div>
  )
}

// =============================================================================
// NodeCardHeader 컴포넌트
// =============================================================================

interface NodeCardHeaderProps {
  /** 헤더 아이콘 */
  icon?: ReactNode
  /** 노드 이름 */
  title: string
  /** 우측에 표시할 배지 (예: "Embeddable", "Enum") */
  badge?: string
  /** 테마에 따른 텍스트 색상 */
  theme?: NodeCardTheme
}

/**
 * 노드 카드 헤더 컴포넌트
 *
 * 아이콘, 제목, 배지를 포함한 헤더 렌더링
 */
export function NodeCardHeader({
  icon,
  title,
  badge,
  theme = "entity",
}: NodeCardHeaderProps) {
  const titleColorClass = {
    entity: "text-blue-600 dark:text-blue-400",
    embeddable: "text-violet-600 dark:text-violet-400",
    enum: "text-amber-600 dark:text-amber-400",
  }[theme]

  const badgeColorClass = {
    entity: "text-blue-500 dark:text-blue-400",
    embeddable: "text-violet-500 dark:text-violet-400",
    enum: "text-amber-500 dark:text-amber-400",
  }[theme]

  return (
    <div className="flex flex-col items-center gap-0.5">
      {/* 스테레오 타입 (상단 가운데) */}
      {badge && (
        <span className={cn("text-xs font-medium", badgeColorClass)}>
          {badge}
        </span>
      )}
      {/* 아이콘 + 이름 */}
      <div className="text-sm font-semibold flex items-center gap-2">
        {icon}
        <span className={cn("truncate", titleColorClass)}>{title}</span>
      </div>
    </div>
  )
}

// =============================================================================
// NodeCardBody 컴포넌트
// =============================================================================

interface NodeCardBodyProps {
  /** 빈 상태일 때 표시할 메시지 */
  emptyMessage?: string
  /** 아이템이 있는지 여부 */
  isEmpty?: boolean
  /** 바디 내용 */
  children: ReactNode
}

/**
 * 노드 카드 바디 컴포넌트
 *
 * 프로퍼티 목록 또는 빈 상태 메시지 렌더링
 */
export function NodeCardBody({
  emptyMessage = "No items",
  isEmpty = false,
  children,
}: NodeCardBodyProps) {
  if (isEmpty) {
    return (
      <div className="px-3 py-2 text-xs text-muted-foreground italic">
        {emptyMessage}
      </div>
    )
  }

  return <div className="py-1">{children}</div>
}
