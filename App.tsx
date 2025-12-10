import React, { useState, useEffect } from 'react';
import { Student, RiskTier, AIStudentAnalysis } from './types';
import { Dashboard } from './components/Dashboard';
import { StudentProfile } from './components/StudentProfile';
import { generateCohortInsights } from './services/geminiService';
import { LayoutDashboard, Users, FileText, Settings, Bell, GraduationCap } from 'lucide-react';

const MOCK_TOPICS = ["Calculus II", "Data Structures", "Linear Algebra", "Database Systems", "Ethics"];

// Helper to generate mock data for demo
const generateMockData = (): Student[] => {
  return Array.from({ length: 25 }, (_, i) => {
    const isRisk = Math.random() > 0.7;
    const isCritical = isRisk && Math.random() > 0.6;
    const baseScore = isCritical ? 45 : isRisk ? 62 : 85;
    
    return {
      id: `STD-${2024000 + i}`,
      name: `Student ${String.fromCharCode(65 + (i % 26))}${i}`,
      email: `student${i}@university.edu`,
      cohort: "CS-2025-A",
      attendanceRate: Math.min(100, Math.max(40, baseScore + (Math.random() * 20 - 10))),
      overallGrade: Math.min(100, Math.max(30, baseScore + (Math.random() * 15 - 7))),
      riskTier: isCritical ? RiskTier.CRITICAL : isRisk ? RiskTier.HIGH : Math.random() > 0.5 ? RiskTier.MEDIUM : RiskTier.LOW,
      riskScore: isCritical ? 85 + Math.random() * 15 : isRisk ? 65 + Math.random() * 20 : Math.random() * 30,
      assessments: [
        { id: `A1-${i}`, name: "Midterm Exam", type: 'Exam', score: Math.floor(baseScore * 0.9), maxScore: 100, topic: "Calculus II", date: "2024-03-15" },
        { id: `A2-${i}`, name: "SQL Project", type: 'Project', score: Math.floor(baseScore * 1.1), maxScore: 100, topic: "Database Systems", date: "2024-04-02" },
        { id: `A3-${i}`, name: "Quiz 3", type: 'Quiz', score: Math.floor(baseScore * 0.85), maxScore: 20, topic: "Data Structures", date: "2024-04-10" },
      ],
      engagement: {
        lmsLoginFrequency: Math.floor(baseScore / 10),
        avgSessionDuration: 45,
        assignmentsSubmitted: 8,
        assignmentsTotal: 10,
        videoWatchPercentage: baseScore
      }
    };
  });
};

function App() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [cohortInsights, setCohortInsights] = useState<string | null>(null);
  const [view, setView] = useState<'dashboard' | 'students' | 'settings'>('dashboard');

  const handleGenerateData = () => {
    const data = generateMockData();
    setStudents(data);
    // Trigger cohort insight generation
    generateCohortInsights(data).then(setCohortInsights).catch(console.error);
  };

  const handleUpdateStudentAnalysis = (id: string, analysis: AIStudentAnalysis) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, aiAnalysis: analysis } : s));
    if (selectedStudent?.id === id) {
        setSelectedStudent(prev => prev ? { ...prev, aiAnalysis: analysis } : null);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shadow-xl z-20">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white">
            <GraduationCap className="w-5 h-5" />
          </div>
          <h1 className="text-white font-bold text-lg tracking-tight">EdPulse AI</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => { setView('dashboard'); setSelectedStudent(null); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${view === 'dashboard' && !selectedStudent ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </button>
          <button 
            onClick={() => { setView('students'); setSelectedStudent(null); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${view === 'students' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}
          >
            <Users className="w-5 h-5" />
            <span>Students</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors">
            <FileText className="w-5 h-5" />
            <span>Reports</span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
            <div className="flex items-center gap-3 px-4 py-2">
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">AD</div>
                <div>
                    <p className="text-sm font-medium text-white">Admin User</p>
                    <p className="text-xs text-slate-500">Computer Science Dept</p>
                </div>
            </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm z-10">
            <h2 className="text-xl font-semibold text-slate-800">
                {selectedStudent ? 'Student Profile' : view === 'dashboard' ? 'Performance Overview' : 'Student Directory'}
            </h2>
            <div className="flex items-center gap-4">
                <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors relative">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
                <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                    <Settings className="w-5 h-5" />
                </button>
            </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-auto p-8 bg-slate-50/50">
            <div className="max-w-7xl mx-auto">
                {selectedStudent ? (
                    <StudentProfile 
                        student={selectedStudent} 
                        onBack={() => setSelectedStudent(null)}
                        onUpdateStudent={handleUpdateStudentAnalysis}
                    />
                ) : (
                    <Dashboard 
                        students={students} 
                        onSelectStudent={setSelectedStudent} 
                        onGenerateData={handleGenerateData}
                        insights={cohortInsights}
                    />
                )}
            </div>
        </div>
      </main>
    </div>
  );
}

export default App;
