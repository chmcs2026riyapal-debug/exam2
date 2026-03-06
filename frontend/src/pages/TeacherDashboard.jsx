import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users, FileText, Book, Activity, Search, Filter,
  Edit, Trash2, Eye, Plus, Calendar,
  LogOut, ChevronRight, User, Clock
} from 'lucide-react';
import axios from '../lib/axios';
import toast from 'react-hot-toast';
import { formatDate, formatTime } from '../lib/util';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [students, setStudents] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchBy, setSearchBy] = useState('name');
  const [filterSubject, setFilterSubject] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  const [stats, setStats] = useState({
    totalStudents: 0,
    totalExams: 0,
    averageScore: 0,
    totalReportCards: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (students.length > 0) {
      filterStudents();
    }
    if (exams.length > 0) {
      filterReportCards();
    }
  }, [searchTerm, searchBy, students, exams, filterSubject, sortBy]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const examsRes = await axios.get('/exams');
      const usersRes = await axios.get('/users');
      const studentsList = usersRes.data.filter(u => u.role === 'student');

      const studentNameMap = {};
      studentsList.forEach(s => {
        studentNameMap[s.email] = s.name;
        studentNameMap[s._id] = s.name;
      });

      const examsWithNames = examsRes.data.map(exam => {
        let studentName = 'Unknown';
        let studentEmail = exam.studentEmail || 'unknown@email.com';

        if (exam.studentName) studentName = exam.studentName;
        else if (exam.studentEmail && studentNameMap[exam.studentEmail]) studentName = studentNameMap[exam.studentEmail];
        else if (exam.studentId && studentNameMap[exam.studentId]) studentName = studentNameMap[exam.studentId];
        else if (exam.studentEmail) studentName = exam.studentEmail.split('@')[0];

        return { ...exam, studentName, studentEmail };
      });

      setExams(examsWithNames);
      setFilteredExams(examsWithNames);

      const studentsWithAvg = studentsList.map(student => {
        const studentExams = examsWithNames.filter(exam => exam.studentEmail === student.email);
        const totalPercentage = studentExams.reduce((sum, exam) => sum + (exam.Average_Score || 0), 0);
        const avgPercentage = studentExams.length > 0 ? (totalPercentage / studentExams.length).toFixed(2) : '0.00';
        return { ...student, averageScore: avgPercentage, examCount: studentExams.length, exams: studentExams };
      });

      setStudents(studentsWithAvg);
      setFilteredStudents(studentsWithAvg);

      // Calculate overall average based on passed exams, or all exams if preferred. Here we take all exams.
      const totalScore = examsWithNames.reduce((sum, exam) => sum + (exam.Average_Score || 0), 0);
      const avgScore = examsWithNames.length > 0 ? (totalScore / examsWithNames.length).toFixed(2) : '0.00';

      setStats({
        totalStudents: studentsList.length,
        totalExams: new Set(examsWithNames.map(e => e.subject)).size, // Unique subjects count
        averageScore: avgScore,
        totalReportCards: examsWithNames.length
      });

    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const filterStudents = () => {
    // Hidden filter logic, preserved without the UI component in this sleek redesign aiming at report cards mainly.
    // If you need the modal back, you can adapt the student table UI accordingly.
    if (!searchTerm.trim()) { setFilteredStudents(students); return; }
    const term = searchTerm.toLowerCase().trim();
    const filtered = students.filter(student => student.name?.toLowerCase().includes(term));
    setFilteredStudents(filtered);
  };

  const filterReportCards = () => {
    let filtered = [...exams];
    if (filterSubject !== 'all') {
      filtered = filtered.filter(exam => exam.subject === filterSubject);
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(exam =>
        exam.subject?.toLowerCase().includes(term) ||
        exam.studentName?.toLowerCase().includes(term)
      );
    }
    filtered.sort((a, b) => {
      if (sortBy === 'date') return new Date(b.examdate) - new Date(a.examdate);
      else if (sortBy === 'score') return b.Average_Score - a.Average_Score;
      else if (sortBy === 'name') return (a.subject || '').localeCompare(b.subject || '');
      return 0;
    });
    setFilteredExams(filtered);
  };

  const handleDeleteExam = async (examId) => {
    if (window.confirm('Are you sure you want to delete this report card?')) {
      try {
        await axios.delete(`/exams/${examId}`);
        toast.success('Report card deleted successfully');
        fetchData();
      } catch (error) {
        console.error('Delete error:', error);
        toast.error('Failed to delete report card');
      }
    }
  };

  const getUniqueSubjects = () => {
    const subjectsList = exams.map(e => e.subject).filter(Boolean);
    return ['all', ...new Set(subjectsList)];
  };

  const groupTimetableByDate = () => {
    const grouped = {};
    const upcomingExams = exams.filter(exam => new Date(exam.examdate) >= new Date(new Date().setHours(0, 0, 0, 0)));
    upcomingExams.forEach(exam => {
      const date = formatDate(exam.examdate);
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(exam);
    });
    // Sort dates
    return Object.keys(grouped).sort((a, b) => new Date(a) - new Date(b)).reduce((obj, key) => {
      obj[key] = grouped[key];
      return obj;
    }, {});
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const subjectsList = getUniqueSubjects();
  const groupedTimetable = groupTimetableByDate();

  const statCards = [
    { label: 'Total Students', value: stats.totalStudents, icon: <Users className="w-6 h-6 text-blue-400" />, trend: 'Active', color: 'blue' },
    { label: 'Report Cards', value: stats.totalReportCards, icon: <FileText className="w-6 h-6 text-purple-400" />, trend: 'Generated', color: 'purple' },
    { label: 'Unique Exams', value: stats.totalExams, icon: <Book className="w-6 h-6 text-indigo-400" />, trend: 'Subjects', color: 'indigo' },
    { label: 'Average Score', value: `${stats.averageScore}%`, icon: <Activity className="w-6 h-6 text-emerald-400" />, trend: 'Overall', color: 'emerald' },
  ];

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 p-4 lg:p-8 relative overflow-hidden">
      {/* Background Animated Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-600/10 blur-[120px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-purple-600/10 blur-[120px] animate-pulse pointer-events-none" style={{ animationDelay: '2s' }} />

      <div className="max-w-[1600px] mx-auto relative z-10">

        {/* Header */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] shadow-xl"
        >
          <div>
            <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight">Teacher Dashboard</h1>
            <p className="text-slate-400 mt-1">Manage your students, report cards, and schedule</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center btn bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-6 py-2.5 rounded-xl transition-all"
            >
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </button>
          </div>
        </motion.header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl group shadow-lg"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-white/10 transition-colors">
                  {stat.icon}
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-lg ${stat.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400'}`}>
                  {stat.trend}
                </span>
              </div>
              <h3 className="text-3xl font-black text-white mb-1">{stat.value}</h3>
              <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <motion.button
            onClick={() => navigate('/teacher/create-report')}
            whileHover={{ scale: 1.01 }}
            className="group outline-none w-full relative p-8 rounded-3xl bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-blue-500/30 text-left overflow-hidden shadow-xl"
          >
            <Plus className="absolute -right-4 -bottom-4 w-32 h-32 text-blue-500/10 rotate-12 group-hover:rotate-0 group-hover:scale-110 transition-transform duration-500" />
            <h3 className="text-xl font-bold text-white mb-2">Create New Report Card</h3>
            <p className="text-slate-400 text-sm max-w-xs mb-6">Instantly generate a performance record and assign marks for any student in the database.</p>
            <div className="flex items-center text-blue-400 font-bold gap-2 group-hover:gap-3 transition-all">
              Get Started <ChevronRight className="w-5 h-5" />
            </div>
          </motion.button>

          <motion.button
            onClick={() => navigate('/teacher/timetable')}
            whileHover={{ scale: 1.01 }}
            className="group outline-none w-full relative p-8 rounded-3xl bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 text-left overflow-hidden shadow-xl"
          >
            <Calendar className="absolute right-0 -bottom-4 w-32 h-32 text-purple-500/10 rotate-12 group-hover:rotate-0 group-hover:scale-110 transition-transform duration-500" />
            <h3 className="text-xl font-bold text-white mb-2">Manage Exam Timetable</h3>
            <p className="text-slate-400 text-sm max-w-xs mb-6">Schedule new examinations or modify existing dates, venues, and durations for upcoming tests.</p>
            <div className="flex items-center text-purple-400 font-bold gap-2 group-hover:gap-3 transition-all">
              View Schedule <ChevronRight className="w-5 h-5" />
            </div>
          </motion.button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Table Section - Report Cards */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
              <div className="p-6 lg:p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/5">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <FileText className="text-blue-400 w-6 h-6" /> All Report Cards
                </h2>

                {/* Advanced Filters */}
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                  <div className="relative w-full sm:w-auto">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search students..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-[#0f172a]/50 border border-white/10 rounded-xl py-2.5 pl-11 pr-4 focus:ring-2 focus:ring-blue-500/50 outline-none w-full sm:w-64 text-sm text-white transition-all"
                    />
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <select
                      value={filterSubject}
                      onChange={(e) => setFilterSubject(e.target.value)}
                      className="w-full sm:w-auto bg-[#0f172a]/50 border border-white/10 rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-blue-500/50 outline-none text-sm text-slate-300 appearance-none"
                    >
                      {subjectsList.map(subject => (
                        <option key={subject} value={subject} className="bg-[#0f172a]">
                          {subject === 'all' ? 'All Subjects' : subject}
                        </option>
                      ))}
                    </select>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full sm:w-auto bg-[#0f172a]/50 border border-white/10 rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-blue-500/50 outline-none text-sm text-slate-300 appearance-none"
                    >
                      <option value="date" className="bg-[#0f172a]">Sort by Date</option>
                      <option value="score" className="bg-[#0f172a]">Sort by Score</option>
                      <option value="name" className="bg-[#0f172a]">Sort by Subject</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-[#0f172a]/60">
                    <tr className="text-slate-400 text-xs uppercase tracking-widest font-bold border-b border-white/10">
                      <th className="px-6 py-5 whitespace-nowrap">Student</th>
                      <th className="px-6 py-5 whitespace-nowrap">Subject</th>
                      <th className="px-6 py-5 whitespace-nowrap hidden md:table-cell">Date</th>
                      <th className="px-6 py-5 whitespace-nowrap">Marks</th>
                      <th className="px-6 py-5 whitespace-nowrap">Status</th>
                      <th className="px-6 py-5 text-right whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredExams.length > 0 ? filteredExams.map((exam) => {
                      const percentage = parseFloat(exam.Average_Score) || 0;
                      const isPassed = percentage >= 40;
                      return (
                        <tr key={exam._id} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                                <User className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="font-bold text-white md:truncate md:max-w-[150px]">{exam.studentName}</div>
                                <div className="text-xs text-slate-500 md:truncate md:max-w-[150px]">{exam.studentEmail}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-300 font-medium">{exam.subject}</td>
                          <td className="px-6 py-4 text-slate-400 text-sm hidden md:table-cell">{formatDate(exam.examdate)}</td>
                          <td className="px-6 py-4">
                            <div className="font-black text-white">{exam.marks_Attempt} <span className="text-slate-500 text-xs font-normal">/ {exam.totalMarks || 100}</span></div>
                            <div className="w-20 md:w-24 h-1.5 bg-white/5 rounded-full mt-1.5 overflow-hidden">
                              <div className={`h-full ${isPassed ? 'bg-emerald-500' : 'bg-red-500'}`} style={{ width: `${Math.min(percentage, 100)}%` }} />
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-lg border text-[10px] sm:text-xs font-bold tracking-wider ${isPassed ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                              {isPassed ? 'PASS' : 'FAIL'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-1 md:gap-2">
                              <button
                                onClick={() => navigate(`/student/report/${exam._id}`)}
                                className="p-2 md:p-2.5 hover:bg-blue-500/20 text-slate-400 hover:text-blue-400 rounded-xl transition-colors"
                                title="View Report Note"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => navigate(`/teacher/edit/${exam.studentId || exam._id}`)}
                                className="p-2 md:p-2.5 hover:bg-purple-500/20 text-slate-400 hover:text-purple-400 rounded-xl transition-colors"
                                title="Edit Report Card"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteExam(exam._id)}
                                className="p-2 md:p-2.5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-xl transition-colors"
                                title="Delete Record"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }) : (
                      <tr>
                        <td colSpan="6" className="py-16 text-center text-slate-500">
                          <div className="flex flex-col items-center">
                            <FileText className="w-12 h-12 text-slate-700 mb-3" />
                            <p>No report cards found matching the filters.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar Section - Timetable */}
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 shadow-xl sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-400" /> Upcoming Schedule
                </h3>
              </div>

              <div className="space-y-4 mb-8 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {Object.keys(groupedTimetable).length > 0 ? (
                  Object.entries(groupedTimetable).slice(0, 5).map(([date, dayExams]) => (
                    <div key={date} className="mb-4">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-2 mb-2">{date}</h4>
                      <div className="space-y-2">
                        {dayExams.map((exam, i) => {
                          const examDate = new Date(exam.examdate);
                          const day = examDate.getDate().toString().padStart(2, '0');
                          const monthStr = examDate.toLocaleString('default', { month: 'short' }).toUpperCase();
                          return (
                            <div key={exam._id || i} className="flex gap-4 p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-purple-500/30 hover:bg-white/10 transition-all group">
                              <div className="bg-purple-500/10 px-3 py-2 rounded-xl text-center min-w-[55px] shrink-0 border border-purple-500/20">
                                <span className="block text-[10px] font-bold text-purple-400">{monthStr}</span>
                                <span className="block text-lg font-black text-white leading-tight">{day}</span>
                              </div>
                              <div className="overflow-hidden">
                                <h4 className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors truncate">{exam.subject}</h4>
                                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5"><Clock className="w-3 h-3" /> {formatTime(exam.examdate)} ({exam.duration}m)</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-slate-500 text-sm">No upcoming exams.</p>
                  </div>
                )}
              </div>

              <button
                onClick={() => navigate('/teacher/timetable')}
                className="w-full py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-slate-300 transition-all uppercase tracking-widest"
              >
                Manage Full Timetable
              </button>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(255, 255, 255, 0.2);
        }
      `}} />
    </div>
  );
};

export default TeacherDashboard;