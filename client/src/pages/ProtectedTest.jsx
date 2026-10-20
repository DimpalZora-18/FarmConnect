import { useState } from "react";

function ProtectedTest() {
    const [message, setMessage] = useState("");

    const testProtectedRoute = async () => {
        const token = localStorage.getItem("token");

        const response = await fetch(
            "http://localhost:5000/api/test/protected",
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
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