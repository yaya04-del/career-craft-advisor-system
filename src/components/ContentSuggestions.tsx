
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Sparkles, Copy, Check, Briefcase } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useFeedbackImprovement } from '@/hooks/useFeedbackImprovement';

interface ContentSuggestionsProps {
  industry: string;
  role: string;
  onSuggestionApply: (type: string, content: string) => void;
}

// Industry-specific data based on custom instructions
const industryData = {
  nursing: {
    job_titles: ["Registered Nurse", "ICU Nurse", "Clinical Nurse", "Nurse Practitioner"],
    skills: ["Patient Care", "IV Therapy", "Medication Administration", "Vital Signs Monitoring", "Electronic Health Records (EHR)", "Compassion", "BLS Certification"],
    certifications: ["BLS", "CPR", "RN License", "BSN"],
    sample_summary: "Compassionate and dedicated Registered Nurse with over 5 years of experience in patient care, skilled in clinical assessments, medication administration, and multidisciplinary collaboration to improve patient outcomes."
  },
  "civil engineering": {
    job_titles: ["Site Engineer", "Structural Engineer", "Hydraulics Engineer", "Project Manager"],
    skills: ["AutoCAD", "Project Planning", "Structural Analysis", "Cost Estimation", "Construction Supervision", "Surveying", "ECSA Registration"],
    certifications: ["BEng Civil Engineering", "ECSA Certification"],
    sample_summary: "Results-driven Civil Engineer with expertise in infrastructure design, project execution, and construction site management. Proven ability to coordinate with teams and meet project deadlines efficiently."
  },
  "software engineering": {
    job_titles: ["Backend Developer", "Frontend Developer", "Full Stack Engineer", "DevOps Engineer"],
    skills: ["Python", "JavaScript", "Django", "React", "Agile Methodologies", "Git", "CI/CD"],
    certifications: ["AWS Certified Developer", "Scrum Master", "Google Cloud Engineer"],
    sample_summary: "Innovative Software Engineer with experience in designing and developing scalable web applications. Strong background in backend systems, cloud services, and agile development environments."
  },
  finance: {
    job_titles: ["Financial Analyst", "Accountant", "Risk Manager", "Auditor"],
    skills: ["Budgeting", "Financial Modeling", "Forecasting", "GAAP", "Risk Analysis", "SAP", "Excel"],
    certifications: ["CPA", "CFA", "MBA Finance"],
    sample_summary: "Detail-oriented Financial Analyst with a strong foundation in budgeting, risk management, and data-driven financial planning. Adept at using financial software to generate reports and insights for strategic decision-making."
  },
  marketing: {
    job_titles: ["Digital Marketing Specialist", "SEO Manager", "Brand Manager", "Content Strategist"],
    skills: ["SEO", "Content Marketing", "Google Analytics", "PPC", "Email Campaigns", "Brand Positioning"],
    certifications: ["Google Ads Certification", "HubSpot Content Marketing", "Meta Blueprint"],
    sample_summary: "Creative and data-driven Marketing Professional with expertise in digital strategy, content marketing, and audience engagement. Proven ability to boost brand visibility and campaign ROI."
  }
};

const ContentSuggestions: React.FC<ContentSuggestionsProps> = ({ 
  industry, 
  role, 
  onSuggestionApply 
}) => {
  const { improvements, trackEdit, generateImprovedPrompt } = useFeedbackImprovement();

  const suggestions = useMemo(() => {
    // Get industry-specific data
    const currentIndustryData = industryData[industry as keyof typeof industryData];
    
    const baseSuggestions = {
      summaries: [
        "Results-driven professional with proven expertise in driving organizational success through strategic initiatives and collaborative leadership.",
        "Dynamic and detail-oriented professional with a track record of delivering high-quality solutions and exceeding performance targets.",
        "Innovative problem-solver with strong analytical skills and a passion for continuous improvement and professional development."
      ],
      skills: {
        technology: ["JavaScript", "Python", "React", "Node.js", "AWS", "Docker", "Git", "Agile", "Problem Solving", "Team Collaboration"],
        healthcare: ["Patient Care", "Medical Documentation", "HIPAA Compliance", "Clinical Assessment", "Team Collaboration", "Critical Thinking", "Communication", "Attention to Detail"],
        finance: ["Financial Analysis", "Risk Management", "Excel", "Financial Modeling", "Compliance", "Data Analysis", "Communication", "Attention to Detail"],
        marketing: ["Digital Marketing", "Content Creation", "SEO/SEM", "Analytics", "Social Media", "Campaign Management", "Creative Thinking", "Data Analysis"],
        sales: ["Relationship Building", "Negotiation", "CRM Software", "Lead Generation", "Presentation Skills", "Communication", "Goal-Oriented", "Customer Service"],
        education: ["Curriculum Development", "Classroom Management", "Student Assessment", "Communication", "Patience", "Adaptability", "Technology Integration", "Collaboration"]
      },
      achievements: {
        entry: [
          "Successfully completed comprehensive training program ahead of schedule",
          "Collaborated with cross-functional teams to deliver project objectives",
          "Demonstrated strong learning agility by quickly mastering new systems and processes"
        ],
        mid: [
          "Led team of 5+ members to achieve 20% improvement in productivity metrics",
          "Implemented process improvements resulting in 15% cost reduction",
          "Mentored junior staff members and contributed to their professional development"
        ],
        senior: [
          "Spearheaded strategic initiatives that generated $500K+ in annual revenue",
          "Built and managed high-performing teams of 15+ professionals",
          "Developed and executed company-wide policies improving operational efficiency by 30%"
        ],
        executive: [
          "Transformed organizational culture leading to 40% improvement in employee satisfaction",
          "Directed multi-million dollar budgets while maintaining fiscal responsibility",
          "Established strategic partnerships resulting in 50% market share growth"
        ]
      }
    };

    // Start with industry-specific content if available
    let customSummaries = currentIndustryData ? [currentIndustryData.sample_summary] : [...baseSuggestions.summaries];
    let customSkills = currentIndustryData ? currentIndustryData.skills : (baseSuggestions.skills[industry as keyof typeof baseSuggestions.skills] || baseSuggestions.skills.technology);
    let customCertifications = currentIndustryData ? currentIndustryData.certifications : [];
    let suggestedJobTitles = currentIndustryData ? currentIndustryData.job_titles : [];
    
    let customAchievements = baseSuggestions.achievements[role as keyof typeof baseSuggestions.achievements] || baseSuggestions.achievements.entry;

    // Apply feedback improvements
    if (improvements.includeMetrics) {
      customSummaries = customSummaries.map(summary => {
        if (!summary.match(/\d+/)) {
          return summary.replace('proven expertise', 'proven expertise with 95% success rate');
        }
        return summary;
      });
    }

    if (improvements.expandDetails) {
      customSummaries = customSummaries.map(summary => {
        if (summary.length < 150) {
          return summary + " Experienced in stakeholder management, project delivery, and driving measurable business outcomes.";
        }
        return summary;
      });
    }

    if (improvements.emphasizeLeadership) {
      customAchievements = customAchievements.map(achievement => {
        if (!achievement.toLowerCase().includes('led') && !achievement.toLowerCase().includes('managed')) {
          return achievement.replace('Successfully', 'Successfully led initiatives that');
        }
        return achievement;
      });
    }

    // Add role-specific summaries
    if (industry && role) {
      const experienceYears = role === 'entry' ? '1-2' : role === 'mid' ? '3-5' : role === 'senior' ? '5-8' : '10+';
      
      if (currentIndustryData) {
        customSummaries.push(
          `Experienced ${role}-level ${industry} professional with ${experienceYears} years of expertise in ${currentIndustryData.skills.slice(0, 3).join(', ')}.`
        );
      } else {
        customSummaries.push(
          `Dynamic ${role}-level professional with ${experienceYears} years of experience delivering exceptional results in ${industry}.`
        );
      }
    }

    return {
      summaries: customSummaries.slice(0, 3),
      skills: customSkills,
      achievements: customAchievements,
      certifications: customCertifications,
      jobTitles: suggestedJobTitles
    };
  }, [industry, role, improvements]);

  const applySuggestion = (type: string, content: string) => {
    onSuggestionApply(type, content);
    
    // Set up tracking for when user edits the applied suggestion
    setTimeout(() => {
      const trackEditFunction = (originalContent: string, editedContent: string) => {
        if (originalContent !== editedContent) {
          trackEdit(originalContent, editedContent, type, { industry, role });
        }
      };
      
      // Store the tracking function for later use
      (window as any).lastAppliedSuggestion = {
        content,
        type,
        trackEdit: trackEditFunction
      };
    }, 100);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard!",
      description: "The suggestion has been copied to your clipboard.",
    });
  };

  const industrySpecificData = industryData[industry as keyof typeof industryData];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5" />
          Smart Suggestions
          {Object.values(improvements).some(Boolean) && (
            <Badge variant="secondary" className="text-xs">Learning</Badge>
          )}
        </CardTitle>
        {(industry || role) && (
          <div className="flex gap-2 flex-wrap">
            {industry && <Badge variant="secondary" className="flex items-center gap-1">
              <Briefcase className="w-3 h-3" />
              {industry}
            </Badge>}
            {role && <Badge variant="secondary">{role} level</Badge>}
            {industrySpecificData && (
              <Badge variant="outline" className="text-xs">Industry Match</Badge>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Job Titles Suggestions */}
        {suggestions.jobTitles.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-1">
              <Briefcase className="w-4 h-4" />
              Suggested Job Titles
            </h4>
            <div className="flex flex-wrap gap-2">
              {suggestions.jobTitles.map((title, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="cursor-pointer hover:bg-blue-50 hover:border-blue-300"
                  onClick={() => copyToClipboard(title)}
                >
                  {title}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Summary Suggestions */}
        <div>
          <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-1">
            <Sparkles className="w-4 h-4" />
            Professional Summary
            {improvements.expandDetails && (
              <Badge variant="outline" className="text-xs ml-2">Enhanced</Badge>
            )}
          </h4>
          <div className="space-y-3">
            {suggestions.summaries.slice(0, 2).map((summary, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700 mb-2">{summary}</p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => applySuggestion('summary', summary)}
                  >
                    <Check className="w-3 h-3 mr-1" />
                    Apply
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(summary)}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Skills Suggestions */}
        <div>
          <h4 className="font-medium text-gray-700 mb-3">Recommended Skills</h4>
          <div className="flex flex-wrap gap-2">
            {suggestions.skills.slice(0, 8).map((skill, index) => (
              <Badge
                key={index}
                variant="outline"
                className="cursor-pointer hover:bg-blue-50 hover:border-blue-300"
                onClick={() => copyToClipboard(skill)}
              >
                {skill}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">Click to copy skill to clipboard</p>
        </div>

        {/* Certifications */}
        {suggestions.certifications.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Relevant Certifications</h4>
            <div className="flex flex-wrap gap-2">
              {suggestions.certifications.map((cert, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="cursor-pointer hover:bg-green-50"
                  onClick={() => copyToClipboard(cert)}
                >
                  {cert}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Achievement Suggestions */}
        <div>
          <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
            Achievement Examples
            {improvements.includeMetrics && (
              <Badge variant="outline" className="text-xs">Metrics</Badge>
            )}
            {improvements.emphasizeLeadership && (
              <Badge variant="outline" className="text-xs">Leadership</Badge>
            )}
          </h4>
          <div className="space-y-2">
            {suggestions.achievements.slice(0, 3).map((achievement, index) => (
              <div key={index} className="p-2 bg-blue-50 rounded text-sm">
                <p className="text-gray-700 mb-1">{achievement}</p>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(achievement)}
                  className="h-6 px-2 text-xs"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Copy
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Pro Tips */}
        <div className="border-t pt-4">
          <h4 className="font-medium text-gray-700 mb-2">💡 Industry Tips</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Use action verbs to start bullet points (Led, Developed, Achieved)</li>
            <li>• Include specific numbers and metrics when possible</li>
            <li>• Tailor your resume for each job application</li>
            {industrySpecificData && (
              <li className="text-blue-600">• Focus on {industrySpecificData.skills.slice(0, 2).join(' and ')} for {industry} roles</li>
            )}
            {improvements.includeMetrics && (
              <li className="text-blue-600">• AI noticed you prefer quantified achievements</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContentSuggestions;
