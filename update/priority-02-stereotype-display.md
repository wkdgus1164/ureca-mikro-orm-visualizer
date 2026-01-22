# Priority 02: 스테레오 타입 표기 개선

## 개요
기존 Entity, Enum 노드에 UML 스테레오 타입 표기법 (`<<Entity>>`, `<<Enumeration>>`)을 추가합니다.

**난이도:** 낮음
**병렬 처리:** 가능 (Entity, Enum 노드는 독립적)
**기존 코드 영향:** 최소 (노드 UI만 수정)

---

## 영향받는 컴포넌트

| 컴포넌트 | 변경 사항 |
|---------|----------|
| ✅ 사이드 메뉴 | 영향 없음 |
| ✅ 캔버스 | **노드 헤더에 스테레오 타입 표기 추가** |
| ✅ 프로퍼티 설정 사이드바 | 영향 없음 |
| ✅ Export Code | 영향 없음 (코드 생성은 동일) |

---

## 구체적인 작업 항목

### 1. Entity 노드 (`components/editor/nodes/entity-node.tsx`)

**현재 상태:**
```tsx
// components/editor/nodes/entity-node.tsx 라인 37-88
<NodeCard id={data.id} kind="entity" selected={selected}>
  <NodeHeader>
    <div className="flex items-center gap-2">
      <Shapes className="size-4" />
      <h3 className="font-semibold text-sm">{data.name}</h3>
    </div>
    {/* ... */}
  </NodeHeader>
  {/* ... */}
</NodeCard>
```

**변경 후:**
```tsx
<NodeCard id={data.id} kind="entity" selected={selected}>
  <NodeHeader>
    <div className="flex flex-col gap-1">
      {/* 스테레오 타입 추가 */}
      <div className="text-xs text-muted-foreground">
        &lt;&lt;Entity&gt;&gt;
      </div>
      {/* 기존 헤더 */}
      <div className="flex items-center gap-2">
        <Shapes className="size-4" />
        <h3 className="font-semibold text-sm">{data.name}</h3>
      </div>
    </div>
    {/* ... */}
  </NodeHeader>
  {/* ... */}
</NodeCard>
```

**파일:** `components/editor/nodes/entity-node.tsx`
**라인:** 약 42-48

---

### 2. Enum 노드 (`components/editor/nodes/enum-node.tsx`)

**현재 상태:**
```tsx
// components/editor/nodes/enum-node.tsx 라인 50
<Badge variant="secondary" className="text-xs">
  Enum
</Badge>
```

**변경 후:**
```tsx
<Badge variant="secondary" className="text-xs">
  &lt;&lt;Enumeration&gt;&gt;
</Badge>
```

**파일:** `components/editor/nodes/enum-node.tsx`
**라인:** 약 50

---

### 3. Embeddable 노드 (`components/editor/nodes/embeddable-node.tsx`)

**변경 사항:**
- VO와 같은 개념이므로 `<<VO>>` 표기 추가

**현재 상태:**
```tsx
// components/editor/nodes/embeddable-node.tsx 헤더 부분
<div className="flex items-center gap-2">
  <Package className="size-4" />
  <h3 className="font-semibold text-sm">{data.name}</h3>
</div>
```

**변경 후:**
```tsx
<div className="flex flex-col gap-1">
  {/* 스테레오 타입 추가 */}
  <div className="text-xs text-muted-foreground">
    &lt;&lt;VO&gt;&gt;
  </div>
  {/* 기존 헤더 */}
  <div className="flex items-center gap-2">
    <Package className="size-4" />
    <h3 className="font-semibold text-sm">{data.name}</h3>
  </div>
</div>
```

**파일:** `components/editor/nodes/embeddable-node.tsx`
**라인:** 헤더 부분 (EntityNode와 동일한 패턴)

---

### 4. 스타일링 일관성

**공통 스타일:**
```tsx
// 스테레오 타입 표기 공통 스타일
className="text-xs text-muted-foreground font-mono"
```

**레이아웃:**
- 스테레오 타입을 노드 이름 위에 작은 글씨로 표시
- `font-mono`로 고정폭 폰트 사용 (UML 표기법과 일치)
- `text-muted-foreground`로 강조되지 않게

---

## 병렬 처리 전략

**독립적으로 진행 가능한 작업:**
1. Entity 노드 수정
2. Enum 노드 수정
3. Embeddable 노드 수정

**서브 에이전트 할당 제안:**
- Agent 1: Entity 노드 + Embeddable 노드
- Agent 2: Enum 노드 + 스타일링 검증

---

## 기존 코드에 영향을 주지 않는 방법

1. **노드 크기 조정 주의**
   - 스테레오 타입 추가로 노드 높이가 증가하지 않도록 `gap-1` 사용
   - 기존 레이아웃이 깨지지 않도록 flex-col로 구조화

2. **기존 아이콘과 이름 유지**
   - 스테레오 타입은 추가만 하고 기존 요소는 그대로 유지

3. **테마 호환성**
   - `text-muted-foreground` 사용으로 다크/라이트 모드 자동 대응

---

## 완료 조건

- [ ] `entity-node.tsx`에 `<<Entity>>` 표기 추가
- [ ] `enum-node.tsx`에 `<<Enumeration>>` 표기 추가
- [ ] `embeddable-node.tsx`에 `<<VO>>` 표기 추가
- [ ] 노드 크기 및 레이아웃 검증
- [ ] 다크/라이트 모드 테스트
- [ ] `bun run lint` 통과
- [ ] `bun run build` 성공

---

## 예상 소요 시간

- Entity 노드: 10분
- Enum 노드: 5분
- Embeddable 노드: 10분
- 스타일링 검증: 10분
- **총 예상 시간: 35분**

---

## 시각적 변경 사항

**Before:**
```
┌─────────────────┐
│ 🔷 User         │
│─────────────────│
│ + id: number    │
│ + name: string  │
└─────────────────┘
```

**After:**
```
┌─────────────────┐
│ <<Entity>>      │
│ 🔷 User         │
│─────────────────│
│ + id: number    │
│ + name: string  │
└─────────────────┘
```
