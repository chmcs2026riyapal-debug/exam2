import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Book, Calendar, Clock,
  Hourglass, Plus, ChevronDown, Sparkles
} from 'lucide-react';
import axios from '../lib/axios';
import toast from 'react-hot-toast';

const CreateTimetable = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    examDate: '',
    examTime: '',
    duration: '60'
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.subject || !formData.examDate || !formData.examTime) {
      toast.error('Please fill all fields');
      return;
    }

    setLoading(true);

    try {
      const examDateTime = new Date(`${formData.examDate}T${formData.examTime}`);

      const examData = {
        subject: formData.subject,
        examdate: examDateTime.toISOString(),
        duration: parseInt(formData.duration),
        // Required fields with default values
        marks_Attempt: 0,
        total_Attempt: 0,
        Average_Score: 0,
        totalMarks: 100
      };

      await axios.post('/exams', examData);

      toast.success('Timetable entry created successfully!');
      navigate('/teacher/dashboard');
    } catch (error) {
      console.error('Error:', error);

      // Demo mode fallback - save to localStorage
      const existingExams = JSON.parse(localStorage.getItem('exams') || '[]');
      const newExam = {
        _id: Date.now().toString(),
        subject: formData.subject,
        examdate: new Date(`${formData.examDate}T${formData.examTime}`).toISOString(),
        duration: parseInt(formData.duration)
      };
      existingExams.push(newExam);
      localStorage.setItem('exams', JSON.stringify(existingExams));

      toast.success('Demo: Timetable entry saved locally!');
      navigate('/teacher/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 p-4 lg:p-12 relative overflow-hidden flex flex-col items-center">
      {/* Background Animated Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-blue-600/10 blur-[150px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] rounded-full bg-purple-600/10 blur-[150px] animate-pulse pointer-events-none" style={{ animationDelay: '3s' }} />

      <div className="w-full max-w-2xl relative z-10">
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
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2 sm:justify-end">
              <Sparkles className="w-5 h-5 text-purple-400" />
              Schedule New Exam
            </h1>
            <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mt-1">Timetable Management</p>
          </div>
        </motion.div>

        {/* Focused Form Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-white/5 backdrop-blur-3xl border border-white/10 p-8 lg:p-12 rounded-[3rem] shadow-2xl relative overflow-hidden"
        >
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 blur-3xl rounded-full pointer-events-none" />

          <form className="space-y-8" onSubmit={handleSubmit}>
            {/* Subject Name */}
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Subject Name</label>
              <div className="relative group">
                <Book className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Advanced Quantum Mechanics"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all placeholder:text-slate-600 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Date Picker */}
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Exam Date</label>
                <div className="relative group">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                  <input
                    type="date"
                    name="examDate"
                    value={formData.examDate}
                    onChange={handleChange}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all appearance-none"
                  />
                </div>
              </div>

              {/* Time Picker */}
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Start Time</label>
                <div className="relative group">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                  <input
                    type="time"
                    name="examTime"
                    value={formData.examTime}
                    onChange={handleChange}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all appearance-none"
                  />
                </div>
              </div>
            </div>

            {/* Duration Dropdown */}
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Exam Duration</label>
              <div className="relative group">
                <Hourglass className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                <select
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-12 pr-12 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all appearance-none cursor-pointer font-medium"
                >
                  <option value="30" className="bg-[#0f172a]">30 Minutes</option>
                  <option value="60" className="bg-[#0f172a]">1 Hour</option>
                  <option value="90" className="bg-[#0f172a]">1.5 Hours</option>
                  <option value="120" className="bg-[#0f172a]">2 Hours</option>
                  <option value="180" className="bg-[#0f172a]">3 Hours</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none group-focus-within:text-blue-400 transition-colors" />
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-6 mt-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 text-white font-black text-lg shadow-2xl shadow-blue-500/25 flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Plus className="w-6 h-6" />
                  CREATE TIMETABLE ENTRY
                </>
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* Bottom Support Text */}
        <p className="mt-8 text-center text-slate-500 text-sm">
          Entry will be synced with the central student portal upon creation.
        </p>
      </div>
    </div>
  );
};

export default CreateTimetable;