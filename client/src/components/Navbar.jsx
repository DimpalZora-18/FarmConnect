import { Link } from "react-router-dom";
import { useContext, useState } from "react";
import AuthContext from "../context/AuthContext.jsx";
import logo from "../assets/farmconnect-logo.png";
import {
    Menu, 
    X, 
    ShoppingCart, 
    UserCircle,
    House,
    Package,
    LayoutDashboard,
    User,
    LogOut
} from "lucide-react";

function Navbar() {

    const { user, logout } = useContext(AuthContext);
    const [isMenuOpen, setIsMenuOpen ] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    return (
        <nav className="flex flex-wrap items-center justify-between px-4 py-3 mx-1 my-1 bg-white border-green-100 border border-gray-200 rounded-2xl">
            <Link to="/" className="flex item-center gap-2">
                <img
                    src={logo}
                    alt="FarmConnect Logo"
                    className="w-[220px] h-auto object-contain"
                />
            </Link>

            <div className="hidden md:flex item-center gap-6">

                <Link to="/" className="text-gray-800 hover:text-green-700">
                    Home
                </Link>

                <Link to="/products" className="text-gray-800 hover:text-green-700">
                    Products
                </Link>

                {user ? (
                    <>
                        <Link to="/dashboard" className="text-gray-800 hover:text-green-700">
                            Dashboard
                        </Link>

                        <button 
                            onClick={logout}
                            className="text-gray-800 hover:text-red-600"
                        >
                            Logout
                        </button>

                        <Link to="/cart" className="text-gray-800 hover:text-green-700">
                            <ShoppingCart size={23}/>
                        </Link>

                        <button 
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="text-gray-800 hover:text-green-700"
                        >
                            <UserCircle size={23}/>
                        </button>

                        {isProfileOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg p-2">

                                <Link
                                    to="/dashboard"
                                    onClick={() => setIsProfileOpen(false)}
                                    className="block px-4 py-2 hover:bg-green-50 rounded-lg"
                                >
                                    <LayoutDashboard size={18} />
                                    Dahboard
                                </Link>

                                <Link
                                    to="/profile"
                                    onClick={()=> setIsProfileOpen(false)}
                                    className="block px-4 py-2 hover:bg-green-50 rounded-lg"
                                >
                                    <User size={18} />
                                    Profile
                                </Link>

                                <button
                                    onClick={() => {
                                        logout();
                                        setIsProfileOpen(false);
                                    }}
                                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                                >
                                    <LogOut size={18} />
                                    Logout
                                </button>
                            </div>
                        )

                        }

                    </>
                ) : (
                    <>
                        <Link to="/login" className="text-gray-800 hover:text-green-700">
                            Login
                        </Link>

                        <Link to="/register" className="text-gray-800 hover:text-green-700">
                            Register
                        </Link>

                        <Link to="/login" className="text-gray-800 hover:text-green-700">
                            <UserCircle size={23} />
                        </Link>
                    </>
                )}

            </div>
            <button 
                className="md:hidden text-gray-800"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
                {isMenuOpen ? <X size={26} /> :<Menu size={26} />}
            </button>

            {isMenuOpen && (
                <div className="md:hidden flex flex-col gap-4 w-full basis-full px-4 py-4 border-t border-green-100">

                    <Link to="/" className="flex items-center gap-3" onClick={() => setIsMenuOpen(false)}>
                        <House size={18} />
                        Home
                    </Link>

                    <Link to="/products" className="flex items-center gap-3" onClick={() => setIsMenuOpen(false)}>
                        <Package size={18} />
                        Products
                    </Link>

                    <Link to="/cart" className="flex items-center gap-3" onClick={() => setIsMenuOpen(false)}>
                        <ShoppingCart size={18} />
                        Cart
                    </Link>



                    {user ? (
                        <>
                            <Link to="/dashboard" className="flex items-center gap-3" onClick={() => setIsMenuOpen(false)}>
                                <LayoutDashboard size={18} />
                                Dashboard
                            </Link>

                            <Link to="/Profile" className="flex items-center gap-3" onClick={() => setIsMenuOpen(false)}>
                                 <User size={18} />
                                Profile
                            </Link>

                            <button onClick={() => {
                                logout();
                                setIsMenuOpen(false);
                                }}
                                className="flex items-center gap-3 text-left self-start"
                            >
                                <LogOut size={18} />
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                                Login
                            </Link>

                            <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                                Register
                            </Link>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
}

export default Navbar;