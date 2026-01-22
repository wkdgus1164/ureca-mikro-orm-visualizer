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
    ├── embeddable.ts         # Embeddable 클래스 생성
    └── interface.ts          # Interface 코드 생성
```

## 파일 설명

### generator.ts (Public API)

외부에서 사용할 메인 진입점. `generators/` 모듈의 기능을 통합하여 제공.

```typescript
import {
  generateAllDiagramCode,
  generateAllDiagramCodeCategorized,
  type CategorizedGeneratedCode
} from "@/lib/mikro-orm/generator"

// 다이어그램 전체를 TypeScript 코드로 변환 (단일 Map)
const codeMap = generateAllDiagramCode(nodes, edges)

for (const [name, code] of codeMap) {
  console.log(`// ${name}.ts`)
  console.log(code)
}

// 카테고리별로 분류된 코드 생성 (폴더 구조 지원)
const categorized = generateAllDiagramCodeCategorized(nodes, edges)
// categorized.entities   - Entity 파일들
// categorized.embeddables - Embeddable 파일들
// categorized.enums      - Enum 파일들
// categorized.interfaces - Interface 파일들
```

**주요 타입:**
- `CategorizedGeneratedCode` - 카테고리별로 분류된 생성 코드 결과

```typescript
interface CategorizedGeneratedCode {
  entities: Map<string, string>
  embeddables: Map<string, string>
  enums: Map<string, string>
  interfaces: Map<string, string>
}
```

**주요 함수:**
- `generateAllDiagramCode(nodes, edges)` - 다이어그램 전체 코드 생성 (단일 Map)
- `generateAllDiagramCodeCategorized(nodes, edges)` - 카테고리별 분류된 코드 생성
- `generateEntityCode(entity, edges, allNodes)` - 단일 Entity 코드 생성
- `generateEmbeddableCode(embeddable)` - 단일 Embeddable 코드 생성
- `generateEnumNodeCode(enumNode)` - 단일 Enum 코드 생성
- `generateInterfaceCode(interfaceNode)` - 단일 Interface 코드 생성

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
// Inheritance/Implementation/Dependency는 null 반환 (MikroORM 데코레이터가 아님)
export function getRelationDecorator(relationType: RelationType): string | null

// Collection 관계 여부 확인
export function isCollectionRelation(relationType: RelationType): boolean

// Relationship 옵션 객체 생성
export function generateRelationshipOptions(data: RelationshipData, indentSize: number): string

// 완전한 Relationship 코드 (데코레이터 + 선언)
// Dependency 관계는 null 반환 (코드 생성하지 않음, import만 처리)
export function generateRelationship(
  edge: RelationshipEdge,
  sourceEntity: EntityNode,
  targetEntity: EntityNode,
  indentSize: number
): string | null
```

**Dependency 관계 처리:**
- `Dependency`는 UML의 의존 관계로, 한 클래스가 다른 클래스를 일시적으로 사용하는 약한 관계
- MikroORM 데코레이터가 아니므로 `@OneToMany` 등의 코드는 생성하지 않음
- 대신 import 문만 생성하여 타입 참조 가능하게 함

#### imports.ts
Import 문 생성.

```typescript
// Entity에 필요한 import 정보 수집
// Dependency 관계: 데코레이터는 추가하지 않고 relatedEntities에만 추가
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

**Dependency 관계 import 처리:**
- Dependency 관계의 타겟 Entity는 `relatedEntities`에 포함되어 import 문 생성
- MikroORM 데코레이터(`@OneToMany` 등)는 추가하지 않음
- 생성 예시: `import { PaymentGateway } from "./PaymentGateway"`

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

#### interface.ts
Interface 코드 생성.

```typescript
// 단일 Interface 코드 생성
export function generateInterfaceCode(
  interfaceNode: InterfaceNode,
  options?: GeneratorOptions
): string

// 모든 Interface 코드 생성
export function generateAllInterfacesCode(
  nodes: InterfaceNode[],
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

### 카테고리별 폴더 구조로 내보내기

```typescript
import { generateAllDiagramCodeCategorized } from "@/lib/mikro-orm/generator"
import JSZip from "jszip"

async function exportAsZip(nodes: DiagramNode[], edges: RelationshipEdge[]) {
  const { entities, embeddables, enums, interfaces } = generateAllDiagramCodeCategorized(nodes, edges)
  const zip = new JSZip()

  // 카테고리별 폴더에 파일 추가
  entities.forEach((code, name) => {
    zip.folder("entities")?.file(`${name}.ts`, code)
  })
  embeddables.forEach((code, name) => {
    zip.folder("embeddables")?.file(`${name}.ts`, code)
  })
  enums.forEach((code, name) => {
    zip.folder("enums")?.file(`${name}.ts`, code)
  })
  interfaces.forEach((code, name) => {
    zip.folder("interfaces")?.file(`${name}.ts`, code)
  })

  // ZIP 파일 생성
  const content = await zip.generateAsync({ type: "blob" })
  downloadBlob(content, "mikro-orm-entities.zip")
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

### Entity with Inheritance/Implementation

상속(`Inheritance`) 및 구현(`Implementation`) 관계가 있으면 클래스 선언에 `extends`/`implements` 키워드가 추가됩니다.

```typescript
import { Entity, PrimaryKey, Property } from "@mikro-orm/core"
import { Animal } from "./Animal"
import { IRunnable } from "./IRunnable"

@Entity()
export class Dog extends Animal implements IRunnable {
  @PrimaryKey()
  id!: number

  @Property()
  breed!: string
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

### Interface

```typescript
export interface ITimestampable {
  createdAt: Date
  updatedAt: Date
}
```

### Dependency 관계

Dependency 관계가 있는 Entity의 경우, 타겟 Entity에 대한 import만 생성됩니다:

```typescript
import { Entity, PrimaryKey, Property } from "@mikro-orm/core"
import { PaymentGateway } from "./PaymentGateway"  // Dependency import
import { Logger } from "./Logger"                   // Dependency import

@Entity()
export class OrderService {
  @PrimaryKey()
  id!: number

  @Property()
  name!: string

  // Dependency 관계는 프로퍼티로 생성되지 않음
  // 메서드 파라미터나 일시적 사용을 의미
}
```
