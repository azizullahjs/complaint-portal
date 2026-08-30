# Complete Testing Checklist

Use this checklist to verify all features of the Civic Portal work correctly.

---

## Pre-Testing Checklist

- [ ] Backend server running (`npm start` from `backend/`)
- [ ] Frontend dev server running (`npm run dev` from `frontend/`)
- [ ] MongoDB connected (check backend logs: "MongoDB connected")
- [ ] Health endpoint working: `GET http://localhost:5000/api/health` returns `{ "ok": true, "database": "connected" }`
- [ ] No console errors in browser DevTools
- [ ] Frontend loads: `http://localhost:5173`

---

## 1. Authentication Tests

### Signup Flow
- [ ] Click "Sign Up" link in navbar
- [ ] Page shows: Name, Email, Password fields
- [ ] Form validation: 
  - [ ] Cannot submit with empty fields
  - [ ] Cannot submit with invalid email format
  - [ ] Cannot submit with password < 6 characters
- [ ] Submit valid form
- [ ] Success: Redirected to login page
- [ ] Error: Duplicate email shows "an account with this email already exists"
- [ ] Check database: New user exists in `users` collection with hashed password

**Test Accounts:**
```
Account 1 (Citizen):
  Email: citizen@example.com
  Password: password123
  Name: John Citizen

Account 2 (Officer - create in DB):
  Email: officer@example.com
  Password: password123
  Name: Jane Officer
  (Change role to "officer" in MongoDB)
```

### Login Flow
- [ ] Click "Login" link
- [ ] Page shows: Email, Password fields
- [ ] Submit with wrong credentials: Shows "invalid email or password"
- [ ] Submit with correct credentials: Redirected to dashboard
- [ ] Token stored in localStorage: Open DevTools → Application → localStorage → check `token` exists
- [ ] User data in localStorage: Check `user` JSON includes name, email, role
- [ ] Navbar shows: User name and "Logout" button
- [ ] Navbar links change based on role:
  - [ ] Citizen: Dashboard, Report Issue, My Complaints, Browse
  - [ ] Officer: Officer Dashboard, Browse

### Logout
- [ ] Click "Logout" button in navbar
- [ ] Redirected to home page
- [ ] localStorage cleared: `token` and `user` removed
- [ ] Navbar shows: Login, Sign Up links instead of user name
- [ ] Protected pages redirect to login: Try accessing `/dashboard` (not logged in)

### Protected Routes
- [ ] Try accessing `/dashboard` without login → Redirects to `/login`
- [ ] Try accessing `/complaints/new` without login → Redirects to `/login`
- [ ] Login as citizen → `/officer/dashboard` redirects to `/dashboard`
- [ ] Logout officer → Try `/officer/dashboard` → Redirects to `/login`

---

## 2. Complaint Filing (Citizen)

### New Complaint Page
- [ ] Click "Report Issue" → Goes to `/complaints/new`
- [ ] Form fields:
  - [ ] Title input (text)
  - [ ] Category dropdown (Road, Garbage, Water, Electricity, Other)
  - [ ] Area/Locality input (text)
  - [ ] Description textarea
  - [ ] Submit button

### Form Validation
- [ ] Cannot submit with empty fields
- [ ] Cannot submit with very long title (test character limit if any)
- [ ] Cannot submit without category selected
- [ ] All required fields show as `required` in HTML5 validation

### Duplicate Complaint Detection
- [ ] Fill form with Title, Category: "Electricity", Area: "Downtown"
- [ ] Blur Area field → Calls `/api/complaints/check-duplicate`
- [ ] If duplicates exist:
  - [ ] Shows warning: "A similar complaint already exists"
  - [ ] Lists similar complaints with upvote counts
  - [ ] "Upvote this" button works for each

### Submit Complaint
- [ ] Fill complete form with unique category+area combination
- [ ] Click Submit
- [ ] Backend creates complaint:
  - [ ] `title` trimmed
  - [ ] `category` preserved
  - [ ] `description` trimmed
  - [ ] `area` trimmed
  - [ ] `createdBy` set to current user._id
  - [ ] `priority` calculated (based on category)
  - [ ] `status` defaults to "pending"
  - [ ] `upvotes` defaults to 0
- [ ] Frontend redirected to `/complaints/:id` page
- [ ] Complaint detail shows all submitted info
- [ ] Check MongoDB: Complaint exists with correct data

### Test Priority Calculation
- [ ] Create "Electricity" complaint → Priority should be "High"
- [ ] Create "Water" complaint → Priority should be "High"
- [ ] Create "Road" complaint → Priority should be "Medium"
- [ ] Create "Garbage" complaint → Priority should be "Low"

---

## 3. Complaint Browsing

### Browse Page (`/complaints`)
- [ ] Visit `http://localhost:5173/complaints`
- [ ] Page shows list of complaints as cards/rows
- [ ] Each complaint shows:
  - [ ] Title (clickable link to detail)
  - [ ] Category badge/tag
  - [ ] Area/Locality
  - [ ] Priority badge with color
  - [ ] Status pill
  - [ ] Upvote count
  - [ ] Upvote button (if logged in)

### Filter/Search
- [ ] Search by title: Type "street" → Filters results
- [ ] Filter by category: Select "Electricity" → Shows only Electricity
- [ ] Filter by status: Select "pending" → Shows only pending
- [ ] Filter by area: Type "downtown" → Searches area (case-insensitive)
- [ ] Combine filters: Category + Status → Works together
- [ ] Clear filter: Select empty option → Shows all complaints
- [ ] No results message: Shows when no complaints match

### Priority Badge Colors
- [ ] Low: Gray
- [ ] Medium: Blue
- [ ] High: Orange
- [ ] Critical: Red

---

## 4. Complaint Detail Page

### Single Complaint View
- [ ] Click on complaint from browse or home
- [ ] URL is `/complaints/:id`
- [ ] Shows:
  - [ ] Full title
  - [ ] Category badge
  - [ ] Priority badge
  - [ ] Area
  - [ ] Full description (not truncated)
  - [ ] Filing date
  - [ ] Filing user name
  - [ ] Status
  - [ ] Upvote count
  - [ ] Officer remark (if any)

### Image Display
- [ ] If `imageUrl` exists, show image
- [ ] If no image, no broken image display

### Upvote Feature
- [ ] Click "Upvote" button
- [ ] Counter increments
- [ ] Upvote count increases by 1
- [ ] Try upvoting same complaint again:
  - [ ] If not logged in: Redirects to login
  - [ ] If already upvoted: Shows error "you already upvoted"
- [ ] Check database: User ID added to `upvotedBy` array

### Priority Escalation by Upvotes
- [ ] Create complaint with category "Garbage" (starts Low)
- [ ] Upvote 5+ times by different users
- [ ] Priority should escalate to "Medium"
- [ ] Upvote 15+ times total
- [ ] Priority should escalate to "Critical"

---

## 5. My Complaints (Citizen Only)

### View My Complaints
- [ ] Navigate to `/complaints/mine`
- [ ] Shows only complaints filed by logged-in user
- [ ] Each shows:
  - [ ] Title (clickable to detail)
  - [ ] Category
  - [ ] Area
  - [ ] Filing date
  - [ ] Status
  - [ ] Priority badge

### Complaint Status Tracking
- [ ] Officer updates complaint status to "in-progress"
- [ ] Check "My Complaints" page
- [ ] Status shows as "in-progress"
- [ ] Officer adds remark: "Team assigned"
- [ ] Check complaint detail: Shows remark

### Feedback Form (When Resolved)
- [ ] Officer sets complaint to "resolved"
- [ ] Go to "My Complaints"
- [ ] Complaint shows feedback form:
  - [ ] Star rating dropdown (1-5)
  - [ ] Comment input (optional)
  - [ ] Submit button
- [ ] Submit with rating 5, no comment
- [ ] Form disappears, feedback saved
- [ ] Check database: `feedback` object has rating:5, comment:""
- [ ] If accessed again: Feedback form doesn't reappear

---

## 6. Officer Dashboard (Officer Only)

### Access Control
- [ ] Try accessing `/officer/dashboard` as citizen → Redirects to `/dashboard`
- [ ] Login as officer → `/officer/dashboard` loads

### Briefing Section
- [ ] On load, briefing is being generated (loading state)
- [ ] Briefing text appears after ~1 second
- [ ] Text includes:
  - [ ] Total open complaints count
  - [ ] Critical and High priority counts
  - [ ] Most reported category
  - [ ] Area with most reports
  - [ ] Most upvoted issue title
- [ ] If no complaints: "No open complaints right now..."

### Complaint Table
- [ ] Shows all non-resolved complaints
- [ ] Columns: Title, Category, Area, Status, Priority, Upvotes
- [ ] Title is clickable link to `/officer/complaints/:id`
- [ ] Filter controls (same as browse page):
  - [ ] Search
  - [ ] Category filter
  - [ ] Status filter
  - [ ] Priority filter (additionally)
  - [ ] Area filter
  - [ ] Download CSV button

### CSV Export
- [ ] Set filters (e.g., status: pending, category: Electricity)
- [ ] Click "Download CSV"
- [ ] File downloads: `complaints_export_YYYY-MM-DD.csv`
- [ ] Open in Excel/text editor
- [ ] Contains columns: id, title, category, area, status, priority, upvotes, filedBy, filedByEmail, createdAt
- [ ] Rows match applied filters
- [ ] All data properly formatted

---

## 7. Officer Complaint Review

### Access Review Page
- [ ] Click on complaint from Officer Dashboard
- [ ] URL: `/officer/complaints/:id`
- [ ] Shows:
  - [ ] Back button to dashboard
  - [ ] Full complaint details
  - [ ] Filer name and email

### Update Complaint
- [ ] Status dropdown: Can select pending/in-progress/resolved
- [ ] Remark textarea: Can enter officer note
- [ ] Change status to "in-progress"
- [ ] Add remark: "Team dispatched to site"
- [ ] Click "Update"
- [ ] Confirm on dashboard: Status shows "in-progress"
- [ ] Confirm in citizen "My Complaints": Status updated

### Trigger Feedback
- [ ] Set complaint status to "resolved"
- [ ] Click Update
- [ ] Go to dashboard → complaint no longer shows (resolved)
- [ ] Login as citizen who filed it
- [ ] Go to "My Complaints"
- [ ] Complaint shows "Resolved" status
- [ ] Feedback form appears with rating dropdown

---

## 8. Home Page

### Featured Complaints
- [ ] Visit `http://localhost:5173/`
- [ ] Shows hero section with CTA buttons
- [ ] "Recently reported" section shows up to 4 latest complaints
- [ ] Each shows: title, category, area, status
- [ ] Click complaint → Goes to detail page
- [ ] If no complaints: Shows "Nothing reported yet"

### Navigation
- [ ] "Get Started" button → `/signup`
- [ ] "Browse Complaints" button → `/complaints`

---

## 9. Navbar

### Logged Out
- [ ] Shows: Brand (CivicFix), Browse, Login, Sign Up

### Logged In as Citizen
- [ ] Shows: Brand (CivicFix), Browse, Dashboard, Report Issue, My Complaints, Logout (UserName)
- [ ] All links work and go to correct pages
- [ ] Click logout → Logs out and shows Login/Sign Up again

### Logged In as Officer
- [ ] Shows: Brand (CivicFix), Browse, Officer Dashboard, Logout (UserName)
- [ ] Officer Dashboard link works

### Mobile Responsive (if CSS supports)
- [ ] On small screen: Navbar collapses to hamburger menu
- [ ] Menu opens/closes on click

---

## 10. Error Handling

### Backend Errors
- [ ] Fill form with only title, submit complaint → 400 error, shows "required"
- [ ] Try creating complaint while logged out → 401 Unauthorized
- [ ] Try updating complaint status as citizen → 403 Forbidden
- [ ] Access non-existent complaint → 404 Not Found

### Frontend Error Display
- [ ] Signup with duplicate email → Shows error message
- [ ] Login with wrong password → Shows error message
- [ ] Create complaint with empty description → Shows validation
- [ ] Network error (backend down) → Shows user-friendly message

### Check Console Logs
- [ ] Backend has no unhandled errors
- [ ] Frontend console has no major errors
- [ ] API requests appear in Network tab
- [ ] JWT tokens visible in request Authorization headers

---

## 11. Database Verification

### User Collection
```
- Verify user documents have:
  - _id (ObjectId)
  - name (string)
  - email (string, unique, lowercase)
  - password (hashed with bcrypt, NOT plaintext)
  - role ("citizen" or "officer")
  - createdAt, updatedAt
```

### Complaint Collection
```
- Verify complaint documents have:
  - _id (ObjectId)
  - title (string)
  - category (enum: Road/Garbage/Water/Electricity/Other)
  - description (string)
  - area (string)
  - status (enum: pending/in-progress/resolved)
  - priority (enum: Low/Medium/High/Critical)
  - upvotes (number ≥ 0)
  - upvotedBy (array of User ObjectIds)
  - createdBy (User ObjectId reference)
  - officerRemark (string)
  - feedbackPending (boolean)
  - feedback { rating, comment }
  - createdAt, updatedAt
```

### Check Indexes
```
- User: Unique index on email
- Complaint: Index on title and description (text search)
```

---

## 12. Security Checks

### No Plaintext Passwords
- [ ] Database: All passwords are hashed (long random string)
- [ ] API Response: Password never returned to frontend
- [ ] Backend logs: No password logging

### JWT Token Security
- [ ] Frontend: Token stored only in localStorage
- [ ] API: All protected requests include `Authorization: Bearer <token>`
- [ ] Backend: Invalid/expired tokens return 401
- [ ] Logout: Token removed from localStorage

### Role-Based Access
- [ ] Citizens cannot access officer endpoints
- [ ] Officers cannot file complaints as citizens
- [ ] Non-owners cannot provide feedback for others' complaints

### No Sensitive Data Exposure
- [ ] Error messages don't expose database structure
- [ ] 404 errors don't reveal if user exists
- [ ] No MongoDB connection strings in responses
- [ ] No JWT secret in responses

### CORS
- [ ] Frontend on 5173, backend on 5000
- [ ] Requests succeed (CORS properly configured)
- [ ] Browser doesn't show CORS errors

---

## 13. Performance & UX

### Loading States
- [ ] Briefing shows "generating briefing..." while loading
- [ ] Complaint list shows while fetching
- [ ] Submit button shows "Saving..." state

### Empty States
- [ ] No complaints: Shows "Nothing reported yet"
- [ ] No filter results: Shows "No complaints match these filters"
- [ ] My Complaints empty: Shows "You haven't filed any complaints yet"

### Form UX
- [ ] Input fields have proper placeholders
- [ ] Error messages appear below fields
- [ ] Submit button disables while processing
- [ ] Success redirects to next logical page

### Responsive Design
- [ ] Desktop (1200px+): Multi-column layout
- [ ] Tablet (768px-1199px): Adjusted spacing
- [ ] Mobile (< 768px): Single column, stacked elements
- [ ] No horizontal scrolling on any device

---

## 14. Edge Cases

### Concurrent Actions
- [ ] Two users upvote same complaint: Both succeed, counter increments by 2
- [ ] Two officers update same complaint: Second one overwrites, no conflicts

### Data Validation
- [ ] Very long title (1000 chars): Accepted and stored
- [ ] Special characters in complaint: Stored correctly (no XSS)
- [ ] Unicode characters: Handled properly
- [ ] Very long description: Textarea accepts and stores

### Role Transitions
- [ ] Convert citizen to officer in DB
- [ ] Log in again: `/officer/dashboard` now accessible
- [ ] Convert back to citizen in DB
- [ ] `/officer/dashboard` redirects to `/dashboard`

### Time-Based Features
- [ ] Complaint created timestamp: Shows correctly
- [ ] Feedback form appears after officer marks resolved
- [ ] Date formatting consistent across pages

---

## 15. Final Sign-Off

- [ ] All tests above pass ✅
- [ ] No critical errors in console
- [ ] Database has expected data
- [ ] All API endpoints respond correctly
- [ ] Frontend shows data without errors
- [ ] User flows are intuitive
- [ ] Error handling is graceful
- [ ] Application is ready for use

---

## Regression Testing (Run After Any Code Changes)

1. Test signup/login flow
2. Test creating a complaint
3. Test upvoting
4. Test officer update
5. Test feedback submission
6. Test CSV export
7. Check browser console for errors
8. Check backend logs for errors

---

**End of Testing Checklist**
