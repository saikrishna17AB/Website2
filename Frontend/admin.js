// Admin Intelligence Command
let selectedReportId = null;
let selectedReportStatus=null;
let selectedUserId=null;
let allUsers = []; // store fetched users
// let currentSort = "az";
let currentSort = "recent";
// UI Toggles
function showSection(sectionId) {
    document.getElementById("reportsSection").style.display = sectionId === "reports" ? "block" : "none";
    document.getElementById("usersSection").style.display = sectionId === "users" ? "block" : "none";
    document.getElementById("mainMenu").style.display = sectionId === "menu" ? "block" : "none";
}

// Reports Logic
async function loadReports() {
    const table = document.getElementById("reportsTableBody");
    table.innerHTML = "<tr><td colspan='4'>Updating Intelligence...</td></tr>";

    try {
        const res = await fetch("http://localhost:4000/api/report/all", { credentials: "include" });
        const data = await res.json();

        if (data.success) {
            table.innerHTML = "";
            data.reports.forEach(report => {
                const tr = document.createElement("tr");
                tr.innerHTML = `

                    <td>${report.reportType}</td>
                    <td>${report.reportedBy?.name}</td>
                    <td class="badge-status">${report.status}</td>
                    <td><button class="action-btn" onclick="selectReport('${report._id}', '${report.description}', '${report.reportedBy?.name}', '${report.createdAt}', '${report.adminRemarks || ''}', '${report.status}')">View</button></td>
                `;
                table.appendChild(tr);
            });
        }
    } 
    catch (err) {
        table.innerHTML = "<tr><td colspan='4'>Feed Unavailable</td></tr>";
    }
}


const messagebox=document.getElementById("message");

window.selectReport = (id, desc, user, date, remarks, status) => {

    
    selectedReportStatus=status.toLowerCase();
    selectedReportId = id;
    document.getElementById("reportDetails").style.display = "block";
    document.getElementById("rID").innerText = id;
    document.getElementById("rDesc").innerText = desc;
    document.getElementById("rUser").innerText = user;
    document.getElementById("rDate").innerText = new Date(date).toLocaleString();
    document.getElementById("adminRemarks").value = remarks;
    document.getElementById("statusSelect").value = status.toLowerCase().replace(" ", "-");


    
    if (selectedReportStatus === "safe" || selectedReportStatus === "phishing") {
        
        document.getElementById("statusSelect").disabled=true;
        document.getElementById("adminRemarks").disabled=true;
    } 
    else {
        document.getElementById("updateReportBtn").disabled = false; 
        document.getElementById("statusSelect").disabled=false;
        document.getElementById("adminRemarks").disabled=false;
        
        messagebox.innerText = "";
    }
};


document.getElementById("updateReportBtn").onclick = async () => {


    if(selectedReportStatus==="safe" || selectedReportStatus==="phishing"){

    
        document.getElementById("updateReportBtn").disabled = true;
        messagebox.innerText = "This report is finalized and cannot be updated";
        messagebox.style.color = "red";
        return;
    }

    

    else{
        messagebox.innerText="";
    }
    const remarks = document.getElementById("adminRemarks").value;
    const status = document.getElementById("statusSelect").value;

    if (!selectedReportId) return;

    try {
        const res = await fetch("http://localhost:4000/api/report/review", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ reportId: selectedReportId, status, adminRemarks: remarks })
        });
        const data = await res.json();
        if (data.success) {

            const messagebox = document.getElementById("message");

            messagebox.innerText = "Report updated successfully";
            messagebox.style.color = "green";

            setTimeout(() => {
                messagebox.innerText = "";
            }, 2000);
            loadReports();
            document.getElementById("reportDetails").style.display = "none";
        }
    } catch (err) {
        const messageBox = document.getElementById("message");

        messagebox.innerText = "Action failed";
        messagebox.style.color = "red";
    }
};

function toggleUserDetails(show) {
    const details = document.getElementById("uDetails");
    const layout = document.querySelector(".users-layout");

    if (show) {
        details.style.display = "block";
        layout.style.gridTemplateColumns = "300px 1fr";
    } else {
        details.style.display = "none";
        layout.style.gridTemplateColumns = "300px";
    }
}


// Users Logic
async function loadUsers() {
    toggleUserDetails(false);
    const list = document.getElementById("userList");
    list.innerHTML = "<li>Retrieving operatives...</li>";

    try {
        const res = await fetch("http://localhost:4000/api/user/getallusers", { credentials: "include" });
        const data = await res.json();
        if (data.success) {
            list.innerHTML = "";
            allUsers = data.users;   // store users
            renderUsers(allUsers);   // render initially
            
        }
    } catch (err) {
        list.innerHTML = "<li>Access Denied</li>";
    }
}



function renderUsers(users) {

    const searchValue = document.getElementById("userSearch").value.toLowerCase();
    const list = document.getElementById("userList");
    list.innerHTML = "";

    if (users.length === 0) {
        list.innerHTML = "<li>No users found</li>";
        return;
    }

    let processedUsers = users
    .filter(user => user.role === "user") // remove admins
    .filter(user =>
        user.email.toLowerCase().includes(searchValue) ||
        user.name.toLowerCase().includes(searchValue)
    );

    // 2. Sort
    if (currentSort === "recent") {
        processedUsers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (currentSort === "oldest") {
        processedUsers.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (currentSort === "az") {
        processedUsers.sort((a, b) => a.name.localeCompare(b.name));
    } else if (currentSort === "za") {
        processedUsers.sort((a, b) => b.name.localeCompare(a.name));
    }

    // 3. Take only top 10
    processedUsers = processedUsers.slice(0, 10);

    
    processedUsers.forEach(user => {
        const li = document.createElement("li");
        li.className = "user-item";

        const isSuspended = user.isSuspended === true;
        console.log(isSuspended);

        const statusBadge = isSuspended
            ? `<span class="badge suspended">Suspended</span>`
            : `<span class="badge active">Active</span>`;

        li.innerHTML = `
            <div class="user-info">
                <span>${user.name}</span>
                <small>${user.email}</small>
            </div>
            ${statusBadge}
        `;

        li.onclick = () => {

            if (selectedUserId === user._id) {
                selectedUserId = null;
                toggleUserDetails(false);
                return;
            }
            selectedUserId = user._id;

            document.getElementById("userActionMessage").innerText = "";
            toggleUserDetails(true);
            document.getElementById("uName").innerText = user.name;
            document.getElementById("uEmail").innerText = user.email;
            document.getElementById("uRole").innerText = user.role;
        };

        list.appendChild(li);
    });
}


// document.getElementById("sortUsers").addEventListener("change", (e) => {
//     currentSort = e.target.value;

//     // re-render based on current filtered list
//     const searchValue = document.getElementById("userSearch").value.toLowerCase();

//     const filteredUsers = allUsers.filter(user =>
//         user.email.toLowerCase().includes(searchValue) ||
//         user.name.toLowerCase().includes(searchValue)
//     );

//     renderUsers(filteredUsers);
// });
// document.getElementById("userSearch").addEventListener("input", (e) => {
//     const searchValue = e.target.value.toLowerCase();

//     const filteredUsers = allUsers.filter(user =>
//         user.email.toLowerCase().includes(searchValue) ||
//         user.name.toLowerCase().includes(searchValue)
//     );

//     renderUsers(filteredUsers);
// });


document.getElementById("sortUsers").addEventListener("change", (e) => {
    currentSort = e.target.value;
    renderUsers(allUsers);
});

document.getElementById("userSearch").addEventListener("input", () => {
    renderUsers(allUsers);
});


const messageBox = document.getElementById("userActionMessage");


document.getElementById("suspendBtn").onclick = async () => {
    if (!selectedUserId) return;

    try {
        const res = await fetch("http://localhost:4000/api/auth/suspenduser", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ userId: selectedUserId })
        });

        const data = await res.json();

        messageBox.innerText = data.message;
        if (data.success) {
            messageBox.style.color = "red";
            await loadUsers();
        }
        else{
            messageBox.style.color = "orange";
            await loadUsers();
        }
    } catch {
        messageBox.innerText = "Action failed";
        messageBox.style.color = "red";
        await loadUsers();
    }
};


document.getElementById("closeUserDetails").onclick = () => {
    selectedUserId = null;

    document.getElementById("uName").innerText = "";
    document.getElementById("uEmail").innerText = "";
    document.getElementById("uRole").innerText = "";

    toggleUserDetails(false);
};

document.getElementById("activateBtn").onclick = async () => {
    if (!selectedUserId) return;

    try {
        const res = await fetch("http://localhost:4000/api/auth/activateuser", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ userId: selectedUserId })
        });

        const data = await res.json();

        messageBox.innerText = data.message;
        if (data.success) {
            
            messageBox.style.color = "green";
            await loadUsers();
        }
        else{
            messageBox.style.color = "orange";
            await loadUsers();
        }
    } catch {
        messageBox.innerText = "Action failed";
        messageBox.style.color = "red";
        await loadUsers();
    }
};

// Navigation
document.getElementById("viewReportsBtn").onclick = () => { showSection("reports"); loadReports(); };
document.getElementById("viewUsersBtn").onclick = () => { showSection("users"); loadUsers(); };
document.getElementById("backFromReports").onclick = () => showSection("menu");
document.getElementById("backFromUsers").onclick = () => showSection("menu");
document.getElementById("logout").onclick = () => window.location.href = "login.html";



document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch("http://localhost:4000/api/user/check-auth", {
            method: "GET", credentials: "include"
        });
        const data = await response.json();
        if (!data.success) {
            window.location.href = "login.html";
        }
        showSection("menu");
    } catch (error) {
        window.location.href = "login.html";
    }
});
