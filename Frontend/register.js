
const form = document.querySelector("#register");
const btn=document.querySelector("#button");
const message=document.querySelector("#message");
function validateEmail(email) {
    const regex = /^\S+@\S+\.\S+$/;
    return regex.test(email);
}
btn.addEventListener("click", async (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("passwd").value;

    if (!name || !email || !password) {
        message.innerText = "Please fill all fields";
        message.style.color = "red";
        return;
    }

    if (!validateEmail(email)) {
        message.innerText = "Invalid email format";
        message.style.color = "red";
        return;
    }

    if (password.length < 6) {
        message.innerText = "Password must be at least 6 characters";
        message.style.color = "red";
        return;
    }

    try {
        const response = await fetch("http://localhost:4000/api/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (data.success) {
            message.innerText = data.message;
            message.style.color = "green";
            setTimeout(() => {
                window.location.href = "login.html";  
            }, 1);
        } 
        else {
            message.innerText = data.message;
            message.style.color = "red";
        }

    } 
    catch (error) {
        message.innerText = "Server error";
        message.style.color = "red";
    }
});
