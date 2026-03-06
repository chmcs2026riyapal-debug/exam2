import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Save, Plus, Trash2, User, Mail,
  Book
} from 'lucide-react';
import axios from '../lib/axios';
import toast from 'react-hot-toast';

const EditReportCard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [student, setStudent] = useState({ name: '', email: '' });
  const [exams, setExams] = useState([]);

  useEffect(() => {
    fetchStudentData();
  }, [id]);

  const fetchStudentData = async () => {
    try {
      setLoading(true);

      let studentData = null;
      try {
        const studentRes = await axios.get(`/users/${id}`);
        studentData = studentRes.data;
      } catch (err) {
        console.log('Student not found by ID (this is normal if coming from exam ID)');
      }

      const examsRes = await axios.get('/exams');
      let studentExams = [];

      if (studentData) {
        studentExams = examsRes.data.filter(exam =>
          exam.studentId === id || exam.studentEmail === studentData.email
        );
        setStudent(studentData);
      } else {
        const examWithStudent = examsRes.data.find(exam => exam.studentId === id || exam._id === id);
        if (examWithStudent) {
          studentExams = examsRes.data.filter(exam =>
            exam.studentEmail === examWithStudent.studentEmail
          );
          setStudent({
            _id: id,
            name: examWithStudent.studentName || 'Student',
            email: examWithStudent.studentEmail,
            role: 'student'
          });
        }
      }

      setExams(studentExams);
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to load student data');
    } finally {
      setLoading(false);
    }
  };

  const handleStudentChange = (e) => {
    setStudent({ ...student, [e.target.name]: e.target.value });
  };

  const handleExamChange = (index, field, value) => {
    const updatedExams = [...exams];
    updatedExams[index][field] = value;

    // Recalculate percentage instantly for UI feedback
    if (field === 'marks_Attempt' || field === 'totalMarks') {
      const marks = parseFloat(updatedExams[index].marks_Attempt) || 0;
      const totalMarks = parseFloat(updatedExams[index].totalMarks) || 100;
      const percentage = totalMarks > 0 ? (marks / totalMarks) * 100 : 0;
      updatedExams[index].Average_Score = percentage.toFixed(2);
    }

    setExams(updatedExams);
  };

  const addSubject = () => {
    const newExam = {
      _id: 'temp_' + Date.now(),
      subject: '',
      marks_Attempt: 0,
      totalMarks: 100,
      Average_Score: 0,
      total_Attempt: 1,
      examdate: new Date().toISOString().split('T')[0]
    };
    setExams([...exams, newExam]);
  };

  const removeSubject = (index) => {
    if (exams.length > 1) {
      setExams(exams.filter((_, i) => i !== index));
    } else {
      toast.error("A report card must have at least one subject.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (student._id && !student._id.toString().startsWith('temp_')) {
        try {
          await axios.put(`/users/${student._id}`, {
            name: student.name,
            email: student.email
          });
        } catch (err) {
          console.log('Student direct update skipped (might be exam-based routing)');
        }
      }

      let updated = 0;
      let created = 0;

      for (const exam of exams) {
        if (!exam.subject) {
          toast.error("Subject name cannot be empty");
          setSaving(false);
          return;
        }

        const examData = {
          subject: exam.subject,
          marks_Attempt: parseFloat(exam.marks_Attempt) || 0,
          totalMarks: parseFloat(exam.totalMarks) || 100,
          Average_Score: parseFloat(exam.Average_Score) || 0,
          total_Attempt: parseInt(exam.total_Attempt) || 1,
          examdate: exam.examdate?.split('T')[0] || new Date().toISOString().split('T')[0],
          studentId: student._id || id,
          studentEmail: student?.email || 'test@example.com',
          studentName: student?.name || 'Student'
        };

        try {
          if (exam._id.toString().startsWith('temp_')) {
            await axios.post('/exams', examData);
            created++;
          } else {
            await axios.put(`/exams/${exam._id}`, examData);
            updated++;
          }
        } catch (examError) {
          console.error(`Error with exam ${exam.subject}:`, examError);
          toast.error(`Failed to update ${exam.subject}`);
        }
      }

      if (created > 0 || updated > 0) {
        toast.success(`✅ Saved ${updated + created} subjects successfully!`);
        navigate('/teacher/dashboard');
      } else {
        toast.error('No changes were made');
      }

    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Failed to save report card');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 p-4 lg:p-12 relative overflow-x-hidden">
      {/* Background Gradients */}
      <div className="absolute top-[-5%] right-[-5%] w-[40vw] h-[40vw] rounded-full bg-blue-600/10 blur-[120px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-5%] left-[-5%] w-[40vw] h-[40vw] rounded-full bg-purple-600/10 blur-[120px] animate-pulse pointer-events-none" style={{ animationDelay: '3s' }} />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header Bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <button
            onClick={() => navigate('/teacher/dashboard')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-slate-300"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <h1 className="text-xl font-bold text-white hidden md:block">Edit Report Card</h1>
        </motion.div>

        {/* Main Form Container */}
        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Student Info Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 lg:p-8 rounded-[2rem] shadow-xl"
          >
            <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <User className="text-blue-400 w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-white">Student Profile</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                  <input
                    type="text"
                    name="name"
                    required
                    value={student?.name || ''}
                    onChange={handleStudentChange}
                    className="w-full bg-[#0f172a]/50 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-slate-600"
                    placeholder="Student Name"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                  <input
                    type="email"
                    name="email"
                    required
                    value={student?.email || ''}
                    onChange={handleStudentChange}
                    className="w-full bg-[#0f172a]/50 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-white focus:ring-2 focus:ring-purple-500/50 outline-none transition-all placeholder:text-slate-600"
                    placeholder="student@university.edu"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Subjects Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Book className="text-purple-400 w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-white">Academic Performance</h2>
              </div>
              <span className="badge badge-outline border-white/10 text-slate-400 px-4 py-3">{exams.length} Subjects Total</span>
            </div>

            <AnimatePresence>
              {exams.map((exam, idx) => {
                const percentage = parseFloat(exam.Average_Score) || 0;

                return (
                  <motion.div
                    key={exam._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 lg:p-8 rounded-[2rem] relative group shadow-lg"
                  >
                    {/* Trash Button - Only show if more than 1 subject to prevent empty report cards */}
                    {exams.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSubject(idx)}
                        className="absolute top-6 right-6 p-2.5 rounded-xl bg-red-500/10 text-red-400 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                        title="Remove Subject"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">

                      <div className="lg:col-span-12 mb-2 lg:mb-0">
                        <h3 className="text-lg font-bold text-slate-300">Subject 0{idx + 1}</h3>
                      </div>

                      <div className="lg:col-span-4 space-y-2">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest pl-1">Subject Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Physics"
                          value={exam.subject || ''}
                          onChange={(e) => handleExamChange(idx, 'subject', e.target.value)}
                          className="w-full bg-[#0f172a]/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-purple-500/50 outline-none transition-all placeholder:text-slate-600"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4 lg:col-span-4 lg:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest pl-1">Marks</label>
                          <input
                            type="number"
                            required min="0" max={exam.totalMarks || 100}
                            value={exam.marks_Attempt ?? ''}
                            onChange={(e) => handleExamChange(idx, 'marks_Attempt', e.target.value)}
                            className="w-full bg-[#0f172a]/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest pl-1">Total</label>
                          <input
                            type="number"
                            required min="1"
                            value={exam.totalMarks ?? 100}
                            onChange={(e) => handleExamChange(idx, 'totalMarks', e.target.value)}
                            className="w-full bg-[#0f172a]/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 lg:col-span-4 lg:grid-cols-2">
                        <div className="space-y-2 relative">
                          <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest pl-1">Attempt</label>
                          <select
                            value={exam.total_Attempt || 1}
                            onChange={(e) => handleExamChange(idx, 'total_Attempt', e.target.value)}
                            className="w-full bg-[#0f172a]/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all appearance-none cursor-pointer"
                          >
                            <option value="1" className="bg-[#0f172a]">1st Attempt</option>
                            <option value="2" className="bg-[#0f172a]">2nd Attempt</option>
                            <option value="3" className="bg-[#0f172a]">3rd Attempt</option>
                          </select>
                          {/* Custom dropdown arrow */}
                          <div className="pointer-events-none absolute inset-y-0 right-0 top-6 flex items-center px-4 text-slate-400">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest pl-1">Date</label>
                          <input
                            type="date"
                            required
                            value={exam.examdate?.split('T')[0] || ''}
                            onChange={(e) => handleExamChange(idx, 'examdate', e.target.value)}
                            className="w-full bg-[#0f172a]/50 border border-white/10 rounded-xl py-3 px-3 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all text-sm sm:text-base [color-scheme:dark]"
                          />
                        </div>
                      </div>

                      {/* Live Grade Display */}
                      <div className="lg:col-span-12 mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-400">Live Calculation</span>
                        <div className={`px-6 py-2 rounded-xl flex items-center gap-3 border ${percentage >= 40 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overall Grade</span>
                          <span className={`text-xl font-black ${percentage >= 40 ? 'text-emerald-400' : 'text-red-400'}`}>{percentage.toFixed(1)}%</span>
                        </div>
                      </div>

                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            <button
              type="button"
              onClick={addSubject}
              className="w-full py-5 border-2 border-dashed border-white/10 rounded-[2rem] text-slate-400 font-bold tracking-wide hover:text-white hover:border-blue-500/50 hover:bg-blue-500/5 transition-all outline-none flex items-center justify-center gap-3 group focus:ring-2 focus:ring-blue-500/50"
            >
              <Plus className="w-6 h-6 p-1 rounded-full bg-white/5 group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-all" />
              ADD NEW SUBJECT RESULT
            </button>
          </div>

          {/* Action Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row items-center justify-end gap-4 bg-white/5 backdrop-blur-xl border border-white/10 p-4 sm:p-6 rounded-[2rem] sticky bottom-4 shadow-2xl z-50"
          >
            <button
              type="button"
              disabled={saving}
              onClick={() => navigate('/teacher/dashboard')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-slate-400 font-semibold hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50"
            >
              Cancel Edit
            </button>
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-blue-500/25 transition-all active:scale-95 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {saving ? 'SAVING DB...' : 'SAVE ALL CHANGES'}
            </button>
          </motion.div>

        </form>
      </div>
    </div>
  );
};

export default EditReportCard;