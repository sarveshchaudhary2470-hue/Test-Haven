# EduXpress - School Management & MCQ Testing Platform

A full-stack MERN application for managing schools, conducting online MCQ tests, and tracking student performance.

## Features

- **Multi-Role System**: Admin, Principal, and Student roles with specific permissions
- **School Management**: Manage multiple schools from a single admin panel
- **Online MCQ Tests**: Create and conduct tests for classes 1-12
- **Real-time Results**: Instant grading with detailed answer analysis
- **Analytics Dashboard**: Class-wise and school-wise performance reports
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile

## Tech Stack

### Backend
- Node.js & Express.js
- MongoDB & Mongoose
- JWT Authentication
- bcrypt for password hashing

### Frontend
- React with Vite
- TailwindCSS for styling
- Framer Motion for animations
- React Router for navigation
- Axios for API calls

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
Create a `.env` file with:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/eduxpress
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

4. Seed the database:
```bash
node seed.js
```

5. Start the server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## Demo Credentials

### Admin
- Email: admin@eduxpress.com
- Password: admin123

### Principal
- Email: principal@dps.edu
- Password: principal123

### Student
- Email: student1@school.com
- Password: student123

## Project Structure

```
EduXpress/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── models/
│   │   ├── User.js
│   │   ├── School.js
│   │   ├── Test.js
│   │   └── Result.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── testRoutes.js
│   │   └── resultRoutes.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── server.js
│   └── seed.js
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   └── Footer.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   ├── About.jsx
    │   │   ├── Contact.jsx
    │   │   ├── FAQ.jsx
    │   │   ├── Login.jsx
    │   │   ├── TestPaper.jsx
    │   │   └── Dashboard/
    │   │       ├── AdminDashboard.jsx
    │   │       ├── PrincipalDashboard.jsx
    │   │       └── StudentDashboard.jsx
    │   ├── App.jsx
    │   └── main.jsx
    └── package.json
```

## API Endpoints

### Authentication
- POST `/api/auth/login` - User login
- GET `/api/auth/me` - Get current user

### Admin Routes
- POST `/api/admin/schools` - Create school
- GET `/api/admin/schools` - Get all schools
- POST `/api/admin/users` - Create user
- GET `/api/admin/users` - Get all users
- PUT `/api/admin/users/:id/suspend` - Suspend/unsuspend user
- DELETE `/api/admin/users/:id` - Delete user

### Test Routes
- POST `/api/tests` - Create test (Admin only)
- GET `/api/tests` - Get tests (role-filtered)
- GET `/api/tests/:id` - Get single test

### Result Routes
- POST `/api/results` - Submit test (Student only)
- GET `/api/results/my-results` - Get student's results
- GET `/api/results/school/:schoolId` - Get school results (Principal/Admin)
- GET `/api/results/analytics/:testId` - Get test analytics

## License

MIT
