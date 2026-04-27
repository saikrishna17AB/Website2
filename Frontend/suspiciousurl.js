const inputurl = document.querySelector("#url");
const btn = document.querySelector("#check");
const result = document.querySelector("#status");
const score = document.querySelector("#score");
const urlResultPanel = document.querySelector("#url-result");

const inputemail = document.querySelector("#eid");
const ebtn = document.querySelector("#checkemail");
const eresult = document.querySelector("#statusemail");
const escore = document.querySelector("#scoreemail");
const emailResultPanel = document.querySelector("#email-result");

const back = document.querySelector("#goback");

function setBadge(element, status) {
    element.className = "badge"; 
    if (status === "Safe") {
        element.classList.add("badge-safe");
    } 
    else if (status === "Suspicious") {
        element.classList.add("badge-warning");
    } 
    else if (status === "Phishing") {
        element.classList.add("badge-danger");
    }
}

btn.addEventListener("click", async () => {
    const url = inputurl.value.trim();
    if (!url) return;

    btn.innerText = "Analyzing...";
    btn.disabled = true;
    urlResultPanel.style.display = "none";

    try {
        const response = await fetch("http://localhost:4000/api/url/checkurl", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url })
        });

        const data = await response.json();

        if (data.success) {
            result.innerText = data.status;
            score.innerText = data.score || "N/A";
            setBadge(result, data.status);
            urlResultPanel.style.display = "block";
            urlResultPanel.classList.add("fade-in");
        }
    } 
    catch (error) {
        console.error("URL check failed", error);
    } 
    finally {
        btn.innerText = "Inspect Domain";
        btn.disabled = false;
    }
});

ebtn.addEventListener("click", async () => {
    const email = inputemail.value.trim();
    if (!email) return;
    ebtn.innerText = "Verifying...";
    ebtn.disabled = true;
    emailResultPanel.style.display = "none";

    try {
        const response = await fetch("http://localhost:4000/api/url/checkemail", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        });

        const data = await response.json();

        if (data.success) {
            eresult.innerText = data.status;
            escore.innerText = data.score || "N/A";
            setBadge(eresult, data.status);
            emailResultPanel.style.display = "block";
            emailResultPanel.classList.add("fade-in");
        }
    } 
    catch (error) {
        console.error("Email check failed", error);
    } 
    finally {
        ebtn.innerText = "Verify Sender";
        ebtn.disabled = false;
    }
});

back.addEventListener("click", () => {
    window.location.href = "userdashboard.html";
});

// Authentication Check
document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch("http://localhost:4000/api/user/check-auth", {
            method: "GET", credentials: "include"
        });
        const data = await response.json();
        if (!data.success) {
            window.location.href = "login.html";
        }
    } catch (error) {
        window.location.href = "login.html";
    }
});

document.querySelector("#logout").addEventListener("click", async () => {
    try {
        window.location.href = "login.html";
    } catch (error) {
        console.log(error);
    }
});


