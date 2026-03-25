function validateInput(type,content){
    if(type==="email"){
        const emailregex=/^\S+@\S+\.\S+$/;
        return emailregex.test(content);
    }

    if(type==="phone"){
        const phoneregex = /^[6-9][0-9]{9}$/;
        return phoneregex.test(content);
    }

    if(type==="url"){
        try{
            const parsed=new URL(content);
            return parsed.protocol === "http:" || parsed.protocol === "https:";
        }
        catch{
            return false;
        }
    }
    return false;
}

document.getElementById("reportform").addEventListener("submit",async (e)=>{
    e.preventDefault();

    const type=document.getElementById("type").value;
    const content=document.getElementById("content").value.trim();
    const description=document.getElementById("description").value.trim();
    const message=document.getElementById("msg");

    if(!validateInput(type,content)){
        message.innerText=`Invalid ${type} format`;
        message.style.color="red";
        return;
    }

    try{
        const response=await fetch("http://localhost:4000/api/report/create",{
            method:"POST",
            headers:{
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
                reportType: type,
                content,
                description
            })

        });

        const data=await response.json();

        if(data.success){
            message.innerText = "Report submitted successfully";
            message.style.color = "green";
            document.getElementById("reportform").reset();
        }
        else{
            message.innerText = data.message;
            message.style.color = "red";
        }
    }
    catch(error){
        message.innerText = "Server error";
        message.style.color = "red";
    }
});

document.getElementById("type").addEventListener("change",()=>{
    const type=document.getElementById("type").value;
    const content=document.getElementById("content");

    if(type==="email"){
        content.placeholder="Enter email";
    }
    else if(type==="phone"){
        content.placeholder="Enter phoneno";
    }
    else{
        content.placeholder="Enter URL";
    }
});

document.querySelector("#Goback").addEventListener("click",()=>{
    window.location.href="userdashboard.html";
})