# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

**MikroORM Class Diagram Visualizer** - MikroORM 엔티티 관계를 비주얼 에디터로 설계하고, TypeScript 코드/JSON/SQL로 내보낼 수 있는 Next.js 애플리케이션.

### 핵심 목표
1. **비주얼 우선**: 드래그앤드롭으로 Class Diagram을 그림 그리듯 설계
2. **MikroORM 전용**: MikroORM의 데코레이터, 관계 타입, 철학을 정확히 표현
3. **다양한 출력**: TypeScript 엔티티 코드, JSON Schema, SQL DDL, ERD 이미지
4. **확장성 대비**: MVP는 기본 기능, 아키텍처는 미래 확장 고려

**기술 스택:**
- **프레임워크**: Next.js 16 (App Router) + React 19
- **언어**: TypeScript 5 (strict mode, `any` 금지)
- **스타일링**: Tailwind CSS v4 + shadcn/ui
- **비주얼 에디터**: @xyflow/react (ReactFlow)
- **테마**: Vercel Geist 폰트 + next-themes (라이트/다크 모드)
- **패키지 매니저**: Bun (필수)

## 개발 명령어

> **중요:** 반드시 `bun`을 사용할 것. `npm`/`yarn`/`pnpm` 사용 금지.

```bash
bun dev          # 개발 서버
bun run build    # 프로덕션 빌드
bun start        # 프로덕션 서버
bun run lint     # ESLint 검사
```

### 패키지 설치

> **중요:** package.json 직접 수정 금지. 항상 `bun add` 사용.

```bash
bun add <package>           # 의존성 추가
bun add -d <package>        # devDependencies 추가
bunx shadcn@latest add <component>  # shadcn 컴포넌트 추가
```

## 디렉토리 구조

**엄격한 계층 구조 준수 필수.** 각 디렉토리의 `README.md`에서 상세 규칙 확인.

```
/
├── app/                        # Next.js App Router
│   ├── (routes)/              # 라우트 그룹 (URL에 포함되지 않음)
│   │   └── editor/            # /editor - 비주얼 에디터 페이지
│   ├── api/                   # API Routes
│   │   ├── export/            # 내보내기 API (TypeScript, JSON, SQL, Image)
│   │   └── import/            # 불러오기 API (DDL, JSON)
│   ├── layout.tsx             # 루트 레이아웃
│   ├── page.tsx               # 홈페이지
│   └── globals.css            # 글로벌 스타일
├── components/                 # React 컴포넌트
│   ├── ui/                    # shadcn/ui 기본 컴포넌트 (Button, Card 등)
│   ├── providers/             # Context Providers (Theme, Editor State 등)
│   ├── editor/                # 에디터 전용 컴포넌트 (Phase 1에서 생성)
│   │   ├── canvas/            # ReactFlow 캔버스 래퍼
│   │   ├── nodes/             # 커스텀 노드 타입들 (EntityNode, etc.)
│   │   ├── edges/             # 커스텀 엣지 타입들 (RelationshipEdge, etc.)
│   │   ├── toolbar/           # 에디터 툴바
│   │   └── panels/            # 사이드 패널 (Properties, Layers, etc.)
│   └── export/                # 내보내기 UI 컴포넌트
├── lib/                        # 비즈니스 로직 및 유틸리티
│   ├── utils.ts               # shadcn/ui cn() 유틸
│   ├── mikro-orm/             # MikroORM 관련 유틸 (Phase 1에서 생성)
│   │   ├── parser.ts          # 코드 → AST 파싱
│   │   ├── generator.ts       # AST → TypeScript 코드 생성
│   │   └── types.ts           # MikroORM 관련 타입 정의
│   ├── export/                # 내보내기 로직 (Phase 2-3에서 생성)
│   │   ├── typescript.ts      # TypeScript 코드 생성
│   │   ├── json.ts            # JSON Schema 생성
│   │   ├── sql.ts             # SQL DDL 생성 (PostgreSQL, MySQL)
│   │   └── image.ts           # ERD 이미지 export (PNG, SVG)
│   └── import/                # 불러오기 로직 (Phase 3에서 생성)
│       ├── ddl-parser.ts      # SQL DDL 파서
│       └── json-parser.ts     # JSON Schema 파서
├── hooks/                      # 커스텀 React 훅
│   ├── use-editor.ts          # 에디터 전역 상태 관리
│   ├── use-nodes.ts           # ReactFlow 노드 관리
│   ├── use-edges.ts           # ReactFlow 엣지 관리
│   └── use-export.ts          # 내보내기 상태 관리
├── types/                      # TypeScript 타입 정의 (Phase 1에서 생성)
│   ├── editor.ts              # 에디터 상태 및 UI 타입
│   ├── entity.ts              # Entity 관련 타입
│   ├── relationship.ts        # 관계 타입 (OneToOne, OneToMany, etc.)
│   ├── decorator.ts           # MikroORM 데코레이터 타입
│   └── export.ts              # Export 형식 타입
├── ai-context/                 # AI 개발 에이전트용 문서
│   ├── README.md              # PRD 작성 규칙
│   ├── phase-1-mvp.md         # Phase 1 PRD
│   ├── phase-2-advanced.md    # Phase 2 PRD
│   ├── phase-3-database.md    # Phase 3 PRD
│   ├── phase-4-optimization.md # Phase 4 PRD
│   ├── adr/                   # Architecture Decision Records
│   └── progress/              # 주간 진행 상황
└── public/                     # 정적 파일
```

| 디렉토리 | 설명 | 상세 문서 | 생성 시점 |
|---------|------|----------|---------|
| `app/` | Next.js App Router, 라우트 및 레이아웃 | [app/README.md](./app/README.md) | 기존 |
| `components/` | React 컴포넌트 (ui/, providers/, editor/) | [components/README.md](./components/README.md) | 기존 + Phase 1 |
| `lib/` | 비즈니스 로직 및 유틸리티 | [lib/README.md](./lib/README.md) | 기존 + Phase 1-3 |
| `hooks/` | 커스텀 React 훅 | [hooks/README.md](./hooks/README.md) | 기존 + Phase 1 |
| `types/` | TypeScript 타입 정의 | [types/README.md](./types/README.md) | Phase 1 |
| `ai-context/` | PRD 및 아키텍처 문서 | [ai-context/README.md](./ai-context/README.md) | 기존 |

## 핵심 설정 파일

| 파일 | 용도 |
|-----|------|
| `components.json` | shadcn/ui 설정 (경로 별칭, 스타일) |
| `tsconfig.json` | TypeScript 설정, `@/*` 경로 별칭 |
| `eslint.config.mjs` | ESLint v9 flat config |
| `postcss.config.mjs` | Tailwind v4 PostCSS 플러그인 |

## 코드 패턴

### Import 경로
```typescript
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
```

### 스타일링
Tailwind CSS v4 + shadcn/ui 시맨틱 토큰:
```tsx
<div className="bg-background text-foreground">
  <Card className="border-border">
    <p className="text-muted-foreground">...</p>
  </Card>
</div>
```

### 다크모드
- `next-themes` 기반 (`ThemeProvider`)
- CSS 클래스 `.dark`로 전환
- `dark:` Tailwind variant 사용

---

## 개발 규칙 (Strict Enforcement)

### 1. 파일 및 디렉토리 생성 규칙

**금지 사항:**
- ❌ 임의로 새 디렉토리 생성 금지
- ❌ 위 구조에 명시되지 않은 위치에 파일 생성 금지
- ❌ `any` 타입 사용 금지 (unknown 사용)
- ❌ `npm`, `yarn`, `pnpm` 사용 금지 (Bun만 사용)

**필수 사항:**
- ✅ 모든 새 파일은 위 디렉토리 구조에 따라 정확한 위치에 생성
- ✅ 새 컴포넌트는 `components/[category]/` 하위에 생성
- ✅ 새 훅은 `hooks/` 하위에 `use-*.ts` 형식으로 생성
- ✅ 타입 정의는 `types/` 하위에 생성
- ✅ 비즈니스 로직은 `lib/` 하위에 생성

### 2. TypeScript 규칙

```typescript
// ✅ 올바른 예시
import type { EntityNode } from "@/types/entity"
import { generateEntityCode } from "@/lib/mikro-orm/generator"

export function exportEntity(entity: EntityNode): string {
  return generateEntityCode(entity)
}

// ❌ 잘못된 예시
import { EntityNode } from "@/types/entity" // type import 누락
import { generateEntityCode } from "../lib/mikro-orm/generator" // 상대 경로 사용

export function exportEntity(entity: any) { // any 사용
  return generateEntityCode(entity)
}
```

**타입 안전성:**
- 모든 함수 파라미터와 리턴 타입 명시
- `strict: true` 모드 준수
- `unknown` 사용 후 타입 가드로 좁히기
- 옵셔널 프로퍼티는 `?:` 명시적 사용

### 3. Import 규칙

```typescript
// 순서: external → internal → types → styles
import { ReactFlow } from "@xyflow/react"           // 1. 외부 라이브러리
import { Button } from "@/components/ui/button"     // 2. 내부 컴포넌트
import { useEditor } from "@/hooks/use-editor"      // 3. 내부 훅
import type { EntityNode } from "@/types/entity"    // 4. 타입 (type import)
import "@xyflow/react/dist/style.css"               // 5. 스타일

// ❌ 상대 경로 금지
import { Button } from "../../components/ui/button" // 잘못됨
import { Button } from "@/components/ui/button"     // 올바름
```

### 4. 컴포넌트 규칙

```typescript
// ✅ 올바른 함수형 컴포넌트
import type { FC } from "react"
import type { EntityNode } from "@/types/entity"

interface EntityCardProps {
  entity: EntityNode
  onEdit?: (entity: EntityNode) => void
}

export const EntityCard: FC<EntityCardProps> = ({ entity, onEdit }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{entity.name}</CardTitle>
      </CardHeader>
    </Card>
  )
}

// ❌ Props 타입 미정의, any 사용
export const EntityCard = ({ entity, onEdit }: any) => { // 잘못됨
  // ...
}
```

**컴포넌트 네이밍:**
- PascalCase (예: `EntityCard`, `RelationshipEdge`)
- 파일명은 kebab-case (예: `entity-card.tsx`, `relationship-edge.tsx`)
- 한 파일에 하나의 메인 컴포넌트 (하위 컴포넌트 허용)

### 5. 훅 규칙

```typescript
// ✅ 올바른 커스텀 훅
import { useState, useCallback } from "react"
import type { EntityNode } from "@/types/entity"

export function useEntityManager() {
  const [entities, setEntities] = useState<EntityNode[]>([])

  const addEntity = useCallback((entity: EntityNode) => {
    setEntities((prev) => [...prev, entity])
  }, [])

  return { entities, addEntity }
}
```

**훅 네이밍:**
- 반드시 `use`로 시작 (예: `useEditor`, `useExport`)
- 파일명: `use-*.ts` 형식
- 단일 책임 원칙 준수

### 6. PRD 및 커밋 규칙

**작업 흐름:**
1. `ai-context/phase-*.md`에서 현재 Phase의 Task 확인
2. Task 시작 시 체크박스 업데이트: `- [ ]` → `- [x]`
3. Task 완료 시 **반드시 한글 커밋 메시지** 작성
4. 다음 Task로 이동

**커밋 메시지 형식:**
```bash
git commit -m "feat(editor): EntityNode 컴포넌트 구현

- ReactFlow 커스텀 노드로 Entity 정보 표시
- 프로퍼티 목록, Primary Key 표시 기능 추가
- 더블클릭 시 편집 모드 진입
- shadcn/ui Card 컴포넌트 활용

관련 Task: Phase 1 - Task 1.3
참고: https://reactflow.dev/examples/nodes/custom-node"
```

**커밋 타입:**
- `feat`: 새 기능 구현
- `fix`: 버그 수정
- `docs`: 문서 수정 (README, PRD 등)
- `refactor`: 코드 리팩토링 (기능 변경 없음)
- `style`: 코드 포맷팅, 세미콜론 등
- `test`: 테스트 추가/수정
- `chore`: 빌드 설정, 패키지 설치 등

**Scope:**
- `editor`: 에디터 관련
- `export`: 내보내기
- `import`: 불러오기
- `ui`: UI 컴포넌트
- `types`: 타입 정의
- `lib`: 라이브러리

---

## Phase 기반 개발

**현재 Phase**: Phase 1 (MVP)

각 Phase는 `ai-context/phase-*.md`에 상세히 정의되어 있습니다. Phase별로 순차적으로 개발하며, 이전 Phase 완료 없이 다음 Phase 시작 금지.

### Phase 개요

1. **Phase 1 (MVP)**: 기본 비주얼 에디터, Entity/Relationship 노드, TypeScript 코드 export
2. **Phase 2 (고급 기능)**: 더 많은 MikroORM 기능, JSON Schema/ERD 이미지 export
3. **Phase 3 (DB 연동)**: SQL DDL export, DDL/JSON import
4. **Phase 4 (최적화)**: UI/UX 개선, 성능 최적화

### Phase 전환 기준

Phase 완료 조건:
- ✅ 모든 필수 Task 완료 (체크박스 모두 체크)
- ✅ 모든 Task에 대한 커밋 생성
- ✅ 진행 상황 문서 업데이트 (`ai-context/progress/`)
- ✅ 다음 Phase로 전환 승인

---

## 문제 해결 가이드

### 1. 패키지 설치 오류
```bash
# ❌ 잘못된 방법
npm install @xyflow/react

# ✅ 올바른 방법
bun add @xyflow/react
```

### 2. 타입 오류
```typescript
// ❌ any 사용
const data: any = getData()

// ✅ unknown + 타입 가드
const data: unknown = getData()
if (isEntityNode(data)) {
  // 이제 data는 EntityNode 타입
}
```

### 3. Import 경로 오류
```typescript
// ❌ 상대 경로
import { Button } from "../../components/ui/button"

// ✅ 절대 경로 (@/ 별칭)
import { Button } from "@/components/ui/button"
```

---

## 참고 자료

- **ReactFlow 공식 문서**: https://reactflow.dev/learn
- **MikroORM 공식 문서**: https://mikro-orm.io/docs/quick-start
- **shadcn/ui**: https://ui.shadcn.com/
- **Next.js 16**: https://nextjs.org/docs
- **Tailwind CSS v4**: https://tailwindcss.com/docs

---

## 기여 시 체크리스트

새 기능 개발 전:
- [ ] 해당 Phase PRD 확인 (`ai-context/phase-*.md`)
- [ ] 디렉토리 구조 확인 (위 구조 준수)
- [ ] 타입 정의 필요 여부 확인 (`types/`)
- [ ] 의존성 설치 필요 시 `bun add` 사용

코드 작성 후:
- [ ] TypeScript strict 모드 통과
- [ ] Import 경로 절대 경로 (`@/`) 사용
- [ ] 타입 안전성 확인 (`any` 사용 금지)
- [ ] 커밋 메시지 작성 (한글, 상세)
- [ ] PRD 체크박스 업데이트
