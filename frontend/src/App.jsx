import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import CitizenDashboard from "./pages/CitizenDashboard";
import NewComplaint from "./pages/NewComplaint";
import MyComplaints from "./pages/MyComplaints";
import BrowseComplaints from "./pages/BrowseComplaints";
import ComplaintDetail from "./pages/ComplaintDetail";
import OfficerDashboard from "./pages/OfficerDashboard";
import OfficerComplaintReview from "./pages/OfficerComplaintReview";

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/complaints" element={<BrowseComplaints />} />
        {/* Specific complaint routes must come BEFORE the :id parameter route */}
        <Route
          path="/complaints/new"
          element={
            <ProtectedRoute role="citizen">
              <NewComplaint />
            </ProtectedRoute>
          }
        />
        <Route
          path="/complaints/mine"
          element={
            <ProtectedRoute role="citizen">
              <MyComplaints />
            </ProtectedRoute>
          }
        />
        {/* Generic :id route comes after specific routes */}
        <Route path="/complaints/:id" element={<ComplaintDetail />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute role="citizen">
              <CitizenDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/officer/dashboard"
          element={
            <ProtectedRoute role="officer">
              <OfficerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/officer/complaints/:id"
          element={
            <ProtectedRoute role="officer">
              <OfficerComplaintReview />
            </ProtectedRoute>
          }
        />
      </Routes>
       
    </>
  );
}
