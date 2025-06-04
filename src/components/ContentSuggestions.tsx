import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Sparkles, Copy, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useFeedbackImprovement } from '@/hooks/useFeedbackImprovement';

interface ContentSuggestionsProps {
  industry: string;
  role: string;
  onSuggestionApply: (type: string, content: string) => void;
}

const ContentSuggestions: React.FC<ContentSuggestionsProps> = ({ 
  industry, 
  role, 
  onSuggestionApply 
}) => {
  const { improvements, trackEdit, generateImprovedPrompt } = useFeedbackImprovement();

  const suggestions = useMemo(() => {
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

    // Apply feedback improvements
    let customSummaries = [...baseSuggestions.summaries];
    let customAchievements = baseSuggestions.achievements[role as keyof typeof baseSuggestions.achievements] || baseSuggestions.achievements.entry;

    // Improve suggestions based on learned patterns
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

    const customSkills = baseSuggestions.skills[industry as keyof typeof baseSuggestions.skills] || baseSuggestions.skills.technology;

    // Customize based on industry and role
    if (industry && role) {
      if (industry === 'technology') {
        customSummaries.push(
          `Experienced ${role}-level technology professional with expertise in modern development practices and emerging technologies.`,
          `Software engineer with ${role === 'entry' ? '1-2' : role === 'mid' ? '3-5' : '5+'} years of experience building scalable applications and leading technical initiatives.`
        );
      } else if (industry === 'healthcare') {
        customSummaries.push(
          `Dedicated healthcare professional committed to providing exceptional patient care and clinical excellence.`,
          `${role === 'entry' ? 'Emerging' : 'Experienced'} healthcare specialist with strong clinical skills and patient-centered approach.`
        );
      }
    }

    return {
      summaries: customSummaries,
      skills: customSkills,
      achievements: customAchievements
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5" />
          AI Suggestions
          {Object.values(improvements).some(Boolean) && (
            <Badge variant="secondary" className="text-xs">Learning</Badge>
          )}
        </CardTitle>
        {(industry || role) && (
          <div className="flex gap-2">
            {industry && <Badge variant="secondary">{industry}</Badge>}
            {role && <Badge variant="secondary">{role} level</Badge>}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
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
          <h4 className="font-medium text-gray-700 mb-2">💡 Pro Tips</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Use action verbs to start bullet points (Led, Developed, Achieved)</li>
            <li>• Include specific numbers and metrics when possible</li>
            <li>• Tailor your resume for each job application</li>
            <li>• Keep descriptions concise but impactful</li>
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
