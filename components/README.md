# components/

재사용 가능한 React 컴포넌트 디렉토리.

## 구조

```
components/
├── ui/                            # shadcn/ui + Magic UI 컴포넌트
│   ├── animated-theme-toggler.tsx # Magic UI 테마 토글 (View Transition API)
│   ├── button.tsx
│   ├── card.tsx
│   └── dropdown-menu.tsx
└── providers/                     # Context Provider 컴포넌트
    └── theme-provider.tsx
```

## 디렉토리 설명

### ui/
shadcn/ui 및 Magic UI CLI로 생성된 UI 컴포넌트.
직접 수정하지 않고, 필요 시 래핑하거나 확장.

```bash
# shadcn 컴포넌트 추가
bunx shadcn@latest add [component-name]

# Magic UI 컴포넌트 추가
bunx --bun shadcn@latest add @magicui/[component-name]
```

### providers/
앱 전체에 걸쳐 상태나 기능을 제공하는 Provider 컴포넌트.
- `theme-provider.tsx`: next-themes 기반 다크모드

## 주요 컴포넌트

### AnimatedThemeToggler
View Transition API를 사용한 애니메이션 테마 전환 버튼.

```tsx
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler"

<AnimatedThemeToggler
  className="rounded-full p-2 hover:bg-accent"
  duration={400}  // 애니메이션 지속시간 (ms)
/>
```

## 컴포넌트 작성 규칙

1. 클라이언트 컴포넌트는 파일 상단에 `"use client"` 선언
2. Props 타입은 컴포넌트와 동일 파일에 정의
3. `cn()` 유틸리티로 className 병합 (`@/lib/utils`)
