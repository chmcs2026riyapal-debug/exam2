import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  GraduationCap, LogOut, Book, Trophy, Target,
  ClipboardList, Calendar, Clock, ChevronRight,
  TrendingUp, Award, BarChart3, ShieldAlert
} from 'lucide-react';
import axios from '../lib/axios';
import toast from 'react-hot-toast';
import { formatDate, formatTime } from '../lib/util';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [student, setStudent] = useState(null);
  const [exams, setExams] = useState([]); // Student's own report cards
  const [timetable, setTimetable] = useState([]); // Upcoming exams
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    let email = params.get('email');

    if (!email) {
      const savedStudent = localStorage.getItem('student');
      if (savedStudent) {
        const studentData = JSON.parse(savedStudent);
        email = studentData.email;
        setStudent(studentData);
      }
    }

    if (!email) {
      navigate('/student/login');
      return;
    }

    fetchStudentData(email);
  }, [location, navigate]);

  const fetchStudentData = async (email) => {
    try {
      setLoading(true);

      const examsRes = await axios.get('/exams');

      // Filter for student's report cards based on email
      const studentExams = examsRes.data.filter(exam => {
        const examEmail = exam.studentEmail?.toLowerCase().trim();
        const studentEmail = email.toLowerCase().trim();
        return examEmail === studentEmail;
      });

      setExams(studentExams);

      // Filter for all public upcoming exams for the timetable
      const now = new Date();
      const upcomingExams = examsRes.data.filter(exam =>
        new Date(exam.examdate) > now
      ).sort((a, b) => new Date(a.examdate) - new Date(b.examdate));

      setTimetable(upcomingExams);

      // Setup student info safely
      if (studentExams.length > 0) {
        setStudent({
          name: studentExams[0].studentName || email.split('@')[0],
          email: email
        });
      } else {
        setStudent({
          name: email.split('@')[0],
          email: email
        });
      }

    } catch (error) {
      console.error('Fetch error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      toast.error(`Failed to fetch report cards: ${error.message}`);
    } finally {
      setLoading(false);
    }

  };

  const handleLogout = () => {
    localStorage.removeItem('student');
    navigate('/');
  };

  const calculateAverage = () => {
    if (exams.length === 0) return 0;
    const total = exams.reduce((sum, exam) => sum + (exam.Average_Score || 0), 0);
    return (total / exams.length).toFixed(1);
  };

  const totalAttempts = exams.reduce((sum, exam) => sum + (exam.total_Attempt || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Dashboard Stats array for mapping
  const stats = [
    { label: 'Total Subjects', value: exams.length.toString(), icon: <Book className="w-6 h-6" />, color: 'from-blue-500 to-cyan-400' },
    { label: 'Average Score', value: `${calculateAverage()}%`, icon: <Trophy className="w-6 h-6" />, color: 'from-emerald-400 to-green-500' },
    { label: 'Total Attempts', value: totalAttempts.toString(), icon: <Target className="w-6 h-6" />, color: 'from-purple-500 to-pink-500' },
  ];

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 p-4 lg:p-8 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[50vw] h-[50vw] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
              <GraduationCap className="text-white w-8 h-8" />
            </div>
            <div className="truncate">
              <h1 className="text-2xl font-bold text-white truncate">Welcome, {student?.name}!</h1>
              <p className="text-slate-400 text-sm truncate">{student?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="btn bg-gradient-to-r from-red-500/20 to-pink-500/20 hover:from-red-500/30 hover:to-pink-500/30 border border-red-500/30 text-red-400 rounded-xl px-6 min-h-[3rem] h-12"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </button>
        </motion.header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ translateY: -5 }}
              className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-3xl relative overflow-hidden group"
            >
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`} />
              <div className="flex items-start justify-between relative z-10">
                <div>
                  <p className="text-slate-400 text-sm font-medium mb-1">{stat.label}</p>
                  <h3 className="text-3xl font-bold text-white">{stat.value}</h3>
                </div>
                <div className={`p-3 rounded-2xl bg-gradient-to-br ${stat.color} bg-opacity-20 text-white shadow-lg`}>
                  {stat.icon}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Content: Report Cards */}
          <div className="xl:col-span-2 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-2 gap-2">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <ClipboardList className="text-blue-400 w-5 h-5" />
                My Report Cards
              </h2>
            </div>

            {exams.length === 0 ? (
              <div className="text-center py-16 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl">
                <div className="mx-auto w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
                  <ShieldAlert className="w-8 h-8 text-blue-400" />
                </div>
                <p className="text-xl text-slate-300 font-semibold mb-2">No report cards found.</p>
                <p className="text-slate-500">You currently have no graded exams published.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {exams.map((exam, idx) => (
                  <motion.div
                    key={exam._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 + idx * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-3xl group flex flex-col h-full"
                  >
                    <div className="flex justify-between items-start mb-4 gap-2">
                      <h3 className="font-bold text-lg text-white group-hover:text-blue-400 transition-colors line-clamp-2">{exam.subject}</h3>
                      <span className={`badge border-none shrink-0 ${exam.Average_Score >= 40 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'} text-xs font-bold py-3 px-3`}>
                        {exam.Average_Score >= 40 ? 'PASSED' : 'FAILED'}
                      </span>
                    </div>

                    <div className="space-y-3 mb-6 flex-grow">
                      <div className="flex justify-between text-sm py-2 border-b border-white/5">
                        <span className="text-slate-500">Exam Date</span>
                        <span className="text-slate-200">{formatDate(exam.examdate)}</span>
                      </div>
                      <div className="flex justify-between text-sm py-2 border-b border-white/5">
                        <span className="text-slate-500">Marks Secured</span>
                        <span className="text-slate-200 font-semibold">{exam.marks_Attempt}/{exam.totalMarks}</span>
                      </div>
                      <div className="flex justify-between text-sm py-2">
                        <span className="text-slate-500">Attempt No.</span>
                        <span className="text-slate-200">{exam.total_Attempt} of 3</span>
                      </div>
                    </div>

                    <Link
                      to={`/student/report/${exam._id}`}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600/20 to-blue-500/20 border border-blue-500/30 hover:from-blue-600/40 hover:to-blue-500/40 text-blue-300 font-semibold transition-all flex items-center justify-center group/btn"
                    >
                      View Full Report
                      <ChevronRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar: Upcoming Exams */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 px-2">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Calendar className="text-purple-400 w-5 h-5" />
                Live Timetable
              </h2>
            </div>

            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
              {timetable.length === 0 ? (
                <div className="p-8 text-center border-b border-white/5">
                  <p className="text-slate-400">No upcoming exams.</p>
                </div>
              ) : (
                <div className="p-2 space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar">
                  {timetable.map((exam, idx) => {
                    const parsedDate = new Date(exam.examdate);
                    const month = parsedDate.toLocaleString('default', { month: 'short' });
                    const day = parsedDate.getDate();

                    return (
                      <motion.div
                        key={exam._id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * idx }}
                        className="p-4 hover:bg-white/5 rounded-2xl transition-colors group"
                      >
                        <div className="flex gap-4 items-center">
                          <div className="flex flex-col items-center justify-center min-w-[55px] h-[55px] bg-purple-500/10 rounded-xl border border-purple-500/20 shrink-0">
                            <span className="text-[10px] uppercase font-bold text-purple-400 leading-none">{month}</span>
                            <span className="text-xl font-black text-white leading-tight">{day}</span>
                          </div>
                          <div className="flex-grow min-w-0">
                            <h4 className="text-sm font-bold text-white mb-1 group-hover:text-purple-400 transition-colors truncate">{exam.subject}</h4>
                            <div className="flex items-center gap-3 text-xs text-slate-400">
                              <span className="flex items-center"><Clock className="w-3 h-3 mr-1 text-slate-500" /> {formatTime(exam.examdate)}</span>
                              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-white/5">{exam.duration}m</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Performance Mini-Card */}
            <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-md border border-white/10 p-6 rounded-3xl relative overflow-hidden group">
              <TrendingUp className="absolute top-[-10px] right-[-10px] w-24 h-24 text-white/5 -rotate-12 group-hover:rotate-0 transition-transform duration-500" />
              <div className="relative z-10">
                <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                  <Award className="w-4 h-4 text-yellow-400" />
                  Keep it up!
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Consistently check your report cards to identify areas of improvement. Good luck with your upcoming exams!
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
};

export default StudentDashboard;