import {BrowserRouter, Routes, Route, useLocation, Navigate  } from "react-router-dom";
import Login from "./pages/Login";
import Navbar from "./components/Navbar";
import Overview from "./pages/Overview";
import Resource_library from "./pages/Resource_library";
import Course from "./pages/Course";
import Settings from "./pages/settings";
import Users from "./pages/Users";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";

// Separate component to handle layout logic based on the current route
function AppContent() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  return (
    <div className="layout">
      {/* Only show Navbar if the user is NOT on the login page */}
      {!isLoginPage && <Navbar />}
      
      <div className={isLoginPage ? "auth-content" : "main-content"}>
        <Routes>
  {/* Add this line right here to catch standard root hits */}
  <Route path="/" element={<Navigate to="/login" replace />} />

  {/* Public Route */}
  <Route path="/login" element={<Login />} />
  
  {/* Protected Routes Wrapper */}
  <Route element={<ProtectedRoute />}>
    <Route path="/dashboard" element={<Overview />} />
    <Route path="/resource" element={<Resource_library />} />
    <Route path="/Course" element={<Course />} />
    <Route path="/Settings" element={<Settings />} />
    <Route path="/users" element={<Users />} />
  </Route>
</Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
