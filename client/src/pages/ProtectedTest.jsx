import { useState } from "react";
import { apiFetch } from "../utils/api";

function ProtectedTest() {
    const [message, setMessage] = useState("");

    const testProtectedRoute = async () => {
        const token = localStorage.getItem("token");

        const response = await apiFetch(
            "/api/test/protected",
            {
                method: "GET",
            }
        );

        const data = await response.json();

        setMessage(data.message);
        console.log("Backend response:", data);
    };

    return (
        <div>
            <h1>Protected Test</h1>

            <button onClick={testProtectedRoute}>
                Test Protected API
            </button>

            <p>{message}</p>
        </div>
    );
}

export default ProtectedTest;