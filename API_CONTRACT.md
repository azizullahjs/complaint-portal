# API Contract Verification

This document lists every API call from the frontend and verifies it matches the backend endpoint.

---

## Authentication Routes

### 1. Signup
**Frontend Call:** `pages/Signup.jsx`
```javascript
await api.post("/auth/signup", { ...form, role: "citizen" })
// form = { name, email, password }
```

**Backend Endpoint:** `routes/auth.js`
```
POST /api/auth/signup
Expected body: { name, email, password, role }
Returns: { user: { _id, name, email, role } }
Status: 201 on success, 400/409/500 on error
```

**✅ VERIFIED:** Frontend sends `{ name, email, password, role: "citizen" }` → Backend receives and validates all fields

---

### 2. Login
**Frontend Call:** `pages/Login.jsx`
```javascript
const res = await api.post("/auth/login", form)
// form = { email, password }
// Uses: login(res.data.token, res.data.user)
```

**Backend Endpoint:** `routes/auth.js`
```
POST /api/auth/login
Expected body: { email, password }
Returns: { token: "...", user: { _id, name, email, role } }
Status: 200 on success, 401 on invalid credentials
```

**✅ VERIFIED:** Frontend expects `{ token, user }` → Backend returns exactly that

---

## Complaint Routes

### 3. Get All Complaints
**Frontend Calls:**
- `pages/BrowseComplaints.jsx`: `api.get("/complaints", { params })`
- `pages/OfficerDashboard.jsx`: `api.get("/complaints", { params })`
- `pages/Home.jsx`: `api.get("/complaints")`

**Backend Endpoint:** `routes/complaints.js`
```
GET /api/complaints
Query params: { search, category, status, area, priority }
Returns: Array of complaint objects
Status: 200 on success, 500 on error
```

**✅ VERIFIED:** Frontend passes filters as query params → Backend buildFilter() processes them

---

### 4. Get Single Complaint
**Frontend Calls:**
- `pages/ComplaintDetail.jsx`: `api.get(/complaints/${id})`
- `pages/OfficerComplaintReview.jsx`: `api.get(/complaints/${id})`

**Backend Endpoint:** `routes/complaints.js`
```
GET /api/complaints/:id
Returns: Single complaint object with createdBy populated
Status: 200 on success, 404 if not found
```

**✅ VERIFIED:** Frontend uses complaint ID → Backend finds and returns with user info

---

### 5. Check Duplicate Complaints
**Frontend Call:** `pages/NewComplaint.jsx`
```javascript
const res = await api.get("/complaints/check-duplicate", {
  params: { category: form.category, area: form.area }
})
// Returns array of similar complaints
```

**Backend Endpoint:** `routes/complaints.js`
```
GET /api/complaints/check-duplicate
Query params: { category, area }
Returns: Array of up to 5 complaints (title, upvotes)
Status: 200 with empty array if no params
```

**✅ VERIFIED:** Frontend sends category & area → Backend returns matching unresolved complaints

---

### 6. Create New Complaint
**Frontend Call:** `pages/NewComplaint.jsx`
```javascript
const res = await api.post("/complaints", form)
// form = { title, category, description, area }
// Auth required: Bearer token
// Role required: citizen
```

**Backend Endpoint:** `routes/complaints.js`
```
POST /api/complaints
Middleware: requireAuth, requireRole("citizen")
Expected body: { title, category, description, area }
Returns: Full complaint object with _id
Status: 201 on success, 400 on validation error, 401 if not auth, 403 if not citizen
```

**✅ VERIFIED:** Frontend sends required fields + auth → Backend validates and creates

---

### 7. Get My Complaints
**Frontend Call:** `pages/MyComplaints.jsx`
```javascript
api.get("/complaints/mine")
// Auth required
```

**Backend Endpoint:** `routes/complaints.js`
```
GET /api/complaints/mine
Middleware: requireAuth
Returns: Array of complaints where createdBy = user._id
Status: 200 on success, 401 if not auth
```

**✅ VERIFIED:** Frontend has token → Backend filters by user ID

---

### 8. Upvote Complaint
**Frontend Calls:**
- `pages/BrowseComplaints.jsx`: `api.patch(/complaints/${id}/upvote)`
- `pages/ComplaintDetail.jsx`: `api.patch(/complaints/${id}/upvote)`
- `pages/NewComplaint.jsx`: `api.patch(/complaints/${id}/upvote)`

**Backend Endpoint:** `routes/complaints.js`
```
PATCH /api/complaints/:id/upvote
Middleware: requireAuth
Body: empty (not used)
Returns: Updated complaint object
Status: 200 on success, 400 if already upvoted, 404 if not found
```

**✅ VERIFIED:** Frontend authenticated → Backend prevents duplicate upvotes

---

### 9. Export Complaints (CSV)
**Frontend Call:** `pages/OfficerDashboard.jsx`
```javascript
fetch(`/api/complaints/export?${params}`, {
  headers: { Authorization: `Bearer ${token}` }
})
// Officer only
```

**Backend Endpoint:** `routes/complaints.js`
```
GET /api/complaints/export
Query params: { search, category, status, area, priority }
Middleware: requireAuth, requireRole("officer")
Returns: CSV file with columns: id, title, category, area, status, priority, upvotes, filedBy, filedByEmail, createdAt
Status: 200 with attachment header
```

**✅ VERIFIED:** Frontend downloads file with proper auth header → Backend returns CSV

---

### 10. Update Complaint Status
**Frontend Call:** `pages/OfficerComplaintReview.jsx`
```javascript
await api.patch(`/complaints/${id}/status`, { status, remark })
// Officer only
```

**Backend Endpoint:** `routes/complaints.js`
```
PATCH /api/complaints/:id/status
Middleware: requireAuth, requireRole("officer")
Expected body: { status, remark }
Returns: Updated complaint object
Status: 200 on success, 400 if invalid status, 404 if not found
```

**✅ VERIFIED:** Frontend sends status & remark → Backend updates and triggers feedback flag if resolved

---

### 11. Submit Feedback
**Frontend Call:** `pages/MyComplaints.jsx`
```javascript
await api.patch(`/complaints/${id}/feedback`, draft)
// draft = { rating, comment }
// Citizen owner only
```

**Backend Endpoint:** `routes/complaints.js`
```
PATCH /api/complaints/:id/feedback
Middleware: requireAuth, requireRole("citizen")
Expected body: { rating, comment }
Returns: Updated complaint object
Status: 200 on success, 400 if invalid rating, 403 if not owner, 404 if not found
```

**✅ VERIFIED:** Frontend checks rating 1-5 → Backend validates and owner authorization

---

## AI Routes

### 12. Officer Briefing
**Frontend Call:** `pages/OfficerDashboard.jsx`
```javascript
api.post("/ai/officer-summary")
// Officer only
```

**Backend Endpoint:** `routes/ai.js`
```
POST /api/ai/officer-summary
Middleware: requireAuth, requireRole("officer")
Body: empty (not used)
Returns: { summary: "Text description of current complaints" }
Status: 200 on success, 500 on error
```

**✅ VERIFIED:** Frontend calls on mount → Backend generates text briefing

---

## Health Check

### 13. Health Endpoint
**Frontend Call:** Not explicitly called, but can be tested manually
```javascript
// Manual test: fetch('/api/health')
```

**Backend Endpoint:** `server.js`
```
GET /api/health
Returns: { ok: true, database: "connected" | "disconnected" }
Status: 200
```

**✅ VERIFIED:** Available for monitoring

---

## Summary

| Endpoint | Method | Auth | Role | Frontend Usage | Status |
|----------|--------|------|------|---|--------|
| /auth/signup | POST | ❌ | - | Signup.jsx | ✅ |
| /auth/login | POST | ❌ | - | Login.jsx | ✅ |
| /complaints | GET | ❌ | - | Browse, Officer, Home | ✅ |
| /complaints | POST | ✅ | citizen | NewComplaint.jsx | ✅ |
| /complaints/:id | GET | ❌ | - | ComplaintDetail | ✅ |
| /complaints/check-duplicate | GET | ❌ | - | NewComplaint.jsx | ✅ |
| /complaints/mine | GET | ✅ | - | MyComplaints.jsx | ✅ |
| /complaints/export | GET | ✅ | officer | OfficerDashboard.jsx | ✅ |
| /complaints/:id/upvote | PATCH | ✅ | - | Multiple pages | ✅ |
| /complaints/:id/status | PATCH | ✅ | officer | OfficerReview.jsx | ✅ |
| /complaints/:id/feedback | PATCH | ✅ | citizen | MyComplaints.jsx | ✅ |
| /ai/officer-summary | POST | ✅ | officer | OfficerDashboard.jsx | ✅ |
| /health | GET | ❌ | - | Manual testing | ✅ |

---

## Response Format Consistency

### Success Responses

**User Objects:**
```javascript
{
  _id: "...",
  name: "...",
  email: "...",
  role: "citizen" | "officer"
}
```

**Complaint Objects:**
```javascript
{
  _id: "...",
  title: "...",
  category: "Road" | "Garbage" | "Water" | "Electricity" | "Other",
  description: "...",
  area: "...",
  imageUrl: "",
  status: "pending" | "in-progress" | "resolved",
  priority: "Low" | "Medium" | "High" | "Critical",
  upvotes: 0,
  upvotedBy: [...],
  createdBy: { _id, name, email },
  officerRemark: "",
  feedbackPending: false,
  feedback: { rating: 0-5, comment: "" },
  createdAt: "ISO string",
  updatedAt: "ISO string"
}
```

**Auth Responses:**
```javascript
// Login success
{ token: "...", user: {...} }

// Signup success
{ user: {...} }
```

**Error Responses:**
```javascript
// All error responses follow this format
{ message: "user-friendly error message" }
```

Status codes:
- 200: Success
- 201: Created
- 400: Bad request (validation error)
- 401: Unauthorized (missing/invalid auth)
- 403: Forbidden (wrong role)
- 404: Not found
- 409: Conflict (e.g., duplicate email)
- 500: Server error

---

## Verification Checklist

✅ All frontend API calls have matching backend endpoints  
✅ All HTTP methods match (GET, POST, PATCH, DELETE)  
✅ Request body format matches backend expectations  
✅ Response format matches frontend usage  
✅ Authentication middleware applied correctly  
✅ Role-based access control validated  
✅ Query parameters processed correctly  
✅ Error responses are consistent  

**All API contracts verified and matching!**
