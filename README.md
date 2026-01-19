# EduFund PH 📚

**Education first, debt last.**

A DeFi protocol on the Sui blockchain enabling tuition advances and education savings for Filipino families.

## Features

### For Students/Parents
- 💰 **Tuition Advances** - Get up to ₱500,000 for tuition with fixed interest rates
- 🎯 **Savings Buckets** - Set and track education savings goals
- 📅 **Repayment Tracking** - Clear installment schedules with early repayment option
- 🔗 **On-Chain Transparency** - Every payment recorded on Sui blockchain

### For Admins
- 📊 **Dashboard** - Overview of users, advances, and repayment stats
- ✅ **Advance Approvals** - Review and approve/reject tuition requests
- 🏫 **School Management** - Manage verified school wallets
- 👥 **User Management** - View registered users

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React + Vite |
| Backend | Express.js + SQLite |
| Auth | JWT + bcrypt |
| Blockchain | Sui Move (planned) |

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### 1. Backend Setup

```bash
cd backend
npm install
npm start
```

Backend runs at `http://localhost:3001`

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@edufund.ph | admin123 |
| Student | Register new account | - |

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Advances
- `GET /api/advances` - List user's advances
- `POST /api/advances` - Request new advance
- `POST /api/advances/:id/repay` - Make payment

### Savings
- `GET /api/savings` - List savings buckets
- `POST /api/savings` - Create new bucket
- `POST /api/savings/:id/deposit` - Make deposit

### Admin
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/users` - List all users
- `GET /api/admin/advances` - List all advances
- `PUT /api/admin/advances/:id` - Approve/reject advance
- `GET /api/admin/schools` - List schools
- `POST /api/admin/schools` - Add school

## Project Structure

```
EduFund/
├── backend/
│   ├── database.js      # SQLite schema
│   ├── server.js        # Express app
│   ├── middleware/
│   │   └── auth.js      # JWT middleware
│   └── routes/
│       ├── auth.js
│       ├── advances.js
│       ├── savings.js
│       └── admin.js
│
├── frontend/
│   ├── src/
│   │   ├── context/     # Auth context
│   │   ├── components/  # Shared UI
│   │   └── pages/
│   │       ├── auth/    # Login, Register
│   │       ├── student/ # Dashboard, Advance, Savings, Repayments
│   │       └── admin/   # Dashboard, Users, Advances, Schools
│   └── index.css        # Design system
│
└── contracts/           # Sui Move (coming soon)
```

## License

MIT

---

Built with ❤️ for Filipino families
