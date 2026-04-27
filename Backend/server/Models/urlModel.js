import mongoose from "mongoose";

const urlThreatSchema = new mongoose.Schema({
    url: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    threatType: {
        type: String,
        enum: ["phishing", "malware", "spam", "suspicious"],
        default: "suspicious"
    },
    reportedCount: {
        type: Number,
        default: 1
    },
    lastReportedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const UrlThreat = mongoose.model("UrlThreat", urlThreatSchema);

export default UrlThreat;