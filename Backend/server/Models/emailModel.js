import mongoose from 'mongoose';

const emailThreatSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    breachSource: {
        type: String,
        default: "Unknown"
    },

    // riskLevel: {
    //     type: String,
    //     enum: ["low", "medium", "high"],
    //     default: "medium"
    // },
    exposedCount: {
        type: Number,
        default: 1
    },
    lastDetectedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const EmailThreat = mongoose.model("EmailThreat", emailThreatSchema);

export default EmailThreat;