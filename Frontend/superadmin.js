const usersTable = document.getElementById("users-table");

async function loadOperatives() {
    usersTable.innerHTML = '<tr><td colspan="5" style="text-align:center;">Synchronizing Registry...</td></tr>';

    try {
        const response = await fetch("http://localhost:4000/api/user/getadminrequests", {
            credentials: "include"
        });
        const data = await response.json();
        
        if (!data.success) {
            usersTable.innerHTML = '<tr><td colspan="5" style="text-align:center;">No pending requests found.</td></tr>';
            return;
        }

        usersTable.innerHTML = "";
        data.users.forEach(user => {
            const tr = document.createElement("tr");
            
            const roleClass = user.role === "admin" ? "badge-warning" : "info";
            const requestStatus = user.role === "admin" ? "Completed" : "Pending Approval";

            tr.innerHTML = `
                <td>${user.name}</td>
                <td style="color: var(--primary-cyan);">${user.email}</td>
                <td><span class="badge ${roleClass}">${user.role}</span></td>
                <td>${requestStatus}</td>
                <td>
                    <div class="action-group">
                        <button class="action-btn btn-approve" onclick="processRequest('${user._id}', 'approve')">Approve</button>
                        <button class="action-btn btn-reject" onclick="processRequest('${user._id}', 'reject')">Reject</button>
                    </div>
                </td>
            `;
            usersTable.appendChild(tr);
        });
    } catch (error) {
        usersTable.innerHTML = '<tr><td colspan="5" style="text-align:center; color:var(--danger-red);">Registry Access Denied</td></tr>';
    }
}

window.processRequest = async (userId, action) => {
    const endpoint = action === "approve" ? "approveadmin" : "rejectadmin";
    
    try {
        const response = await fetch(`http://localhost:4000/api/auth/${endpoint}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ userId })
        });

        const data = await response.json();
        if (data.success) {
            loadOperatives();
        }
    } 
    catch (error) {
        console.error("Action failed", error);
    }
};

function showSection(section) {
    document.getElementById("mainMenu").style.display = section === "menu" ? "block" : "none";
    document.getElementById("requestsSection").style.display = section === "requests" ? "block" : "none";
}


document.getElementById("viewAdminRequestsBtn").onclick = () => {
    showSection("requests");
    loadOperatives(); // your existing function
};

document.getElementById("backFromRequests").onclick = () => {
    showSection("menu");
};
document.getElementById("logout").onclick = () => {
    window.location.href = "login.html";
};

// Initialize
document.addEventListener("DOMContentLoaded", () => {
    loadOperatives();
});
