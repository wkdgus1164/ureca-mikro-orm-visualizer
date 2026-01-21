# hooks/

커스텀 React 훅 디렉토리.

## 구조

```
hooks/
└── (훅 파일들)
```

## 훅 작성 규칙

1. 파일명은 `use-[name].ts` 형식 사용
2. 훅 함수명은 `use`로 시작
3. 클라이언트 전용 훅은 `"use client"` 선언

## 예시

```typescript
// hooks/use-mounted.ts
"use client"

import { useEffect, useState } from "react"

export function useMounted() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return mounted
}
```

## 일반적인 훅 패턴

- `use-mounted.ts`: 클라이언트 마운트 상태
- `use-debounce.ts`: 값 디바운스
- `use-local-storage.ts`: localStorage 동기화
- `use-media-query.ts`: 미디어 쿼리 감지
