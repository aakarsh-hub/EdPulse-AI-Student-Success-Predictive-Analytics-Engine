import { GoogleGenAI, Type } from "@google/genai";
import { Student, AIStudentAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Schema for structured JSON output from Gemini
const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    riskDrivers: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of top 3 factors contributing to the student's risk level."
    },
    weakTopics: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          topic: { type: Type.STRING },
          confidence: { type: Type.NUMBER, description: "0-100 confidence score" },
          reasoning: { type: Type.STRING }
        }
      },
      description: "Identified academic topics where the student is struggling."
    },
    interventionPlan: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING, enum: ['Academic', 'Behavioral', 'Administrative'] },
          description: { type: Type.STRING },
          resources: { type: Type.ARRAY, items: { type: Type.STRING } },
          priority: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] }
        }
      },
      description: "Actionable steps to improve student performance."
    },
    predictedOutcome: {
      type: Type.STRING,
      description: "A short predictive statement about the student's trajectory if no action is taken."
    }
  },
  required: ["riskDrivers", "weakTopics", "interventionPlan", "predictedOutcome"]
};

export const analyzeStudentRisk = async (student: Student): Promise<AIStudentAnalysis> => {
  const model = "gemini-2.5-flash";
  
  // Construct a prompt context based on student data
  const promptContext = `
    Analyze the following student data for an EdTech dashboard.
    Student Name: ${student.name}
    Current Risk Tier: ${student.riskTier} (Score: ${student.riskScore})
    Attendance: ${student.attendanceRate}%
    Overall Grade: ${student.overallGrade}%
    
    Assessments:
    ${student.assessments.map(a => `- ${a.name} (${a.type}): ${a.score}/${a.maxScore} (Topic: ${a.topic})`).join('\n')}
    
    Engagement:
    - LMS Logins/Week: ${student.engagement.lmsLoginFrequency}
    - Video Watch %: ${student.engagement.videoWatchPercentage}
    - Missing Assignments: ${student.engagement.assignmentsTotal - student.engagement.assignmentsSubmitted}
    
    Task:
    1. Identify specific risk drivers (e.g., declining quiz scores, low attendance).
    2. Diagnose weak topics based on assessment data.
    3. Create a personalized intervention plan with specific resources (videos, exercises, meetings).
    4. Predict the outcome if no intervention occurs.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: promptContext,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        systemInstruction: "You are an expert academic advisor and data scientist. Analyze student performance data to prevent dropout.",
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    const data = JSON.parse(text);
    return {
      ...data,
      generatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error analyzing student:", error);
    throw error;
  }
};

export const generateCohortInsights = async (students: Student[]): Promise<string> => {
    // A lighter weight analysis for the cohort summary text
    const summaryData = {
        count: students.length,
        avgGrade: (students.reduce((acc, s) => acc + s.overallGrade, 0) / students.length).toFixed(1),
        atRiskCount: students.filter(s => s.riskTier === 'High' || s.riskTier === 'Critical').length,
    };

    const prompt = `
        Given a cohort of ${summaryData.count} students with an average grade of ${summaryData.avgGrade}% and ${summaryData.atRiskCount} students flagged as high risk.
        Generate a concise, 2-sentence executive summary for the University Dean regarding the health of this cohort.
        Focus on urgency and general sentiment.
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
    });

    return response.text || "Unable to generate cohort insights.";
}
