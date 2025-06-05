
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Eye, LogOut } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useResumeData } from '@/hooks/useResumeData';
import TemplateSelector from './TemplateSelector';
import ResumePreview from './ResumePreview';
import ATSChecker from './ATSChecker';
import ContentSuggestions from './ContentSuggestions';
import JobSuggestions from './JobSuggestions';
import FeedbackTracker from './FeedbackTracker';
import ExportDropdown from './ExportDropdown';
import PersonalInfoForm from './forms/PersonalInfoForm';
import SummaryForm from './forms/SummaryForm';
import ExperienceForm from './forms/ExperienceForm';
import EducationForm from './forms/EducationForm';
import SkillsForm from './forms/SkillsForm';

const ResumeBuilder = () => {
  const { user, signOut } = useAuth();
  const { resumeData, setResumeData, loading } = useResumeData();
  const [activeTab, setActiveTab] = useState('personal');
  const [currentSkill, setCurrentSkill] = useState('');
  const [currentAchievement, setCurrentAchievement] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [feedbackPatterns, setFeedbackPatterns] = useState<any[]>([]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your resume...</p>
        </div>
      </div>
    );
  }

  const updatePersonalInfo = (field: keyof typeof resumeData.personalInfo, value: string) => {
    const newData = {
      ...resumeData,
      personalInfo: { ...resumeData.personalInfo, [field]: value }
    };
    setResumeData(newData);
  };

  const addExperience = () => {
    const newExp = {
      id: Date.now().toString(),
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      current: false,
      description: ''
    };
    const newData = {
      ...resumeData,
      experience: [...resumeData.experience, newExp]
    };
    setResumeData(newData);
  };

  const updateExperience = (id: string, field: string, value: any) => {
    const newData = {
      ...resumeData,
      experience: resumeData.experience.map(exp => 
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    };
    setResumeData(newData);
  };

  const removeExperience = (id: string) => {
    const newData = {
      ...resumeData,
      experience: resumeData.experience.filter(exp => exp.id !== id)
    };
    setResumeData(newData);
  };

  const addEducation = () => {
    const newEdu = {
      id: Date.now().toString(),
      institution: '',
      degree: '',
      field: '',
      graduationDate: '',
      gpa: ''
    };
    const newData = {
      ...resumeData,
      education: [...resumeData.education, newEdu]
    };
    setResumeData(newData);
  };

  const updateEducation = (id: string, field: string, value: string) => {
    const newData = {
      ...resumeData,
      education: resumeData.education.map(edu => 
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    };
    setResumeData(newData);
  };

  const removeEducation = (id: string) => {
    const newData = {
      ...resumeData,
      education: resumeData.education.filter(edu => edu.id !== id)
    };
    setResumeData(newData);
  };

  const addSkill = () => {
    if (currentSkill.trim() && !resumeData.skills.includes(currentSkill.trim())) {
      const newData = {
        ...resumeData,
        skills: [...resumeData.skills, currentSkill.trim()]
      };
      setResumeData(newData);
      setCurrentSkill('');
      toast({
        title: "Skill added!",
        description: `"${currentSkill}" has been added to your skills list.`,
      });
    }
  };

  const removeSkill = (skillToRemove: string) => {
    const newData = {
      ...resumeData,
      skills: resumeData.skills.filter(skill => skill !== skillToRemove)
    };
    setResumeData(newData);
  };

  const addAchievement = () => {
    if (currentAchievement.trim()) {
      const newData = {
        ...resumeData,
        achievements: [...resumeData.achievements, currentAchievement.trim()]
      };
      setResumeData(newData);
      setCurrentAchievement('');
      toast({
        title: "Achievement added!",
        description: "Your achievement has been added successfully.",
      });
    }
  };

  const removeAchievement = (index: number) => {
    const newData = {
      ...resumeData,
      achievements: resumeData.achievements.filter((_, i) => i !== index)
    };
    setResumeData(newData);
  };

  const calculateCompleteness = () => {
    let score = 0;
    const weights = {
      personalInfo: 25,
      summary: 15,
      experience: 25,
      education: 20,
      skills: 10,
      achievements: 5
    };

    // Personal Info
    const personalComplete = Object.values(resumeData.personalInfo).filter(v => v.trim()).length;
    score += (personalComplete / 6) * weights.personalInfo;

    // Summary
    if (resumeData.summary.trim()) score += weights.summary;

    // Experience
    if (resumeData.experience.length > 0) score += weights.experience;

    // Education
    if (resumeData.education.length > 0) score += weights.education;

    // Skills
    if (resumeData.skills.length > 0) score += weights.skills;

    // Achievements
    if (resumeData.achievements.length > 0) score += weights.achievements;

    return Math.round(score);
  };

  if (previewMode) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <Button onClick={() => setPreviewMode(false)} variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              Back to Editor
            </Button>
            <ExportDropdown resumeData={resumeData} />
          </div>
          <div id="resume-preview">
            <ResumePreview data={resumeData} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Resume Builder</h1>
              <p className="text-gray-600">Welcome back, {user?.email}</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setPreviewMode(true)}>
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <ExportDropdown resumeData={resumeData} />
              <Button variant="outline" onClick={signOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
          
          {/* Progress Bar */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Resume Completeness</span>
                <span className="text-sm text-gray-600">{calculateCompleteness()}%</span>
              </div>
              <Progress value={calculateCompleteness()} className="w-full" />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Editor */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="personal">Personal</TabsTrigger>
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="experience">Experience</TabsTrigger>
                <TabsTrigger value="education">Education</TabsTrigger>
                <TabsTrigger value="skills">Skills</TabsTrigger>
                <TabsTrigger value="template">Template</TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="space-y-4">
                <PersonalInfoForm
                  personalInfo={resumeData.personalInfo}
                  onUpdate={updatePersonalInfo}
                />
              </TabsContent>

              <TabsContent value="summary" className="space-y-4">
                <SummaryForm
                  summary={resumeData.summary}
                  selectedIndustry={selectedIndustry}
                  selectedRole={selectedRole}
                  onSummaryChange={(value) => setResumeData({ ...resumeData, summary: value })}
                  onIndustryChange={setSelectedIndustry}
                  onRoleChange={setSelectedRole}
                />
              </TabsContent>

              <TabsContent value="experience" className="space-y-4">
                <ExperienceForm
                  experience={resumeData.experience}
                  onAdd={addExperience}
                  onUpdate={updateExperience}
                  onRemove={removeExperience}
                />
              </TabsContent>

              <TabsContent value="education" className="space-y-4">
                <EducationForm
                  education={resumeData.education}
                  onAdd={addEducation}
                  onUpdate={updateEducation}
                  onRemove={removeEducation}
                />
              </TabsContent>

              <TabsContent value="skills" className="space-y-4">
                <SkillsForm
                  skills={resumeData.skills}
                  achievements={resumeData.achievements}
                  currentSkill={currentSkill}
                  currentAchievement={currentAchievement}
                  onSkillChange={setCurrentSkill}
                  onAchievementChange={setCurrentAchievement}
                  onAddSkill={addSkill}
                  onAddAchievement={addAchievement}
                  onRemoveSkill={removeSkill}
                  onRemoveAchievement={removeAchievement}
                />
              </TabsContent>

              <TabsContent value="template">
                <TemplateSelector
                  selectedTemplate={resumeData.selectedTemplate}
                  onTemplateSelect={(template) => setResumeData({ ...resumeData, selectedTemplate: template })}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <FeedbackTracker onPatternsUpdate={setFeedbackPatterns} />
            <ATSChecker data={resumeData} />
            <JobSuggestions resumeData={resumeData} />
            <ContentSuggestions 
              industry={selectedIndustry}
              role={selectedRole}
              onSuggestionApply={(type, content) => {
                if (type === 'summary') {
                  setResumeData({ ...resumeData, summary: content });
                  toast({
                    title: "Suggestion applied!",
                    description: "Your summary has been updated with AI suggestions.",
                  });
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;
