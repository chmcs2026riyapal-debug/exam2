import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, CalendarPlus, Edit, Trash2, Clock,
  Calendar, ChevronRight, BookOpen, AlertCircle, Plus
} from 'lucide-react';
import axios from '../lib/axios';
import toast from 'react-hot-toast';
import { formatDate, formatTime } from '../lib/util';

const ManageTimetable = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/exams');

      // Sort by exam date
      const sortedExams = response.data.sort((a, b) =>
        new Date(a.examdate) - new Date(b.examdate)
      );

      setExams(sortedExams);
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to load timetable');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this exam schedule? Note: This deletes the entire report card record.')) {
      try {
        // Optimistic UI update
        const previousExams = [...exams];
        setExams(exams.filter(e => e._id !== id));

        await axios.delete(`/exams/${id}`);
        toast.success('Exam removed from timetable');
      } catch (error) {
        console.error('Delete error:', error);
        toast.error('Failed to delete exam');
        fetchTimetable(); // revert on fail
      }
    }
  };

  const handleEdit = (exam) => {
    // Navigate to edit page based on the report card it belongs to
    // Since exams are tied to report cards heavily in this system structure, 
    // editing timetables effectively means editing the report card date.
    navigate(`/teacher/edit/${exam.studentId || exam._id}`);
  };

  // Group exams by distinct date
  const groupByDate = () => {
    const grouped = {};
    // Only show future exams or all depending on preference. Here we show all sorted.
    exams.forEach(exam => {
      const dateStr = formatDate(exam.examdate);
      if (!grouped[dateStr]) {
        grouped[dateStr] = [];
      }
      grouped[dateStr].push(exam);
    });
    return grouped;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const groupedExams = groupByDate();

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 p-4 lg:p-12 relative overflow-hidden">
      {/* Background Animated Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-600/10 blur-[120px] animate-pulse pointer-events-none fixed" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-purple-600/10 blur-[120px] animate-pulse pointer-events-none fixed" style={{ animationDelay: '2s' }} />

      <div className="max-w-4xl mx-auto relative z-10 w-full">

        {/* Top Header Navigation */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8"
        >
          <button
            onClick={() => navigate('/teacher/dashboard')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-slate-300 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <div className="flex items-center gap-2 text-slate-500 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-bold uppercase tracking-widest">Exam Scheduling Portal</span>
          </div>
        </motion.div>

        {/* Main Timetable Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] lg:rounded-[2.5rem] overflow-hidden shadow-2xl"
        >
          <div className="p-6 lg:p-10 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/5">
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                <CalendarPlus className="text-blue-400 w-8 h-8 hidden sm:block" /> Manage Timetable
              </h1>
              <p className="text-slate-400 mt-2 text-sm sm:text-base">Organize and schedule upcoming examinations for all students.</p>
            </div>
            <button
              onClick={() => navigate('/teacher/create-report')}
              className="flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-blue-500/25 transition-all group active:scale-95"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
              CREATE NEW EXAM
            </button>
          </div>

          <div className="p-4 lg:p-10">
            {Object.keys(groupedExams).length > 0 ? (
              <div className="space-y-12">
                <AnimatePresence>
                  {Object.entries(groupedExams).map(([date, dateExams], dateIdx) => (
                    <motion.div
                      key={date}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: dateIdx * 0.1 }}
                      className="mb-8"
                    >
                      {/* Date Divider */}
                      <div className="flex items-center gap-4 mb-6">
                        <div className="h-px flex-grow bg-gradient-to-r from-transparent to-white/10" />
                        <span className="px-5 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs sm:text-sm font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(99,102,241,0.1)] whitespace-nowrap">
                          {date}
                        </span>
                        <div className="h-px flex-grow bg-gradient-to-l from-transparent to-white/10" />
                      </div>

                      {/* Exams List for Date */}
                      <div className="space-y-4">
                        {dateExams.map((exam) => (
                          <motion.div
                            key={exam._id}
                            whileHover={{ x: 4 }}
                            className="bg-[#0f172a]/40 border border-white/5 hover:border-indigo-500/30 hover:bg-[#0f172a]/60 p-5 lg:p-6 rounded-[1.5rem] transition-all relative group flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md"
                          >
                            <div className="flex items-start gap-4 lg:gap-6">
                              <div className="p-3 lg:p-4 bg-indigo-500/10 rounded-2xl group-hover:bg-indigo-500/20 transition-colors shrink-0">
                                <BookOpen className="w-6 h-6 text-indigo-400" />
                              </div>
                              <div>
                                <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors pr-8 sm:pr-0">
                                  {exam.subject} <span className="text-sm font-normal text-slate-500 ml-2 block sm:inline">({exam.studentName || 'Unassigned'})</span>
                                </h3>
                                <div className="flex flex-wrap items-center gap-3 lg:gap-6 mt-2">
                                  <span className="flex items-center gap-1.5 text-xs lg:text-sm text-slate-400 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                                    <Clock className="w-3.5 h-3.5 text-blue-400" /> {formatTime(exam.examdate)}
                                  </span>
                                  <span className="flex items-center gap-1.5 text-xs lg:text-sm text-slate-400 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                                    <AlertCircle className="w-3.5 h-3.5 text-purple-400" /> {exam.duration || 60} Mins
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Actions - visible on mobile, reveal on hover for desktop */}
                            <div className="flex items-center gap-2 mt-4 sm:mt-0 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity justify-end sm:justify-start pt-4 sm:pt-0 border-t border-white/10 sm:border-0 pl-16 sm:pl-0">
                              <button
                                onClick={() => handleEdit(exam)}
                                className="p-3 bg-white/5 hover:bg-blue-500/20 text-blue-400 rounded-xl transition-colors border border-white/10 hover:border-blue-500/50"
                                title="Edit Exam"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(exam._id)}
                                className="p-3 bg-white/5 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors border border-white/10 hover:border-red-500/50"
                                title="Delete Exam"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="py-24 text-center space-y-6 bg-white/5 rounded-3xl border border-white/5">
                <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <CalendarPlus className="w-10 h-10 text-slate-500" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-3">No Exams Scheduled</h3>
                  <p className="text-slate-400 max-w-sm mx-auto">Your timetable is currently empty. Get started by creating your first examination schedule.</p>
                </div>
                <button
                  onClick={() => navigate('/teacher/create-report')}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold border-none px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/25 active:scale-95"
                >
                  <Plus className="w-5 h-5" />
                  Create First Exam
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Footer Helper */}
        <div className="hidden md:block mt-8 p-6 bg-gradient-to-r from-blue-600/10 to-transparent border-l-4 border-blue-500 rounded-r-2xl border-y border-r border-y-white/5 border-r-white/5">
          <p className="text-sm text-slate-400 leading-relaxed flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-blue-400 shrink-0" />
            <span className="font-bold text-blue-400">Pro-tip:</span> Students will see these timetable updates live on their dashboard immediately after creation or modification.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ManageTimetable;