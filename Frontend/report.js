function validateInput(type, content) {
    if (type === "email") {
        const emailregex = /^\S+@\S+\.\S+$/;
        return emailregex.test(content);
    }
    if (type === "phone") {
        const phoneregex = /^[6-9][0-9]{9}$/;
        return phoneregex.test(content);
    }
    if (type === "url") {
        try {
            const parsed = new URL(content);
            return parsed.protocol === "http:" || parsed.protocol === "https:";
        } catch {
            return false;
        }
    }
    return false;
}

function initializeReportForm() {

    const reportForm = document.getElementById("reportform");
    const typeSelect = document.getElementById("type");
    const contentInput = document.getElementById("content");
    const backBtn = document.getElementById("Goback");

    if (!reportForm) {
        console.warn("Report form elements missing in current DOM view.");
        return;
    }

    // Setup Type Switcher
    if (typeSelect && contentInput) {
        typeSelect.onchange = () => {
            const type = typeSelect.value;
            console.log(` Context Shift: ${type}`);
            if (type === "email") {
                contentInput.placeholder = "Enter sender email address";
            } else if (type === "phone") {
                contentInput.placeholder = "Enter suspicious phone number";
            } else {
                contentInput.placeholder = "Enter target malicious URL";
            }
        };
    }

    // Setup Form Submission
    reportForm.onsubmit = async (e) => {
        e.preventDefault();
        console.log("Initiating intelligence transmission");

        const submitBtn = reportForm.querySelector('button[type="submit"]');
        const type = document.getElementById("type").value;
        const content = document.getElementById("content").value.trim();
        const description = document.getElementById("description").value.trim();
        const message = document.getElementById("msg");

        if (!validateInput(type, content)) {
            console.warn("Validation abort: Invalid data format.");
            if (message) {
                message.innerText = `Protocol Error: Invalid ${type} format.`;
                message.className = "feedback error";
            }
            return;
        }

        if (submitBtn) {
            submitBtn.innerText = "Transmitting...";
            submitBtn.disabled = true;
        }

        try {
            const response = await fetch("http://localhost:4000/api/report/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ reportType: type, content, description })
            });

            const data = await response.json();

            if (data.success) {
                if (message) {
                    message.innerText = "Reported successfully.";
                    message.className = "feedback success";
                }
                reportForm.reset();
                setTimeout(() => {
                    window.location.href = "userdashboard.html";
                }, 1500);
            } 
            else{
                console.warn(`Transmission rejected: ${data.message}`);
                if (message) {
                    message.innerText = `Report rejected: ${data.message}`;
                    message.className = "feedback error";
                }
            }
        } 
        catch (error) {
            console.error("Connectivity Failure:", error);
            if (message) {
                message.innerText = "Terminal Error: Security Council unreachable.";
                message.className = "feedback error";
            }
        } 
        finally {
            if (submitBtn) {
                submitBtn.innerText = "Submit Report";
                submitBtn.disabled = false;
            }
        }
    };

    // Navigation
    if (backBtn) {
        backBtn.onclick = (e) => {
            e.preventDefault();
            window.location.href = "userdashboard.html";
        };
    }

    
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeReportForm);
} 
else {
    initializeReportForm();
}