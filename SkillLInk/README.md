# SkillLink - Service Provider Platform

A full-stack web application connecting customers with certified service providers in Nepal.

## 🚀 Features

### For Customers
- Browse service providers by category
- View provider profiles, ratings, and reviews
- Book services with preferred providers
- Secure authentication and profile management

### For Service Providers
- Create detailed service profiles
- Upload CTEVT certificates
- Set hourly rates and service locations
- Manage bookings and availability

### For Admins
- User management
- Provider verification
- Platform oversight

## 🛠️ Tech Stack

### Frontend
- **React** 19.2.0 with **Vite**
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Radix UI** components
- **Lucide React** icons

### Backend
- **Node.js** with **Express** 5.2.1
- **PostgreSQL** database
- **JWT** authentication
- **bcrypt** for password hashing
- **Cookie-based** sessions

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## 🔧 Installation

### 1. Clone the repository
```bash
cd SkillLink
```

### 2. Setup Database
```bash
# Create PostgreSQL database
psql -U postgres
CREATE DATABASE SkillLink;
\c SkillLink
\i Server/schema.sql
```

See [DATABASE_SETUP.md](DATABASE_SETUP.md) for detailed instructions.

### 3. Configure Backend
```bash
cd Server
npm install

# Update .env file with your database credentials
# DB_USER, DB_PASSWORD, etc.
```

### 4. Configure Frontend
```bash
cd Front-end
npm install

# .env is already configured for local development
```

## 🚀 Running the Application

### Start Backend Server
```bash
cd Server
npm run dev
```
Server runs on http://localhost:5000

### Start Frontend
```bash
cd Front-end
npm run dev
```
Frontend runs on http://localhost:5173

## 📖 Documentation

- [Setup Guide](SETUP_GUIDE.md) - Complete setup and configuration guide
- [Database Setup](DATABASE_SETUP.md) - Database creation and management
- [API Documentation](#api-endpoints) - API endpoints reference

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/CustomerSignup` - Register customer
- `POST /api/auth/ProviderSignup` - Register service provider
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (protected)
- `POST /api/auth/logout` - Logout

## 📁 Project Structure

```
SkillLink/
├── Front-end/              # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service layer
│   │   └── hooks/          # Custom React hooks
│   └── package.json
│
├── Server/                 # Express backend
│   ├── Routes/             # API routes
│   ├── middleWear/         # Custom middleware
│   ├── Services/           # Business logic
│   ├── schema.sql          # Database schema
│   └── package.json
│
└── README.md
```

## 🔒 Security

- Passwords hashed with bcrypt
- JWT-based authentication
- HTTP-only cookies for sessions
- CORS protection
- Environment variables for sensitive data

## 🌟 Key Features Implementation

### User Authentication
- Role-based access (Customer, Provider, Admin)
- Secure password hashing
- JWT token management
- Cookie-based sessions

### Service Provider Registration
- Multi-step form validation
- Certificate upload (PDF/Image)
- Multiple service locations
- Service category selection

### Database Design
- PostgreSQL with proper relationships
- CASCADE delete for data integrity
- UUID primary keys
- Timestamp tracking

## 🛣️ Roadmap

- [ ] Provider dashboard
- [ ] Customer dashboard
- [ ] Booking system
- [ ] Rating and review system
- [ ] Payment integration
- [ ] Email notifications
- [ ] SMS notifications
- [ ] Advanced search filters
- [ ] Provider availability calendar
- [ ] Admin panel

## 👨‍💻 Development

### Install dependencies
```bash
# Backend
cd Server && npm install

# Frontend
cd Front-end && npm install
```

### Run in development mode
```bash
# Backend (with nodemon)
cd Server && npm run dev

# Frontend (with hot reload)
cd Front-end && npm run dev
```

## 📝 License

This project is developed as a Final Year Project (FYP).

## 👥 Author

Anmol Poudyal

## 🤝 Contributing

This is an academic project. For suggestions or issues, please contact the author.

---

Built with ❤️ for connecting skilled professionals with customers in Nepal
