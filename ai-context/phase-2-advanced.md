# Phase 2: 고급 기능

**목표**: 더 많은 MikroORM 기능, JSON Schema export, ERD 이미지 export

**예상 완료 기간**: 1-2주

**의존성**: Phase 1 완료 필수

---

## 진행 상황

- [x] Embeddable 지원
- [x] Index 및 Unique 제약조건
- [x] Enum 타입 지원
- [x] JSON Schema export
- [x] ERD 이미지 export (PNG, SVG)
- [x] 다이어그램 저장/불러오기 (JSON)

---

## 핵심 목표

1. ✅ MikroORM의 고급 기능 (Embeddable, Index, Enum) 지원
2. ✅ JSON Schema 형식으로 export 가능
3. ✅ ERD 이미지 (PNG, SVG) 다운로드 가능
4. ✅ 작업 중인 다이어그램을 JSON으로 저장/불러오기 가능

---

## 필수 기능

### 1. Embeddable 지원

**개념:**
- Embeddable은 독립적인 Entity가 아니라 다른 Entity에 내장되는 객체
- 재사용 가능한 필드 그룹 (예: Address, Money)

**UI:**
- 새 노드 타입: "Embeddable Node"
- Embeddable 노드는 Entity 노드와 시각적으로 구분 (색상, 테두리 스타일)
- Embeddable → Entity 연결 시 `@Embedded` 데코레이터 생성

**코드 생성 예시:**
```typescript
@Embeddable()
export class Address {
  @Property()
  street!: string

  @Property()
  city!: string
}

@Entity()
export class User {
  @Embedded(() => Address)
  address!: Address
}
```

---

### 2. Index 및 Unique 제약조건

**기능:**
- Entity 레벨 Index 정의
- 복합 Index (여러 컬럼)
- Unique 제약조건

**UI:**
- Entity 편집 패널에 "Indexes" 섹션 추가
- Index 추가 버튼
- 컬럼 선택 (다중 선택 가능)

**코드 생성 예시:**
```typescript
@Entity()
@Index({ properties: ['email', 'username'] })
@Unique({ properties: ['email'] })
export class User {
  // ...
}
```

---

### 3. Enum 타입 지원

**기능:**
- Property 타입으로 Enum 지원
- Enum 정의 및 값 목록 관리

**UI:**
- Property 타입 드롭다운에 "Enum" 추가
- Enum 선택 시 Enum 이름 및 값 목록 입력 UI

**코드 생성 예시:**
```typescript
export enum UserRole {
  Admin = "admin",
  User = "user",
  Guest = "guest",
}

@Entity()
export class User {
  @Enum(() => UserRole)
  role!: UserRole
}
```

---

### 4. JSON Schema Export

**기능:**
- 현재 다이어그램을 JSON Schema 형식으로 export
- 다른 도구와의 연동 가능

**JSON Schema 구조:**
```json
{
  "entities": [
    {
      "name": "User",
      "tableName": "users",
      "properties": [
        {
          "name": "id",
          "type": "number",
          "isPrimaryKey": true
        },
        {
          "name": "email",
          "type": "string",
          "isUnique": true
        }
      ]
    }
  ],
  "relationships": [
    {
      "type": "OneToMany",
      "source": "User",
      "target": "Post",
      "sourceProperty": "posts",
      "targetProperty": "author"
    }
  ]
}
```

**UI:**
- Export 모달에 "Format" 드롭다운 추가 (TypeScript, JSON Schema)
- JSON Schema 선택 시 JSON 출력

---

### 5. ERD 이미지 Export

**기능:**
- 현재 캔버스를 이미지 (PNG, SVG)로 export
- ReactFlow의 `toPng`, `toSvg` 유틸 사용

**UI:**
- Export 모달에 "Export as Image" 버튼 추가
- 포맷 선택 (PNG, SVG)
- 해상도 선택 (1x, 2x, 4x)

**구현:**
```typescript
import { toPng, toSvg } from "react-flow-renderer"

const handleExportImage = async (format: "png" | "svg") => {
  const dataUrl = format === "png" ? await toPng(reactFlowInstance) : await toSvg(reactFlowInstance)
  // 다운로드 로직
}
```

---

### 6. 다이어그램 저장/불러오기

**기능:**
- 현재 작업 중인 다이어그램을 JSON 파일로 저장
- 저장된 JSON 파일 불러오기

**저장 형식:**
```json
{
  "version": "1.0",
  "nodes": [...],
  "edges": [...],
  "metadata": {
    "createdAt": "2026-01-21T12:00:00Z",
    "updatedAt": "2026-01-21T12:30:00Z"
  }
}
```

**UI:**
- 툴바에 "Save" / "Load" 버튼 추가
- Save: JSON 파일 다운로드
- Load: 파일 선택 → JSON 파싱 → 캔버스 업데이트

---

## 작업 단위 (Task Breakdown)

### Task 2.1: Embeddable 노드 타입 구현

**담당**: Advanced Node Types
**예상 난이도**: Medium
**의존성**: Phase 1 완료

**세부 작업:**
1. `types/entity.ts`에 EmbeddableNode 타입 추가
2. `components/editor/nodes/embeddable-node.tsx` 생성
3. ReactFlow nodeTypes에 embeddable 등록
4. 코드 생성 로직에 `@Embeddable` 데코레이터 추가

**완료 조건:**
- [x] Embeddable 노드 추가 및 렌더링
- [x] Entity와 시각적 구분
- [x] `@Embeddable` 데코레이터 코드 생성

**커밋 메시지 템플릿:**
```
feat(editor): Embeddable 노드 타입 구현

- EmbeddableNode 타입 및 컴포넌트 추가
- @Embeddable, @Embedded 데코레이터 코드 생성
- Entity와 시각적 구분 (색상, 아이콘)

관련 Task: Phase 2 - Task 2.1
참고: https://mikro-orm.io/docs/embeddables
```

---

### Task 2.2: Index 및 Unique 제약조건 UI 구현

**담당**: Constraints UI
**예상 난이도**: Medium
**의존성**: Phase 1 완료

**세부 작업:**
1. Entity 편집 패널에 "Indexes" 섹션 추가
2. Index 추가/편집/삭제 UI
3. 코드 생성 로직에 `@Index`, `@Unique` 데코레이터 추가

**완료 조건:**
- [x] Indexes UI 구현
- [x] 복합 Index 지원
- [x] `@Index`, `@Unique` 코드 생성

**커밋 메시지 템플릿:**
```
feat(editor): Index 및 Unique 제약조건 UI 구현

- Entity 편집 패널에 Indexes 섹션 추가
- Index 추가/편집/삭제 기능
- 복합 Index 지원 (다중 컬럼 선택)
- @Index, @Unique 데코레이터 코드 생성

관련 Task: Phase 2 - Task 2.2
```

---

### Task 2.3: Enum 타입 지원

**담당**: Enum Support
**예상 난이도**: Medium
**의존성**: Phase 1 완료

**세부 작업:**
1. Property 타입 드롭다운에 "Enum" 추가
2. Enum 정의 UI (이름, 값 목록)
3. 코드 생성 로직에 Enum export 추가

**완료 조건:**
- [x] Enum 타입 선택 가능
- [x] Enum 값 목록 편집 UI
- [x] `@Enum` 데코레이터 및 Enum export 코드 생성

**커밋 메시지 템플릿:**
```
feat(editor): Enum 타입 지원 구현

- Property 타입에 Enum 추가
- Enum 이름 및 값 목록 편집 UI
- @Enum 데코레이터 및 Enum export 코드 생성

관련 Task: Phase 2 - Task 2.3
```

---

### Task 2.4: JSON Schema Export 구현

**담당**: JSON Export
**예상 난이도**: Medium
**의존성**: Phase 1 완료

**세부 작업:**
1. `lib/export/json.ts` 생성
2. Entity/Relationship → JSON Schema 변환 로직
3. Export 모달에 JSON Schema 옵션 추가

**완료 조건:**
- [x] generateJsonSchema 함수 구현
- [x] Export 모달에서 JSON Schema 선택 가능
- [x] JSON 다운로드 기능

**커밋 메시지 템플릿:**
```
feat(export): JSON Schema export 구현

- lib/export/json.ts 생성
- generateJsonSchema 함수로 다이어그램 → JSON 변환
- Export 모달에 JSON Schema 포맷 추가
- JSON 파일 다운로드 기능

관련 Task: Phase 2 - Task 2.4
```

---

### Task 2.5: ERD 이미지 Export 구현

**담당**: Image Export
**예상 난이도**: Medium
**의존성**: Phase 1 완료

**세부 작업:**
1. `lib/export/image.ts` 생성
2. ReactFlow `toPng`, `toSvg` 유틸 활용
3. Export 모달에 이미지 export 옵션 추가

**완료 조건:**
- [x] PNG, SVG export 기능
- [x] 해상도 선택 (1x, 2x, 4x)
- [x] Export 모달 UI 업데이트

**커밋 메시지 템플릿:**
```
feat(export): ERD 이미지 export 구현 (PNG, SVG)

- lib/export/image.ts 생성
- ReactFlow toPng, toSvg 유틸 활용
- PNG, SVG 포맷 지원
- 해상도 선택 기능 (1x, 2x, 4x)

관련 Task: Phase 2 - Task 2.5
참고: https://reactflow.dev/examples/misc/download-image
```

---

### Task 2.6: 다이어그램 저장/불러오기 구현

**담당**: Save/Load
**예상 난이도**: Medium
**의존성**: Phase 1 완료

**세부 작업:**
1. 툴바에 "Save" / "Load" 버튼 추가
2. Save: 현재 상태 → JSON 파일 다운로드
3. Load: 파일 선택 → JSON 파싱 → 상태 업데이트

**완료 조건:**
- [x] Save 버튼 클릭 시 JSON 다운로드
- [x] Load 버튼 클릭 시 파일 선택 UI
- [x] JSON 파싱 및 캔버스 업데이트
- [x] 오류 처리 (잘못된 JSON)

**커밋 메시지 템플릿:**
```
feat(editor): 다이어그램 저장/불러오기 기능 구현

- 툴바에 Save, Load 버튼 추가
- Save: 현재 노드/엣지 → JSON 파일 다운로드
- Load: JSON 파일 선택 → 캔버스 업데이트
- JSON 파싱 오류 처리 및 사용자 알림

관련 Task: Phase 2 - Task 2.6
```

---

## 제외 사항

Phase 2에서 구현하지 않는 것들:
- ❌ SQL DDL export (Phase 3)
- ❌ DDL/JSON import (Phase 3)
- ❌ 자동 레이아웃 (Phase 4)
- ❌ 협업 기능 (추후 논의)

---

## 성공 메트릭

Phase 2 완료 기준:
1. ✅ Embeddable 노드 추가 및 코드 생성 가능
2. ✅ Index, Unique 제약조건 정의 및 코드 생성 가능
3. ✅ Enum 타입 프로퍼티 정의 및 코드 생성 가능
4. ✅ JSON Schema export 가능
5. ✅ ERD 이미지 (PNG, SVG) export 가능
6. ✅ 다이어그램 저장 및 불러오기 가능

---

## 다음 단계

Phase 2 완료 후:
- Phase 3 시작: SQL DDL export, DDL/JSON import
