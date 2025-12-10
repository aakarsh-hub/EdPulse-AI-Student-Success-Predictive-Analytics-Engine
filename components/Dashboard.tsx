import React, { useMemo } from 'react';
import { Student, RiskTier } from '../types';
import { Users, AlertTriangle, TrendingDown, BookOpen, Search, ArrowUpRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface DashboardProps {
  students: Student[];
  onSelectStudent: (student: Student) => void;
  onGenerateData: () => void;
  insights: string | null;
}

const COLORS = {
  [RiskTier.LOW]: '#10b981', // Emerald 500
  [RiskTier.MEDIUM]: '#f59e0b', // Amber 500
  [RiskTier.HIGH]: '#f97316', // Orange 500
  [RiskTier.CRITICAL]: '#ef4444' // Red 500
};

export const Dashboard: React.FC<DashboardProps> = ({ students, onSelectStudent, onGenerateData, insights }) => {
  const stats = useMemo(() => {
    const riskCounts = {
      [RiskTier.LOW]: 0,
      [RiskTier.MEDIUM]: 0,
      [RiskTier.HIGH]: 0,
      [RiskTier.CRITICAL]: 0
    };
    students.forEach(s => riskCounts[s.riskTier]++);
    
    const total = students.length;
    const criticalRisk = riskCounts[RiskTier.CRITICAL] + riskCounts[RiskTier.HIGH];
    const avgAttendance = students.reduce((acc, s) => acc + s.attendanceRate, 0) / (total || 1);

    const pieData = Object.entries(riskCounts).map(([name, value]) => ({ name, value }));
    
    return { riskCounts, total, criticalRisk, avgAttendance, pieData };
  }, [students]);

  const sortedStudents = [...students].sort((a, b) => b.riskScore - a.riskScore);

  if (students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-6 text-center p-12">
        <div className="bg-slate-100 p-6 rounded-full">
            <Users className="w-16 h-16 text-slate-400" />
        </div>
        <div>
            <h2 className="text-2xl font-bold text-slate-800">No Data Loaded</h2>
            <p className="text-slate-500 mt-2 max-w-md">Upload a CSV file containing student records, assessments, and attendance logs to begin analysis.</p>
        </div>
        <button 
            onClick={onGenerateData}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-lg transition-all flex items-center gap-2"
        >
            <BookOpen className="w-5 h-5" />
            Load Demo Dataset
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Total Students</p>
            <h3 className="text-2xl font-bold text-slate-900">{stats.total}</h3>
          </div>
          <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">At-Risk (High/Critical)</p>
            <h3 className="text-2xl font-bold text-red-600">{stats.criticalRisk}</h3>
            <p className="text-xs text-red-500 mt-1">{((stats.criticalRisk / stats.total) * 100).toFixed(1)}% of cohort</p>
          </div>
          <div className="p-3 bg-red-50 rounded-lg text-red-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Avg. Attendance</p>
            <h3 className="text-2xl font-bold text-slate-900">{stats.avgAttendance.toFixed(1)}%</h3>
          </div>
          <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
            <TrendingDown className="w-6 h-6 transform rotate-180" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
             <p className="text-sm font-medium text-slate-500 mb-2">AI Cohort Insight</p>
             <p className="text-xs text-slate-700 italic border-l-2 border-indigo-500 pl-2">
                 {insights || "Analyzing cohort patterns..."}
             </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Distribution Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Risk Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name as RiskTier]} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 text-xs text-slate-500 mt-2">
            {Object.entries(COLORS).map(([key, color]) => (
                <div key={key} className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></span>
                    {key}
                </div>
            ))}
          </div>
        </div>

        {/* At-Risk Students List */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800">Priority Intervention List</h3>
            <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Search student..." 
                    className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </div>
          </div>
          <div className="flex-1 overflow-auto max-h-[400px]">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-medium sticky top-0">
                <tr>
                  <th className="px-6 py-3">Student</th>
                  <th className="px-6 py-3">Risk Tier</th>
                  <th className="px-6 py-3">Grade</th>
                  <th className="px-6 py-3">Missed Classes</th>
                  <th className="px-6 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedStudents.slice(0, 10).map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{student.name}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${student.riskTier === RiskTier.CRITICAL ? 'bg-red-100 text-red-800' : 
                          student.riskTier === RiskTier.HIGH ? 'bg-orange-100 text-orange-800' : 
                          student.riskTier === RiskTier.MEDIUM ? 'bg-amber-100 text-amber-800' : 
                          'bg-emerald-100 text-emerald-800'}`}>
                        {student.riskTier} ({student.riskScore}%)
                      </span>
                    </td>
                    <td className="px-6 py-4">{student.overallGrade}%</td>
                    <td className="px-6 py-4">{Math.round((100 - student.attendanceRate) / 5)}</td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => onSelectStudent(student)}
                        className="text-indigo-600 hover:text-indigo-800 font-medium text-xs flex items-center gap-1"
                      >
                        Analyze <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
