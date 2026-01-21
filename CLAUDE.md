# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

**MikroORM Class Diagram Visualizer** - MikroORM 엔티티 관계를 비주얼 에디터로 설계하고, TypeScript 코드/JSON/이미지로 내보낼 수 있는 Next.js 애플리케이션.

**기술 스택:**
- Next.js 16 (App Router) + React 19
- TypeScript 5 (strict mode, `any` 금지)
- Tailwind CSS v4 + shadcn/ui
- @xyflow/react (ReactFlow)
- Vitest + @testing-library (테스트)
- Bun (패키지 매니저)

## 개발 명령어

```bash
bun dev          # 개발 서버
bun run build    # 프로덕션 빌드
bun run lint     # ESLint 검사
bun run test     # Vitest 테스트 실행
bun run test:run # 테스트 1회 실행
```

## 디렉토리 구조

```text
/
├── app/                    # Next.js App Router
│   └── (routes)/editor/    # /editor - 비주얼 에디터 페이지
├── components/
│   ├── ui/                 # shadcn/ui 컴포넌트
│   ├── providers/          # Context Providers
│   ├── editor/             # 에디터 컴포넌트
│   │   ├── canvas/         # ReactFlow 캔버스
│   │   ├── nodes/          # 커스텀 노드 (Entity, Embeddable, Enum)
│   │   ├── edges/          # 커스텀 엣지 (Relationship)
│   │   ├── toolbar/        # 에디터 툴바
│   │   └── panels/         # 사이드 패널
│   │       ├── property-form.tsx
│   │       ├── inline-enum-form.tsx      # Enum 정의 편집
│   │       └── property-type-selector.tsx # 타입 선택
│   └── export/             # Export 컴포넌트
│       ├── export-modal.tsx
│       ├── typescript-export-tab.tsx
│       ├── json-export-tab.tsx
│       └── image-export-tab.tsx
├── hooks/                  # 커스텀 React 훅
│   ├── use-editor.ts       # 에디터 통합 훅 (메인)
│   ├── use-nodes.ts        # 노드 CRUD 관리
│   ├── use-edges.ts        # 엣지 CRUD 관리
│   └── use-editor-ui.ts    # UI 상태 관리
├── lib/                    # 비즈니스 로직
│   ├── mikro-orm/          # MikroORM 코드 생성
│   └── export/             # JSON/이미지 내보내기
├── types/                  # TypeScript 타입 정의
├── test/                   # 테스트 파일
│   ├── hooks/              # 훅 테스트
│   └── components/         # 컴포넌트 테스트
└── ai-context/             # PRD 및 아키텍처 문서
```

각 디렉토리의 상세 규칙은 해당 디렉토리의 `README.md` 참조.

## 핵심 규칙

### TypeScript
- `any` 타입 금지 → `unknown` + 타입 가드 사용
- 모든 함수에 파라미터/반환 타입 명시
- `strict: true` 모드 준수

### Import
```typescript
// 절대 경로 필수 (@/)
import { Button } from "@/components/ui/button"
import { useEditor } from "@/hooks/use-editor"
import type { EntityNode } from "@/types/entity"

// ❌ 상대 경로 금지
import { Button } from "../../components/ui/button"
```

### 함수형 프로그래밍
`for...of`, `for...in` 등 구형 반복문 사용 금지. 함수형 메서드 사용 필수.

```typescript
// ✅ 올바른 예시
items.forEach((item) => process(item))
const result = items.map((item) => transform(item))
const filtered = items.filter((item) => item.isValid)
const hasMatch = items.some((item) => item.id === targetId)
const allValid = items.every((item) => item.isValid)

// Map 생성
const map = new Map(items.map((item) => [item.id, item.value]))

// ❌ 잘못된 예시
for (const item of items) { process(item) }
for (let i = 0; i < items.length; i++) { ... }
```

### 공통 컴포넌트 추출
동일한 패턴이 3개 이상의 파일에서 반복되면 `shared/` 디렉토리에 추출.

```text
components/editor/nodes/
├── entity-node.tsx
├── embeddable-node.tsx
├── enum-node.tsx
└── shared/              # 공통 패턴 추출
    ├── node-handles.tsx # 4방향 핸들
    ├── node-card.tsx    # 카드 레이아웃
    └── index.ts
```

### SVG 에셋 처리
CSS 변수(테마)가 필요한 SVG는 React 컴포넌트로 작성. `public/`에 두지 않음.

```typescript
// ✅ 테마 지원이 필요한 SVG → React 컴포넌트
// components/editor/edges/shared/edge-markers.tsx
export function ArrowMarker() {
  return (
    <marker id="arrow">
      <path fill="hsl(var(--foreground))" />  {/* CSS 변수 사용 */}
    </marker>
  )
}

// ❌ public/에 정적 SVG → 테마 변경 불가
```

### 커밋
- 한글 커밋 메시지
- 커밋 전 필수: `bun run lint && bun run build`
- 타입: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`

## 테스트

```bash
bun run test          # watch 모드
bun run test:run      # 1회 실행
bun run test:coverage # 커버리지 포함
```

테스트 파일 위치: `test/` 디렉토리
- `test/hooks/` - 훅 테스트
- `test/components/` - 컴포넌트 테스트

## 참고 자료

- [ReactFlow](https://reactflow.dev/learn)
- [MikroORM](https://mikro-orm.io/docs/quick-start)
- [shadcn/ui](https://ui.shadcn.com/)
- [Next.js](https://nextjs.org/docs)
- [Vitest](https://vitest.dev/)
