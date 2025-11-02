# Admin Web Dashboard - Phase 2

React-based admin dashboard for IT Center Leave & Attendance Management.

## Tech Stack

- **React 18** with TypeScript
- **Vite** for build tooling
- **React Router** for routing
- **React Query** for data fetching
- **Axios** for API calls
- **React Hook Form** + **Zod** for forms

## Features

- Employee leave management
- Admin approvals
- Attendance tracking
- Reports and analytics
- Role-based access control

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables

Create `.env.local`:

```
VITE_API_BASE_URL=http://localhost:8082
```

### Production Build

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── Layout/
│   └── ProtectedRoute/
├── pages/              # Page components
│   ├── Auth/
│   ├── Leave/
│   ├── Attendance/
│   ├── Reports/
│   └── Error/
├── hooks/              # Custom React hooks
├── lib/                # Utilities
├── types/              # TypeScript types
└── utils/              # Helper functions
```

## Scripts

- `npm run dev` - Start dev server
- `npm run build` - Production build
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm test` - Run tests

## Authentication

Uses AWS Cognito JWT tokens stored in localStorage. Protected routes require authentication and specific roles.

## API Integration

All API calls go through the `apiClient` with automatic:
- Token injection
- Error handling
- 401 redirects
- Correlation ID tracking

## Deployment

Deploy to any static hosting:
- Vercel
- Netlify
- AWS S3 + CloudFront
- GitHub Pages

## Development Notes

- Mock login for development (replace with Cognito)
- Responsive design
- Accessibility (WCAG 2.1 AA)
- Error boundaries
- Loading states

## License

MIT

