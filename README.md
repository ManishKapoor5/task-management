# Task Management System

A full-stack Task Management System built with Node.js, Express, TypeScript, Prisma, PostgreSQL, and Next.js.

## Tech Stack

**Backend**
- Node.js + TypeScript
- Express.js
- Prisma ORM
- PostgreSQL (Neon)
- JWT Authentication (Access + Refresh Tokens)
- bcrypt

**Frontend**
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Axios
- React Hot Toast

## Features

- User Registration & Login
- JWT Authentication with Access & Refresh Tokens
- Refresh Token stored in HTTP-only Cookie
- Create, Read, Update, Delete Tasks
- Toggle Task Status (PENDING ↔ COMPLETED)
- Search Tasks by Title
- Filter Tasks by Status
- Pagination
- Toast Notifications

## Project Structure
```
task-management/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   └── task.controller.ts
│   │   ├── middlewares/
│   │   │   └── auth.middleware.ts
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   └── task.routes.ts
│   │   ├── utils/
│   │   │   ├── jwt.ts
│   │   │   └── prisma.ts
│   │   └── index.ts
│   └── .env
└── frontend/
    ├── app/
    │   ├── dashboard/
    │   │   └── page.tsx
    │   ├── login/
    │   │   └── page.tsx
    │   ├── register/
    │   │   └── page.tsx
    │   └── page.tsx
    └── lib/
        └── axios.ts
```

## API Endpoints

**Auth**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/register | Register new user |
| POST | /auth/login | Login user |
| POST | /auth/refresh | Refresh access token |
| POST | /auth/logout | Logout user |

**Tasks** (Protected — Bearer Token required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /tasks | Get all tasks (pagination, filter, search) |
| POST | /tasks | Create new task |
| GET | /tasks/:id | Get single task |
| PATCH | /tasks/:id | Update task |
| DELETE | /tasks/:id | Delete task |
| PATCH | /tasks/:id/toggle | Toggle task status |

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database (local or Neon)

### Backend Setup
```bash
cd backend
npm install
```

Create `.env` file:
```env
DATABASE_URL="postgresql://username:password@host/dbname?sslmode=require"
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
PORT=5000
```

Run migrations:
```bash
npx prisma migrate dev --name init
```

Start server:
```bash
npm run dev
```

Backend runs on `http://localhost:5000`

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`

## Environment Variables

| Variable | Description |
|----------|-------------|
| DATABASE_URL | PostgreSQL connection string |
| ACCESS_TOKEN_SECRET | JWT access token secret |
| REFRESH_TOKEN_SECRET | JWT refresh token secret |
| PORT | Backend port (default: 5000) |
