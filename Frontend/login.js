
const message=document.querySelector("#message");
document.querySelector("#sub").addEventListener("click",async (e)=>{
    const email=document.querySelector("#email").value;
    const password=document.querySelector("#passwd").value;
    const role=document.querySelector("#role").value;
    

    e.preventDefault();

    if (!email || !password || !role) {
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
            body: JSON.stringify({email, password,role })
        });

        const data = await response.json();

        if (data.success) {
            message.innerText = data.message;
            message.style.color = "green";
            setTimeout(() => {
                if(data.role==="superadmin" && role==="superadmin"){
                    window.location.href="superadmin.html";
                }
                else if(data.role==="admin" && role==="admin"){
                    window.location.href="admin.html";
                }   
                else{
                    window.location.href="userdashboard.html";  
                }  
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

const logoutBtn = document.getElementById("logout");

logoutBtn.onclick = async () => {
    try {
        const res = await fetch("http://localhost:4000/api/auth/logout", {
            method: "POST",
            credentials: "include"
        });

        const data = await res.json();

        if (data.success) {


            setTimeout(() => {
                window.location.href = "login.html"; // redirect to login page
            }, 1500);
        } else {
            ;
        }

    } catch (error) {
        message.innerText = "Logout failed";
        message.style.color = "red";
    }
};

