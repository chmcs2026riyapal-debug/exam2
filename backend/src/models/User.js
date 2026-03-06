import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        auto: true
    },
    name: {
        type: String,
        required: [true, "Please provide a name"],
        trim: true
    },
    email: {
        type: String,
        required: [true, "Please provide an email"],
        unique: true,
        lowercase: true
    },
    //password: {
       // type: String,
       // required: [true, "Please provide a password"],
       // minlength: 6
   // },
    role: {
        type: String,
        enum: ["student", "teacher"],
        default: "student"
    },
    subjects: [{
        type: String,
        trim: true
    }],
    totalScore: {
        type: Number,
        default: 0
    },
    noOfAttempt: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

userSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const User = mongoose.model("User", userSchema);
export default User;