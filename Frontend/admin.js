// Admin Intelligence Command
let selectedReportId = null;
let selectedReportStatus=null;
let selectedUserId=null;
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



// Users Logic
async function loadUsers() {
    const list = document.getElementById("userList");
    list.innerHTML = "<li>Retrieving operatives...</li>";

    try {
        const res = await fetch("http://localhost:4000/api/user/getallusers", { credentials: "include" });
        const data = await res.json();
        if (data.success) {
            list.innerHTML = "";
            data.users.forEach(user => {
                const li = document.createElement("li");
                li.className = "user-item";
                li.innerHTML = `<span>${user.name}</span> <small>${user.email}</small>`;
                
                li.onclick = () => {
                    selectedUserId=user._id;
                    document.getElementById("uDetails").style.display = "block";
                    document.getElementById("uName").innerText = user.name;
                    document.getElementById("uEmail").innerText = user.email;
                    document.getElementById("uRole").innerText = user.role;
                };
                list.appendChild(li);
            });
        }
    } catch (err) {
        list.innerHTML = "<li>Access Denied</li>";
    }
}



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
        }
        else{
            messageBox.style.color = "orange";
        }
    } catch {
        messageBox.innerText = "Action failed";
        messageBox.style.color = "red";
    }
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
        }
        else{
            messageBox.style.color = "orange";
        }
    } catch {
        messageBox.innerText = "Action failed";
        messageBox.style.color = "red";
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
