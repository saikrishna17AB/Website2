const reportsSection = document.getElementById("reportsSection");
const usersSection = document.getElementById("usersSection");

const message = document.getElementById("message");

document.getElementById("viewReports").onclick = () => {
    reportsSection.style.display = "block";
    usersSection.style.display = "none";
    loadReports();
};

document.getElementById("viewUsers").onclick = () => {
    reportsSection.style.display = "none";
    usersSection.style.display = "block";
    document.getElementById("userDetails").style.display = "none";
    loadUsers();
};

let selectedReportId = null;

async function loadReports() {
    const list = document.getElementById("reportList");
    list.innerHTML = "";

    const res = await fetch("http://localhost:4000/api/report/all", {
        credentials: "include",

    });

    const data = await res.json();

    if (!data.success) return;

    data.reports.forEach(report => {
    const li = document.createElement("li");

    li.innerText = `${report.reportType} | ${report.status}`;
    li.style.cursor = "pointer";
    li.style.marginBottom = "10px";

    li.onclick = () => showReport(report);

    list.appendChild(li);
    });
}


function showReport(report) {
    selectedReportId = report._id;
    document.getElementById("reportDetails").style.display = "block";

    document.getElementById("rType").innerText = report.reportType;
    document.getElementById("rContent").innerText = report.content;
    document.getElementById("rStatus").innerText = report.status;
    document.getElementById("rDesc").innerText = report.description;

    document.getElementById("rUser").innerText =
        report.reportedBy?.name || "Unknown";

    document.getElementById("rDate").innerText =
        new Date(report.createdAt).toLocaleString();

    document.getElementById("statusSelect").value = "under-review";
    document.getElementById("adminRemarks").value ="";
}
document.getElementById("viewReports").onclick = () => {
    reportsSection.style.display = "block";
    usersSection.style.display = "none";

    document.getElementById("reportDetails").style.display = "none";

    loadReports();
};

document.getElementById("backFromReports").onclick = () => {
    reportsSection.style.display = "none";

    // Optional: clear selected report
    document.getElementById("reportDetails").style.display = "none";
    selectedReportId = null;
};


document.getElementById("updateReportBtn").onclick = async () => {
    if (!selectedReportId) {
        message.innerText = "Select a report first";
        message.style.color = "red";
        return;
    }

    const status = document.getElementById("statusSelect").value;
    const adminRemarks = document.getElementById("adminRemarks").value;

    try {
        const res = await fetch("http://localhost:4000/api/report/review", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
                reportId: selectedReportId,
                status,
                adminRemarks
            })
        });

        const data = await res.json();

        if (data.success) {
            message.innerText = data.message;
            message.style.color = "green";

            setTimeout(() => {
                message.innerText = "";
                loadReports();
            }, 2000); // 2 sec delay
        } else {
            message.innerText = data.message;
            message.style.color = "red";
        }

    } catch (error) {
        message.innerText = "Server error";
        message.style.color = "red";
    }
};

let selectedUser = null;

function showUser(user) {
    selectedUser = user;

    document.getElementById("userDetails").style.display = "block";

    document.getElementById("uName").innerText = user.name;
    document.getElementById("uEmail").innerText = user.email;
    document.getElementById("uRole").innerText = user.role;
}
async function loadUsers() {
    const list = document.getElementById("userList");
    list.innerHTML = "";

    const res = await fetch("http://localhost:4000/api/user/getallusers", {
        credentials: "include"
    });

    const data = await res.json();

    if (!data.success) return;

    data.users.forEach(user => {
        const li = document.createElement("li");

        li.innerText = user.name;
        li.style.cursor = "pointer";

        li.onclick = () => showUser(user);

        list.appendChild(li);
    });
}

document.getElementById("backFromUsers").onclick = () => {
    usersSection.style.display = "none";

    document.getElementById("userDetails").style.display = "none";

    selectedUser = null;
};


const logoutBtn = document.getElementById("logout");

logoutBtn.onclick = async () => {
    try {
        const res = await fetch("http://localhost:4000/api/auth/logout", {
            method: "POST",
            credentials: "include"
        });

        const data = await res.json();

        if (data.success) {


            setTimeout(() => {
                window.location.href = "login.html"; // redirect to login page
            }, 1500);
        } else {
            ;
        }

    } catch (error) {
        message.innerText = "Logout failed";
        message.style.color = "red";
    }
};