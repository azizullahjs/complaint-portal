# Civic Portal - Complete Setup & Testing Guide

## Project Overview

The Civic Portal is a full-stack MERN application that allows citizens to report civic issues (road damage, garbage, water/electricity problems) and track their resolution. Officers can review, prioritize, and update complaint statuses.

**Stack:**
- Frontend: React + Vite + React Router + Axios
- Backend: Express.js + Node.js
- Database: MongoDB (Atlas or Local)
- Authentication: JWT tokens stored in localStorage

---

## Prerequisites

- **Node.js** >= 18.0.0
- **npm** (comes with Node)
- **MongoDB** (Atlas account OR local MongoDB)

---

## Installation & Setup

### Step 1: Clone/Extract the Project

Navigate to the project root:
```bash
cd civic-portal
```

### Step 2: Backend Setup

#### 2a. Install dependencies
```bash
cd backend
npm install
```

#### 2b. Configure Environment Variables

Copy the example to create your `.env` file:
```bash
cp .env.example .env
```

Edit `backend/.env` and fill in your MongoDB connection:

**Option A: Use MongoDB Atlas (Cloud)**
```env
PORT=5000
MONGO_URI=mongodb+srv://username:password@your-cluster.mongodb.net/civic-portal?retryWrites=true&w=majority
JWT_SECRET=generate-a-random-string-here-min-32-chars
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=http://localhost:5173
```

To get MongoDB Atlas credentials:
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account or login
3. Create a cluster
4. Click "Connect" → "Drivers"
5. Copy the connection string and replace `username`, `password`, and `database-name`

**Option B: Use Local MongoDB**
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/civic-portal
JWT_SECRET=generate-a-random-string-here-min-32-chars
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=http://localhost:5173
```

To run local MongoDB on Windows:
- Install [MongoDB Community Server](https://www.mongodb.com/try/download/community)
- Run `mongod` from command line to start the server

#### 2c. Generate a JWT Secret (if needed)
```bash
# In Node REPL or any terminal:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 3: Frontend Setup

#### 3a. Install dependencies
```bash
cd frontend
npm install
```

The frontend is ready to use (no `.env` file needed - it uses the proxy in `vite.config.js`).

---

## Running the Application

### Terminal 1: Start Backend Server

```bash
cd backend
npm start
```

Expected output:
```
connecting to MongoDB...
MongoDB connected
server running on port 5000
```

**Troubleshooting:**
- `ECONNREFUSED`: MongoDB is not running. Start MongoDB first.
- `401 connection failed`: Wrong MongoDB credentials. Check your MONGO_URI.
- `Port 5000 in use`: Change `PORT` in `.env` or kill the process using port 5000.

### Terminal 2: Start Frontend Dev Server

```bash
cd frontend
npm run dev
```

Expected output:
```
VITE v5.3.1  ready in XXX ms

➜  Local:   http://localhost:5173/
```

### Terminal 3 (Optional): MongoDB (if using local)

If using local MongoDB:
```bash
mongod
```

---

## Creating Test Accounts

### 1. Citizen Account (Default)

Visit http://localhost:5173/signup and create an account. It will default to "citizen" role.

```
Name: John Citizen
Email: citizen@example.com
Password: password123
```

### 2. Officer Account

Create a citizen account first, then convert it to officer in MongoDB:

**Option A: Using MongoDB Compass**
1. Connect to your MongoDB instance
2. Navigate to `civic-portal` database → `users` collection
3. Find the user record
4. Change `role` from `"citizen"` to `"officer"`
5. Save

**Option B: Using MongoDB Shell**
```bash
# In MongoDB shell
db.users.updateOne(
  { email: "officer@example.com" },
  { $set: { role: "officer" } }
)
```

**Option C: Using Script (if included)**
```bash
cd backend
node scripts/makeOfficer.js
# Follow prompts
```

---

## Testing the Application

### Health Check

Before testing, verify the backend is running:
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "ok": true,
  "database": "connected"
}
```

### Complete Test Flow

#### 1. **Citizen Signs Up**
   - Visit http://localhost:5173/signup
   - Fill form: Name, Email, Password (min 6 chars)
   - Click "Sign Up" → redirects to login
   - Verify: Check backend logs for `[Signup successful]`

#### 2. **Citizen Logs In**
   - Visit http://localhost:5173/login
   - Enter email and password
   - Click "Login" → redirects to `/dashboard`
   - Verify: Token saved in localStorage

#### 3. **Citizen Files a Complaint**
   - Click "Report Issue" on dashboard
   - Fill form:
     - Title: "Broken street light on Main St"
     - Category: "Electricity"
     - Area: "Downtown"
     - Description: "Street light near corner is not working"
   - Click "Submit Complaint"
   - Verify: Redirects to complaint detail, complaint appears in database

#### 4. **Check Duplicate Complaints**
   - File another complaint with same category and area
   - "Similar complaint" warning should appear
   - Click "Upvote this" instead

#### 5. **Browse All Complaints**
   - Click "Browse Complaints"
   - Search/filter by category, status, area
   - Click on a complaint to view details
   - Click "Upvote" button

#### 6. **View My Complaints**
   - Click "My Complaints"
   - See all complaints filed by this user
   - Shows status and priority

#### 7. **Officer Dashboard**
   - Logout and create/login as officer
   - Click "Officer Dashboard"
   - See briefing and all open complaints
   - Click on a complaint to review

#### 8. **Officer Updates Complaint**
   - Click on complaint from officer dashboard
   - Change status to "in-progress"
   - Add remark: "Team dispatched"
   - Click "Update"
   - Verify: Status changes on dashboard

#### 9. **Citizen Provides Feedback**
   - Login as citizen who filed the complaint
   - Go to "My Complaints"
   - When status is "resolved", feedback form appears
   - Select rating (1-5 stars)
   - Add comment
   - Submit

#### 10. **Export Complaints (Officer)**
   - On Officer Dashboard, apply filters
   - Click "Download CSV"
   - Verify: CSV file downloads with complaint data

---

## API Endpoints Reference

### Authentication
- `POST /api/auth/signup` — `{ name, email, password }`
- `POST /api/auth/login` — `{ email, password }` → `{ token, user }`

### Complaints
- `GET /api/complaints` — List with filters
- `GET /api/complaints/:id` — Single complaint
- `POST /api/complaints` — Create (citizen only)
- `GET /api/complaints/mine` — User's complaints
- `GET /api/complaints/check-duplicate?category=X&area=Y` — Similar complaints
- `GET /api/complaints/export` — CSV export (officer only)
- `PATCH /api/complaints/:id/upvote` — Add upvote
- `PATCH /api/complaints/:id/status` — Update status (officer only)
- `PATCH /api/complaints/:id/feedback` — Submit feedback (citizen owner only)

### AI/Summary
- `POST /api/ai/officer-summary` — Briefing text (officer only)

### Health
- `GET /api/health` — Server status

---

## Common Issues & Solutions

### Issue: "MongoDB connection failed"
**Solution:** 
- If using Atlas: Whitelist your IP in Network Access
- If using local: Start MongoDB first with `mongod`
- Check MONGO_URI format is correct

### Issue: "Port 5000 already in use"
**Solution:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID [PID] /F

# macOS/Linux
lsof -i :5000
kill -9 [PID]
```

### Issue: "CORS error in browser console"
**Solution:**
- Check `CLIENT_ORIGIN` in `.env` matches your frontend URL
- Ensure backend is running and accessible

### Issue: "Login fails with 401"
**Solution:**
- Verify user exists in MongoDB
- Check JWT_SECRET is set in `.env`
- Clear localStorage and try again

### Issue: "Cannot create complaint (500 error)"
**Solution:**
- Verify you're logged in as a citizen (not officer)
- Check all required fields are filled
- Check backend logs for detailed error message

### Issue: "Frontend cannot find backend"
**Solution:**
- Verify backend is running on port 5000
- Check `vite.config.js` has proxy to `http://localhost:5000`
- Check `src/api.js` baseURL is `/api`

---

## Production Deployment Notes

### Before Going Live

1. **Change JWT_SECRET**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Change MongoDB Password** (if using Atlas)
   - Go to Database Access → Edit User → New Password

3. **Whitelist Production IP** (Atlas)
   - Network Access → Add IP Address

4. **Set NODE_ENV=production**
   ```bash
   export NODE_ENV=production
   ```

5. **Update CLIENT_ORIGIN** to production frontend URL

6. **Build Frontend**
   ```bash
   cd frontend
   npm run build
   ```

7. **Deploy Backend** (Heroku, Render, Railway, etc.)

8. **Deploy Frontend** (Vercel, Netlify, etc.)

---

## File Structure

```
civic-portal/
├── backend/
│   ├── .env                 # Environment variables (DO NOT COMMIT)
│   ├── .env.example         # Template for .env
│   ├── server.js            # Express app entry point
│   ├── package.json
│   ├── middleware/
│   │   └── auth.js          # JWT validation
│   ├── models/
│   │   ├── User.js
│   │   └── Complaint.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── complaints.js
│   │   └── ai.js
│   ├── utils/
│   │   └── priority.js      # Priority calculation logic
│   └── scripts/
│       └── makeOfficer.js   # Convert user to officer
│
├── frontend/
│   ├── vite.config.js       # Vite proxy config
│   ├── package.json
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx          # Routes
│       ├── api.js           # Axios client
│       ├── index.css        # Styles
│       ├── context/
│       │   └── AuthContext.jsx
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── ProtectedRoute.jsx
│       │   └── PriorityBadge.jsx
│       └── pages/
│           ├── Home.jsx
│           ├── Signup.jsx
│           ├── Login.jsx
│           ├── CitizenDashboard.jsx
│           ├── NewComplaint.jsx
│           ├── MyComplaints.jsx
│           ├── BrowseComplaints.jsx
│           ├── ComplaintDetail.jsx
│           ├── OfficerDashboard.jsx
│           └── OfficerComplaintReview.jsx
│
└── SETUP.md (this file)
```

---

## Features Summary

✅ **Authentication** - Signup/Login with JWT  
✅ **Role-based Access** - Citizen vs Officer  
✅ **File Complaints** - Create and track issues  
✅ **Upvoting** - Community prioritization  
✅ **Duplicate Detection** - Suggest similar complaints  
✅ **Filtering** - By category, status, area  
✅ **Officer Dashboard** - All open complaints + briefing  
✅ **Status Updates** - Officer can update & remark  
✅ **Feedback System** - Citizens rate resolution  
✅ **CSV Export** - Officer can download data  
✅ **Priority Levels** - Auto-escalate by upvotes  

---

## Support & Debugging

**Backend Logs** - Look for `[ERROR]`, `[SIGNUP ERROR]`, etc.  
**Browser Console** - Check for frontend errors  
**MongoDB Compass** - Visual database inspection  
**Postman** - Test API endpoints directly  

For issues, check:
1. Are both backend and frontend running?
2. Is MongoDB connected? (Check health endpoint)
3. Are .env variables set correctly?
4. Is the frontend accessing the correct API URL?

---

**Good luck! 🚀**
