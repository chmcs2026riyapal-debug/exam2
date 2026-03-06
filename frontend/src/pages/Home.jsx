import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, LayoutDashboard, CheckCircle2, ArrowRight, BookOpen, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const Home = () => {
  const navigate = useNavigate();

  // Animation variants for the glass cards
  const cardVariants = {
    hover: {
      scale: 1.02,
      translateY: -10,
      transition: { type: "spring", stiffness: 300 }
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 overflow-x-hidden relative">
      {/* Animated Background Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/20 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-12 lg:py-24">
        {/* Hero Section */}
        <header className="text-center mb-16 lg:mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400">
              Online Examination <br /> System
            </h1>
            <p className="max-w-2xl mx-auto text-lg lg:text-xl text-slate-400 leading-relaxed">
              Empowering students and teachers with a seamless, high-performance evaluation platform.
              Precision, security, and insight in every click.
            </p>
          </motion.div>
        </header>

        {/* Portals Grid */}
        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">

          {/* Student Portal Card */}
          <motion.div
            variants={cardVariants}
            whileHover="hover"
            className="group relative"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative h-full p-8 lg:p-12 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 flex flex-col">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-blue-500/20 rounded-2xl">
                  <GraduationCap className="w-8 h-8 text-blue-400" />
                </div>
                <h2 className="text-3xl font-bold text-white">Student Portal</h2>
              </div>

              <ul className="space-y-4 mb-10 flex-grow">
                {[
                  { icon: <CheckCircle2 className="w-5 h-5" />, text: 'View Digital Report Cards' },
                  { icon: <Clock className="w-5 h-5" />, text: 'Check Real-time Timetables' },
                  { icon: <BookOpen className="w-5 h-5" />, text: 'Access Study Resources' }
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-slate-300">
                    <span className="text-blue-400">{item.icon}</span>
                    {item.text}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => navigate('/student/login')}
                className="btn btn-lg bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 border-none text-white shadow-xl shadow-blue-500/20 group w-full"
              >
                ENTER STUDENT VIEW
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>

          {/* Teacher Portal Card */}
          <motion.div
            variants={cardVariants}
            whileHover="hover"
            className="group relative"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative h-full p-8 lg:p-12 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 flex flex-col">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-purple-500/20 rounded-2xl">
                  <LayoutDashboard className="w-8 h-8 text-purple-400" />
                </div>
                <h2 className="text-3xl font-bold text-white">Teacher Portal</h2>
              </div>

              <ul className="space-y-4 mb-10 flex-grow">
                {[
                  { icon: <CheckCircle2 className="w-5 h-5" />, text: 'Create & Manage Exams' },
                  { icon: <CheckCircle2 className="w-5 h-5" />, text: 'Evaluate Performance Analytics' },
                  { icon: <CheckCircle2 className="w-5 h-5" />, text: 'Automated Grading Tools' }
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-slate-300">
                    <span className="text-purple-400">{item.icon}</span>
                    {item.text}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => navigate('/teacher/dashboard')}
                className="btn btn-lg bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 border-none text-white shadow-xl shadow-purple-500/20 group w-full"
              >
                ENTER TEACHER VIEW
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>

        </div>

        {/* Simple Footer/Info */}
        <footer className="mt-24 text-center text-slate-500 text-sm">
          <p>© 2026 ExamPro Systems. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default Home;