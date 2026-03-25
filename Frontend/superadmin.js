
let selectedUserId=null;

function showDetails(user){
    selectedUserId=user._id;

    document.querySelector("#userEmail").innerText=user.email;
    document.querySelector("#userName").innerText=user.name;

    document.querySelector("#reqdetails").style.display="block";
}
async function loadRequests(){
    const list=document.querySelector("#requestList");
    list.innerHTML="";  

    try{
        const response=await fetch("http://localhost:4000/api/user/getadminrequests",{
            credentials:"include"
        });

        if(!response.ok){
            console.log("Request failed");
            return;
        }
        const data=await response.json();
        
        if(!data.success){
            return
        }

        data.users.forEach(user=>{
            const li=document.createElement("li");

            li.innerText=user.name;
            li.style.cursor="pointer";

            li.onclick = ()=> showDetails(user);

            list.appendChild(li);
        })


    }
    catch(error){
        console.log("Error loading requests");
    }
}


const btn=document.querySelector("#adminreq");
const section=document.querySelector("#adminsection");

btn.addEventListener("click",()=>{
    section.style.display="flex";
    loadRequests();
})

document.querySelector("#approveBtn").addEventListener("click",async ()=>{
    if(!selectedUserId) return;

    const response=await fetch("http://localhost:4000/api/auth/approveadmin",{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        credentials: "include",
        body: JSON.stringify({userid: selectedUserId})
    });

    const data=await response.json();
    
    const msg=document.querySelector("#actionmsg");
    msg.innerText=data.message;
    msg.style.color=data.success ? "green" : "red";

    loadRequests();
});

document.querySelector("#rejectBtn").addEventListener("click",async ()=>{
    if(!selectedUserId) return;

    const response=await fetch("http://localhost:4000/api/auth/rejectadmin",{
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ userid: selectedUserId })
    });

    const data=await response.json();

    const msg = document.getElementById("actionmsg");
    msg.innerText = data.message;
    msg.style.color = data.success ? "green" : "red";

    loadRequests(); //
})