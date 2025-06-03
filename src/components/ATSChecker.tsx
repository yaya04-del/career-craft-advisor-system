
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, XCircle, Target } from 'lucide-react';

interface ResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    website: string;
  };
  summary: string;
  experience: Array<{
    id: string;
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
  }>;
  education: Array<{
    id: string;
    institution: string;
    degree: string;
    field: string;
    graduationDate: string;
    gpa?: string;
  }>;
  skills: string[];
  achievements: string[];
}

interface ATSCheckerProps {
  data: ResumeData;
}

const ATSChecker: React.FC<ATSCheckerProps> = ({ data }) => {
  const atsAnalysis = useMemo(() => {
    let score = 0;
    const checks = [];
    const warnings = [];
    const errors = [];

    // Contact Information Check (20 points)
    const contactFields = [data.personalInfo.fullName, data.personalInfo.email, data.personalInfo.phone];
    const contactComplete = contactFields.filter(field => field.trim()).length;
    const contactScore = (contactComplete / 3) * 20;
    score += contactScore;

    if (contactComplete === 3) {
      checks.push('Complete contact information');
    } else {
      warnings.push('Missing contact information fields');
    }

    // Professional Summary (15 points)
    if (data.summary && data.summary.length >= 50) {
      score += 15;
      checks.push('Professional summary included');
    } else if (data.summary) {
      score += 7;
      warnings.push('Professional summary too short (50+ characters recommended)');
    } else {
      errors.push('Missing professional summary');
    }

    // Work Experience (25 points)
    if (data.experience.length > 0) {
      score += 15;
      checks.push('Work experience included');
      
      // Check for detailed descriptions
      const detailedExperience = data.experience.filter(exp => exp.description && exp.description.length > 100);
      if (detailedExperience.length > 0) {
        score += 10;
        checks.push('Detailed job descriptions');
      } else {
        warnings.push('Add more detailed job descriptions');
      }
    } else {
      errors.push('No work experience added');
    }

    // Education (15 points)
    if (data.education.length > 0) {
      score += 15;
      checks.push('Education information included');
    } else {
      warnings.push('Consider adding education information');
    }

    // Skills (15 points)
    if (data.skills.length >= 5) {
      score += 15;
      checks.push('Comprehensive skills list (5+ skills)');
    } else if (data.skills.length > 0) {
      score += 8;
      warnings.push('Add more relevant skills (5+ recommended)');
    } else {
      errors.push('No skills listed');
    }

    // Achievements (10 points)
    if (data.achievements.length > 0) {
      score += 10;
      checks.push('Key achievements highlighted');
    } else {
      warnings.push('Consider adding key achievements');
    }

    // Word count and format checks
    const totalWords = [
      data.summary,
      ...data.experience.map(exp => exp.description),
      ...data.achievements
    ].join(' ').split(/\s+/).filter(word => word.length > 0).length;

    if (totalWords >= 200) {
      checks.push('Adequate content length');
    } else {
      warnings.push('Resume may be too brief (200+ words recommended)');
    }

    return {
      score: Math.round(score),
      checks,
      warnings,
      errors,
      totalWords
    };
  }, [data]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5" />
          ATS Compatibility
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Score Display */}
        <div className={`text-center p-4 rounded-lg ${getScoreBgColor(atsAnalysis.score)}`}>
          <div className={`text-3xl font-bold ${getScoreColor(atsAnalysis.score)}`}>
            {atsAnalysis.score}%
          </div>
          <p className="text-sm text-gray-600 mt-1">ATS Score</p>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Optimization Progress</span>
            <span>{atsAnalysis.score}%</span>
          </div>
          <Progress value={atsAnalysis.score} className="w-full" />
        </div>

        {/* Checks */}
        {atsAnalysis.checks.length > 0 && (
          <div>
            <h4 className="font-medium text-green-700 mb-2 flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              Passed Checks
            </h4>
            <ul className="space-y-1">
              {atsAnalysis.checks.map((check, index) => (
                <li key={index} className="text-sm text-green-600 flex items-center gap-2">
                  <CheckCircle className="w-3 h-3" />
                  {check}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Warnings */}
        {atsAnalysis.warnings.length > 0 && (
          <div>
            <h4 className="font-medium text-yellow-700 mb-2 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              Improvements
            </h4>
            <ul className="space-y-1">
              {atsAnalysis.warnings.map((warning, index) => (
                <li key={index} className="text-sm text-yellow-600 flex items-center gap-2">
                  <AlertCircle className="w-3 h-3" />
                  {warning}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Errors */}
        {atsAnalysis.errors.length > 0 && (
          <div>
            <h4 className="font-medium text-red-700 mb-2 flex items-center gap-1">
              <XCircle className="w-4 h-4" />
              Critical Issues
            </h4>
            <ul className="space-y-1">
              {atsAnalysis.errors.map((error, index) => (
                <li key={index} className="text-sm text-red-600 flex items-center gap-2">
                  <XCircle className="w-3 h-3" />
                  {error}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Statistics */}
        <div className="border-t pt-4">
          <h4 className="font-medium text-gray-700 mb-2">Resume Statistics</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <Badge variant="outline">{atsAnalysis.totalWords} words</Badge>
            <Badge variant="outline">{data.skills.length} skills</Badge>
            <Badge variant="outline">{data.experience.length} jobs</Badge>
            <Badge variant="outline">{data.achievements.length} achievements</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ATSChecker;
