import { useState } from "react";

function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("customer");
    const [showPassword, setShowPassword] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (!name.trim()) {
            setError("Name is required");
            return;
        }

        if (!email.trim()) {
            setError("Email is required");
            return;
        }

        if (!email.includes("@")) {
            setError("Please enter a valid email");
            return;
        }

        if (!phone.trim()) {
            setError("Phone number is required");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(
                "http://localhost:5000/api/auth/register",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name,
                        email,
                        phone,
                        password,
                        role,
                    }),
                }
            );

            const data = await response.json();

            if(!response.ok){
                setError(data.message || "Registration failed");
                return;
            }

            setSuccess("Account created successfully!");
            
            // Clear form
            setName("");
            setEmail("");
            setPhone("");
            setPassword("");
            setRole("customer");

        } catch (error) {
            setError("Unable to connect to server");
            console.error(error);

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-green-50 flex items-center justify-center px-4 py-10">

            <div className="w-full max-w-md">

                {/* Logo / Brand */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-green-700">
                        🌱 FarmConnect
                    </h1>

                    <p className="text-gray-600 mt-2">
                        Connecting farmers with better opportunities
                    </p>
                </div>


                {/* Registration Card */}
                <div className="bg-white rounded-2xl shadow-lg p-8">

                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">
                            Create Account
                        </h2>

                        <p className="text-gray-500 mt-1">
                            Join FarmConnect today
                        </p>
                    </div>
                    
                    {error && (
                            <div className="mb-5 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                                ❌ {error}
                            </div>
                    )}

                    
                    {success && (
                            <div className="mb-5 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
                                ✅ {success}
                            </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Full Name
                            </label>

                            <input
                                type="text"
                                placeholder="Enter your full name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                            />
                        </div>


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


                        {/* Phone */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Phone Number
                            </label>

                            <input
                                type="text"
                                placeholder="Enter your phone number"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                            />
                        </div>


                        {/* Password */}
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Password
                            </label>

                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Create a password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-20 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-7 translate-y-1/2 text-sm font-medium text-green-600"
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>


                        {/* Role */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Account Type
                            </label>

                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 bg-white outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                            >
                                <option value="customer">
                                    Customer
                                </option>

                                <option value="farmer">
                                    Farmer
                                </option>
                            </select>
                        </div>


                        {/* Register Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 transition duration-200"
                        >
                            {loading ? "Creating Account..." : "Create Account"}
                        </button>

                    </form>


                    {/* Login Link */}
                    <p className="text-center text-sm text-gray-500 mt-6">
                        Already have an account?{" "}
                        <span className="text-green-600 font-semibold cursor-pointer hover:text-green-700">
                            Login
                        </span>
                    </p>

                </div>

            </div>

        </div>
    );
}

export default Register;



// import { useState } from "react";

// function Register() {
//     const [name, setName] = useState("");
//     const [email, setEmail] = useState("");
//     const [phone, setPhone] = useState("");
//     const [password, setPassword] = useState("");
//     const [role, setRole] = useState("customer");

//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         if (!name.trim()) {
//             alert("Name is required");
//             return;
//         }

//         if (!email.trim()) {
//             alert("Email is required");
//             return;
//         }

//         if (!email.includes("@")) {
//             alert("Please enter a valid email");
//             return;
//         }

//         if (!phone.trim()) {
//             alert("Phone is required");
//             return;
//         }

//         if (password.length < 6) {
//             alert("Password must be at least 6 characters");
//             return;
//         }

//         try {
//             const response = await fetch(
//                 "http://localhost:5000/api/auth/register",{
//                     method: "POST",

//                     headers: {
//                         "Content-Type": "application/json"
//                     },

//                     body: JSON.stringify({
//                         name,
//                         email,
//                         phone,
//                         password,
//                         role
//                     })
//                 }
//             );

//             const data = await response.json();

//             console.log(data);
//         } catch (error) {
//             console.error("Registration failed:",error);
//         }
//     }
//     return (
//         <div>
//             <h1>Create Account</h1>

//             <form onSubmit={handleSubmit}>
//                 <input
//                     type="text"
//                     placeholder="Name"
//                     value={name}
//                     onChange={(e) => setName(e.target.value)}
//                 />

//                 <input
//                     type="email"
//                     placeholder="Email"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                 />

//                 <input
//                     type="text"
//                     placeholder="Phone"
//                     value={phone}
//                     onChange={(e) => setPhone(e.target.value)}
//                 />

//                 <input
//                     type="password"
//                     placeholder="Password"
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                 />

//                 <select
//                     value={role}
//                     onChange={(e) => setRole(e.target.value)}
//                 >
//                     <option value="customer">Customer</option>
//                     <option value="farmer">Farmer</option>
//                 </select>

//                 <button type="submit">
//                     Register
//                 </button>
//             </form>
//         </div>
//     );
// }

// export default Register;