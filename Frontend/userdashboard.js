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

checkbtn.addEventListener("click",async ()=>{
    window.location.href="suspiciousurl.html";
})
