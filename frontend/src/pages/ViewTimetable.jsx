import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Calendar, Clock, Hourglass, Book,
  ChevronRight, Filter, AlertCircle, Sparkles
} from 'lucide-react';
import api from '../lib/axios';
import toast from 'react-hot-toast';
import { formatDate, formatTime } from '../lib/util';

const ViewTimetable = () => {
  const [exams, setExams] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTimetable();
  }, []);

  useEffect(() => {
    filterExams();
  }, [searchTerm, exams]);

  const fetchTimetable = async () => {
    try {
      setLoading(true);
      const response = await api.get('/exams');

      // Sort by exam date
      const sortedExams = response.data.sort((a, b) =>
        new Date(a.examdate) - new Date(b.examdate)
      );

      setExams(sortedExams);
      setFilteredExams(sortedExams);
    } catch (error) {
      toast.error('Failed to fetch timetable');
    } finally {
      setLoading(false);
    }
  };

  const filterExams = () => {
    if (searchTerm) {
      const filtered = exams.filter(exam =>
        exam.subject?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredExams(filtered);
    } else {
      setFilteredExams(exams);
    }
  };

  const groupByDate = () => {
    const grouped = {};
    filteredExams.forEach(exam => {
      const date = formatDate(exam.examdate);
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(exam);
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
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/10 blur-[120px] animate-pulse pointer-events-none" style={{ animationDelay: '2s' }} />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header & Search */}
        <div className="mb-12 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-6"
          >
            <div>
              <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight flex items-center gap-3">
                <Calendar className="text-blue-400 w-8 h-8 lg:w-10 lg:h-10" />
                Exam Timetable
              </h1>
              <p className="text-slate-400 mt-1 font-medium italic">Your upcoming academic schedule</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold text-sm tracking-widest uppercase">
                Active Session
              </span>
            </div>
          </motion.div>

          {/* Search Bar - Only show if there are exams */}
          {exams.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative group"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-lg opacity-50 group-focus-within:opacity-100 transition duration-500" />
              <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center p-2">
                <Search className="w-5 h-5 text-slate-500 ml-4 shrink-0" />
                <input
                  type="text"
                  placeholder="Search by subject name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-transparent border-none w-full py-3 px-4 focus:ring-0 text-white placeholder:text-slate-600 font-medium"
                />
              </div>
            </motion.div>
          )}
        </div>

        {/* Timetable Content */}
        <div className="space-y-12 pb-24">
          {Object.keys(groupedExams).length > 0 ? (
            Object.entries(groupedExams).map(([date, exams], dateIdx) => (
              <motion.div
                key={date}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: dateIdx * 0.1 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-4">
                  <div className="px-5 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-black uppercase tracking-widest shadow-[0_0_20px_rgba(59,130,246,0.15)] backdrop-blur-md">
                    {date}
                  </div>
                  <div className="h-px flex-grow bg-gradient-to-r from-blue-500/20 to-transparent" />
                </div>

                <div className="grid gap-5">
                  {exams.map((exam, idx) => (
                    <motion.div
                      key={exam._id || idx}
                      whileHover={{ x: 10, backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
                      className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 lg:p-8 rounded-[2.5rem] group transition-all"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/5 rounded-2xl flex items-center justify-center group-hover:from-blue-500/20 group-hover:to-purple-500/20 transition-all shrink-0 shadow-lg">
                            <Book className="w-8 h-8 text-blue-400" />
                          </div>
                          <div>
                            <h3 className="text-xl lg:text-2xl font-black text-white mb-2 group-hover:text-blue-400 transition-colors uppercase tracking-tight">{exam.subject}</h3>
                            <div className="flex flex-wrap items-center gap-5 text-sm font-bold text-slate-400">
                              <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5">
                                <Clock className="w-4 h-4 text-purple-400" /> {formatTime(exam.examdate)}
                              </span>
                              <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5">
                                <Hourglass className="w-4 h-4 text-purple-400" /> {exam.duration} Minutes
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between md:justify-end gap-8 border-t md:border-t-0 border-white/5 pt-5 md:pt-0">
                          <div className="text-right">
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Status</p>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                              <Sparkles className="w-3 h-3" /> Scheduled
                            </span>
                          </div>
                          <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-all">
                            <ChevronRight className="w-6 h-6" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-24 text-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] mt-8"
            >
              <div className="relative inline-block mb-10">
                <div className="absolute -inset-6 bg-blue-500/15 blur-3xl rounded-full animate-pulse" />
                <div className="w-28 h-28 bg-white/5 border border-white/10 rounded-full flex items-center justify-center relative shadow-2xl">
                  <AlertCircle className="w-12 h-12 text-slate-600" />
                </div>
              </div>
              <h2 className="text-3xl font-black text-white mb-3">Schedule Not Found</h2>
              <p className="text-slate-500 max-w-sm mx-auto font-medium leading-relaxed">
                {exams.length === 0
                  ? "The exam timetable has not been published yet. Please check back later or contact your instructor."
                  : "We couldn't find any exams matching your search criteria. Try a different subject name."}
              </p>
              {exams.length > 0 && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="mt-8 px-8 py-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-blue-400 font-black hover:bg-blue-500/20 transition-all uppercase tracking-widest text-sm"
                >
                  Reset Filters
                </button>
              )}
            </motion.div>
          )}
        </div>

        {/* Floating Indicator */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-white/5 backdrop-blur-xl border border-white/10 px-8 py-4 rounded-[2rem] flex items-center gap-4 text-xs font-black text-slate-400 shadow-2xl"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
          SYSTEM SYNCED & LIVE
        </motion.div>
      </div>
    </div>
  );
};

export default ViewTimetable;