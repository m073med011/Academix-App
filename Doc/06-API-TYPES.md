# Academix 2.0 — API Types Reference

> All API types are defined in `src/types/api.ts`.  
> These types mirror the MongoDB schemas from the NestJS backend.

---

## 1. Enums & Literal Types

```typescript
type UserRole       = "student" | "freelancer" | "admin" | "organizer" | "instructor" | "user" | "guest"
type CourseLevel    = "beginner" | "intermediate" | "advanced" | "expert"
type EnrollmentType = "free" | "subscription" | "one-time-purchase" | "org-subscription"
type MaterialType   = "video" | "pdf" | "link" | "text" | "quiz" | "assignment"
type PaymentStatus  = "pending" | "success" | "failed" | "refunded" | "cancelled"
type PaymentMethod  = "CARD"
type InvoiceStatus  = "DRAFT" | "ISSUED" | "PAID" | "CANCELLED"
type ChatType       = "PRIVATE" | "GROUP"
type MessageType    = "TEXT" | "IMAGE" | "FILE"
type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE"
type MembershipStatus = "ACTIVE" | "INACTIVE" | "INVITED"
type OTPPurpose     = "EMAIL_VERIFICATION" | "PASSWORD_RESET" | "LOGIN_VERIFICATION"
type DiscountType   = "PERCENTAGE" | "FIXED"
```

---

## 2. Core Entity Types

### Base Entity
```typescript
interface BaseEntity {
  _id: string
  createdAt: string
  updatedAt: string
}
```

### User
```typescript
interface User extends BaseEntity {
  name: string
  email: string
  role: UserRole
  isOAuthUser?: boolean
  provider?: "google" | "credentials"
  purchasedCourses?: string[]
  organizationMemberships?: string[]
  lastActiveOrganization?: string
  imageProfileUrl?: string
  emailVerified?: boolean
  twoFactorEnabled?: boolean
}
```

### Course
```typescript
interface Course extends BaseEntity {
  title: string
  description: string
  instructor: string | User           // Populated or ID
  editors?: string[] | User[]
  price: number
  duration: number
  level: CourseLevel
  category: string
  thumbnailUrl?: string
  isPublished: boolean
  students?: string[] | User[]
  rating?: number
  materials?: string[] | Material[]
  organizationId?: string
  isOrgPrivate?: boolean
  termId?: string
  promoVideoUrl?: string
  brandColor?: string
  modules?: Array<{
    _id?: string
    title: string
    items: Array<{ materialId: string | Material; order?: number }>
  }>
}
```

### Material
```typescript
interface Material extends BaseEntity {
  title: string
  description?: string
  courseId: string
  type: MaterialType
  content?: string
  url?: string
  duration?: number
  order: number
  isPublished?: boolean
  isFreePreview?: boolean
  allowDownloads?: boolean
  points?: number
  dueDate?: string
  submissionTypes?: string[]
  allowLate?: boolean
  openInNewTab?: boolean
  moduleId?: string
  assignmentFileUrl?: string
  quizQuestions?: QuizQuestion[]
  thumbnailUrl?: string
}
```

### Cart
```typescript
interface Cart extends BaseEntity {
  userId: string
  items: CartItem[]
}

interface CartItem {
  courseId: string | Course
  addedDate: string
}

// Extended with populated data
interface CartWithCourses extends Cart {
  items: Array<{
    courseId: string | Course
    addedDate: string
    course?: Course
  }>
  totalPrice: number
  itemCount: number
}
```

### Payment & Invoice
```typescript
interface Payment extends BaseEntity {
  userId: string | User
  courseIds: string[] | Course[]
  amount: number
  currency: string
  status: PaymentStatus
  paymentMethod: PaymentMethod
  paymobOrderId?: string
  paymobTransactionId?: string
  invoiceId?: string
  discountAmount?: number
  originalAmount?: number
}

interface Invoice extends BaseEntity {
  paymentId: string | Payment
  userId: string | User
  courses: string[] | Course[]
  totalAmount: number
  discountAmount: number
  finalAmount: number
  invoiceNumber: string
  status: InvoiceStatus
  issueDate: string
  dueDate: string
}
```

### Chat & Message
```typescript
interface Chat extends BaseEntity {
  type: ChatType
  participants: string[] | User[]
  courseId?: string
  lastMessage?: string | Message
  lastMessageTime?: string
}

interface Message extends BaseEntity {
  chatId: string
  senderId: string | User
  content: string
  type: MessageType
  fileUrl?: string
  isRead: boolean
  readBy?: string[]
}
```

### Organization Types
Organization types are defined in `app/[lang]/(dashboard-layout)/organizations/_types/types.ts` and re-exported from `types/api.ts`.

---

## 3. Request/Response Types

### Authentication
| Type                   | Fields                                            | Purpose |
|------------------------|---------------------------------------------------|---------|
| `LoginRequest`         | `email, password`                                 | Login |
| `LoginResponse`        | Union of success, verify, 2FA                     | 3 possible outcomes |
| `RegisterRequest`      | `name, email, password, role?, imageProfileUrl?`  | Registration |
| `RegisterResponse`     | Union of credentials + OAuth                      | 2 possible outcomes |
| `VerifyEmailRequest`   | `email, code`                                     | Email verification |
| `Verify2FARequest`     | `email, code`                                     | 2FA verification |
| `ForgotPasswordRequest`| `email`                                           | Password reset request |
| `ResetPasswordRequest` | `email, otp, newPassword`                         | Password reset |
| `RefreshTokenRequest`  | `refreshToken`                                    | Token refresh |

### Commerce
| Type                      | Fields                                                          | Purpose |
|---------------------------|-----------------------------------------------------------------|---------|
| `AddToCartRequest`        | `courseId`                                                      | Add course to cart |
| `CreatePaymentRequest`    | `cartId?, courseId?, billingData, discountCode?, paymentMethod` | Initiate payment |
| `CreateBulkPaymentRequest`| `courseIds[], discountCode?`                                    | Bulk purchase |
| `ValidateDiscountRequest` | `code, courseIds[]`                                             | Check discount code |
| `CreateDiscountRequest`   | `code, courseId?, discountType, discountValue, maxUses, expiryDate` | Create discount |

### Courses & Materials
| Type                   | Fields                                             | Purpose |
|------------------------|----------------------------------------------------|---------|
| `CreateCourseRequest`  | `title, description, price, ...`                   | Create course |
| `UpdateCourseRequest`  | `Partial<CreateCourseRequest>`                     | Update course |
| `CreateMaterialRequest`| `title, courseId, type, ...`                       | Create material |
| `CourseFilterParams`   | `page?, limit?, category?, level?, search?, sort?` | Course list filters |

### API Response Wrappers
```typescript
interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data: T
}

interface PaginatedResponse<T> {
  success: boolean
  message: string
  data: T[]
  total: number
  page: number
  totalPages: number
}

interface ApiError {
  success: false
  error: string
  statusCode: number
}
```

---

## 4. Type Patterns & Rules

> **Populated vs ID references:** Many entities have union-typed fields like `instructor: string | User`. When the backend populates the reference, it returns the full object; otherwise, it returns just the ObjectId string. Always check the type at runtime:
> ```typescript
> const instructorName = typeof course.instructor === "string"
>   ? "Unknown"          // Just an ID
>   : course.instructor.name  // Populated User object
> ```

> **Rule:** When adding new API types:
> 1. Add the entity to `types/api.ts`
> 2. Follow the `extends BaseEntity` pattern
> 3. Use union types for populated references
> 4. Keep request types separate from entity types
> 5. Re-export route-specific types via barrel exports
