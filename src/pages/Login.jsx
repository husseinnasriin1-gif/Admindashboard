import { useState } from "react";
import { useNavigate } from "react-router-dom"; 


function Login() {
  // 1. Manage form input states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
   const navigate = useNavigate();

  // 2. Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevents the page from reloading
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch("https://adminbackend-production-f7a6.up.railway.app/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Displays backend validation or database query error messages
        throw new Error(data.message || "Login failed");
      }

      // 3. Store the secure JWT token locally
      localStorage.setItem("adminToken", data.token);
      setSuccessMessage("Login successful! Redirecting...");

      setTimeout(() => {
        navigate("/dashboard"); // This points to your target dashboard path
      }, 1500); 

    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  return (
    <div className="login-container">
      <h2>Admin login</h2>
      
      {/* 4. Display status alerts if they exist */}
      {errorMessage && <p style={{ color: "red", fontWeight: "bold" }}>{errorMessage}</p>}
      {successMessage && <p style={{ color: "green", fontWeight: "bold" }}>{successMessage}</p>}

      <form onSubmit={handleSubmit}>
        <input 
          type="email" 
          placeholder="Enter email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input 
          type="password" 
          placeholder="Enter password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">login</button>
      </form>
    </div>
  );
}

export default Login;
