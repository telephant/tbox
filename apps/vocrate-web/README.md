# Vocrate Web

Next.js frontend application for the Vocrate vocabulary learning platform.

## Features

- Mobile-first responsive design
- User authentication with JWT tokens
- Protected routes with authentication guards
- Modern UI with Tailwind CSS
- State management with Zustand
- Form handling with React Hook Form
- Toast notifications

## Setup

1. Install dependencies: `pnpm install`
2. Copy `.env.example` to `.env.local` and configure
3. Start development server: `pnpm dev`

## Environment Variables

```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## Pages

- `/` - Dashboard (protected)
- `/login` - User login
- `/register` - User registration

## Components

- `AuthGuard` - Protects routes and handles authentication state
- Authentication forms with validation
- Responsive mobile-first layouts

## Development

The application uses:
- Next.js 15 with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- Zustand for state management
- Axios for API calls
