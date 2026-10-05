# 🍔 Food Farma (Eat N Bite) - Modern Food Ordering Platform

[![React](https://img.shields.io/badge/React-19.x-61dafb?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646cff?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-38bdf8?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Sequelize](https://img.shields.io/badge/ORM-Sequelize-52b0e7?logo=sequelize&logoColor=white)](https://sequelize.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A full-stack food delivery and ordering web application built with **React 19**, **TypeScript**, **Tailwind CSS**, and an **Express / Sequelize** backend. It features real-time cart management, authentication, role-based admin dashboard, mock Razorpay payment processing, and order tracking.

---

## 🌟 Key Features

### 👤 Customer Experience
- **Interactive Food Catalog**: Filter meals by category (Pizza, Burger, Pasta, Desserts, Beverages, etc.) and search dynamically.
- **Restaurant Details & Ratings**: View curated restaurants, ratings, delivery times, and price points.
- **Cart & Checkout Workflow**: Slide-over cart drawer with quantity adjustments, item removal, and live order summary calculations.
- **Razorpay Payment Integration**: Integrated checkout supporting card, UPI, net banking, or Cash on Delivery (COD).
- **Order History & Receipts**: View past orders, status badges (`PENDING`, `PREPARING`, `OUT_FOR_DELIVERY`, `DELIVERED`, `CANCELLED`), and generated digital receipts.

### 🛡️ Authentication & Security
- **JWT-Based Authentication**: Secure access & refresh tokens with HTTP-only cookies and Authorization headers.
- **Role-Based Access Control (RBAC)**: Distinguishes between standard Customers and Admins.
- **Input Validation**: Request validation powered by **Zod** schema validation.
- **API Security**: Protected with **Helmet**, **CORS**, and **Express Rate Limiting**.

### 📊 Admin Portal
- **Admin Dashboard**: Live overview of platform metrics, active orders, and sales revenue.
- **Order Status Management**: Update customer order states in real-time.

---

## 🛠️ Tech Stack

| Domain | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Axios |
| **Backend** | Node.js, Express.js, TypeScript, tsx |
| **Database & ORM** | Sequelize ORM with SQLite (default) / MySQL support |
| **Payment Gateway** | Razorpay Node SDK |
| **Monorepo Tools** | npm workspaces, Concurrently |

---

## 📁 Repository Structure

```text
food_farma/
├── backend/                  # Node.js + Express TypeScript API
│   ├── src/
│   │   ├── config/           # Database & Razorpay configurations
│   │   ├── controllers/      # Route controllers (Auth, Food, Order, Payment, etc.)
│   │   ├── middleware/       # Auth, Admin, and Zod validation middlewares
│   │   ├── models/           # Sequelize database models
│   │   ├── routes/           # Express API route definitions
│   │   ├── seeders/          # Database seeding scripts (demo foods & restaurants)
│   │   ├── utils/            # JWT helpers, passwords, standardized responses
│   │   └── server.ts         # Server entry point
│   ├── .env.example          # Backend environment template
│   └── package.json
├── frontend/                 # React 19 + TypeScript + Vite Client
│   ├── src/
│   │   ├── api/              # Axios API client with interceptors
│   │   ├── components/       # UI components (Navbar, CartDrawer, Modals, Cards)
│   │   ├── context/          # React Contexts (AuthContext, CartContext, ToastContext)
│   │   ├── types/            # TypeScript interfaces and types
│   │   ├── App.tsx           # Main application shell
│   │   └── main.tsx          # Frontend entry point
│   └── package.json
├── package.json              # Monorepo root configuration & dev scripts
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) (v9 or higher)
- [Git](https://git-scm.com/)

### 1. Clone the Repository
```bash
git clone https://github.com/biswassomnath854-glitch/food_farma.git
cd food_farma
```

### 2. Install Dependencies
Install all root, backend, and frontend packages with one command:
```bash
npm install
```

### 3. Configure Environment Variables
Navigate to the `backend` folder and create a `.env` file based on `.env.example`:
```bash
cp backend/.env.example backend/.env
```
Update the settings in `backend/.env` if desired (defaults work out-of-the-box with SQLite):
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key
RAZORPAY_KEY_ID=rzp_test_placeholder
RAZORPAY_KEY_SECRET=placeholder_secret
DB_DIALECT=sqlite
```

### 4. Seed the Database
Populate the database with demo restaurants, categories, dishes, and an admin user:
```bash
npm run seed
```

### 5. Start the Application
Run both backend and frontend concurrently in development mode:
```bash
npm run dev
```

- **Frontend Client**: [http://localhost:5173](http://localhost:5173)
- **Backend API Server**: [http://localhost:5000](http://localhost:5000)

---

## 📡 API Overview

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user | Public |
| `POST` | `/api/auth/login` | Login user & return tokens | Public |
| `GET` | `/api/foods` | Fetch available food menu | Public |
| `GET` | `/api/restaurants` | List partner restaurants | Public |
| `GET` | `/api/cart` | Get current user's cart | Authenticated |
| `POST` | `/api/cart/items` | Add item to cart | Authenticated |
| `POST` | `/api/orders` | Place a new order | Authenticated |
| `GET` | `/api/orders/my-orders` | Fetch user order history | Authenticated |
| `POST` | `/api/payments/create-order` | Initialize Razorpay order | Authenticated |
| `GET` | `/api/admin/dashboard` | Admin analytics & orders | Admin Only |

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.
