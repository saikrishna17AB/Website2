import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },

    action: {
        type: String,
        required: true
    },

    details: {
        message: {
            type: String,
            default: ""
        },
        meta: {
            type: Object,  
            default: {}
        }
    }

}, { timestamps: true });

const activityModel = mongoose.models.activity || mongoose.model("activity", activitySchema);

export default activityModel;