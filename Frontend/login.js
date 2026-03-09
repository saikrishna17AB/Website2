
const message=document.querySelector("#message");
const logoutbtn=document.querySelector("#logout");
document.querySelector("#sub").addEventListener("click",async (e)=>{
    const email=document.querySelector("#email").value;
    const password=document.querySelector("#passwd").value;
    

    e.preventDefault();

    if (!email || !password) {
        message.innerText = "Please fill all fields";
        message.style.color = "red";
        return;
    }
    try {
        const response = await fetch("http://localhost:4000/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({email, password })
        });

        const data = await response.json();

        if (data.success) {
            message.innerText = data.message;
            message.style.color = "green";
            setTimeout(() => {
                window.location.href = "userdashboard.html";  
            }, 1);

        } else {
            message.innerText = data.message;
            message.style.color = "red";
        }

    } catch (error) {
        message.innerText = "Server error";
        message.style.color = "red";
    }
});

