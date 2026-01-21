# lib/

유틸리티 함수와 공유 로직을 포함하는 디렉토리.

## 구조

```
lib/
└── utils.ts    # 공통 유틸리티 함수
```

## 주요 파일

### utils.ts
```typescript
import { cn } from "@/lib/utils"

// className 조건부 병합
cn("base-class", condition && "conditional-class", className)
```

`cn()` 함수:
- `clsx`: 조건부 className 처리
- `tailwind-merge`: Tailwind 클래스 충돌 해결

## 확장 가이드

새 유틸리티 추가 시 도메인별로 파일 분리:
```
lib/
├── utils.ts        # 범용 유틸리티
├── api.ts          # API 호출 헬퍼
├── validation.ts   # 유효성 검사
└── constants.ts    # 상수 정의
```
