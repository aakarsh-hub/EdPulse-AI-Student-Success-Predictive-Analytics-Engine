import React, { useEffect, useState } from 'react';
import { Student, AIStudentAnalysis, RiskTier } from '../types';
import { analyzeStudentRisk } from '../services/geminiService';
import { ArrowLeft, BrainCircuit, BookOpen, Clock, AlertOctagon, CheckCircle2, TrendingUp, Download, Sparkles, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

interface StudentProfileProps {
  student: Student;
  onBack: () => void;
  onUpdateStudent: (id: string, analysis: AIStudentAnalysis) => void;
}

export const StudentProfile: React.FC<StudentProfileProps> = ({ student, onBack, onUpdateStudent }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!student.aiAnalysis && !loading) {
      setLoading(true);
      analyzeStudentRisk(student)
        .then(analysis => {
          onUpdateStudent(student.id, analysis);
          setLoading(false);
        })
        .catch(err => {
            console.error(err);
            setError("Failed to generate AI insights. Please check API key.");
            setLoading(false);
        });
    }
  }, [student, onUpdateStudent]);

  // Transform assessments for chart
  const chartData = student.assessments
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(a => ({
        name: a.name,
        score: (a.score / a.maxScore) * 100,
        date: a.date
    }));

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div>
                <h2 className="text-2xl font-bold text-slate-800">{student.name}</h2>
                <div className="flex gap-3 text-sm text-slate-500 mt-1">
                    <span>ID: {student.id}</span>
                    <span>•</span>
                    <span>{student.cohort}</span>
                </div>
            </div>
        </div>
        <div className="flex gap-3">
             <div className={`px-4 py-2 rounded-lg border flex items-center gap-2
                ${student.riskTier === RiskTier.CRITICAL ? 'bg-red-50 border-red-200 text-red-700' : 
                  student.riskTier === RiskTier.HIGH ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-slate-50 border-slate-200'}`}>
                <AlertOctagon className="w-5 h-5" />
                <span className="font-bold">Risk: {student.riskTier}</span>
             </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Stats & Chart */}
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-indigo-600" />
                    Performance Velocity
                </h3>
                <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="name" hide />
                            <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={12} />
                            <RechartsTooltip />
                            <Line type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={2} dot={{fill: '#4f46e5'}} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h4 className="font-semibold text-slate-700">Quick Stats</h4>
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-xs text-slate-500">Attendance</p>
                        <p className="text-xl font-bold text-slate-800">{student.attendanceRate}%</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-xs text-slate-500">Assignment Avg</p>
                        <p className="text-xl font-bold text-slate-800">{student.overallGrade}%</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-xs text-slate-500">LMS Logins</p>
                        <p className="text-xl font-bold text-slate-800">{student.engagement.lmsLoginFrequency}<span className="text-xs font-normal">/wk</span></p>
                    </div>
                     <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-xs text-slate-500">Missing Tasks</p>
                        <p className="text-xl font-bold text-red-600">{student.engagement.assignmentsTotal - student.engagement.assignmentsSubmitted}</p>
                    </div>
                </div>
            </div>
        </div>

        {/* Right Column: AI Insights */}
        <div className="lg:col-span-2 space-y-6">
            {loading ? (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-white rounded-xl border border-slate-200 shadow-sm">
                    <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                    <p className="text-slate-600 font-medium">Gemini is analyzing {student.name}'s academic profile...</p>
                    <p className="text-slate-400 text-sm mt-2">Diagnosing learning gaps & generating interventions</p>
                </div>
            ) : error ? (
                <div className="p-6 bg-red-50 text-red-600 rounded-xl border border-red-200">{error}</div>
            ) : student.aiAnalysis ? (
                <>
                {/* Risk Drivers Card */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-rose-500">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-rose-500" />
                        Risk Drivers
                    </h3>
                    <ul className="space-y-3">
                        {student.aiAnalysis.riskDrivers.map((driver, i) => (
                            <li key={i} className="flex items-start gap-3 text-slate-700">
                                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0" />
                                <span className="text-sm leading-relaxed">{driver}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Weakness Diagnosis */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-amber-500">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <BrainCircuit className="w-5 h-5 text-amber-500" />
                        Topic-Level Diagnostics
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {student.aiAnalysis.weakTopics.map((topic, i) => (
                            <div key={i} className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                                <div className="flex justify-between mb-2">
                                    <span className="font-semibold text-amber-900">{topic.topic}</span>
                                    <span className="text-xs font-mono bg-white px-2 py-1 rounded border border-amber-200 text-amber-600">{topic.confidence * 100}% Conf</span>
                                </div>
                                <p className="text-sm text-amber-800 leading-relaxed">{topic.reasoning}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Intervention Plan */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-indigo-500">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-indigo-500" />
                            Personalized Intervention Plan
                        </h3>
                        <button className="text-indigo-600 text-sm font-medium flex items-center gap-1 hover:underline">
                            <Download className="w-4 h-4" /> Export PDF
                        </button>
                    </div>

                    <div className="space-y-4">
                        {student.aiAnalysis.interventionPlan.map((plan, i) => (
                            <div key={i} className="flex gap-4 p-4 rounded-lg bg-slate-50 border border-slate-100">
                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs
                                    ${plan.priority === 'High' ? 'bg-red-500' : 'bg-indigo-500'}`}>
                                    {i + 1}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-bold text-slate-800">{plan.type} Intervention</h4>
                                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded
                                            ${plan.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {plan.priority} Priority
                                        </span>
                                    </div>
                                    <p className="text-slate-600 text-sm mb-3">{plan.description}</p>
                                    
                                    {plan.resources.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {plan.resources.map((res, j) => (
                                                <span key={j} className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-500">
                                                    <BookOpen className="w-3 h-3" /> {res}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100">
                        <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Predictive Trajectory</h5>
                        <p className="text-sm text-slate-600 italic">"{student.aiAnalysis.predictedOutcome}"</p>
                    </div>
                </div>
                </>
            ) : null}
        </div>
      </div>
    </div>
  );
};