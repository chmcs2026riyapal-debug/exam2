import User from "../models/User.js";
import Exam from "../models/Exam.js";

// ================= USER CONTROLLERS =================

// CREATE USER
export const createUser = async (req, res) => {
  try {
    const { name, email, role } = req.body;

    const user = await User.create({
      name: name?.trim(),
      email: email?.toLowerCase().trim(),
      role: role || 'student'
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    console.error("Create user error:", error);

    if (error.code === 11000) {
      res.status(400).json({ error: "Email already exists" });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
};

// LOGIN USER (Only name and email)
export const loginUser = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    const user = await User.findOne({
      email: email?.toLowerCase().trim(),
      name: name?.trim()
    });

    if (!user) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: error.message });
  }
};

// GET ALL USERS
export const getAllUsers = async (req, res) => {
  try {
    const { email } = req.query;
    let query = {};

    if (email) {
      query.email = email.toLowerCase().trim();
    }

    const users = await User.find(query);
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET USER BY ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE USER
export const updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// DELETE USER
export const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ================= EXAM CONTROLLERS =================

// CREATE EXAM
export const createExam = async (req, res) => {
  try {
    const {
      studentId,
      studentEmail,
      studentName,
      subject,
      examdate,
      duration,
      marks_Attempt,
      total_Attempt,
      Average_Score,
      totalMarks
    } = req.body;

    // Validate required fields
    if (!studentEmail) {
      return res.status(400).json({
        error: "studentEmail is required"
      });
    }

    if (!subject || !examdate || !duration) {
      return res.status(400).json({
        error: "Missing required fields: subject, examdate, duration are required"
      });
    }

    const exam = await Exam.create({
      studentId,
      studentEmail: studentEmail.toLowerCase().trim(),
      studentName: studentName?.trim(),
      subject: subject.trim(),
      examdate,
      duration: parseInt(duration),
      marks_Attempt: marks_Attempt || 0,
      total_Attempt: total_Attempt || 1,
      Average_Score: Average_Score || 0,
      totalMarks: totalMarks || 100
    });

    res.status(201).json(exam);
  } catch (error) {
    console.error("Create exam error:", error);
    res.status(400).json({ error: error.message });
  }
};

// GET ALL EXAMS
export const getExams = async (req, res) => {
  try {
    const { email } = req.query;
    let query = {};

    if (email) {
      query.studentEmail = email.toLowerCase().trim();
    }

    const exams = await Exam.find(query).sort({ examdate: -1 });
    res.json(exams);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET EXAM BY ID
export const getExamById = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ message: "Exam not found" });
    res.json(exam);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE EXAM
export const updateExam = async (req, res) => {
  try {
    const exam = await Exam.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(exam);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// DELETE EXAM
export const deleteExam = async (req, res) => {
  try {
    await Exam.findByIdAndDelete(req.params.id);
    res.json({ message: "Exam deleted" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ATTEMPT EXAM
export const attemptExam = async (req, res) => {
  try {
    const { marks } = req.body;
    const exam = await Exam.findById(req.params.id);

    if (!exam)
      return res.status(404).json({ message: "Exam not found" });

    if (exam.total_Attempt >= 3)
      return res.status(400).json({ message: "Only 3 attempts allowed" });

    const percentage = (marks / exam.totalMarks) * 100;

    exam.total_Attempt += 1;
    exam.marks_Attempt = marks;

    const previousAttempts = exam.total_Attempt - 1;
    const currentTotalScore = (exam.Average_Score * previousAttempts) + percentage;
    exam.Average_Score = currentTotalScore / exam.total_Attempt;

    await exam.save();
    res.json(exam);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// GET EXAM STATISTICS
export const getExamStatistics = async (req, res) => {
  try {
    const stats = await Exam.aggregate([
      {
        $group: {
          _id: null,
          totalExams: { $sum: 1 },
          averageScoreOverall: { $avg: "$Average_Score" },
          totalAttempts: { $sum: "$total_Attempt" }
        }
      }
    ]);
    res.json(stats[0] || { totalExams: 0, averageScoreOverall: 0, totalAttempts: 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// SUBJECT WISE REPORT
export const subjectWiseReport = async (req, res) => {
  try {
    const report = await Exam.aggregate([
      {
        $group: {
          _id: "$subject",
          averageScore: { $avg: "$Average_Score" },
          totalExams: { $sum: 1 }
        }
      }
    ]);
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ================= FIX FUNCTIONS =================

// FIX - Create missing users from exams
export const fixMissingUsers = async (req, res) => {
  try {
    // Get all exams
    const exams = await Exam.find({});

    // Get unique emails from exams
    const emailSet = new Set();
    exams.forEach(exam => {
      if (exam.studentEmail) {
        emailSet.add(exam.studentEmail.toLowerCase().trim());
      }
    });

    const uniqueEmails = Array.from(emailSet);
    console.log(`Found ${uniqueEmails.length} unique emails from exams`);

    let created = 0;
    let existing = 0;

    for (const email of uniqueEmails) {
      // Check if user exists
      const existingUser = await User.findOne({ email });

      if (!existingUser) {
        // Create user
        const name = email.split('@')[0]; // Use email prefix as name
        await User.create({
          name: name,
          email: email,
          role: 'student'
        });
        created++;
        console.log(`✅ Created user for ${email}`);
      } else {
        existing++;
        console.log(`👤 User already exists for ${email}`);
      }
    }

    res.json({
      message: "Users fixed successfully",
      uniqueEmails: uniqueEmails.length,
      created,
      existing
    });

  } catch (error) {
    console.error("Fix users error:", error);
    res.status(500).json({ error: error.message });
  }
};

// FIX - Check student login
export const checkStudentLogin = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Check exams for this email
    const exams = await Exam.find({ studentEmail: email.toLowerCase().trim() });

    res.json({
      userExists: !!user,
      user: user ? { name: user.name, email: user.email, role: user.role } : null,
      examCount: exams.length,
      exams: exams.map(e => ({ subject: e.subject, marks: e.marks_Attempt }))
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// INITIALIZE DEFAULT USERS
export const initializeDefaultUsers = async () => {
  try {
    const demoUsers = [
      { name: 'Teacher Demo', email: 'teacher@demo.com', role: 'teacher' },
      { name: 'Student Demo', email: 'student@demo.com', role: 'student' }
    ];

    for (const demoUser of demoUsers) {
      const exists = await User.findOne({ email: demoUser.email });
      if (!exists) {
        await User.create(demoUser);
        console.log(`✅ Created default user: ${demoUser.name} (${demoUser.email})`);
      } else {
        console.log(`ℹ️ Default user already exists: ${demoUser.name}`);
      }
    }
  } catch (error) {
    console.error('Error creating default users:', error);
  }
};
