const resultMsg = document.getElementById("resultMsg");

async function checkPassword(password) {

    resultMsg.innerText = "Checking...";
    resultMsg.style.color = "black";

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

        // Step 5: Show EXACT result
        if (breachCount > 0) {
            resultMsg.innerText =
                `⚠️ Compromised Password!\n\n` +
                `This password has appeared ${breachCount} times in data breaches.\n` +
                `It is NOT safe to use.\n\n` +
                `👉 Please choose a stronger password.`;

            resultMsg.style.color = "red";
        } else {
            resultMsg.innerText =
                `✅ Safe Password\n\n` +
                `This password was NOT found in known data breaches.\n` +
                `Still, make sure it's strong and unique.`;

            resultMsg.style.color = "green";
        }

    } catch (error) {
        resultMsg.innerText = "Error checking password";
        resultMsg.style.color = "red";
    }
}


document.getElementById("checkBtn").onclick = () => {
    const password = document.getElementById("passwordInput").value;

    if (!password) {
        resultMsg.innerText = "Please enter a password";
        resultMsg.style.color = "red";
        return;
    }

    checkPassword(password);
};


// ⬅ Back button
document.getElementById("backBtn").onclick = () => {
    window.location.href = "admin.html"; // change if needed
};