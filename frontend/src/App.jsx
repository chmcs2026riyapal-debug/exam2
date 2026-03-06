import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import Home from './pages/Home';
import StudentLogin from './pages/StudentLogin';
import StudentDashboard from './pages/StudentDashboard';
import ViewReportCard from './pages/ViewReportCard';
import TeacherDashboard from './pages/TeacherDashboard';
import CreateReportCard from './pages/CreateReportCard';
import CreateTimetable from './pages/CreateTimetable';
import ManageTimetable from './pages/ManageTimetable';
import EditReportCard from './pages/EditReportCard';

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/student/login" element={<StudentLogin />} />
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/report/:id" element={<ViewReportCard />} />
        <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
        <Route path="/teacher/create-report" element={<CreateReportCard />} />
        <Route path="/teacher/create-timetable" element={<CreateTimetable />} />
        <Route path="/teacher/timetable" element={<ManageTimetable />} />
        <Route path="/teacher/edit/:id" element={<EditReportCard />} />
      </Routes>
    </AuthProvider>
  );
}

// ✅ YEH IMPORTANT HAI - default export
export default App;