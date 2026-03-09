
export const checkurl=async (req,res)=>{
    const {url}=req.body;
    if(!url){
        return res.status(400).json({success:false,message:"URL is required"});
    }
    let score=5;
    let status='Safe';
    const lowerurl=url.toLowerCase();

    try{
    
        //Check based on rule based mechanism
        if(!lowerurl.startsWith('https://'))
            score-=2;
        if(lowerurl.length>75)
            score-=1;
        if(/\d+\.\d+\.\d+\.\d+/.test(url))
            score-=2;
        if(url.includes('@'))
            score-=2;
        
        const domainparts=url.replace(/https?:\/\//,'').split('/');
        const subdomains=domainparts[0].split('.');
        if(subdomains.length>3)
            score-=1;
        if(domainparts[0].includes('-'))
            score-=1;

        const suspiciousextensions=['.exe','.zip','.scr','.bat','.jar'];
        for(let ext of suspiciousextensions){
            if(url.endsWith(ext))
                score-=2;
        }

        const keywords=['login','secure','verify','update','account','banking','confirm'];
        for(let k of keywords){
            if(lowerurl.includes(k)){
                score-=1;
            }
        }
        if(/%[0-9a-f]{2}/i.test(url))
            score-=1;

        if(score<=0){
            status='Phishing';
        }
        else if(score<=3){
            status='Suspicious';
        }
        else{
            status='Safe';
        }
        res.json({success:true,score,status});
    }
    catch(error){
        res.status(500).json({success:failure,message:error.message});
    }

}

export const checkemail=async (req,res)=>{
    try{
        const {email}=req.body;
        if(!email){
            return res.status(400).json({ success: false, message: "Email is required" });
        }

        let score=5;
        let localpart=email.split('@')[0];
        let domainpart=email.split('@')[1];

        if(!email.includes('@') || !domainpart){
            score-=5;
        }
        //If IP address is there as domain

        if(/\d+\.\d+\.\d+\.\d+/.test(domainpart)){
            score-=4;
        }

        if(email.length>50){
            score-=1;
        }

        if(domainpart && domainpart.split('.').length>2){
            score-=1;
        }
        //Suspicious keywords

        const suspiciouskeywordslocal=["admin","verify","update","secure","banking"];
        const suspiciouskeywordsdomain=["login","secure","update","verify","account"];

        suspiciouskeywordslocal.forEach(word=>{
            if(localpart.toLowerCase().includes(word))
                score-=2;
        });
        suspiciouskeywordsdomain.forEach(word=>{
            if(domainpart && domainpart.toLowerCase().includes(word))
                score-=2;
        });

        const commonTLDs = ["com", "org", "net", "edu", "gov", "co", "io", "in"];
        if(domainpart){
            const parts = domainpart.split('.');
            const tld = parts[parts.length - 1].toLowerCase();
            if(!commonTLDs.includes(tld)){
                score -= 1; // penalize unusual TLD
            }
        }
        
        const specialCharsCount = (localpart.match(/[^a-zA-Z0-9._]/g) || []).length;
        if (specialCharsCount > 0) score -= 1;

        // Numbers in local part
        const numCount = (localpart.match(/\d/g) || []).length;

        // Only penalize if digits are suspiciously mixed with letters
        if (numCount > 3 && /[a-zA-Z]/.test(localpart)) score -= 1;  
        // Reduce extra penalty for extremely digit-heavy but normal numeric emails
        if (numCount > 6 && /[a-zA-Z]/.test(localpart)) score -= 1;
        
        
        const disposableDomains = ["mailinator.com", "tempmail.com", "10minutemail.com", "yopmail.com"];
        if (domainpart && disposableDomains.includes(domainpart.toLowerCase())) {
            score -= 2;
        }

        // Look-alike domains (simple check for numbers replacing letters)
        if (domainpart && /[\d]/.test(domainpart) && domainpart.toLowerCase().replace(/\d/g, '') !== domainpart.toLowerCase()) {
            score -= 1;
        }

        let status="Safe";
        if(score<=1){
            status="Phishing";
        }
        else if(score<=3){
            status="Suspicious";
        }
        res.status(200).json({
            success:true,email,score,status
        })

    }
    catch(error){
        res.status(500).json({ success: false, message: error.message });
    }
}