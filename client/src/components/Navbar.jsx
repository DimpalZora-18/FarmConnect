import { Link } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "../context/AuthContext.jsx";

function Navbar() {

    const { user, logout } = useContext(AuthContext);
    return (
        <nav>
            <h2>FarmConnect</h2>

            <div>
                <Link to="/">Home</Link>

                {user ? (
                    <>
                        <Link to="/dashboard">Dashboard</Link>
                        <button onClick={logout}>Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/login">Login</Link>
                        <Link to="/register">Register</Link>
                    </>
                )}
            </div>
        </nav>
    );
}

export default Navbar;