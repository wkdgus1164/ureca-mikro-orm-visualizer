# app/

Next.js App Router 디렉토리. 모든 라우트와 레이아웃을 포함합니다.

## 구조

```
app/
├── layout.tsx      # 루트 레이아웃 (ThemeProvider, 폰트 설정)
├── page.tsx        # 홈페이지 (/)
├── globals.css     # 전역 스타일, Tailwind v4, CSS 변수
└── favicon.ico     # 파비콘
```

## 주요 파일

### layout.tsx
- `ThemeProvider`: next-themes 기반 다크모드 지원
- Geist 폰트 (Sans, Mono) 로드
- `suppressHydrationWarning`: 테마 하이드레이션 경고 방지

### globals.css
- Tailwind v4 `@theme inline` 블록으로 CSS 변수를 Tailwind 유틸리티로 매핑
- `:root`와 `.dark` 클래스에 oklch 색상 변수 정의
- shadcn/ui 컴포넌트용 시맨틱 색상 토큰

## 라우트 추가

새 페이지 추가 시:
```
app/
├── [route-name]/
│   └── page.tsx    # /route-name 경로
```

레이아웃이 필요하면 해당 폴더에 `layout.tsx` 추가.
