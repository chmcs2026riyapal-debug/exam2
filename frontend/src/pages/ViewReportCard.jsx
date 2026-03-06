import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Printer, User, Mail, Calendar,
  Book, Clock, Target, CheckCircle2,
  AlertCircle, History
} from 'lucide-react';
import axios from '../lib/axios';
import { formatDate, formatTime } from '../lib/util';

const ViewReportCard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExamDetails();
  }, [id]);

  const fetchExamDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/exams/${id}`);
      setExam(response.data);
    } catch (error) {
      console.error('Fetch error:', error);
      // Demo fallback removed for cleaner production code, 
      // but let's keep a graceful error state if not found.
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold">Report Card Not Found</h2>
        <button
          onClick={() => navigate(-1)}
          className="mt-6 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
        >
          Go Back
        </button>
      </div>
    );
  }

  const percentage = exam.Average_Score || 0;
  const marksFormat = `${exam.marks_Attempt || 0}`;
  const totalMarksFormat = `${exam.totalMarks || 100}`;
  const status = percentage >= 40 ? 'PASSED' : 'FAILED';

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 p-4 lg:p-12 relative overflow-x-hidden">
      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-600/10 blur-[120px] animate-pulse pointer-events-none print:hidden" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-purple-600/10 blur-[120px] animate-pulse pointer-events-none print:hidden" style={{ animationDelay: '2s' }} />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Top Navigation Bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4 print:hidden"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex w-full sm:w-auto items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-slate-300"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex w-full sm:w-auto gap-3">
            <button
              onClick={handlePrint}
              className="flex w-full sm:w-auto items-center justify-center gap-2 px-6 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 transition-all text-blue-400 font-medium tracking-wide"
            >
              <Printer className="w-4 h-4" />
              Print Report
            </button>
          </div>
        </motion.div>

        {/* Main Report Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#0f172a]/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl print:shadow-none print:border-none print:rounded-none"
        >
          {/* Section 1: Info & Details Header */}
          <div className="p-6 lg:p-12 border-b border-white/10 bg-white/5 print:border-slate-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-4">Student Identification</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 print:text-blue-600"><User className="w-4 h-4" /></div>
                      <span className="text-xl font-bold text-white print:text-black">{exam.studentName || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400 print:text-purple-600"><Mail className="w-4 h-4" /></div>
                      <span className="text-slate-400 print:text-slate-700">{exam.studentEmail || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 lg:gap-6">
                <div className="space-y-1">
                  <span className="text-xs text-slate-500 flex items-center gap-1.5"><Book className="w-3 h-3" /> Subject</span>
                  <p className="font-semibold text-white print:text-black">{exam.subject}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-slate-500 flex items-center gap-1.5"><Calendar className="w-3 h-3" /> Date</span>
                  <p className="font-semibold text-white print:text-black">{formatDate(exam.examdate)}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-slate-500 flex items-center gap-1.5"><Clock className="w-3 h-3" /> Duration</span>
                  <p className="font-semibold text-white print:text-black">{exam.duration || 60} mins</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-slate-500 flex items-center gap-1.5"><Target className="w-3 h-3" /> Attempt</span>
                  <p className="font-semibold text-white print:text-black">#0{exam.total_Attempt || 1}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Visual Marks Summary */}
          <div className="p-6 lg:p-12 print:py-8">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
              <div className="flex-1 space-y-2 text-center lg:text-left w-full">
                <h4 className="text-lg font-medium text-slate-400 print:text-slate-600">Total Marks Obtained</h4>
                <div className="flex items-baseline justify-center lg:justify-start gap-2">
                  <span className="text-7xl lg:text-8xl font-black text-white print:text-black">{marksFormat}</span>
                  <span className="text-2xl font-bold text-slate-600 print:text-slate-400">/ {totalMarksFormat}</span>
                </div>
                <div className="h-3 w-full max-w-md bg-white/5 rounded-full overflow-hidden mt-6 print:hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-8 w-full lg:w-auto justify-center">
                <div className="relative flex items-center justify-center">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5 print:text-slate-200" />
                    <motion.circle
                      cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent"
                      strokeDasharray={364.4}
                      initial={{ strokeDashoffset: 364.4 }}
                      animate={{ strokeDashoffset: 364.4 - (364.4 * Math.min(percentage, 100)) / 100 }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="text-blue-500 print:hidden"
                    />
                    {/* Fallback circle for printing */}
                    <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={364.4} strokeDashoffset={364.4 - (364.4 * Math.min(percentage, 100)) / 100} className="text-blue-500 hidden print:block" />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-2xl font-black text-white print:text-black">{percentage.toFixed(1)}%</span>
                  </div>
                </div>

                <div className={`p-8 rounded-3xl border w-full sm:w-auto ${status === 'PASSED' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.1)] print:border-emerald-500' : 'bg-red-500/10 border-red-500/30 text-red-400 shadow-[0_0_30px_rgba(239,68,68,0.1)] print:border-red-500'} text-center`}>
                  <div className="flex flex-col items-center gap-2">
                    {status === 'PASSED' ? <CheckCircle2 className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
                    <span className="text-2xl font-black tracking-tighter">{status}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Attempt History (Only show if history exists) */}
          {exam.attemptHistory && exam.attemptHistory.length > 0 && (
            <div className="p-6 lg:p-12 bg-white/5 border-t border-white/10 print:bg-transparent print:border-slate-800">
              <div className="flex items-center gap-2 mb-6">
                <History className="w-5 h-5 text-slate-400 print:text-slate-600" />
                <h4 className="text-lg font-bold text-white print:text-black">Attempt History</h4>
              </div>
              <div className="overflow-x-auto rounded-xl border border-white/5 print:border-slate-200">
                <table className="w-full text-left">
                  <thead className="bg-white/5 print:bg-slate-100">
                    <tr className="border-b border-white/10 print:border-slate-200 text-slate-400 print:text-slate-700 text-xs uppercase tracking-wider">
                      <th className="px-6 py-4 font-semibold">Attempt</th>
                      <th className="px-6 py-4 font-semibold">Date</th>
                      <th className="px-6 py-4 font-semibold">Marks</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {exam.attemptHistory.map((item, idx) => (
                      <tr key={idx} className="border-b border-white/5 print:border-slate-200 last:border-0 group">
                        <td className="px-6 py-4 text-white print:text-black font-medium">Attempt #0{idx + 1}</td>
                        <td className="px-6 py-4 text-slate-400 print:text-slate-600">{formatDate(item.date)}</td>
                        <td className="px-6 py-4 text-slate-200 print:text-black font-bold">{item.marks}/{exam.totalMarks || 100}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${item.percentage >= 40 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 print:border-emerald-500' : 'bg-red-500/10 border-red-500/20 text-red-400 print:border-red-500'}`}>
                            {item.percentage >= 40 ? 'PASSED' : 'FAILED'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 text-xs text-slate-500 print:text-slate-400">
                <p>Note: Maximum 3 attempts allowed per subject.</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-slate-500 text-sm flex items-center justify-center gap-4 print:mt-12">
          <p>Generated on {formatDate(new Date().toISOString())}</p>
          <div className="w-1 h-1 rounded-full bg-slate-700" />
          <p>University Examination Board</p>
        </div>
      </div>
    </div>
  );
};

export default ViewReportCard;