const passwordInput = document.getElementById("passwordInput");
const checkBtn = document.getElementById("checkBtn");
const strengthResult = document.getElementById("strengthResult");
const suggestionsBox = document.getElementById("suggestionsBox");

function calculateStrength(password) {
    return zxcvbn(password);
}

async function getSuggestions() {
    try {
        const res = await fetch("https://www.dinopass.com/password/strong?n=3&format=json", {
            headers: { "User-Agent": "Mozilla/5.0" }
        });

        const data = await res.json();

        suggestionsBox.style.display = "block";
        suggestionsBox.innerHTML = "<b>Suggested Strong Passwords:</b>";

        data.passwords.forEach(pwd => {
            const div = document.createElement("div");
            div.className = "suggestion-item";
            div.innerText = pwd;

            // Click to copy
            div.onclick = () => {
                navigator.clipboard.writeText(pwd);
                alert("Copied to clipboard!");
            };

            suggestionsBox.appendChild(div);
        });

    } 
    catch (err) {
        suggestionsBox.style.display = "block";
        suggestionsBox.innerHTML = "Error fetching suggestions";
    }
}

checkBtn.onclick = async () => {
    const password = passwordInput.value;

    if (!password) {
        strengthResult.innerHTML = "Enter a password";
        return;
    }

    const result = calculateStrength(password);

    const score = result.score; // 0–4
    const feedback = result.feedback;
    const crackTime = result.crack_times_display.offline_slow_hashing_1e4_per_second;

    suggestionsBox.style.display = "none";

    if (score <= 1) {
        strengthResult.innerHTML = `
            <span class="badge badge-weak">Weak Password</span>
            <p style="margin-top:10px; font-size:0.9rem; color: var(--danger-red);">
                Crack Time: ${crackTime}
            </p>
            <p style="font-size:0.85rem; margin-top:5px;">
                ${feedback.warning || "This password is easily guessable."}
            </p>
        `;
        getSuggestions();
    }
    else if (score === 2) {
        strengthResult.innerHTML = `
            <span class="badge badge-medium">Medium Strength</span>
            <p style="margin-top:10px; font-size:0.9rem; color: #f59e0b;">
                ⏱ Crack Time: ${crackTime}
            </p>
            <p style="font-size:0.85rem; margin-top:5px;">
                ${feedback.suggestions.join(" ") || "Try making it longer and less predictable."}
            </p>
        `;
        getSuggestions();
    }

    else{
        strengthResult.innerHTML = `
            <span class="badge badge-strong">Strong Password</span>
            <p style="margin-top:10px; font-size:0.9rem; color: var(--success-green);">
                Crack Time: ${crackTime}
            </p>`;
    }
};

document.getElementById("backBtn").onclick = () => {
    window.location.href = "userdashboard.html";
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
    } catch (error) {
        window.location.href = "login.html";
    }
});
