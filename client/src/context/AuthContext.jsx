import { createContext,useState, useEffect } from "react";
import { apiFetch } from "../utils/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);


    useEffect(() =>{
        const restoreUser = async () =>{
            try{
                const token = localStorage.getItem("token");

                if(!token) {
                    return;
                }

                const response = await apiFetch("/api/auth/profile");

                if(!response.ok) {
                    return;
                }

                const data = await response.json();
                setUser(data.user);

            }catch(error) {
                console.log("Session restoration error:",error);
            }finally{
                setLoading(false);
            }
        };

        restoreUser();
    },[]);
    const logout = async () => {
        try{
            await fetch("http://localhost:5000/api/auth/logout", {
                method: "POST",
                credentials: "include",
            });
        }catch(error) {
            console.log("Logout API error:",error);
        }finally{
            localStorage.removeItem("token");
            setUser(null);
        }
    };

    return(
        <AuthContext.Provider value={{user,setUser,loading, logout}}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;