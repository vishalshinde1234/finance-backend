# Finance Backend API
Backend assignment for Zorvyn FinTech — finance dashboard with role-based access control.

## What I Built
A REST API where Viewer, Analyst and Admin users interact with financial records based on their role.

## Tech Used
Node.js, Express, MongoDB Atlas, JWT, Zod, Helmet, Rate Limiting

## How to Run

npm install
npm run dev

Create .env file

PORT=3000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_secret
JWT_EXPIRES_IN=7d

## Roles
- Viewer — can only view records and dashboard
- Analyst — can view records and access dashboard
- Admin — full access to everything

## APIs

Auth — POST /api/auth/register  POST /api/auth/login  GET /api/auth/me

Users (Admin only) — GET /api/users  POST /api/users  PATCH /api/users/:id/role  PATCH /api/users/:id/status

Records — GET /api/records  POST /api/records  PATCH /api/records/:id  DELETE /api/records/:id

Dashboard (All roles) — GET /api/dashboard/summary  GET /api/dashboard/categories  GET /api/dashboard/trends/monthly  GET /api/dashboard/recent

Filter Records — ?type=income  ?category=salary  ?startDate=2024-01-01  ?page=1&limit=10

## Assumptions
- Admin registers first and manages the system
- Soft delete used — data is never permanently deleted
- Viewer can access dashboard in read-only mode

## What I Focused On
- Clean folder structure — models, middleware, controllers, routes separated
- Role based access control on every protected route
- Parallel DB queries using Promise.all for better performance
- lean() for faster MongoDB reads
- Indexes on type, category, date for fast filtering