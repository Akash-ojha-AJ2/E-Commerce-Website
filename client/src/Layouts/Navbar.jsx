
// import React, { useState, useContext, useEffect, useRef } from 'react';
// import axios from "axios";
// import { Link, useNavigate } from 'react-router-dom';
// import './Navbar.css';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import 'bootstrap/dist/js/bootstrap.bundle.min.js';
// import { FaUserCircle, FaShoppingCart, FaStore, FaBell, FaSignOutAlt, FaUserEdit, FaBoxOpen, FaRobot, FaSignInAlt, FaUserPlus, FaSearch, FaHeart } from 'react-icons/fa';
// import { Context } from '../store/Context';

// // Custom hook to detect clicks outside a component
// const useOnClickOutside = (ref, handler) => {
//     useEffect(() => {
//         const listener = (event) => {
//             if (!ref.current || ref.current.contains(event.target)) {
//                 return;
//             }
//             handler(event);
//         };
//         document.addEventListener('mousedown', listener);
//         document.addEventListener('touchstart', listener);
//         return () => {
//             document.removeEventListener('mousedown', listener);
//             document.removeEventListener('touchstart', listener);
//         };
//     }, [ref, handler]);
// };

// function Navbar({ isLoggedIn }) {
//     const [showProfileMenu, setShowProfileMenu] = useState(false);
//     const { 
//         logout, 
//         user, 
//         cartCount, 
//         backend
      
//     } = useContext(Context);
    
//     const navigate = useNavigate();
//     const [searchQuery, setSearchQuery] = useState("");
//     const [isSearchFocused, setIsSearchFocused] = useState(false);
//     const [notifications, setNotifications] = useState([]);
//      const [localCartCount, setLocalCartCount] = useState(0);

//     const dropdownRef = useRef(null);
    
//     useOnClickOutside(dropdownRef, () => setShowProfileMenu(false));

//     const toggleProfileMenu = () => setShowProfileMenu(!showProfileMenu);
//     const closeProfileMenu = () => setShowProfileMenu(false);

//     const handleSearch = () => {
//         if (!searchQuery.trim()) return;
//         navigate(`/searchproduct?q=${encodeURIComponent(searchQuery)}`);
//     };

//         const getLocalCartCount = () => {
//         try {
//             const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
//             return cartItems.length;
//         } catch (error) {
//             console.error("Error reading cart from localStorage:", error);
//             return 0;
//         }
//     };


//         useEffect(() => {
//         const updateLocalCartCount = () => {
//             setLocalCartCount(getLocalCartCount());
//         };

//         // Initial count
//         updateLocalCartCount();

//         // Listen for storage changes (if cart is updated in other tabs)
//         const handleStorageChange = (e) => {
//             if (e.key === 'cartItems') {
//                 updateLocalCartCount();
//             }
//         };

//         window.addEventListener('storage', handleStorageChange);
        
//         // Poll for changes (optional, for same tab updates)
//         const interval = setInterval(updateLocalCartCount, 1000);

//         return () => {
//             window.removeEventListener('storage', handleStorageChange);
//             clearInterval(interval);
//         };
//     }, []);

//     // Determine which cart count to display
//     const displayCartCount = isLoggedIn ? cartCount : localCartCount;


//         const unseenCount = Array.isArray(notifications) ?
//         notifications.filter(notif => !notif.isRead).length :
//         0;

//     // ... (rest of the logic remains the same) ...
//     const handleNotificationClick = async () => {
//         try {
//             navigate('/notifications');
//             await fetch(`${backend}/api/v1/notifications/mark-read`, {
//                 method: 'PATCH',
//                 credentials: 'include',
//             });
//             setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
//         } catch (err) {
//             console.error('Failed to mark notifications as read:', err);
//         }
//     };


//     const isAdmin = user?.role === 'admin';
//     const isSeller = user?.isSeller === true;

//     const getDashboardLink = () => {
//         if (isAdmin) return "/admin/dashboard";
//         if (isSeller) return "/seller/dashboard";
//         return "/become-seller";
//     }

//     const getDashboardText = () => {
//         if (isAdmin || isSeller) return "Dashboard";
//         return "Become a Seller";
//     }

//     return (
//         <nav className="modern-navbar">
//             <div className="nav-container">
//                 {/* Brand Logo */}
//                 <Link className="nav-brand" to="/">
//                     <div className="brand-logo">
//                         <span className="logo-icon">🛍️</span>
//                         <span className="brand-text">ShopKart</span>
//                     </div>
//                 </Link>

//                 {/* Search Bar */}
//                 <div className={`nav-search-container ${isSearchFocused ? 'focused' : ''}`}>
//                     <div className="search-input-wrapper">
//                         <FaSearch className="search-icon" />
//                         <input
//                             className="nav-search-input"
//                             type="search"
//                             placeholder="Search for products, brands and more..."
//                             value={searchQuery}
//                             onChange={(e) => setSearchQuery(e.target.value)}
//                             onKeyDown={(e) => {
//                                 if (e.key === "Enter") {
//                                     e.preventDefault();
//                                     handleSearch();
//                                 }
//                             }}
//                             onFocus={() => setIsSearchFocused(true)}
//                             onBlur={() => setIsSearchFocused(false)}
//                         />
//                         {searchQuery && (
//                             <button 
//                                 className="clear-search" 
//                                 onClick={() => setSearchQuery("")}
//                             >
                                
//                             </button>
//                         )}
//                     </div>
//                     <button
//                         className="nav-search-btn"
//                         onClick={handleSearch}
//                     >
//                         Search
//                     </button>
//                 </div>

//                 {/* Navigation Icons */}
//                 <div className="nav-actions">
//                     {/* Seller Dashboard */}
//                     {isLoggedIn && (
//                         <Link to={getDashboardLink()} className="nav-seller-btn">
//                             <FaStore className="btn-icon" />
//                             <span className="btn-text">{getDashboardText()}</span>
//                         </Link>
//                     )}

//                     {/* Profile Dropdown */}
//                     <div className="nav-dropdown-wrapper" ref={dropdownRef}>
//                         <button className="nav-profile-btn" onClick={toggleProfileMenu}>
//                             <FaUserCircle className="profile-icon" />
//                             <span className="profile-text">Account</span>
//                         </button>

//                         {showProfileMenu && (
//                             <ul className="navbar-dropdown-menu-custom">
//                                 {!isLoggedIn ? (
//                                     <>
//                                         <li className="navbar-dropdown-header">Welcome to ShopKart!</li>
//                                         <li><Link className="navbar-dropdown-item-custom" to="/login" onClick={closeProfileMenu}><FaSignInAlt className='navbar-icon-margin' />Login</Link></li>
//                                         <li><Link className="navbar-dropdown-item-custom" to="/signup" onClick={closeProfileMenu}><FaUserPlus className='navbar-icon-margin' />Signup</Link></li>
//                                     </>
//                                 ) : (
//                                     <>
//                                         <li className="navbar-dropdown-header">Hello, {user?.name || 'User'}</li>
//                                         <li><Link className="navbar-dropdown-item-custom" to="/profile" onClick={closeProfileMenu}><FaUserEdit className='navbar-icon-margin' />My Profile</Link></li>

//                                         {user?.role === 'user' && (
//                                             <>
//                                                 <li><Link className="navbar-dropdown-item-custom" to="/orders" onClick={closeProfileMenu}><FaBoxOpen className='navbar-icon-margin' />Orders</Link></li>
//                                                 <li><Link className="navbar-dropdown-item-custom" to="/ai-suggestion" onClick={closeProfileMenu}><FaRobot className='navbar-icon-margin' />AI Suggestion</Link></li>
//                                             </>
//                                         )}

//                                         <li><hr className="navbar-dropdown-divider" /></li>
//                                         <li>
//                                             <Link className="navbar-dropdown-item-custom text-danger" onClick={() => { logout(); closeProfileMenu(); }}>
//                                                 <FaSignOutAlt className='navbar-icon-margin' />Logout
//                                             </Link>
//                                         </li>
//                                     </>
//                                 )}
//                             </ul>
//                         )}
//                     </div>

//                     {/* Notifications - Direct Link */}
//                     {isLoggedIn && (
//                         <Link className="nav-icon-btn" to="/notifications" onClick={handleNotificationClick}>
//                             <FaBell size={24} />
//                             {unseenCount > 0 && <span className="navbar-custom-badge">{unseenCount}</span>}
//                         </Link>
//                     )}

//                     {/* Cart */}
//                    {(!isLoggedIn || user?.role === 'user') && (
//                         <Link className="nav-icon-btn" to="/cart">
//                             <div className="icon-wrapper">
//                                 <FaShoppingCart size={24} />
//                                 {displayCartCount > 0 && <span className="cart-badge">{displayCartCount}</span>}
//                             </div>
//                         </Link>
//                     )}
//                 </div>
//             </div>
//         </nav>
//     );
// }

// export default Navbar;














import React, { useState, useContext, useEffect, useRef } from 'react';
import axios from "axios";
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { FaUserCircle, FaShoppingCart, FaStore, FaBell, FaSignOutAlt, FaUserEdit, FaBoxOpen, FaRobot, FaSignInAlt, FaUserPlus, FaSearch, FaHeart } from 'react-icons/fa';
import { Context } from '../store/Context';

// Custom hook to detect clicks outside a component
const useOnClickOutside = (ref, handler) => {
    useEffect(() => {
        const listener = (event) => {
            if (!ref.current || ref.current.contains(event.target)) {
                return;
            }
            handler(event);
        };
        document.addEventListener('mousedown', listener);
        document.addEventListener('touchstart', listener);
        return () => {
            document.removeEventListener('mousedown', listener);
            document.removeEventListener('touchstart', listener);
        };
    }, [ref, handler]);
};

function Navbar({ isLoggedIn }) {
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const { 
        logout, 
        user, 
        cartCount, 
        backend
    } = useContext(Context);
    
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [localCartCount, setLocalCartCount] = useState(0);

    const dropdownRef = useRef(null);
    
    useOnClickOutside(dropdownRef, () => setShowProfileMenu(false));

    const toggleProfileMenu = () => setShowProfileMenu(!showProfileMenu);
    const closeProfileMenu = () => setShowProfileMenu(false);

    const handleSearch = () => {
        if (!searchQuery.trim()) return;
        navigate(`/searchproduct?q=${encodeURIComponent(searchQuery)}`);
    };

    const getLocalCartCount = () => {
        try {
            const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
            return cartItems.length;
        } catch (error) {
            console.error("Error reading cart from localStorage:", error);
            return 0;
        }
    };

    useEffect(() => {
        const updateLocalCartCount = () => {
            setLocalCartCount(getLocalCartCount());
        };

        // Initial count
        updateLocalCartCount();

        // Listen for storage changes (if cart is updated in other tabs)
        const handleStorageChange = (e) => {
            if (e.key === 'cartItems') {
                updateLocalCartCount();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        
        // Poll for changes (optional, for same tab updates)
        const interval = setInterval(updateLocalCartCount, 1000);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(interval);
        };
    }, []);

    // Determine which cart count to display
    const displayCartCount = isLoggedIn ? cartCount : localCartCount;

    const unseenCount = Array.isArray(notifications) ?
        notifications.filter(notif => !notif.isRead).length :
        0;

    const handleNotificationClick = async () => {
        try {
            navigate('/notifications');
            await fetch(`${backend}/api/v1/notifications/mark-read`, {
                method: 'PATCH',
                credentials: 'include',
            });
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (err) {
            console.error('Failed to mark notifications as read:', err);
        }
    };

    const isAdmin = user?.role === 'admin';
    const isSeller = user?.isSeller === true;

    const getDashboardLink = () => {
        if (isAdmin) return "/admin/dashboard";
        if (isSeller) return "/seller/dashboard";
        return "/become-seller";
    }

    const getDashboardText = () => {
        if (isAdmin || isSeller) return "Dashboard";
        return "Become a Seller";
    }

    // Check if it's mobile view
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <nav className="modern-navbar">
            <div className="nav-container">
                {/* Brand Logo */}
                <Link className="nav-brand" to="/">
                    <div className="brand-logo">
                        <span className="logo-icon">🛍️</span>
                        <span className="brand-text">ShopKart</span>
                    </div>
                </Link>

                {/* Search Bar */}
                <div className={`nav-search-container ${isSearchFocused ? 'focused' : ''}`}>
                    <div className="search-input-wrapper">
                        <FaSearch className="search-icon" />
                        <input
                            className="nav-search-input"
                            type="search"
                            placeholder="Search for products, brands and more..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleSearch();
                                }
                            }}
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => setIsSearchFocused(false)}
                        />
                        {searchQuery && (
                            <button 
                                className="clear-search" 
                                onClick={() => setSearchQuery("")}
                            >
                                
                            </button>
                        )}
                    </div>
                    <button
                        className="nav-search-btn"
                        onClick={handleSearch}
                    >
                        Search
                    </button>
                </div>

                {/* Navigation Icons */}
                <div className="nav-actions">
                    {/* Seller Dashboard - Show only on desktop if user is logged in */}
                    {isLoggedIn && !isMobile && (
                        <Link to={getDashboardLink()} className="nav-seller-btn">
                            <FaStore className="btn-icon" />
                            <span className="btn-text">{getDashboardText()}</span>
                        </Link>
                    )}

                    {/* Profile Dropdown */}
                    <div className="nav-dropdown-wrapper" ref={dropdownRef}>
                        <button className="nav-profile-btn" onClick={toggleProfileMenu}>
                            <FaUserCircle className="profile-icon" />
                            <span className="profile-text">Account</span>
                        </button>

                        {showProfileMenu && (
                            <ul className="navbar-dropdown-menu-custom">
                                {!isLoggedIn ? (
                                    <>
                                        <li className="navbar-dropdown-header">Welcome to ShopKart!</li>
                                        <li><Link className="navbar-dropdown-item-custom" to="/login" onClick={closeProfileMenu}><FaSignInAlt className='navbar-icon-margin' />Login</Link></li>
                                        <li><Link className="navbar-dropdown-item-custom" to="/signup" onClick={closeProfileMenu}><FaUserPlus className='navbar-icon-margin' />Signup</Link></li>
                                    </>
                                ) : (
                                    <>
                                        <li className="navbar-dropdown-header">Hello, {user?.name || 'User'}</li>
                                        <li><Link className="navbar-dropdown-item-custom" to="/profile" onClick={closeProfileMenu}><FaUserEdit className='navbar-icon-margin' />My Profile</Link></li>

                                        {/* Become a Seller link in dropdown for mobile */}
                                        {isMobile && !isAdmin && !isSeller && (
                                            <li><Link className="navbar-dropdown-item-custom" to="/become-seller" onClick={closeProfileMenu}><FaStore className='navbar-icon-margin' />Become a Seller</Link></li>
                                        )}

                                        {user?.role === 'user' && (
                                            <>
                                                <li><Link className="navbar-dropdown-item-custom" to="/orders" onClick={closeProfileMenu}><FaBoxOpen className='navbar-icon-margin' />Orders</Link></li>
                                                <li><Link className="navbar-dropdown-item-custom" to="/ai-suggestion" onClick={closeProfileMenu}><FaRobot className='navbar-icon-margin' />AI Suggestion</Link></li>
                                            </>
                                        )}

                                        <li><hr className="navbar-dropdown-divider" /></li>
                                        <li>
                                            <Link className="navbar-dropdown-item-custom text-danger" onClick={() => { logout(); closeProfileMenu(); }}>
                                                <FaSignOutAlt className='navbar-icon-margin' />Logout
                                            </Link>
                                        </li>
                                    </>
                                )}
                            </ul>
                        )}
                    </div>

                    {/* Notifications - Direct Link */}
                    {isLoggedIn && (
                        <Link className="nav-icon-btn" to="/notifications" onClick={handleNotificationClick}>
                            <FaBell size={24} />
                            {unseenCount > 0 && <span className="navbar-custom-badge">{unseenCount}</span>}
                        </Link>
                    )}

                    {/* Cart */}
                    {(!isLoggedIn || user?.role === 'user') && (
                        <Link className="nav-icon-btn" to="/cart">
                            <div className="icon-wrapper">
                                <FaShoppingCart size={24} />
                                {displayCartCount > 0 && <span className="cart-badge">{displayCartCount}</span>}
                            </div>
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
