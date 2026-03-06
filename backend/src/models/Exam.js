import mongoose from "mongoose";

// Sirf Exam schema define karo, User model import mat karo
const examSchema = new mongoose.Schema({
    subject: { 
        type: String, 
        required: true 
    },
    examdate: { 
        type: Date, 
        required: true 
    },
    duration: { 
        type: Number, 
        required: true 
    },
    marks_Attempt: { 
        type: Number, 
        default: 0 
    },
    total_Attempt: { 
        type: Number, 
        default: 0, 
        max: 3 
    },
    Average_Score: { 
        type: Number, 
        default: 0 
    },
    totalMarks: { 
        type: Number, 
        default: 100 
    },
    studentId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User'  // Yeh reference sahi hai, model import nahi karna
    },
    studentEmail: { 
        type: String, 
        required: true,
        lowercase: true,
        trim: true,
        index: true
    },
    studentName: { 
        type: String,
        trim: true 
    }
}, {
    timestamps: true
});

// Check karo model pehle se exist karta hai ya nahi
const Exam = mongoose.models.Exam || mongoose.model("Exam", examSchema);

export default Exam;