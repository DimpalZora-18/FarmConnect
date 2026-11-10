import { useNavigate } from "react-router-dom";

const Unauthorized = () =>{
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex item-center justify-center bg-gray-100 px-4" >
            <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md">
                <div className="text-5xl mb-4">🚫</div>
                <h1 className="text-3xl font-bold text-gray-800">
                    Access Denied
                </h1>
                <p className="text-gray-500 mt-4">
                    403 - Forbidden
                </p>
                <p className="text-gray-500 mt-2">
                    Sorry, you don't have permission to access this page.
                </p>

                <button 
                    onClick={() => navigate("/")}
                    className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
                >
                    Go Home
                </button>
            </div>
        </div>
    );
};

export default Unauthorized;