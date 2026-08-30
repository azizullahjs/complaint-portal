# Civic Portal - Complete MERN Application

**A full-stack application for reporting and tracking civic infrastructure issues.**

![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![License](https://img.shields.io/badge/License-MIT-blue)
![Node](https://img.shields.io/badge/Node-%3E%3D18.0.0-brightgreen)

---

## 📋 Overview

The Civic Portal enables citizens to report civic issues (broken roads, garbage, water/electricity problems) and track their resolution. Officers can review complaints, update statuses, and access analytics.

### Key Features

✅ **User Authentication** - JWT-based signup/login with role-based access  
✅ **Complaint Management** - File, browse, filter, and track complaints  
✅ **Upvoting System** - Community-driven prioritization  
✅ **Duplicate Detection** - Smart suggestions for similar complaints  
✅ **Officer Dashboard** - Comprehensive complaint management  
✅ **Feedback System** - Citizens rate resolution quality  
✅ **CSV Export** - Download complaint data  
✅ **Priority Levels** - Auto-escalation based on upvotes  
✅ **Real-time Status** - Track complaint progress  

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + Vite + React Router + Axios |
| **Backend** | Express.js + Node.js |
| **Database** | MongoDB (Atlas or Local) |
| **Authentication** | JWT (JSON Web Tokens) |
| **Password Security** | bcryptjs |
| **Data Export** | json2csv |

---

## 📁 Project Structure

```
civic-portal/
├── backend/                    # Express API server
│   ├── models/                # Mongoose schemas (User, Complaint)
│   ├── routes/                # API endpoints (auth, complaints, ai)
│   ├── middleware/            # Authentication & authorization
│   ├── utils/                 # Helper functions (priority calc)
│   ├── scripts/               # Utility scripts (makeOfficer)
│   ├── server.js              # Express app entry point
│   ├── package.json
│   ├── .env                   # Environment variables (DO NOT COMMIT)
│   └── .env.example           # Template for .env
│
├── frontend/                  # React Vite application
│   ├── src/
│   │   ├── pages/            # Page components
│   │   ├── components/       # Reusable components
│   │   ├── context/          # React Context (Auth)
│   │   ├── App.jsx           # Routes
│   │   ├── api.js            # Axios client
│   │   ├── main.jsx          # React entry point
│   │   └── index.css         # Global styles
│   ├── vite.config.js        # Vite configuration
│   ├── package.json
│   └── index.html
│
├── SETUP.md                  # Detailed setup instructions
├── TESTING.md               # Comprehensive testing checklist
├── API_CONTRACT.md          # API documentation & verification
└── README.md                # This file
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** >= 18.0.0
- **npm** (included with Node)
- **MongoDB** (Atlas account or local installation)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd civic-portal
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your MongoDB credentials
   ```

3. **Frontend Setup:**
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Access the application:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Backend Health: http://localhost:5000/api/health

---

## 📚 Documentation

### For Setup & Installation
👉 **[SETUP.md](./SETUP.md)** - Complete installation, configuration, and setup guide

### For Testing
👉 **[TESTING.md](./TESTING.md)** - Comprehensive testing checklist with 100+ test cases

### For API Reference
👉 **[API_CONTRACT.md](./API_CONTRACT.md)** - Complete API endpoints, request/response formats, and verification

---

## 🔐 Security Features

✅ **Password Hashing** - bcryptjs with salt rounds  
✅ **JWT Authentication** - Stateless token-based auth  
✅ **Role-Based Access Control** - Citizen vs Officer roles  
✅ **Input Validation** - Server-side validation on all endpoints  
✅ **CORS Protection** - Configured for development  
✅ **Secure Headers** - Best practices implemented  
✅ **Environment Variables** - Sensitive data never hardcoded  
✅ **No Plaintext Passwords** - Always hashed and never returned  

---

## 📊 Database Schema

### User Collection
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

### Complaint Collection
```javascript
{
  _id: ObjectId,
  title: String,
  category: "Road" | "Garbage" | "Water" | "Electricity" | "Other",
  description: String,
  area: String,
  status: "pending" | "in-progress" | "resolved",
  priority: "Low" | "Medium" | "High" | "Critical",
  upvotes: Number,
  upvotedBy: [User._id],
  createdBy: User._id (reference),
  officerRemark: String,
  feedbackPending: Boolean,
  feedback: {
    rating: Number (1-5),
    comment: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔄 API Endpoints

### Authentication
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/signup` | Public | Register new citizen |
| POST | `/api/auth/login` | Public | Login and get JWT |

### Complaints
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/api/complaints` | Public | Browse all complaints |
| GET | `/api/complaints/:id` | Public | Get single complaint |
| POST | `/api/complaints` | Citizen | Create complaint |
| GET | `/api/complaints/mine` | Citizen | My complaints |
| GET | `/api/complaints/check-duplicate` | Public | Find similar complaints |
| GET | `/api/complaints/export` | Officer | Export CSV |
| PATCH | `/api/complaints/:id/upvote` | Auth | Upvote complaint |
| PATCH | `/api/complaints/:id/status` | Officer | Update status & remark |
| PATCH | `/api/complaints/:id/feedback` | Citizen | Submit feedback |

### AI/Analytics
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/api/ai/officer-summary` | Officer | Get AI briefing |

### Health
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | Public | Server & DB status |

See [API_CONTRACT.md](./API_CONTRACT.md) for full details.

---

## 👥 User Roles

### Citizen
- Create complaints
- Browse all complaints
- Upvote complaints
- View their own complaints
- Rate resolution (feedback)

### Officer
- View all complaints
- Filter by priority, status, category
- Update complaint status & add remarks
- Export data as CSV
- Get AI-generated briefing

---

## 🧪 Testing

Start with the [TESTING.md](./TESTING.md) checklist which includes:

1. **Authentication Tests** - Signup, Login, Logout
2. **Complaint Filing** - Create, Validate, Detect Duplicates
3. **Browsing** - Filter, Search, Priority
4. **Officer Dashboard** - Analytics, CSV Export
5. **Feedback System** - Rating, Comments
6. **Security Tests** - Authorization, Role Checks
7. **Error Handling** - Validation, Edge Cases

---

## 🐛 Known Issues & Solutions

### MongoDB Connection Failed
- Ensure MongoDB is running (local or Atlas)
- Check MONGO_URI in `.env`
- Verify IP whitelisting (Atlas)

### Port Already in Use
```bash
# Windows
taskkill /PID <PID> /F

# macOS/Linux
kill -9 <PID>
```

### CORS Errors
- Check `CLIENT_ORIGIN` matches frontend URL
- Verify backend is accessible at `http://localhost:5000`

See [SETUP.md](./SETUP.md) for comprehensive troubleshooting.

---

## 🚢 Deployment

### Prerequisites Before Deployment
1. ✅ Update JWT_SECRET to a strong random value
2. ✅ Change MongoDB password (if using Atlas)
3. ✅ Whitelist production IP (if using Atlas)
4. ✅ Update CLIENT_ORIGIN to production URL
5. ✅ Build frontend: `npm run build`
6. ✅ Set NODE_ENV=production

### Deployment Options

**Backend Options:** Heroku, Render, Railway, AWS EC2  
**Frontend Options:** Vercel, Netlify, GitHub Pages

See deployment guides for each platform.

---

## 📝 Environment Variables

### Backend (.env)
```env
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/db
JWT_SECRET=<random-32-char-string>
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=http://localhost:5173
NODE_ENV=development
```

**⚠️ IMPORTANT:** Never commit `.env` to Git. Use `.env.example` as template.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 Code Quality

### Frontend
- React best practices
- Component composition
- Proper error handling
- Responsive design

### Backend
- Express middleware pattern
- Mongoose schema validation
- Comprehensive error logging
- Role-based access control
- Input validation

---

## 🎯 Future Enhancements

- [ ] Image upload for complaints
- [ ] Real-time notifications
- [ ] Email alerts
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Geolocation mapping
- [ ] Multiple language support
- [ ] Admin panel

---

## 📞 Support

For issues or questions:
1. Check [SETUP.md](./SETUP.md) troubleshooting
2. Review [TESTING.md](./TESTING.md) for test cases
3. Check [API_CONTRACT.md](./API_CONTRACT.md) for endpoint details
4. Review backend logs for errors
5. Check browser console for frontend errors

---

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

---

## 🙏 Acknowledgments

Built with modern web technologies:
- React for UI
- Express for API
- MongoDB for database
- Vite for bundling

---

## ✅ Project Status

**Version:** 1.0.0  
**Status:** ✅ Production Ready  
**Last Updated:** 2024  

- [x] Complete feature implementation
- [x] All API contracts verified
- [x] Comprehensive testing suite
- [x] Security audit completed
- [x] Documentation finalized
- [x] Error handling improved
- [x] Frontend routing fixed
- [x] Backend optimized

---

**Ready to make your city better! 🏘️**
