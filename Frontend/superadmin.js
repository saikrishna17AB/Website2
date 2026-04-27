const usersTable = document.getElementById("users-table");
const adminsTable = document.getElementById("admins-table");

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
                </td>`;
            usersTable.appendChild(tr);
        });
    } 
    catch (error) {
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
            body: JSON.stringify({ userid: userId })
        });

        const data = await response.json();
        if (data.success) {
            loadOperatives();
        }
    } 
    catch(error){
        console.error("Action failed", error);
    }
};


async function loadAdmins() {
    adminsTable.innerHTML = '<tr><td colspan="4">Loading admins...</td></tr>';

    try {
        const res = await fetch("http://localhost:4000/api/user/getadmins", {
            credentials: "include"
        });

        const data = await res.json();

        if (!data.success || data.admins.length === 0) {
            adminsTable.innerHTML = '<tr><td colspan="4">No admins found</td></tr>';
            return;
        }

        adminsTable.innerHTML = "";

        data.admins.forEach(admin => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${admin.name}</td>
                <td>${admin.email}</td>
                <td><span class="badge badge-warning">${admin.role}</span></td>
                <td>
                    <button class="action-btn btn-reject" onclick="removeAdmin('${admin._id}')">
                        Remove Admin
                    </button>
                </td>`;
            adminsTable.appendChild(tr);
        });

    } 
    catch (err) {
        adminsTable.innerHTML = '<tr><td colspan="4">Error loading admins</td></tr>';
    }
}


window.removeAdmin = async (userId) => {
    if(!confirm("Are you sure you want to remove this admin ")) 
        return;

    try {
        const res = await fetch("http://localhost:4000/api/user/removeadmin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ userId })
        });

        const data = await res.json();

        if (data.success) {
            loadAdmins();
        }

    } 
    catch (err) {
        console.error("Failed to remove admin");
    }
};

function showSection(section) {
    document.getElementById("mainMenu").style.display = section === "menu" ? "block" : "none";
    document.getElementById("requestsSection").style.display = section === "requests" ? "block" : "none";
    document.getElementById("adminsSection").style.display = section === "admins" ? "block" : "none";
}


document.getElementById("viewAdminRequestsBtn").onclick = () => {
    showSection("requests");
    loadOperatives(); 
};

document.getElementById("backFromRequests").onclick = () => {
    showSection("menu");
};
document.getElementById("logout").onclick = () => {
    window.location.href = "login.html";
};

document.getElementById("viewAdminsBtn").onclick = () => {
    showSection("admins");
    loadAdmins();
};

document.getElementById("backFromAdmins").onclick = () => {
    showSection("menu");
};

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch("http://localhost:4000/api/user/check-auth", {
            method: "GET", credentials: "include"
        });
        const data = await response.json();
        if (!data.success) {
            window.location.href = "login.html";
        }
        loadOperatives();
    } 
    catch (error) {
        window.location.href = "login.html";
    }
});
