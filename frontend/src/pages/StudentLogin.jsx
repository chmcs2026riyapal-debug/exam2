import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Calendar, Clock, ArrowRight, Info } from 'lucide-react';
import axios from '../lib/axios';
import toast from 'react-hot-toast';
import { formatDate, formatTime } from '../lib/util';

const StudentLogin = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [timetable, setTimetable] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    try {
      const response = await axios.get('/exams');
      setTimetable(response.data);
    } catch (error) {
      console.error('Fetch error:', error);
      // Demo data
      setTimetable([
        { _id: '1', subject: 'Mathematics', examdate: '2026-03-10T10:00:00', duration: 60 },
        { _id: '2', subject: 'Science', examdate: '2026-03-12T09:30:00', duration: 90 },
        { _id: '3', subject: 'English', examdate: '2026-03-15T11:00:00', duration: 60 },
        { _id: '4', subject: 'History', examdate: '2026-03-18T13:00:00', duration: 120 },
        { _id: '5', subject: 'Mathematics', examdate: '2026-03-20T10:00:00', duration: 60 }
      ]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email) {
      toast.error('Please enter your name and email');
      return;
    }

    setLoading(true);

    try {
      // Check if student exists
      const response = await axios.get('/users');
      const student = response.data.find(u =>
        u.role === 'student' &&
        u.name?.toLowerCase() === name.toLowerCase() &&
        u.email?.toLowerCase() === email.toLowerCase()
      );

      if (student) {
        // Store student info
        localStorage.setItem('student', JSON.stringify(student));
        toast.success(`Welcome ${student.name}!`);
        navigate(`/student/dashboard?email=${student.email}`);
      } else {
        toast.error('Student not found. Please check your name and email.');
      }
    } catch (error) {
      console.error('Login error:', error);
      // Demo mode
      const demoStudent = {
        _id: 'demo-student',
        name: name,
        email: email,
        role: 'student'
      };
      localStorage.setItem('student', JSON.stringify(demoStudent));
      toast.success('Demo login successful!');
      navigate(`/student/dashboard?email=${email}`);
    } finally {
      setLoading(false);
    }
  };

  const groupByDate = () => {
    const grouped = {};
    timetable.forEach(exam => {
      const date = formatDate(exam.examdate);
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(exam);
    });
    return grouped;
  };

  const groupedTimetable = groupByDate();

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 relative overflow-x-hidden flex items-center justify-center p-4 lg:p-12">
      {/* Dynamic Background Blobs */}
      <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] rounded-full bg-blue-600/20 blur-[100px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-5%] left-[-5%] w-[40vw] h-[40vw] rounded-full bg-purple-600/20 blur-[100px] animate-pulse pointer-events-none" style={{ animationDelay: '3s' }} />

      <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

        {/* Left Column: Login Card */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="relative group mt-8 lg:mt-0"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-[2rem] blur-2xl opacity-50 group-hover:opacity-100 transition duration-1000 hidden lg:block"></div>
          <div className="relative bg-white/5 backdrop-blur-2xl border border-white/10 p-8 lg:p-12 rounded-[2rem] shadow-2xl">
            <div className="mb-10 text-center lg:text-left">
              <h1 className="text-4xl font-bold text-white mb-2">Student Login</h1>
              <p className="text-slate-400">Enter your details to access your portal</p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 ml-1">Full Name</label>
                <div className="relative group/input">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within/input:text-blue-400 transition-colors" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 ml-1">Email Address</label>
                <div className="relative group/input">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within/input:text-blue-400 transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@university.edu"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-slate-600"
                  />
                </div>
              </div>

              {/* Demo Credentials Tooltip */}
              <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-xs text-blue-300">
                <Info className="w-4 h-4 mt-0.5 shrink-0" />
                <div>
                  <p><strong>Demo Credentials:</strong></p>
                  <p>Name: Student Demo</p>
                  <p>Email: student@demo.com</p>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn btn-lg h-16 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 border-none text-white text-lg font-bold rounded-2xl shadow-lg shadow-blue-500/25 group disabled:opacity-50"
              >
                {loading ? 'VERIFYING...' : 'VIEW MY REPORT CARD'}
                {!loading && <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link to="/" className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
                ← Back to Home
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Timetable */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="h-full"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 px-2 gap-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <Calendar className="text-purple-400" />
              Upcoming Exams
            </h2>
            <span className="badge badge-outline border-purple-500/50 text-purple-300 px-4 py-3 shrink-0">Live Timetable</span>
          </div>

          <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {Object.keys(groupedTimetable).length === 0 ? (
              <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10">
                <p className="text-slate-400">No exams scheduled currently.</p>
              </div>
            ) : (
              Object.entries(groupedTimetable).map(([date, dayExams]) => (
                <div key={date} className="relative pl-6">
                  <div className="absolute top-0 bottom-0 left-[11px] w-[2px] bg-gradient-to-b from-purple-500/30 to-blue-500/30" />

                  <h3 className="font-bold text-lg mb-4 text-purple-400 relative">
                    <span className="absolute -left-[18px] top-1.5 w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_10px_2px_rgba(192,132,252,0.5)]" />
                    {date}
                  </h3>

                  <div className="space-y-4">
                    {dayExams.map(exam => (
                      <motion.div
                        key={exam._id}
                        whileHover={{ x: 5 }}
                        className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-2xl hover:bg-white/10 transition-all group"
                      >
                        <div className="flex flex-col sm:flex-row justify-between gap-4">
                          <div className="space-y-1">
                            <h4 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">{exam.subject}</h4>
                            <div className="flex items-center gap-4 text-sm text-slate-400">
                              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-slate-500" /> {formatTime(exam.examdate)}</span>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <div className="badge bg-purple-500/20 text-purple-300 border-none px-4 py-3 font-medium shrink-0">
                              {exam.duration} min
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="mt-6 text-sm text-slate-500 text-center">
            <p>Timetable is currently view-only.</p>
          </div>
        </motion.div>

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

export default StudentLogin;