import reportModel from '../Models/reportModel.js';
import validator from 'validator';

export const createReport = async (req,res)=>{
    try{
        const {reportType,content,description}=req.body;

        if(!reportType || !content || !description){
            return res.status(400).json({
                success:false,
                message:"All fields are required"
            });
        }

        if(reportType==="email" && !validator.isEmail(content)){
            return res.status(400).json({
                success:false,message:"Invalid Email"
            });
        }

        if (reportType === "url") {
            try{
                const parsed = new URL(content);
                if(parsed.protocol !== "http:" && parsed.protocol !== "https:"){
                    throw new Error();
                }
            } 
            catch{
                return res.status(400).json({
                    success: false,
                    message: "Invalid URL"
                });
            }
        }
        
        if (reportType === "phone") {
            const phoneRegex = /^[6-9][0-9]{9}$/;
            if (!phoneRegex.test(content)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid phone number"
                });
            }
        }

        const report=new reportModel({
            reportedBy: req.body.userid,
            reportType,
            content,
            description,
            status:"pending"
        });

        await report.save();

        return res.status(201).json({
            success:true,
            message:"Complaint filed successfully",
            reportId:report._id
        });
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

export const getMyReports=async (req,res)=>{
    try{
        const userid=req.body.userid;

        const reports=await reportModel.find({reportedBy:userid}).sort({createdAt:-1})

        return res.status(200).json({
            success:true,
            reports
        }); 
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        });
    }
};

export const getAllReports=async (req,res)=>{
    try{
        const reports=await reportModel.find().populate("reportedBy","name email")
                                            .sort({createdAt:-1});

        return res.status(200).json({
            success:true,
            reports
        });
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        });
    }
};

export const reviewReport=async (req,res)=>{
    try{
        const {reportId,status,adminRemarks}=req.body;

        if(!reportId || !status){
            return res.status(400).json({
                success:false,
                message:"Report ID and status are not there"
            });
        }

        const validStatus=["safe","phishing","under-review"];

        if(!validStatus.includes(status)){
            return res.status(400).json({
                success:false,
                message:"Invalid status"
            })
        }

        const report=await reportModel.findById(reportId);
        if(!report){
            return res.status(404).json({
                success:false,
                message:"Report not found"
            });
        }

        report.status=status;
        report.reviewedBy=req.body.userid;
        report.reviewedAt=new Date();
        report.adminRemarks=adminRemarks || "";

        await report.save();
        return res.status(200).json({
            success:true,
            message:"Report updated successfully"
        });

    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        });
    }
}

export const getReportById=async (req,res)=>{
    try{
        const {id}=req.params;

        const report=await reportModel.findById(id).populate("reportedBy","name email");
        if(!report){
            return res.status(404).json({
                success: false,
                message: "Report not found"
            });
        }

        return res.status(200).json({
            success:true,
            report
        });
    }
    catch(error){
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}



