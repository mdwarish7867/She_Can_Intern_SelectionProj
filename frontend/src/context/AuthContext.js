import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check localStorage on initial load
  useEffect(() => {
    const initializeAuth = async () => {
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        const userData = JSON.parse(storedUser);

        try {
          // Fetch latest user data from backend
          const response = await axios.get(
            `${process.env.REACT_APP_BACKEND_URL}/api/interns/${userData._id}`
          );
          setUser(response.data);
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUser(userData);
        }
      }

      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
