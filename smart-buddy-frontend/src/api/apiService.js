const API_URL = "http://localhost:8080/api";

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
    try {
        const response = await fetch(`${API_URL}/tasks`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify(task)
        });

        if (!response.ok) {
            throw new Error("Backend unavailable");
        }

        return response.json();
    } catch (error) {
        // Temporary frontend storage
        const savedTasks =
            JSON.parse(localStorage.getItem("smartBuddyTasks")) || [];

        const newTask = {
            id: Date.now(),
            ...task
        };

        savedTasks.push(newTask);

        localStorage.setItem(
            "smartBuddyTasks",
            JSON.stringify(savedTasks)
        );

        return newTask;
    }
}