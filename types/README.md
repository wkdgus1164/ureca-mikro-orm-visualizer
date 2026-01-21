# types/

TypeScript 타입 정의 디렉토리.

## 구조

```
types/
├── README.md
├── editor.ts           # 에디터 상태 및 UI 관련 타입
├── entity.ts           # MikroORM Entity 관련 타입
├── relationship.ts     # Entity 간 관계 타입 (OneToOne, OneToMany, etc.)
├── decorator.ts        # MikroORM 데코레이터 관련 타입
└── export.ts           # Export 형식 관련 타입 (JSON, SQL, etc.)
```

## 파일별 역할

### `editor.ts`
- ReactFlow 노드/엣지 확장 타입
- 에디터 설정 및 상태 타입
- 툴바, 패널 등 UI 컴포넌트 타입

### `entity.ts`
- MikroORM Entity를 표현하는 타입
- 프로퍼티, 메서드, 생성자 정의
- 엔티티 메타데이터 타입

### `relationship.ts`
- `@OneToOne`, `@OneToMany`, `@ManyToOne`, `@ManyToMany`
- `Composition` (강한 결합 ◆), `Aggregation` (약한 결합 ◇)
- `Inheritance` (상속 △), `Implementation` (구현 △ 점선)
- 관계 옵션 (nullable, cascade, orphanRemoval, fetchType, deleteRule 등)
- 양방향/단방향 관계 표현

### `decorator.ts`
- `@Entity`, `@Property`, `@PrimaryKey` 등
- 데코레이터 옵션 및 파라미터 타입
- Index, Unique 등 제약조건 타입

### `export.ts`
- TypeScript 코드 생성 관련 타입
- JSON Schema 포맷 타입
- SQL DDL 생성 옵션 (PostgreSQL, MySQL)
- 이미지 export 설정

## 사용 예시

```typescript
import type { EntityNode, EntityProperty } from "@/types/entity"
import type { Relationship, RelationType } from "@/types/relationship"

const userEntity: EntityNode = {
  id: "user-1",
  name: "User",
  properties: [
    { name: "id", type: "number", isPrimaryKey: true },
    { name: "email", type: "string", isUnique: true },
  ],
}

const relationship: Relationship = {
  type: RelationType.OneToMany,
  source: "user-1",
  target: "post-1",
  inversedBy: "author",
}
```

## 네이밍 규칙

- **타입명**: PascalCase (예: `EntityNode`, `RelationshipType`)
- **속성명**: camelCase (예: `isPrimaryKey`, `isNullable`)
- **Enum**: PascalCase (예: `RelationType.OneToMany`)
- **인터페이스 vs 타입**: 확장 가능성이 있으면 interface, 유니온/인터섹션은 type

## 주의사항

- 모든 타입은 엄격하게 정의 (strict mode)
- `any` 사용 금지, 필요시 `unknown` 사용
- 옵셔널 프로퍼티는 명시적으로 `?:` 사용
- JSDoc으로 복잡한 타입 설명 추가
