const resultMsg = document.getElementById("resultMsg");
const checkBtn = document.getElementById("checkBtn");
const passwordInput = document.getElementById("passwordInput");

async function checkPassword(password) {
    resultMsg.innerHTML = '<span class="feedback info">Initializing Scan...</span>';
    checkBtn.innerText = "Scanning Hash Range...";
    checkBtn.disabled = true;

    try {
        // Step 1: Convert password → SHA-1 hash
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest("SHA-1", data);

        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hash = hashArray
            .map(b => b.toString(16).padStart(2, "0"))
            .join("")
            .toUpperCase();

        // Step 2: Split hash
        const prefix = hash.substring(0, 5);
        const suffix = hash.substring(5);

        // Step 3: API call
        const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
        const text = await res.text();

        const lines = text.split("\n");

        let breachCount = 0;

        // Step 4: Match suffix
        for (let line of lines) {
            const [hashSuffix, count] = line.split(":");

            if (hashSuffix === suffix) {
                breachCount = parseInt(count);
                break;
            }
        }

        // Step 5: Show result as badge
        if (breachCount > 0) {
            resultMsg.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: center; gap: 10px;">
                    <span class="badge badge-danger">Compromised</span>
                    <p style="font-size: 0.9rem; color: var(--danger-red);">
                        Detected in <b>${breachCount.toLocaleString()}</b> known breaches.
                    </p>
                </div>
            `;
        } else {
            resultMsg.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: center; gap: 10px;">
                    <span class="badge badge-safe">Secure</span>
                    <p style="font-size: 0.9rem; color: var(--success-green);">
                        No matches found in global breach catalogs.
                    </p>
                </div>
            `;
        }

    } catch (error) {
        resultMsg.innerHTML = '<span class="feedback error">Scan Interrupted: Network Error</span>';
    } finally {
        checkBtn.innerText = "Initiate Scan";
        checkBtn.disabled = false;
    }
}

checkBtn.onclick = () => {
    const password = passwordInput.value;

    if (!password) {
        resultMsg.innerHTML = '<span class="feedback error">Input required: Empty token</span>';
        return;
    }

    checkPassword(password);
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
