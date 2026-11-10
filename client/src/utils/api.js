const API_URL = "http://localhost:5000";

export async function apiFetch(path, options = {}, isRetry = false){
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        credentials: "include",
        headers: {
            ...options.headers,
            Authorization: `Bearer ${token}`,
        },
    });

    if(response.status === 401 && !isRetry){
        const refreshResponse = await fetch(
            `${API_URL}/api/auth/refresh`,
            {
                method: "POST",
                credentials: "include",
            }
        );

        if(refreshResponse.ok){
            const data = await refreshResponse.json();

            localStorage.setItem("token", data.accessToken);

            console.log("Access token refreshed successfully!");

            return apiFetch(path, options,true);
        }else{
            console.log("Refresh failed.Login required.");
            localStorage.removeItem("token");
            window.location.href = "/login";
            return response;
        }
    }

    return response;
}