
let socket;
let reportsData = [];

async function initializeDashboard() {
    setupEventListeners();
    const authSuccess = await checkAuth();
    if (!authSuccess) {
        console.warn("Session invalid, redirecting to login...");
        return;
    }
    initializeChat();
}

async function checkAuth() {
    try {
        const response = await fetch("http://localhost:4000/api/user/check-auth", {
            method: "GET", credentials: "include"
        });
        if (!response.ok) 
            throw new Error("Auth endpoint unreachable");

        const data = await response.json();
        if (!data.success) 
            throw new Error("Authentication rejected");

        window.currentUser = data.user;

        document.getElementById("profileName").innerText = data.user.name;
        document.getElementById("profileEmail").innerText = data.user.email;
        return true;
    } 
    catch(error){
        console.warn("Auth Error:", error.message);
        window.location.href = "login.html";
        return false;
    }
}
function setupEventListeners() {
    const bindSafe = (id, name, action) => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener("click",(e)=>{
                console.log(`Action: ${name}`);
                action(e);
            });
            return el;
        } 
        else{
            return null;
        }
    };

    bindSafe("logout", "Logout", handleLogout);
    bindSafe("phishingsite", "URL Check", () => window.location.href = "suspiciousurl.html");
    bindSafe("breachbutton", "Breach Check", () => window.location.href = "passwordbreach.html");
    bindSafe("report", "Report Incident", (e) => {
        e.preventDefault();
        window.location.href = "report.html";
    });
    bindSafe("viewreports", "View Reports", (e) => {
        e.preventDefault();
        loadReports();
    });
    bindSafe("Goback", "Hide Reports", (e) => {
        e.preventDefault();
        toggleReportsSection();
    });
    bindSafe("request", "Request Admin", (e) => {
        e.preventDefault();
        handleAdminRequest();
    });

    const chatFab = document.getElementById("toggleChatFab");
    const closeChat = document.getElementById("closeChat");
    const chatPanel = document.getElementById("chatPanel");

    if (chatFab && chatPanel) {
        chatFab.onclick = (e) => {
            e.preventDefault();
            chatPanel.classList.toggle("active");
            const dot = document.querySelector(".notification-dot");
            if(dot) 
                dot.style.display = "none";
            
            if(chatPanel.classList.contains("active")) {
                setTimeout(() => {
                    const chatBox = document.getElementById("chatMessages");
                    if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;
                }, 50);
            }
        };
    }
    if(closeChat && chatPanel){
        closeChat.onclick = (e) => {
            e.preventDefault();
            chatPanel.classList.remove("active");
        };
    }

    const profileBtn = document.getElementById("profileBtn");
    const dropdown = document.getElementById("profileDropdown");

    if(profileBtn && dropdown){
        profileBtn.onclick = () => {
            dropdown.classList.toggle("active");
        };

        document.addEventListener("click", (e) => {
            if (!profileBtn.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.remove("active");
            }
        });
    }
}


async function handleLogout() {
    try{
        await fetch("http://localhost:4000/api/auth/logout", { method: "GET", credentials: "include" });
    } 
    finally {
        window.location.href = "login.html";
    }
}

async function handleAdminRequest() {
    const adminMsg = document.getElementById("adminmsg");
    if (adminMsg) 
        adminMsg.innerText = "Requesting clearance...";

    try{
        const response = await fetch("http://localhost:4000/api/auth/requestadmin", {
            method: "POST",
            credentials: "include"
        });
        const data = await response.json();
        if (adminMsg) {
            adminMsg.innerText = data.message;
            adminMsg.style.color = data.success ? "var(--success-green)" : "var(--danger-red)";
        }
    } 
    catch (error) {
        if (adminMsg) adminMsg.innerText = "Communication failure with security council.";
    }
}

async function loadReports() {
    const reportSection = document.getElementById("reportsection");
    const hideBtn = document.getElementById("Goback");
    const list = document.getElementById("reportlist");

    if (reportSection) 
        reportSection.style.display = "block";
    if (hideBtn) 
        hideBtn.style.display = "inline-block";
    if (list) 
        list.innerHTML = `<div class="loading-spinner">Decrypting data...</div>`;

    if (reportSection) {
        reportSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    try {
        const response = await fetch("http://localhost:4000/api/report/my", { credentials: "include" });
        const data = await response.json();

        if (!data.success || !data.reports || data.reports.length === 0) {
            if (list) list.innerHTML = "<li style='padding: 1rem; color: var(--text-muted);'>No security incidents reported yet.</li>";
            return;
        }

        reportsData = data.reports;
        if (list) {
            list.innerHTML = "";
            reportsData.forEach((entry, index) => {
                const item = document.createElement("li");
                const date = new Date(entry.createdAt).toLocaleDateString();
                const shortId = entry._id.slice(-6);

                item.className = "report-item";
                item.style.cursor = "pointer";
                item.style.padding = "1rem";
                item.style.borderBottom = "1px solid #f1f5f9";
                item.style.transition = "background 0.2s";

                item.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <strong style="color: var(--primary-purple);">#${shortId}</strong> 
                            <span style="margin: 0 10px; color: #cbd5e1;">|</span> 
                            <span style="font-size: 0.85rem;">${date}</span>
                        </div>
                        <span class="badge ${entry.status === 'phishing' ? 'badge-danger' : 'badge-safe'}">${entry.status}</span>
                    </div>
                    <div style="font-size: 0.85rem; margin-top: 5px; color: var(--text-muted);">${entry.reportType}: ${entry.content}</div>`;

                item.onmouseover = () => item.style.background = "#f8fafc";
                item.onmouseout = () => item.style.background = "transparent";
                item.onclick = () => showReportDetails(index);
                list.appendChild(item);
            });

            if (reportsData.length > 0) 
                showReportDetails(0);
        }
    } 
    catch (err) {
        console.error("Report Fetch Error:", err);
        if (list) list.innerHTML = "<li style='color: var(--danger-red);'>Error connecting to reports database.</li>";
    }
}

function showReportDetails(index) {
    const report = reportsData[index];
    if (!report) return;

    const fields = {
        "dType": report.reportType,
        "dContent": report.content,
        "dStatus": report.status,
        "dDesc": report.description,
        "dRemarks": report.adminRemarks || "No feedback available yet from administration."
    };

    for (const [id, value] of Object.entries(fields)) {
        const el = document.getElementById(id);
        if (el) {
            el.innerText = value;
            if (id === "dStatus") {
                el.style.color = value === "phishing" ? "var(--danger-red)" : "var(--success-green)";
            }
        }
    }
}

function toggleReportsSection() {
    const reportSection = document.getElementById("reportsection");
    const hideBtn = document.getElementById("Goback");
    if (reportSection) 
        reportSection.style.display = "none";
    if (hideBtn) 
        hideBtn.style.display = "none";
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function initializeChat() {
    if (typeof io === 'undefined') {
        setTimeout(initializeChat, 1000);
        return;
    }

    if (socket) return;

    socket = io("http://localhost:4000", { withCredentials: true });
    loadMessages();

    const sendBtn = document.getElementById("sendBtn");
    const input = document.getElementById("chatInput");

    if (sendBtn && input) {
        sendBtn.onclick = () => {
            const text = input.value.trim();
            if (!text || !socket) return;
            socket.emit("sendMessage", {
                text,
                name: window.currentUser?.name || "Anonymous",
                role: window.currentUser?.role || "user"
            });
            input.value = "";
        };
        input.onkeydown = (e) => { if (e.key === "Enter") 
            sendBtn.click(); 
        };
    }

    socket.on("receiveMessage", (msg) => {
        displayMessage(msg);
        const chatPanel = document.getElementById("chatPanel");
        if (chatPanel && !chatPanel.classList.contains("active")) {
            const dot = document.querySelector(".notification-dot");
            if (dot) dot.style.display = "block";
        }
        const chatBox = document.getElementById("chatMessages");
        if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;
    });
}

async function loadMessages() {
    try {
        const res = await fetch("http://localhost:4000/api/chat/messages", { credentials: "include" });
        const data = await res.json();
        if (data.success) {
            const chatBox = document.getElementById("chatMessages");
            if (chatBox) {
                chatBox.innerHTML = "";
                data.messages.forEach(msg => displayMessage(msg));
                chatBox.scrollTop = chatBox.scrollHeight;
            }
        }
    } 
    catch (err) { }
}

function displayMessage(msg) {
    const chatBox = document.getElementById("chatMessages");
    if (!chatBox) 
        return;

    const time = new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const div = document.createElement("div");
    div.classList.add("message");
    div.classList.add(msg.name === window.currentUser?.name ? "myMessage" : "otherMessage");
    if (msg.role === "admin") 
        div.classList.add("admin");

    if (msg.text.toLowerCase().includes("phishing") || msg.text.toLowerCase().includes("fraud")) {
        div.classList.add("alert");
    }

    const roleTag = msg.role === "admin" ? `<span class="role-tag">admin</span>` : "";
    div.innerHTML = `<strong>${msg.name} ${roleTag}</strong>
                    <div class="msg-text">${msg.text}</div>
                    <span class="msg-time">${time}</span>`;

    chatBox.appendChild(div);
}


document.getElementById("passwordStrengthBtn").addEventListener("click", () => {
    window.location.href = "passwordstrength.html";
});

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeDashboard);
} else {
    initializeDashboard();
}