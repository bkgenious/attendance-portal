# Vedlinks Attendance Portal — Technical Documentation

## Technology Stack Overview

```mermaid
graph TB
    subgraph Frontend
        A[Next.js 14] --> B[React 18]
        B --> C[TypeScript]
        C --> D[TailwindCSS]
    end
    
    subgraph Backend
        E[Fastify] --> F[TypeScript]
        F --> G[Prisma ORM]
        G --> H[MySQL]
    end
    
    Frontend -->|REST API| Backend
```

---

## Languages Used

| Language | Usage | Version |
|----------|-------|---------|
| **TypeScript** | Primary language for both frontend and backend | 5.x |
| **CSS** | Styling via TailwindCSS | 3.x |
| **SQL** | Database queries via Prisma | MySQL 8.0 |

---

## Frontend Stack

| Technology | Purpose | Documentation |
|------------|---------|---------------|
| **Next.js 14** | React framework with App Router | [nextjs.org](https://nextjs.org) |
| **React 18** | UI component library | [react.dev](https://react.dev) |
| **TypeScript** | Type-safe JavaScript | [typescriptlang.org](https://typescriptlang.org) |
| **TailwindCSS** | Utility-first CSS framework | [tailwindcss.com](https://tailwindcss.com) |
| **shadcn/ui** | Radix-based component library | [ui.shadcn.com](https://ui.shadcn.com) |
| **Lucide React** | Icon library | [lucide.dev](https://lucide.dev) |
| **Sonner** | Toast notifications | [sonner.emilkowal.ski](https://sonner.emilkowal.ski) |
| **Zod** | Schema validation | [zod.dev](https://zod.dev) |
| **React Hook Form** | Form state management | [react-hook-form.com](https://react-hook-form.com) |

---

## Backend Stack

| Technology | Purpose | Documentation |
|------------|---------|---------------|
| **Fastify** | High-performance web framework | [fastify.dev](https://fastify.dev) |
| **TypeScript** | Type-safe server code | [typescriptlang.org](https://typescriptlang.org) |
| **Prisma** | Next-gen ORM for database access | [prisma.io](https://prisma.io) |
| **MySQL 8** | Relational database | [mysql.com](https://mysql.com) |
| **@fastify/jwt** | JWT authentication | [github.com/fastify/fastify-jwt](https://github.com/fastify/fastify-jwt) |
| **@fastify/cors** | CORS handling | [github.com/fastify/fastify-cors](https://github.com/fastify/fastify-cors) |
| **@fastify/helmet** | Security headers | [github.com/fastify/fastify-helmet](https://github.com/fastify/fastify-helmet) |
| **@fastify/swagger** | API documentation | [github.com/fastify/fastify-swagger](https://github.com/fastify/fastify-swagger) |
| **bcrypt** | Password hashing | npm: bcrypt |
| **ts-node-dev** | Development server with hot reload | npm: ts-node-dev |

---

## Development Tools

| Tool | Purpose |
|------|---------|
| **npm** | Package manager |
| **ESLint** | Code linting |
| **Prettier** | Code formatting |
| **Prisma CLI** | Database migrations & schema management |
| **Git** | Version control |

---

## Project Structure

```
attendance-portal/
├── frontend/                 # Next.js 14 App
│   ├── app/                  # App Router pages
│   │   ├── (auth)/           # Auth pages (login, register)
│   │   └── (dashboard)/      # Protected dashboard pages
│   ├── components/           # Reusable React components
│   │   ├── ui/               # shadcn/ui primitives
│   │   └── dashboard/        # Dashboard widgets
│   ├── lib/                  # Utility functions
│   └── public/               # Static assets
│
├── backend/                  # Fastify API Server
│   ├── src/
│   │   ├── modules/          # Feature modules
│   │   │   ├── auth/         # Authentication
│   │   │   ├── attendance/   # Attendance tracking
│   │   │   ├── leaves/       # Leave management
│   │   │   ├── admin/        # Executive features
│   │   │   ├── settings/     # System configuration
│   │   │   └── users/        # User management
│   │   ├── plugins/          # Fastify plugins (JWT, Prisma)
│   │   └── services/         # Shared services
│   └── prisma/
│       └── schema.prisma     # Database schema
```

---

## API Architecture

- **REST API** with JSON payloads
- **JWT Authentication** for protected routes
- **Role-Based Access Control (RBAC)** with roles: `SUPER_ADMIN`, `SYSTEM_ADMIN`, `HR`, `EMPLOYEE`
- **Request validation** using Zod schemas
- **Swagger documentation** available at `/documentation`

---

## Database Schema (Key Models)

| Model | Description |
|-------|-------------|
| `User` | Authentication and role assignment |
| `EmployeeProfile` | Employee details (name, department, salary) |
| `Attendance` | Daily check-in/check-out records |
| `LeaveRequest` | Leave applications and approvals |
| `AuditLog` | System activity tracking |
| `Break` | Break time records |
| `Payslip` | Monthly salary records |

---

## Environment Variables

### Backend (`.env`)

```
DATABASE_URL=mysql://user:password@localhost:3306/attendance_db
JWT_SECRET=your-secret-key
PORT=3001
```

### Frontend (`.env.local`)

```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## Running the Application

```bash
# Backend
cd backend
npm install
npx prisma migrate dev
npm run dev        # Runs on http://localhost:3001

# Frontend
cd frontend
npm install
npm run dev        # Runs on http://localhost:3000
```

---

## Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT tokens with expiration
- ✅ CORS protection
- ✅ Helmet security headers
- ✅ Role-based route protection
- ✅ Audit logging for privileged actions

---

*Documentation generated for Vedlinks Attendance Portal v1.0*
