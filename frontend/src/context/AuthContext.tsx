import React, { createContext, useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";

export interface User {
  username: string;
  full_name: string;
  email: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  logout: () => void;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  logout: () => {},
  login: async () => {},
  loading: true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch(
          `${import.meta.env.VITE_APP_BACKEND_URL}/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setUser(data);
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };

    fetchUserData();
    setLoading(false);
  }, []);

  const login = async (credentials: { username: string; password: string }) => {
    try {
      toast("Logging in...", {
        icon: "🔒",
      });

      const response = await fetch(
        `${import.meta.env.VITE_APP_BACKEND_URL}/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(credentials),
        }
      );
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.access_token);

        const res = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/me`, {
          headers: {
            Authorization: `Bearer ${data.access_token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data);
          toast.success("Logged in successfully!");
        } else {
          toast.error("Login failed. Please check your credentials.");
        }
      } else {
        throw new Error("Login failed. Please check your credentials.");
      }
    } catch (error) {
      console.log(error);
      toast.error("Login failed. Please check your credentials.");
    }
  };

  const logout = async () => {
    try {
      toast("Logging out...", {
        icon: "🔒",
      });
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_APP_BACKEND_URL}/logout`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        localStorage.removeItem("token");
        setUser(null);
      }
      toast.success("Logged out successfully!");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed. Please try again.");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        logout,
        loading,
        login,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
