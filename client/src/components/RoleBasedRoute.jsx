// import { useContext } from "react";
// import AuthContext from "../context/AuthContext";
// import ProtectedRoute from "./ProtectedRoute";
// import Unauthorized from "../pages/Unauthorized";

// const RoleBasedRoute = ({ children, allowedRoles }) => {
//     const { user } = useContext(AuthContext);

//     return (
//         <ProtectedRoute>
//             {allowedRoles.includes(user.role) ? (
//                 children
//             ) : (
//                 <Unauthorized />
//             )}
//         </ProtectedRoute>
//     );
// }

// export default RoleBasedRoute;

import { useContext } from "react";
import { Navigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import Unauthorized from "../pages/Unauthorized";

const RoleBasedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useContext(AuthContext);

    // Step 1: Wait until authentication check completes
    if (loading) {
        return <p>Checking authentication...</p>;
    }

    // Step 2: Redirect if user is not logged in
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Step 3: Check user's role
    if (!allowedRoles.includes(user.role)) {
        return <Unauthorized />;
    }

    // Step 4: Allow access
    return children;
};

export default RoleBasedRoute;
