const API_URL = "/api";

// Get saved JWT token
function getToken() {
    return localStorage.getItem("token");
}

// Common headers
function getAuthHeaders() {
    const token = getToken();

    return {
        "Content-Type": "application/json",
        ...(token && {
            Authorization: `Bearer ${token}`
        })
    };
}

// Get dashboard statistics
export async function fetchDashboardStats() {
    try {
        const response = await fetch(`${API_URL}/dashboard/stats`, {
            method: "GET",
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error("Backend unavailable");
        }

        return response.json();
    } catch (error) {
        return {
            totalAssignments: 0,
            completedAssignments: 0,
            pendingAssignments: 0,
            attendance: 0
        };
    }
}

// Get recent activity
export async function fetchRecentActivity() {
    try {
        const response = await fetch(`${API_URL}/activity/recent`, {
            method: "GET",
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error("Backend unavailable");
        }

        return response.json();
    } catch (error) {
        return [];
    }
}

// Add a new task


export async function addTask(task) {
    const response = await fetch(`${API_URL}/assignments`, {
        method: "POST",
        headers: {
            ...getAuthHeaders(),
            "Content-Type": "application/json"
        },
        body: JSON.stringify(task)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
            `Failed to add assignment: ${response.status} ${errorText}`
        );
    }

    return response.json();
}


 // Update an existing assignment
export async function updateTask(id, task) {
    const response = await fetch(`${API_URL}/assignments/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(task)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
            `Failed to update assignment: ${response.status} ${errorText}`
        );
    }

    return response.json();
}