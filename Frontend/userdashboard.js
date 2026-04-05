

const toggleBtn = document.getElementById("toggleChat");
const chatSection = document.getElementById("chatSection");

toggleBtn.onclick = () => {
    chatSection.classList.toggle("hidden");

    toggleBtn.textContent =
        chatSection.classList.contains("hidden") ? "Show Chat" : "Hide Chat";
};

const logout=document.querySelector("#logout");
const checkbtn=document.querySelector("#phishingsite");
const viewreport=document.querySelector("#viewreports");
const passwordbreach=document.querySelector("#breachbutton");



logout.addEventListener("click",async ()=>{
    try{
        const response=await fetch("http://localhost:4000/api/auth/logout",{
            method:"GET",
            credentials:"include"
        });
        const data = await response.json();

        if (data.success) {
            alert(data.message); // Optional confirmation
            window.location.href = "login.html"; // Redirect to login page
        } else {
            alert("Logout failed: " + data.message);
        }
    }
    catch(error){
        window.location.href="login.html";
    }
})

let reportsData=[];
async function loadReports(){
    document.querySelector("#reportsection").style.display="block";
    document.querySelector("#Goback").style.display="inline-block";

    const list=document.querySelector("#reportlist");
    list.innerHTML="";

    const response=await fetch("http://localhost:4000/api/report/my",{
        credentials:"include"
    });

    const data=await response.json();

    if (!data.success) {
        alert("Failed to load reports");
        return;
    }

    if (data.reports.length === 0) {
        list.innerHTML = "<p>No reports found</p>";
        return;
    }

    reportsData=data.reports;

    data.reports.forEach((report, index) => {
        const item = document.createElement("li");
        const date = new Date(report.createdAt).toLocaleDateString();
        const shortId = report._id.slice(-6);

        item.innerHTML = `<strong>#${shortId}</strong> | ${date} | ${report.reportType} |
            <span style="color:${report.status === "phishing" ? "red" : report.status === "safe" ? "green" : "black"}">
                ${report.status}
            </span>
        `;
        item.style.cursor = "pointer";

        if (report.status === "phishing") item.style.color = "red";
        if (report.status === "safe") item.style.color = "green";

        item.onclick = () => showDetails(index);

        list.appendChild(item);    
    });
}

function showDetails(index) {
    const report = reportsData[index];

    document.getElementById("dType").innerText = report.reportType;
    document.getElementById("dContent").innerText = report.content;
    document.getElementById("dStatus").innerText = report.status;
    document.getElementById("dDesc").innerText = report.description;
    document.getElementById("dRemarks").innerText =
        report.adminRemarks || "Not reviewed yet";
}

report.addEventListener("click",async()=>{
    window.location.href="report.html";
})
checkbtn.addEventListener("click",async ()=>{
    window.location.href="suspiciousurl.html";
})

passwordbreach.addEventListener("click",async ()=>{
    window.location.href="passwordbreach.html";
})

viewreport.addEventListener("click",loadReports);

document.querySelector("#Goback").addEventListener("click",()=>{
    document.querySelector("#reportsection").style.display = "none";
    document.querySelector("#Goback").style.display = "none";
});

const requestadmin=document.querySelector("#request");
const adminmsg=document.querySelector("#adminmsg");

requestadmin.addEventListener("click",async ()=>{
    try{
        const response = await fetch("http://localhost:4000/api/auth/requestadmin", {
            method: "POST",
            credentials: "include"
        });

        const data = await response.json();

        if (data.success) {
            adminmsg.innerText = data.message;
            adminmsg.style.color = "green";
        } 
        else {
            adminmsg.innerText = data.message;
            adminmsg.style.color = "red";
        }
    }
    catch(error){
        adminmsg.innerText="Server error";
        adminmsg.style.color="red";
    }
})



const socket = io("http://localhost:4000", {
    withCredentials: true
});
async function loadMessages() {
    try {
        const res = await fetch("http://localhost:4000/api/chat/messages", {
            credentials: "include"
        });

        const data = await res.json();

        if (!data.success) return;

        const chatBox = document.getElementById("chatMessages");

        chatBox.innerHTML = ""; // clear first

        data.messages.forEach(msg => displayMessage(msg));
        chatBox.scrollTop=chatBox.scrollHeight;
    } catch (err) {
        console.log("Error loading messages");
    }
}

function displayMessage(msg) {
    const chatBox = document.getElementById("chatMessages");

    const time = new Date(msg.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
    });

    const div = document.createElement("div");
    div.classList.add("message");

    if(msg.name===window.currentUser?.name){
        div.classList.add("myMessage");
    }
    else{
        div.classList.add("otherMessage");
    }

    if (msg.role === "admin") {
        div.classList.add("admin");
    } else {
        div.classList.add("user");
    }

    // Highlight phishing alerts
    if (msg.text.toLowerCase().includes("phishing") || msg.text.toLowerCase().includes("fraud")) {
        div.classList.add("alert");
    }

    if(msg.role==="admin"){
        div.innerHTML = `<strong>${msg.name}</strong>
                     <span class="role-tag">(${msg.role})</span>:
                        ${msg.text}
                        <span class="msg-time">${time}</span>`
                        
    }
    else{
        div.innerHTML = `<strong>${msg.name}</strong>:
                        ${msg.text}
                        <span class="msg-time">${time}</span>`;
    }

    chatBox.appendChild(div);
}

const sendBtn = document.getElementById("sendBtn");
const input = document.getElementById("chatInput");

sendBtn.addEventListener("click", () => {
    const text = input.value.trim();
    if (!text) return;

    socket.emit("sendMessage", {
        text,
        name: window.currentUser?.name || "Anonymous",
        role: window.currentUser?.role || "user"
    });

    input.value = "";
});
input.addEventListener("keydown",(e)=>{
    if(e.key==="Enter"){
        e.preventDefault();
        sendBtn.click();
    }
});

socket.on("receiveMessage", (msg) => {
    displayMessage(msg);

    const chatBox=document.getElementById("chatMessages");
    chatBox.scrollTop=chatBox.scrollHeight;
});




document.addEventListener("DOMContentLoaded",async ()=>{
    try{
        const response=await fetch("http://localhost:4000/api/user/check-auth",{
            method:"GET",credentials:"include"
        });
        if(!response.ok){
            window.location.href="login.html";
            console.log('Error');
            return;
        }
        const data=await response.json();
        if(!data.success){
            window.location.href="login.html";
            console.log("Error");
        }

        window.currentUser=data.user;
        loadMessages();
    }
    catch(error){
        window.location.href="login.html";
    }
});