# Civic Portal - Quick Reference Guide

## 🚀 Quick Start (5 Minutes)

```bash
# Terminal 1: Backend
cd backend
npm install
cp .env.example .env
# Edit .env with MongoDB URI
npm start

# Terminal 2: Frontend
cd frontend
npm install
npm run dev

# Visit http://localhost:5173
```

---

## 📚 Documentation Map

| Document | Purpose | Time to Read |
|----------|---------|--------------|
| [README.md](./README.md) | Project overview, features, tech stack | 5 min |
| [SETUP.md](./SETUP.md) | Installation, config, environment setup | 10 min |
| [API_CONTRACT.md](./API_CONTRACT.md) | All API endpoints, request/response formats | 10 min |
| [TESTING.md](./TESTING.md) | Complete testing checklist with 100+ tests | 20 min |
| [AUDIT_REPORT.md](./AUDIT_REPORT.md) | Issues found, fixes applied, verification | 15 min |

---

## 🔑 Key Configuration Files

### Backend
```
backend/.env                 # Environment variables (DO NOT COMMIT)
backend/server.js            # Express app entry point
backend/routes/              # API endpoints
backend/models/              # Database schemas
backend/middleware/          # Authentication
```

### Frontend
```
frontend/vite.config.js      # API proxy to backend
frontend/src/api.js          # Axios client config
frontend/src/App.jsx         # Routes (FIXED: correct order)
frontend/src/context/        # Auth state management
```

---

## 🔐 Critical Fixes Applied

### Fix #1: Frontend Route Ordering ✅
**Problem:** Routes like `/complaints/new` weren't reachable  
**Solution:** Moved specific routes before parameter routes  
**File:** `frontend/src/App.jsx`

### Fix #2: Input Validation ✅
**Problem:** Invalid inputs could crash backend  
**Solution:** Added type/content validation on signup and complaints  
**Files:** `backend/routes/auth.js`, `backend/routes/complaints.js`

### Fix #3: Error Logging ✅
**Problem:** Hard to debug errors in production  
**Solution:** Added structured error logging with context  
**Files:** All backend routes

### Fix #4: Security ✅
**Problem:** Real credentials in `.env`  
**Solution:** Replaced with placeholders, updated `.env.example`  
**File:** `backend/.env`

---

## 🧪 Quick Test

```bash
# 1. Health check
curl http://localhost:5000/api/health
# Expected: { "ok": true, "database": "connected" }

# 2. Create user
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"password123"}'

# 3. Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# 4. Get complaints
curl http://localhost:5000/api/complaints
```

---

## 📊 API Endpoints at a Glance

```
PUBLIC ENDPOINTS:
  GET    /api/complaints              # Browse all
  GET    /api/complaints/:id          # View one
  GET    /api/complaints/check-duplicate
  POST   /api/auth/signup             # Register
  POST   /api/auth/login              # Login
  GET    /api/health                  # Health check

CITIZEN ENDPOINTS (Requires Auth + Citizen Role):
  POST   /api/complaints              # Create
  GET    /api/complaints/mine         # My complaints
  PATCH  /api/complaints/:id/feedback # Rate resolution

OFFICER ENDPOINTS (Requires Auth + Officer Role):
  GET    /api/complaints/export       # Download CSV
  PATCH  /api/complaints/:id/status   # Update status

AUTHENTICATED ENDPOINTS (Any logged-in user):
  PATCH  /api/complaints/:id/upvote   # Upvote

OFFICER ENDPOINTS:
  POST   /api/ai/officer-summary      # Get briefing
```

---

## 🛡️ Security Checklist

- [x] Passwords hashed (never returned to frontend)
- [x] JWT tokens validated on every request
- [x] Role-based access control enforced
- [x] Input validated on server
- [x] No credentials hardcoded
- [x] CORS configured
- [x] Error messages don't expose database
- [x] Database indexes created
- [x] Unique constraint on email
- [x] No sensitive data in logs

---

## 🚨 Common Issues & Quick Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| MongoDB connection failed | DB not running | Start MongoDB or check URI |
| Port 5000 in use | Another app using port | Change PORT in .env or kill process |
| CORS error in browser | Frontend/backend URLs mismatch | Check CLIENT_ORIGIN in .env |
| Login fails (401) | Wrong password/email | Verify user exists in DB |
| Create complaint fails (500) | Missing fields or not citizen | Check all fields filled, user is citizen |
| `/complaints/new` shows 404 | OLD CODE BUG | Already fixed - routes are now correct |

---

## 📱 User Flows

### Citizen Signup & Report Issue
```
1. Signup page (/signup)
   ↓
2. Login page (/login)
   ↓
3. Dashboard (/dashboard)
   ↓
4. Report Issue (/complaints/new)
   ↓
5. Complaint Detail (/complaints/:id)
```

### Officer Review
```
1. Login page (/login)
   ↓
2. Officer Dashboard (/officer/dashboard)
   ↓
3. Select Complaint
   ↓
4. Review Page (/officer/complaints/:id)
   ↓
5. Update Status & Add Remark
```

---

## 🗄️ Database Models

### User
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: "citizen" | "officer",
  createdAt: Date,
  updatedAt: Date
}
```

### Complaint
```javascript
{
  _id: ObjectId,
  title: String,
  category: String,
  description: String,
  area: String,
  status: "pending" | "in-progress" | "resolved",
  priority: "Low" | "Medium" | "High" | "Critical",
  upvotes: Number,
  upvotedBy: [User._id],
  createdBy: User._id,
  officerRemark: String,
  feedbackPending: Boolean,
  feedback: { rating: Number, comment: String },
  createdAt: Date,
  updatedAt: Date
}
```

---

## 💾 Backup & Restore

### MongoDB Atlas
```bash
# Download data
mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/civic-portal" --out=./backup

# Restore data
mongorestore --uri="mongodb+srv://user:pass@cluster.mongodb.net/civic-portal" ./backup
```

---

## 📈 Performance Tips

1. **Database Indexes** - Created on title/description (text search)
2. **API Caching** - Implement Redis for complaint lists
3. **Pagination** - Add limit/offset for large datasets
4. **CDN** - Serve frontend from CDN
5. **Compression** - Enable gzip on backend

---

## 🔄 Deployment Steps

1. Build frontend: `cd frontend && npm run build`
2. Deploy backend (Render, Railway, Heroku)
3. Deploy frontend (Vercel, Netlify, GitHub Pages)
4. Update CLIENT_ORIGIN in backend .env
5. Test all flows end-to-end
6. Set up monitoring & alerts
7. Configure automated backups

---

## 🎯 Key Metrics to Monitor

- API response time (target: < 200ms)
- Error rate (target: < 0.1%)
- Database connection pool
- JWT token refresh rate
- File upload success rate
- Page load time (target: < 2s)

---

## 📞 Troubleshooting Guide

### Backend Won't Start
```bash
# Check logs
npm start 2>&1 | tee logs.txt

# Verify dependencies
npm ls

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Frontend Won't Connect
```bash
# Check proxy in vite.config.js
# Check backend is running on port 5000
# Check browser console for errors
# Try http://localhost:5000/api/health in browser
```

### Database Issues
```bash
# Check MongoDB is running
mongo --version

# Check connection string
echo $MONGO_URI

# Test connection
mongosh "your-uri-here"
```

---

## 📚 External Resources

- [Express.js Docs](https://expressjs.com/)
- [React Docs](https://react.dev/)
- [MongoDB Docs](https://www.mongodb.com/docs/)
- [JWT.io](https://jwt.io/)
- [Axios Docs](https://axios-http.com/)

---

## 🎓 Learning Path

**Day 1:** Read README.md, run Quick Start  
**Day 2:** Follow SETUP.md, configure environment  
**Day 3:** Read API_CONTRACT.md, test endpoints with curl  
**Day 4:** Run through TESTING.md checklist  
**Day 5:** Deploy to production  

---

## ✅ Pre-Deployment Verification

- [ ] All tests pass
- [ ] No console errors
- [ ] Health endpoint returns "connected"
- [ ] Can signup and login
- [ ] Can create complaint as citizen
- [ ] Can update complaint as officer
- [ ] CSV export works
- [ ] Feedback system works
- [ ] Responsive on mobile
- [ ] No sensitive data in logs

---

## 🚀 Deployment Environments

### Development
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- Database: Local MongoDB or Atlas

### Production
- Frontend: Your domain (Vercel/Netlify)
- Backend: Your domain (Render/Railway)
- Database: MongoDB Atlas

---

**Last Updated:** December 2024  
**Version:** 1.0.0  
**Status:** Production Ready ✅
