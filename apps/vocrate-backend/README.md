# Vocrate Backend

Express.js API server for the Vocrate vocabulary learning application.

## Features

- User authentication with JWT tokens
- RESTful API for vocabulary management
- PostgreSQL database with Prisma ORM
- Input validation with Zod schemas
- Secure password hashing with bcrypt

## Setup

1. Install dependencies: `pnpm install`
2. Copy `.env.example` to `.env` and configure
3. Generate Prisma client: `pnpm db:generate`
4. Push database schema: `pnpm db:push`
5. Start development server: `pnpm dev`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)

### Vocabulary
- `GET /api/vocabulary` - Get user's vocabulary (requires auth)
- `POST /api/vocabulary` - Create vocabulary entry (requires auth)
- `PUT /api/vocabulary/:id` - Update vocabulary entry (requires auth)
- `DELETE /api/vocabulary/:id` - Delete vocabulary entry (requires auth)

## Environment Variables

```
DATABASE_URL="postgresql://username:password@localhost:5432/vocrate_db?schema=public"
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"
```
