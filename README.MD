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
- Viewer — only view records
- Analyst — view records + dashboard
- Admin — full access

## APIs

Auth — POST /api/auth/register  POST /api/auth/login  GET /api/auth/me

Users (Admin only) — GET /api/users  POST /api/users  PATCH /api/users/:id/role  PATCH /api/users/:id/status

Records — GET /api/records  POST /api/records  PATCH /api/records/:id  DELETE /api/records/:id

Dashboard (Analyst + Admin) — GET /api/dashboard/summary  GET /api/dashboard/categories  GET /api/dashboard/trends/monthly  GET /api/dashboard/recent

Records filter — ?type=income  ?category=salary  ?startDate=2024-01-01  ?page=1&limit=10

## Assumptions
- Admin pehle register karta hai
- Soft delete use kiya — data permanently delete nahi hota
- Viewer dashboard access nahi kar sakta

## What I Focused On
- Clean structure — models, middleware, controllers, routes alag alag
- Role check har protected route pe
- Promise.all se parallel DB queries
- lean() se fast reads
- Indexes on type, category, date