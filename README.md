# MikroORM Class Diagram Visualizer

MikroORM 엔티티 관계를 비주얼 에디터로 설계하고, TypeScript 코드/JSON/SQL로 내보낼 수 있는 Next.js 애플리케이션.

## 기술 스택

- **프레임워크**: Next.js 16 (App Router) + React 19
- **언어**: TypeScript 5 (strict mode)
- **스타일링**: Tailwind CSS v4 + shadcn/ui
- **비주얼 에디터**: @xyflow/react (ReactFlow)
- **패키지 매니저**: Bun (필수)

## 시작하기

> **중요:** 반드시 `bun`을 사용할 것. `npm`/`yarn`/`pnpm` 사용 금지.

```bash
# 개발 서버 실행
bun dev

# 프로덕션 빌드
bun run build

# ESLint 검사
bun run lint
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 결과를 확인하세요.

## 개발 워크플로우

### Phase별 브랜치 전략

프로젝트는 Phase별로 개발되며, 각 Phase는 독립된 브랜치에서 작업합니다:

```bash
# Phase 1 작업
git checkout -b v1
# ... 작업 진행 ...
git push origin v1

# Phase 2 작업 (v1에서 분기)
git checkout v1
git checkout -b v2
# ... 작업 진행 ...
git push origin v2
```

**브랜치 규칙:**
- Phase N → `vN` 브랜치 (예: Phase 1 → v1)
- Phase N+1은 `vN` 브랜치에서 분기

### 병렬 작업 전략

**개발 속도 향상을 위해 독립적인 작업은 병렬로 진행합니다:**

```bash
# ✅ 병렬 가능 (서로 다른 파일)
- types/entity.ts
- types/relationship.ts
- hooks/use-editor.ts

# ❌ 병렬 불가 (같은 파일 또는 의존성)
- components/editor/canvas.tsx 생성
- components/editor/canvas.tsx 수정
```

**병렬 작업 흐름:**
1. Phase PRD에서 독립적인 Task 그룹 식별
2. 각 독립 작업을 동시에 진행
3. 작업 완료 시 즉시 개별 커밋 (lint/build 검증 후)

상세한 병렬 작업 가이드는 [CLAUDE.md - 병렬 작업 전략](./CLAUDE.md#6-prd-및-커밋-규칙)을 참조하세요.

### 커밋 전 필수 검증

모든 커밋 직전에 반드시 실행:

```bash
bun run lint    # ESLint 검사
bun run build   # 빌드 검증

# 검증 통과 후에만 커밋
git add .
git commit -m "feat(scope): 기능 설명"
```

> **중요:** lint 또는 build 실패 시 **절대 커밋 금지**.

## 프로젝트 구조

```
/
├── app/                    # Next.js App Router
├── components/             # React 컴포넌트
│   ├── ui/                # shadcn/ui 기본 컴포넌트
│   ├── providers/         # Context Providers
│   └── editor/            # 에디터 전용 컴포넌트
├── lib/                    # 비즈니스 로직 및 유틸리티
├── hooks/                  # 커스텀 React 훅
├── types/                  # TypeScript 타입 정의
└── ai-context/            # PRD 및 아키텍처 문서
```

상세한 개발 가이드는 [CLAUDE.md](./CLAUDE.md)를 참조하세요.

## Phase 기반 개발

- **Phase 1 (MVP)**: 기본 비주얼 에디터, Entity/Relationship 노드, TypeScript 코드 export
- **Phase 2 (고급 기능)**: 더 많은 MikroORM 기능, JSON Schema/ERD 이미지 export
- **Phase 3 (DB 연동)**: SQL DDL export, DDL/JSON import
- **Phase 4 (최적화)**: UI/UX 개선, 성능 최적화

각 Phase의 상세한 Task 목록은 `ai-context/phase-*.md`를 참조하세요.

## 참고 자료

- [ReactFlow 공식 문서](https://reactflow.dev/learn)
- [MikroORM 공식 문서](https://mikro-orm.io/docs/quick-start)
- [shadcn/ui](https://ui.shadcn.com/)
- [Next.js 16](https://nextjs.org/docs)
- [프로젝트 개발 가이드](./CLAUDE.md)
