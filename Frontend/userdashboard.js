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
    }
    catch(error){
        window.location.href="login.html";
    }
});


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