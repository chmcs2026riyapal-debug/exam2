import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Plus, User, Mail, Book,
  Calendar, Clock, Trash2, Save, Sparkles,
  Percent, ChevronDown, CheckCircle2, AlertCircle
} from 'lucide-react';
import axios from '../lib/axios';
import { calculatePercentage as calcPct } from '../lib/util';
import toast from 'react-hot-toast';

const CreateReportCard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [student, setStudent] = useState({
    name: '',
    email: '',
    role: 'student'
  });

  const [subjects, setSubjects] = useState([
    {
      id: Date.now(),
      name: '',
      marks: '',
      totalMarks: '100',
      attempts: '1',
      examDate: '',
      duration: '60'
    }
  ]);

  const handleStudentChange = (e) => {
    setStudent({ ...student, [e.target.name]: e.target.value });
  };

  const handleSubjectChange = (id, field, value) => {
    const updatedSubjects = subjects.map(s =>
      s.id === id ? { ...s, [field]: value } : s
    );
    setSubjects(updatedSubjects);
  };

  const addSubject = () => {
    setSubjects([
      ...subjects,
      {
        id: Date.now() + Math.random(),
        name: '',
        marks: '',
        totalMarks: '100',
        attempts: '1',
        examDate: '',
        duration: '60'
      }
    ]);
  };

  const removeSubject = (id) => {
    if (subjects.length > 1) {
      setSubjects(subjects.filter(s => s.id !== id));
    }
  };

  const validateForm = () => {
    console.log('Validating form...', { student, subjects });
    if (!student.name.trim()) {
      toast.error('Please enter student name');
      return false;
    }
    if (!student.email.trim()) {
      toast.error('Please enter student email');
      return false;
    }
    if (!student.email.includes('@') || !student.email.includes('.')) {
      toast.error('Please enter a valid university email address');
      return false;
    }

    for (let i = 0; i < subjects.length; i++) {
      const sub = subjects[i];
      if (!sub.name.trim()) {
        toast.error(`Please enter subject name for #${i + 1}`);
        return false;
      }
      if (sub.marks === "" || sub.marks === null || sub.marks === undefined) {
        toast.error(`Please enter marks for ${sub.name || 'Subject ' + (i + 1)}`);
        return false;
      }
      if (!sub.totalMarks) {
        toast.error(`Please enter total marks for ${sub.name}`);
        return false;
      }
      if (!sub.examDate) {
        toast.error(`Please select exam date for ${sub.name}`);
        console.warn('Validation failed: Missing examDate for subject', sub);
        return false;
      }

      const marks = parseFloat(sub.marks);
      const totalMarks = parseFloat(sub.totalMarks);

      if (marks > totalMarks) {
        toast.error(`Marks (${marks}) cannot exceed total (${totalMarks}) for ${sub.name}`);
        return false;
      }
      if (marks < 0 || totalMarks <= 0) {
        toast.error(`Invalid marks/total for ${sub.name}`);
        return false;
      }
    }
    return true;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      const studentEmail = student.email.trim().toLowerCase();
      const studentName = student.name.trim();

      // Step 1: Check if student already exists
      let studentId;
      try {
        const searchRes = await axios.get(`/users?email=${studentEmail}`);
        if (searchRes.data && searchRes.data.length > 0) {
          studentId = searchRes.data[0]._id;
          toast.success(`Found existing student: ${searchRes.data[0].name}`);
        }
      } catch (searchError) {
        console.log('Student search error (Expected if not found)');
      }

      // Step 2: Create new student if needed
      if (!studentId) {
        try {
          const createRes = await axios.post('/users', {
            name: studentName,
            email: studentEmail,
            role: 'student'
          });
          studentId = createRes.data._id;
          toast.success('New student created successfully');
        } catch (createError) {
          const errorMsg = createError.response?.data?.error || '';
          if (errorMsg.includes('duplicate') || errorMsg.includes('email')) {
            toast.error('This email already exists.');
          } else {
            toast.error('Failed to create student.');
          }
          setLoading(false);
          return;
        }
      }

      // Step 3: Create exams
      let examsCreated = 0;
      for (const subject of subjects) {
        const marks = parseFloat(subject.marks);
        const totalMarks = parseFloat(subject.totalMarks);
        const percentage = (marks / totalMarks) * 100;

        const examData = {
          studentId,
          studentEmail,
          studentName,
          subject: subject.name.trim(),
          examdate: subject.examDate,
          duration: parseInt(subject.duration),
          marks_Attempt: marks,
          total_Attempt: parseInt(subject.attempts),
          Average_Score: percentage,
          totalMarks: totalMarks
        };

        try {
          await axios.post('/exams', examData);
          examsCreated++;
        } catch (examError) {
          toast.error(`Failed to create report for ${subject.name}`);
        }
      }

      if (examsCreated > 0) {
        toast.success(`Successfully created ${examsCreated} records for ${studentName}!`);
        setTimeout(() => navigate(`/student/dashboard?email=${studentEmail}`), 1500);
      }
    } catch (error) {
      console.error('Submit report card error:', error);
      toast.error(`Submission failed: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }

  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 p-4 lg:p-12 relative overflow-hidden">
      {/* Background Animated Blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-600/10 blur-[120px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-purple-600/10 blur-[120px] animate-pulse pointer-events-none" style={{ animationDelay: '2s' }} />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-12"
        >
          <button
            onClick={() => navigate('/teacher/dashboard')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-slate-300 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </button>
          <div className="text-center sm:text-right">
            <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight flex items-center gap-2 sm:justify-end">
              <Sparkles className="w-6 h-6 text-blue-400" />
              New Performance Record
            </h1>
            <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mt-1">Report Card Generator</p>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section: Student Details */}
          <motion.section
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/5 backdrop-blur-2xl border border-white/10 p-6 lg:p-10 rounded-[2.5rem] shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400">
                <User className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">Student Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                  <input
                    type="text"
                    name="name"
                    value={student.name}
                    onChange={handleStudentChange}
                    required
                    placeholder="e.g. Riya Churail"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all placeholder:text-slate-600"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">University Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                  <input
                    type="email"
                    name="email"
                    value={student.email}
                    onChange={handleStudentChange}
                    required
                    placeholder="student@university.edu"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all placeholder:text-slate-600"
                  />
                </div>
              </div>
            </div>
          </motion.section>

          {/* Section: Subjects */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-400">
                  <Book className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">Academic Records</h2>
              </div>
              <button
                type="button"
                onClick={addSubject}
                className="flex items-center gap-2 py-2 px-4 rounded-xl bg-white/5 border border-white/5 text-sm font-bold text-blue-400 hover:bg-white/10 transition-all"
              >
                <Plus className="w-4 h-4" /> Add Subject
              </button>
            </div>

            <AnimatePresence mode='popLayout'>
              {subjects.map((subject, idx) => (
                <motion.div
                  key={subject.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 lg:p-8 rounded-[2.5rem] relative group shadow-lg"
                >
                  <button
                    type="button"
                    onClick={() => removeSubject(subject.id)}
                    className="absolute top-6 right-6 p-2 rounded-xl bg-red-500/10 text-red-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-5 space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Subject Name</label>
                      <input
                        type="text"
                        value={subject.name}
                        onChange={(e) => handleSubjectChange(subject.id, 'name', e.target.value)}
                        required
                        placeholder="e.g. Database Management"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-white placeholder:text-slate-700"
                      />
                    </div>
                    <div className="lg:col-span-2 space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Marks</label>
                      <input
                        type="number"
                        value={subject.marks}
                        onChange={(e) => handleSubjectChange(subject.id, 'marks', e.target.value)}
                        required
                        placeholder="0"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none text-white focus:ring-1 focus:ring-blue-500 transition-all"
                      />
                    </div>
                    <div className="lg:col-span-2 space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total</label>
                      <input
                        type="number"
                        value={subject.totalMarks}
                        onChange={(e) => handleSubjectChange(subject.id, 'totalMarks', e.target.value)}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none text-white focus:ring-1 focus:ring-blue-500 transition-all"
                      />
                    </div>
                    <div className="lg:col-span-3 space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Percentage</label>
                      <div className="w-full bg-blue-500/10 border border-blue-500/20 rounded-xl py-3 px-4 text-center">
                        <span className="text-blue-400 font-black tracking-tighter text-lg">
                          {calcPct(subject.marks, subject.totalMarks)}
                        </span>
                      </div>
                    </div>

                    <div className="lg:col-span-4 space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Exam Date</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="date"
                          value={subject.examDate}
                          onChange={(e) => handleSubjectChange(subject.id, 'examDate', e.target.value)}
                          required
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 outline-none text-sm text-white focus:ring-1 focus:ring-blue-500 transition-all appearance-none"
                        />
                      </div>
                    </div>
                    <div className="lg:col-span-4 space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Attempts</label>
                      <div className="relative">
                        <select
                          value={subject.attempts}
                          onChange={(e) => handleSubjectChange(subject.id, 'attempts', e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none text-sm appearance-none text-white focus:ring-1 focus:ring-blue-500 transition-all"
                        >
                          <option value="1" className="bg-[#0f172a]">1st Attempt</option>
                          <option value="2" className="bg-[#0f172a]">2nd Attempt</option>
                          <option value="3" className="bg-[#0f172a]">3rd Attempt</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                      </div>
                    </div>
                    <div className="lg:col-span-4 space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Duration (min)</label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="number"
                          value={subject.duration}
                          onChange={(e) => handleSubjectChange(subject.id, 'duration', e.target.value)}
                          required
                          placeholder="60"
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 outline-none text-sm text-white focus:ring-1 focus:ring-blue-500 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6">
            <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 max-w-md">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-[11px] font-medium leading-relaxed uppercase tracking-wide">
                <strong>Attention:</strong> Ensure all marks are cross-verified before creation. Records are synced across student dashboards instantly.
              </p>
            </div>
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => navigate('/teacher/dashboard')}
                className="px-8 py-4 rounded-2xl text-slate-500 hover:text-white font-bold transition-colors text-sm uppercase tracking-widest"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-3 px-10 py-5 rounded-[2rem] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black shadow-xl shadow-blue-500/25 transition-all group disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                )}
                {loading ? 'CREATING...' : 'GENERATE REPORT'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateReportCard;