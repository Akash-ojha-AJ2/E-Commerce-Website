
import { createContext, useState, useEffect } from "react";
import { toast } from "react-toastify";
import App from "../App";

export const Context = createContext({
  token: null,
  setToken: () => {},
  isAuthenticated: false,
  setIsAuthenticated: () => {},
  user: null,
  setUser: () => {},
  logout: () => {},
  isLoggedIn: false,
  currentUser: null,
  setCurrentUser: () => {},
  searchTerm: "",
  setSearchTerm: () => {},
  backend: "",

  cartCount: 0,
  setCartCount: () => {},
  fetchCartCount: () => {},
  refreshCartCount: () => {},
});

const AppWrapper = () => {
  const [token, setTokenState] = useState(localStorage.getItem("token"));
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [cartCount, setCartCount] = useState(0); 
  const isLoggedIn = !!token;

  const backend = import.meta.env.VITE_SERVER;

  const setToken = (newToken) => {
    setTokenState(newToken);
    if (newToken) {
      localStorage.setItem("token", newToken);
      setIsAuthenticated(true);
    } else {
      localStorage.removeItem("token");
      setIsAuthenticated(false);
    }
  };

  const logoutt = () => {
    setToken(null);
    setUser(null);
    setCartCount(0); 
    setNotifications([]); // Clear notifications on logout
  };

  const logout = async () => {
    try {
      const response = await fetch(`${backend}/api/v1/user/logout`, {
        credentials: "include"
      });
      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        setUser(null);
        setIsAuthenticated(false);
        setCartCount(0); // Reset cart count
        setNotifications([]); // Clear notifications
        logoutt();
      } else {
        toast.error(data.message || "Logout failed");
      }
    } catch (err) {
      toast.error("Something went wrong during logout.");
      console.error("Logout error:", err);
    }
  };

  // Cart count fetch function
  const fetchCartCount = async () => {
    try {
      const response = await fetch(`${backend}/api/v1/userproduct/cart-count`, { 
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        setCartCount(data.cartCount);
      }
    } catch (error) {
      console.error('❌ Error fetching cart count:');
      console.error('Message:', error.message);
      setCartCount(0);
    }
  };

  const refreshCartCount = () => {
    fetchCartCount();
  };


  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${backend}/api/v1/user/me`, {
          credentials: 'include',
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.message);

        setUser(data.user);
        
        // Fetch cart count and notifications after user profile is loaded
        if (data.user) {
          fetchCartCount();
        }
      } catch (error) {
        console.error('Failed to fetch user:', error.message);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchCartCount();
      const cartInterval = setInterval(fetchCartCount, 30000);
      return () => {
        clearInterval(cartInterval);
      };
    } else {
      setCartCount(0); 
    }
  }, [isAuthenticated, user]);



  return (
    <Context.Provider
      value={{
        token,
        setToken,
        isAuthenticated,
        setIsAuthenticated,
        user,
        setUser,
        logout,
        isLoggedIn,
        currentUser,
        setCurrentUser,
        searchTerm,
        setSearchTerm,
        backend,
        cartCount,
        setCartCount,
        fetchCartCount,
        refreshCartCount,
      }}
    >
      <App />
    </Context.Provider>
  );
};

export default AppWrapper;
