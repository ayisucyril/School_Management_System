# EduManage — School Management System

A comprehensive full-stack school management platform built with React, Node.js, Express, and MongoDB.

**Color Theme:** Green, Yellow & Black

---

## 🚀 Quick Start

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI
npm run dev
# Runs on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

### 3. Create Admin Account (first time only)
```bash
curl -X POST http://localhost:5000/api/auth/setup \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@school.com","password":"Admin123456"}'
```

Then login at: **http://localhost:5173/login**

---

## 📁 Features

- 📊 **Dashboard** — Stats, charts, recent activity
- 👥 **Students** — Full CRUD, class assignment, parent info
- 👩‍🏫 **Teachers** — Manage staff, subjects, qualifications
- 📚 **Classes** — Create and assign classrooms
- 📝 **Grades** — Record and track student scores
- ✅ **Attendance** — Daily bulk attendance marking
- 📣 **Announcements** — Post school-wide communications

---

## 🌐 API Routes

| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/auth/login | Admin login |
| GET | /api/students | Get all students |
| POST | /api/students | Add student |
| GET | /api/teachers | Get all teachers |
| POST | /api/teachers | Add teacher |
| GET | /api/classes | Get all classes |
| GET | /api/grades | Get grades |
| POST | /api/grades | Record grade |
| POST | /api/attendance/bulk | Bulk mark attendance |
| GET | /api/announcements | Get announcements |
| GET | /api/dashboard/stats | Dashboard statistics |

---

## 🔑 Environment Variables

```
MONGODB_URI=mongodb://localhost:27017/school_management
JWT_SECRET=your_secret_key
PORT=5000
CLIENT_URL=http://localhost:5173
```
