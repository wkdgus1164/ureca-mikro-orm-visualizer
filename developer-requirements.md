
# 스테레오 타입의 분류

1. Aggregate Root (집합 루트)


<<Root>>
AggregateRootName
* DDD의 핵심 개념으로, 트랜잭션 일관성의 경계를 정의하는 엔티티입니다
* Repository를 통해 조회/저장되는 기본 단위이며, 외부에서는 반드시 Root를 통해서만 내부 엔티티에 접근해야 합니다
* 하나의 Aggregate는 하나의 Root와 0개 이상의 Entity 및 VO를 포함할 수 있습니다
* 고유한 식별자(ID)를 가지며, 데이터베이스의 Primary Key로 매핑됩니다
* 예시: Order, User, Product 등
2. Entity (엔티티)


<<Entity>>
EntityName
* Aggregate Root가 아닌 엔티티로, Root에 종속되어 존재합니다
* 고유한 식별자(ID)를 가지지만, Root를 통해서만 접근되어야 합니다
* 독립적으로 Repository를 가지지 않으며, Root의 생명주기에 연결됩니다
* 동일성(Identity)을 기준으로 비교되며, 속성이 같아도 ID가 다르면 다른 객체입니다
* 예시: OrderItem (Order의 Entity), Address (User의 Entity)
3. Enumeration (열거형)


<<Enumeration>>
EnumName
* 고정된 상수 집합을 표현하는 타입입니다
* 주로 상태(Status), 타입(Type), 카테고리(Category) 등을 정의할 때 사용합니다
* 코드의 타입 안정성을 높이고, 유효하지 않은 값의 입력을 방지합니다
* 예시: OrderStatus { PENDING, CONFIRMED, SHIPPED, DELIVERED }, UserRole { ADMIN, USER, GUEST }
4. VO (Value Object, 값 객체)


<<VO>>
VoName
* 식별자가 없는 불변(immutable) 객체로, 값 그 자체로 의미를 가집니다
* 동등성(Equality)을 기준으로 비교되며, 모든 속성이 같으면 같은 객체입니다
* 독립적인 테이블이 아닌 Entity나 Root에 임베디드(embedded) 되어 저장됩니다
* 비즈니스 로직을 캡슐화하여 도메인 개념을 명확히 표현합니다
* 예시: Money { amount, currency }, Email, PhoneNumber, Address { street, city, zipCode }
5. Interface (인터페이스)


<<Interface>>
InterfaceName
* AggregateRoot, Entity가 구현해야 할 계약(contract) 또는 뼈대를 정의합니다
* 다형성(polymorphism)을 활용하여 유연한 설계를 가능하게 합니다
* 주로 도메인 서비스, Repository 인터페이스 정의에 사용됩니다
* 구현체와 인터페이스를 분리하여 의존성 역전 원칙(DIP)을 준수합니다
* 예시: IOrderRepository, IPaymentGateway, IAuditable { createdAt, updatedAt }



# Relation의 분류

**Association (연관)**은 두 클래스 간의 가장 기본적인 관계로, 한 클래스가 다른 클래스를 알고 있거나 사용하는 관계입니다. 실선으로 표현하며, 방향성이 있을 수도 있고 없을 수도 있습니다. 예를 들어 Student와 Course 클래스가 있다면, 학생이 수강하는 과목이라는 연관관계가 성립합니다. 코드상으로는 한 클래스가 다른 클래스의 인스턴스를 멤버 변수나 메서드 파라미터로 가지는 형태입니다.

**Inheritance (상속)**은 "is-a" 관계로, 자식 클래스가 부모 클래스의 속성과 메서드를 물려받는 관계입니다. 빈 삼각형 화살표로 표현하며, 화살표는 부모 클래스를 가리킵니다. Animal 클래스를 상속받는 Dog 클래스처럼, 일반화된 개념에서 구체적인 개념으로 확장되는 구조입니다. Flutter에서 StatefulWidget을 상속받아 커스텀 위젯을 만드는 것이 좋은 예시입니다.

**Implementation (구현)**은 클래스가 인터페이스를 구현하는 관계입니다. 빈 삼각형 화살표에 점선으로 표현되며, 인터페이스에 정의된 메서드를 클래스가 반드시 구현해야 합니다. NestJS에서 서비스 클래스가 특정 인터페이스를 구현하는 경우나, Flutter의 ChangeNotifier를 구현하는 상태 관리 클래스가 이에 해당합니다.

**Dependency (의존)**는 가장 약한 관계로, 한 클래스가 다른 클래스를 일시적으로 사용하는 관계입니다. 점선 화살표로 표현하며, 주로 메서드의 파라미터나 지역 변수, 또는 정적 메서드 호출로 나타납니다. 예를 들어 OrderService가 PaymentGateway를 메서드 파라미터로 받아 일시적으로 사용하는 경우입니다.

**Composition (합성)**은 "whole-part" 관계 중 강한 결합을 나타냅니다. 채워진 다이아몬드로 표현하며, 부모 객체가 삭제되면 자식 객체도 함께 삭제되는 강한 생명주기 의존성이 있습니다. Car와 Engine 관계처럼, 자동차가 없으면 해당 엔진도 의미가 없는 경우입니다. 코드상으로는 부모 클래스가 자식 객체를 생성하고 소유합니다.

**Aggregation (집합)**은 Composition보다 약한 "whole-part" 관계입니다. 빈 다이아몬드로 표현하며, 부모 객체가 삭제되어도 자식 객체는 독립적으로 존재할 수 있습니다. University와 Professor 관계처럼, 대학이 사라져도 교수는 다른 곳에서 존재할 수 있는 경우입니다. 참조만 가지고 있고 생명주기는 독립적입니다.
실무에서는 Composition과 Aggregation의 구분이 모호할 수 있어서, 많은 경우 단순히 Association으로 표현하고 multiplicity(다중성)와 방향성으로 관계를 명확히 하는 경우도 많습니다.


—

# 구현 조건

- 엔티티 간의 관계에 Lazy, Eager 와 같은 FetchType을 설정할 수 있어야 합니다.
- 부모 엔티티가 삭제되는 경우, 자식 엔티티가 어떻게 반응할지 deleterule을 설정할 수 있어야 합니다.
- 클래스내의 에트리뷰트는 수 많은 타입을 가질 수 있으므로, 정해진 값이 아닌 사용자의 타이핑으로 직접 입력 가능하게 해야 합니다.
