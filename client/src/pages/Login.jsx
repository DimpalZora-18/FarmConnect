import { useState, useContext } from "react";
import AuthContext from "../context/AuthContext.jsx";
import { GoogleLogin } from "@react-oauth/google";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { setUser } = useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
        const response = await fetch(
            "http://localhost:5000/api/auth/login",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    password,
                }),
            }
        );

        const data = await response.json();
        if (response.ok) {
            localStorage.setItem("token", data.accessToken);
            setUser(data.user);
        }

        console.log("Backend response:", data);

    } catch (error) {
        console.error("Login failed:", error);
    }
    };

    const handleGoogleSuccess = async (credentialResponse) =>{
        try{
            const response = await fetch(
                "http://localhost:5000/api/auth/google",
                {
                    method: "POST",
                    headers: {
                        "Content-Type" : "application/json"
                    },
                    body: JSON.stringify({
                        credential:credentialResponse.credential, 
                    }),
                }
            );

            const data = await response.json();

            if(!response.ok){
                throw new Error(data.message || "Google login failed");
            }

            localStorage.setItem("token",data.token);
            setUser(data.user);

            console.log("Google login successful:", data.user);
        } catch(error){
            console.log("Google login failed:", error);
        }
    };

    return (
        <div className="min-h-screen bg-green-50 flex items-center justify-center px-4">

            <div className="w-full max-w-md">

                {/* Brand */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-green-700">
                        🌱 FarmConnect
                    </h1>

                    <p className="text-gray-600 mt-2">
                        Connecting farmers with better opportunities
                    </p>
                </div>


                {/* Login Card */}
                <div className="bg-white rounded-2xl shadow-lg p-8">

                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">
                            Welcome Back
                        </h2>

                        <p className="text-gray-500 mt-1">
                            Login to your FarmConnect account
                        </p>
                    </div>


                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>

                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                            />
                        </div>


                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Password
                            </label>

                            <input
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                            />
                        </div>


                        {/* Login Button */}
                        <button
                            type="submit"
                            className="w-full bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 transition duration-200"
                        >
                            Login
                        </button>

                    </form>

                    <div className="mt-5">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="flex-1 border-t border-gray-200"></div>
                            <span className="text-sm text-gray-500">
                                 OR CONTINUE WITH
                            </span>
                            <div className="flex-1 border-t border-gray-200"></div>
                        </div>

                        <div className="flex justify-center">
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                    onError={() => {
                                        console.error("Google login failed");
                                    }}
                                text="continue_with"
                                shape="rectangular"
                                width="320"
                            />
                        </div>
                    </div>


                    {/* Register */}
                    <p className="text-center text-sm text-gray-500 mt-6">
                        Don't have an account?{" "}
                        <span className="text-green-600 font-semibold cursor-pointer hover:text-green-700">
                            Register
                        </span>
                    </p>

                </div>

            </div>

        </div>
    );
}

export default Login;