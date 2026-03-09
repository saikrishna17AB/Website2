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



const inputurl=document.querySelector("#url");
const btn=document.querySelector("#check");
const result=document.querySelector("#status");
const score=document.querySelector("#score");

const inputemail=document.querySelector("#eid");
const ebtn=document.querySelector("#checkemail");
const eresult=document.querySelector("#statusemail");
const escore=document.querySelector("#scoreemail");

const back=document.querySelector("#goback");


btn.addEventListener("click",async ()=>{
    const url=inputurl.value.trim();
    if(!url){
        alert("Please enter a valid URL");
        return;
    }
    try{
        const response=await fetch("http://localhost:4000/api/url/checkurl",{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify({url})
        });

        const data=await response.json();

        if(data.success){
            result.innerText=data.status;
            score.innerText=data.score;

            if(data.status==="Safe"){
                result.style.color='green';
            }
            else if(data.status==="Suspicious"){
                result.style.color='orange';
            }
            else if(data.status==='Phishing'){
                result.style.color='red';
            }
            else{
                alert("Error checking URL: " + data.message);
            }
        }
    }
    catch(error){
        result.innerText="Unable to check URL try again";
    }
})



ebtn.addEventListener("click",async ()=>{
    const email=inputemail.value.trim();
    if(!email){
        alert("Please enter a valid URL");
        return;
    }
    try{
        const response=await fetch("http://localhost:4000/api/url/checkemail",{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify({email})
        });

        const data=await response.json();

        if(data.success){
            eresult.innerText=data.status;
            escore.innerText=data.score;

            if(data.status==="Safe"){
                eresult.style.color='green';
            }
            else if(data.status==="Suspicious"){
                eresult.style.color='orange';
            }
            else if(data.status==='Phishing'){
                eresult.style.color='red';
            }
            else{
                alert("Error checking URL: " + data.message);
            }
        }
    }
    catch(error){
        eresult.innerText="Unable to check URL try again";
    }
})

back.addEventListener("click",async ()=>{
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

    setTimeout(() => {
        window.location.href = "userdashboard.html";  
    }, 1);
});