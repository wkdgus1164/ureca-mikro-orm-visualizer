# Priority 05: VO 타입 추가

## 개요
기존 Embeddable을 VO(Value Object)로 이름 변경하고, 스테레오 타입 `<<VO>>`를 표시합니다. 코드 생성은 동일하게 `@Embeddable()`을 사용합니다.

**난이도:** 낮음
**병렬 처리:** 불가 (Priority 02와 중복 작업)
**기존 코드 영향:** 최소 (이미 Priority 02에서 작업 완료)

---

## 작업 상태

**Priority 02 (스테레오 타입 표기 개선)**에서 이미 완료 예정:
- `embeddable-node.tsx`에 `<<VO>>` 표기 추가

**이 우선순위는 실질적으로 추가 작업 없음**

---

## 영향받는 컴포넌트

| 컴포넌트 | 변경 사항 |
|---------|----------|
| ✅ 사이드 메뉴 | Embeddable → VO 표시 (선택사항) |
| ✅ 캔버스 | `<<VO>>` 스테레오 타입 (Priority 02 완료) |
| ✅ 프로퍼티 설정 사이드바 | 영향 없음 |
| ✅ Export Code | 영향 없음 (`@Embeddable()` 유지) |

---

## 구체적인 작업 항목

### 1. 노드 표기 (Priority 02에서 완료)

**파일:** `components/editor/nodes/embeddable-node.tsx`

**변경 사항:**
```tsx
<div className="flex flex-col gap-1">
  {/* 스테레오 타입 */}
  <div className="text-xs text-muted-foreground font-mono">
    &lt;&lt;VO&gt;&gt;
  </div>
  {/* 헤더 */}
  <div className="flex items-center gap-2">
    <Package className="size-4" />
    <h3 className="font-semibold text-sm">{data.name}</h3>
  </div>
</div>
```

**상태:** ✅ Priority 02에서 이미 작업 완료

---

### 2. 툴바 버튼 텍스트 변경 (선택사항)

**현재:**
```tsx
<Button>
  <Package className="mr-2 size-4" />
  Embeddable
</Button>
```

**변경 후 (선택사항):**
```tsx
<Button>
  <Package className="mr-2 size-4" />
  VO
</Button>
```

**파일:** `components/editor/toolbar/add-node-buttons.tsx`
**선택 이유:** "Embeddable"이 더 기술적으로 정확하므로 변경하지 않는 것을 권장

---

### 3. 타입 이름 변경 검토

**현재 타입 구조:**
```typescript
// types/entity.ts
export type NodeKind = "entity" | "embeddable" | "enum" | "root"

export interface EmbeddableNode extends Node {
  type: "embeddable"
  data: EmbeddableData
}
```

**변경 검토:**
- `"embeddable"` → `"vo"`로 변경?
- `EmbeddableNode` → `VONode`로 변경?

**권장 사항: 변경하지 않음**
- 이유 1: MikroORM 데코레이터가 `@Embeddable()`이므로 일관성 유지
- 이유 2: 기존 다이어그램 데이터 호환성 깨짐
- 이유 3: 코드베이스 전체에 `embeddable` 용어 사용 중

**대안:**
- 스테레오 타입 `<<VO>>`로만 시각적 구분 (Priority 02 완료)

---

## 병렬 처리 전략

**이 우선순위는 독립적인 작업 없음**
- Priority 02의 일부로 이미 완료

---

## 기존 코드에 영향을 주지 않는 방법

1. **타입 이름은 `embeddable` 유지**
   - 기존 데이터 호환성 보장
   - MikroORM 용어와 일치

2. **시각적 표기만 `<<VO>>`**
   - 개발자에게 도메인 개념 전달
   - 코드 생성은 `@Embeddable()` 유지

---

## 완료 조건

- [x] `embeddable-node.tsx`에 `<<VO>>` 표기 추가 (Priority 02 완료)
- [ ] 툴바 버튼 텍스트 변경 검토 (선택사항)
- [ ] 타입 이름 변경 검토 (권장하지 않음)

---

## 예상 소요 시간

- **실질적 작업 없음 (Priority 02에서 완료)**
- 선택사항 작업: 5분

---

## 결론

**이 우선순위는 Priority 02 (스테레오 타입 표기 개선)에 포함됩니다.**

VO와 Embeddable은 같은 개념이며, 사용자 답변에 따르면 코드베이스에서도 동일하게 `@Embeddable()` 데코레이터를 사용합니다.

**권장 사항:**
- Priority 05는 별도 작업 없이 Priority 02 완료로 충족됨
- 타입 이름은 `embeddable` 유지
- 스테레오 타입 `<<VO>>`로 도메인 개념 표현
