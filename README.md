# SmartMart Pro - AI-Powered Supermarket Management System

A comprehensive, production-ready supermarket ERP system built with Next.js 15, MongoDB, and AI integration.

## Features

### Core Modules
- **Executive Dashboard** - Real-time KPIs, charts, and business insights
- **Inventory Management** - Complete CRUD, stock tracking, expiry alerts
- **POS System** - Barcode scanning, cart management, multiple payment methods
- **Digital Receipts** - Print, download, and share receipts
- **Sales Analytics** - Daily/weekly/monthly/yearly views with trends
- **Customer CRM** - Customer profiles, purchase history, loyalty points
- **Supplier Management** - Track suppliers, payments, and outstanding debts
- **Expense Tracking** - Categorized expenses with profit calculation
- **Employee Management** - Staff accounts, performance tracking, attendance
- **Notifications System** - Real-time alerts for stock, expiry, and payments

### AI Features
- **AI Business Assistant** - OpenAI-powered insights and recommendations
- **Sales Prediction** - ML-based demand forecasting
- **Smart Analytics** - Automated business intelligence

### Advanced Features
- **Multi-branch Support** - Manage multiple store locations
- **Online Ordering** - Customer-facing e-commerce
- **WhatsApp Integration** - Order processing via WhatsApp
- **Paystack Integration** - Secure payment processing

## Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, Shadcn UI, Framer Motion
- **Backend**: Next.js Server Actions, Node.js
- **Database**: MongoDB, Mongoose ODM
- **Authentication**: NextAuth.js with role-based access control
- **File Storage**: Cloudinary
- **Charts**: Recharts
- **Payments**: Paystack
- **AI**: OpenAI API

## Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB (local or MongoDB Atlas)
- OpenAI API key (for AI features)
- Cloudinary account (for image uploads)

### Installation

1. Install dependencies:
```bash
npm install


5. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   └── login/             # Authentication pages
├── components/            # Reusable components
├── lib/                   # Utilities and configurations
│   ├── actions/           # Server actions
│   ├── mongodb.ts         # Database connection
│   └── auth.ts            # NextAuth configuration
├── models/                # MongoDB schemas
└── types/                 # TypeScript types
```

## User Roles

### Admin/Owner
- Full access to all features
- Manage employees and branches
- View all analytics and reports
- Configure system settings

### Manager
- Manage products and inventory
- View sales reports
- Manage suppliers and customers
- Track expenses

### Cashier
- Process sales at POS
- Print receipts
- View assigned tasks

## Deployment

### Vercel
1. Push code to GitHub
2. Import project to Vercel
3. Add environment variables
4. Deploy

### MongoDB Atlas
1. Create a free cluster
2. Add connection string to environment variables
3. Enable IP whitelist

### Cloudinary
1. Create account
2. Add environment variables
3. Configure upload presets

## Security Features

- Secure authentication with NextAuth.js
- Password hashing with bcrypt
- Role-based access control
- Protected API routes
- Input validation with Zod

## License

MIT
