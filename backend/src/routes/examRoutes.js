import express from "express";
import {
    createExam,
    getExams,
    getExamById,
    updateExam,
    deleteExam,
    attemptExam,
    getExamStatistics,
    subjectWiseReport,
    fixMissingUsers,
    checkStudentLogin
} from "../controllers/indexController.js";

const router = express.Router();

// Existing routes
router.post("/", createExam);
router.get("/", getExams);
router.get("/stats/overall", getExamStatistics);
router.get("/stats/subject", subjectWiseReport);
router.get("/:id", getExamById);
router.put("/:id", updateExam);
router.delete("/:id", deleteExam);
router.post("/attempt/:id", attemptExam);

// 🔧 FIX ROUTES
router.post("/fix-users", fixMissingUsers);
router.post("/check-login", checkStudentLogin);

export default router;