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

const reportForm = document.getElementById("reportform");
const submitBtn = reportForm.querySelector('button[type="submit"]');

reportForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const type = document.getElementById("type").value;
    const content = document.getElementById("content").value.trim();
    const description = document.getElementById("description").value.trim();
    const message = document.getElementById("msg");

    if (!validateInput(type, content)) {
        message.innerText = `Protocol entry error: Invalid ${type} format`;
        message.className = "feedback error";
        return;
    }

    submitBtn.innerText = "Transmitting...";
    submitBtn.disabled = true;

    try {
        const response = await fetch("http://localhost:4000/api/report/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
                reportType: type,
                content,
                description
            })
        });

        const data = await response.json();

        if (data.success) {
            message.innerText = "Intelligence transmitted successfully.";
            message.className = "feedback success";
            reportForm.reset();
        } else {
            message.innerText = `Transmission failed: ${data.message}`;
            message.className = "feedback error";
        }
    } catch (error) {
        message.innerText = "Terminal error: Security council unreachable.";
        message.className = "feedback error";
    } finally {
        submitBtn.innerText = "Transmit Report";
        submitBtn.disabled = false;
    }
});

document.getElementById("type").addEventListener("change", () => {
    const type = document.getElementById("type").value;
    const content = document.getElementById("content");

    if (type === "email") {
        content.placeholder = "Enter sender email";
    } else if (type === "phone") {
        content.placeholder = "Enter phone number";
    } else {
        content.placeholder = "Enter malicious URL";
    }
});

document.querySelector("#Goback").addEventListener("click", () => {
    window.location.href = "userdashboard.html";
});