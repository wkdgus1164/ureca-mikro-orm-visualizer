# lib/mikro-orm/

MikroORM TypeScript 코드 생성 모듈.

## 구조

```text
lib/mikro-orm/
├── generator.ts              # Public API - 메인 진입점
├── types.ts                  # MikroORM 관련 타입 정의
└── generators/               # 코드 생성기 모듈
    ├── index.ts              # 모듈 통합 export
    ├── utils.ts              # 공통 유틸리티
    ├── enum.ts               # Enum 코드 생성
    ├── property.ts           # Property 코드 생성
    ├── relationship.ts       # Relationship 코드 생성
    ├── imports.ts            # Import 문 생성
    ├── entity.ts             # Entity 클래스 생성
    └── embeddable.ts         # Embeddable 클래스 생성
```

## 파일 설명

### generator.ts (Public API)

외부에서 사용할 메인 진입점. `generators/` 모듈의 기능을 통합하여 제공.

```typescript
import { generateAllDiagramCode } from "@/lib/mikro-orm/generator"

// 다이어그램 전체를 TypeScript 코드로 변환
const codeMap = generateAllDiagramCode(nodes, edges)

for (const [name, code] of codeMap) {
  console.log(`// ${name}.ts`)
  console.log(code)
}
```

**주요 함수:**
- `generateAllDiagramCode(nodes, edges)` - 다이어그램 전체 코드 생성
- `generateEntityCode(entity, edges, allNodes)` - 단일 Entity 코드 생성
- `generateEmbeddableCode(embeddable)` - 단일 Embeddable 코드 생성
- `generateEnumNodeCode(enumNode)` - 단일 Enum 코드 생성

### generators/ 디렉토리

역할별로 분리된 코드 생성기 모듈.

#### utils.ts
공통 유틸리티 함수 및 타입.

```typescript
export interface GeneratorOptions {
  indentSize?: number        // 들여쓰기 크기 (기본: 2)
  collectionImport?: string  // Collection import 경로
}

export function indent(level: number, size?: number): string
export function sanitizeClassName(name: string): string
```

#### enum.ts
Enum 관련 코드 생성.

```typescript
// EnumDefinition → TypeScript enum 코드
export function generateEnumCode(enumDef: EnumDefinition): string

// Property에서 Enum 정의 수집
export function collectEnumDefinitions(properties: EntityProperty[]): EnumDefinition[]

// EnumNode → TypeScript 코드
export function generateEnumNodeCode(enumNode: EnumNode): string
```

#### property.ts
Property 데코레이터 및 선언 생성.

```typescript
// Property 옵션 객체 문자열 생성
export function generatePropertyOptions(property: EntityProperty): string

// 완전한 Property 코드 (데코레이터 + 선언)
export function generateProperty(property: EntityProperty, indentSize: number): string
```

#### relationship.ts
Relationship 관련 코드 생성.

```typescript
// RelationType → 데코레이터 이름
export function getRelationDecorator(relationType: RelationType): string

// Collection 관계 여부 확인
export function isCollectionRelation(relationType: RelationType): boolean

// Relationship 옵션 객체 생성
export function generateRelationshipOptions(data: RelationshipData, indentSize: number): string

// 완전한 Relationship 코드 (데코레이터 + 선언)
export function generateRelationship(
  edge: RelationshipEdge,
  sourceEntity: EntityNode,
  targetEntity: EntityNode,
  indentSize: number
): string | null
```

#### imports.ts
Import 문 생성.

```typescript
// Entity에 필요한 import 정보 수집
export function collectImports(
  entity: EntityNode,
  edges: RelationshipEdge[],
  allNodes: EntityNode[]
): CollectedImports

// Import 문 문자열 생성
export function generateImports(
  decorators: Set<string>,
  relatedEntities: Set<string>,
  needsCollection: boolean,
  needsCascade: boolean
): string
```

#### entity.ts
Entity 클래스 코드 생성.

```typescript
// 단일 Entity 코드 생성
export function generateEntityCode(
  entity: EntityNode,
  edges: RelationshipEdge[],
  allNodes: EntityNode[],
  options?: GeneratorOptions
): string

// 모든 Entity 코드 생성
export function generateAllEntitiesCode(
  nodes: EntityNode[],
  edges: RelationshipEdge[],
  options?: GeneratorOptions
): Map<string, string>
```

#### embeddable.ts
Embeddable 클래스 코드 생성.

```typescript
// 단일 Embeddable 코드 생성
export function generateEmbeddableCode(
  embeddable: EmbeddableNode,
  options?: GeneratorOptions
): string

// 모든 Embeddable 코드 생성
export function generateAllEmbeddablesCode(
  nodes: EmbeddableNode[],
  options?: GeneratorOptions
): Map<string, string>
```

## 사용 예시

### 기본 사용

```typescript
import { generateAllDiagramCode } from "@/lib/mikro-orm/generator"

function exportToTypeScript(nodes: DiagramNode[], edges: RelationshipEdge[]) {
  const codeMap = generateAllDiagramCode(nodes, edges)

  // 각 파일별로 코드 출력
  codeMap.forEach((code, name) => {
    downloadFile(`${name}.ts`, code)
  })
}
```

### 개별 생성기 사용

```typescript
import { generateEntityCode } from "@/lib/mikro-orm/generators/entity"
import { generateEnumCode } from "@/lib/mikro-orm/generators/enum"

// Entity만 생성
const entityCode = generateEntityCode(userEntity, edges, allEntities)

// Enum만 생성
const enumCode = generateEnumCode({
  name: "UserRole",
  values: [
    { key: "Admin", value: "admin" },
    { key: "User", value: "user" },
  ]
})
```

## 생성 코드 예시

### Entity

```typescript
import { Entity, PrimaryKey, Property, OneToMany, Collection } from "@mikro-orm/core"
import { Post } from "./Post"

@Entity()
export class User {
  @PrimaryKey()
  id!: number

  @Property()
  name!: string

  @Property({ unique: true })
  email!: string

  @OneToMany(() => Post, post => post.author)
  posts = new Collection<Post>(this)
}
```

### Embeddable

```typescript
import { Embeddable, Property } from "@mikro-orm/core"

@Embeddable()
export class Address {
  @Property()
  street!: string

  @Property()
  city!: string
}
```

### Enum

```typescript
export enum UserRole {
  Admin = "admin",
  User = "user",
  Guest = "guest",
}
```
