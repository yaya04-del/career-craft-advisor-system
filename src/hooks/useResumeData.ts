
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { z } from 'zod';
import DOMPurify from 'dompurify';

const resumeSchema = z.object({
  personalInfo: z.object({
    fullName: z.string().max(100),
    email: z.string().email().max(255),
    phone: z.string().max(20),
    location: z.string().max(100),
    linkedin: z.string().max(255),
    website: z.string().max(255)
  }),
  summary: z.string().max(2000),
  experience: z.array(z.object({
    id: z.string(),
    company: z.string().max(100),
    position: z.string().max(100),
    startDate: z.string(),
    endDate: z.string(),
    current: z.boolean(),
    description: z.string().max(2000)
  })),
  education: z.array(z.object({
    id: z.string(),
    institution: z.string().max(100),
    degree: z.string().max(100),
    field: z.string().max(100),
    graduationDate: z.string(),
    gpa: z.string().max(10).optional()
  })),
  skills: z.array(z.string().max(50)),
  achievements: z.array(z.string().max(500)),
  selectedTemplate: z.enum(['modern', 'classic', 'minimal'])
});

export type ResumeData = z.infer<typeof resumeSchema>;

const sanitizeResumeData = (data: any): ResumeData => {
  const sanitized = {
    personalInfo: {
      fullName: DOMPurify.sanitize(data.personalInfo?.fullName || ''),
      email: DOMPurify.sanitize(data.personalInfo?.email || ''),
      phone: DOMPurify.sanitize(data.personalInfo?.phone || ''),
      location: DOMPurify.sanitize(data.personalInfo?.location || ''),
      linkedin: DOMPurify.sanitize(data.personalInfo?.linkedin || ''),
      website: DOMPurify.sanitize(data.personalInfo?.website || '')
    },
    summary: DOMPurify.sanitize(data.summary || ''),
    experience: (data.experience || []).map((exp: any) => ({
      id: exp.id || Date.now().toString(),
      company: DOMPurify.sanitize(exp.company || ''),
      position: DOMPurify.sanitize(exp.position || ''),
      startDate: exp.startDate || '',
      endDate: exp.endDate || '',
      current: Boolean(exp.current),
      description: DOMPurify.sanitize(exp.description || '')
    })),
    education: (data.education || []).map((edu: any) => ({
      id: edu.id || Date.now().toString(),
      institution: DOMPurify.sanitize(edu.institution || ''),
      degree: DOMPurify.sanitize(edu.degree || ''),
      field: DOMPurify.sanitize(edu.field || ''),
      graduationDate: edu.graduationDate || '',
      gpa: edu.gpa ? DOMPurify.sanitize(edu.gpa) : ''
    })),
    skills: (data.skills || []).map((skill: string) => DOMPurify.sanitize(skill)),
    achievements: (data.achievements || []).map((achievement: string) => DOMPurify.sanitize(achievement)),
    selectedTemplate: data.selectedTemplate || 'modern'
  };

  return resumeSchema.parse(sanitized);
};

export const useResumeData = () => {
  const { user } = useAuth();
  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      website: ''
    },
    summary: '',
    experience: [],
    education: [],
    skills: [],
    achievements: [],
    selectedTemplate: 'modern' as const
  });
  const [loading, setLoading] = useState(true);
  const [currentResumeId, setCurrentResumeId] = useState<string | null>(null);

  // Load user's resume data
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const loadResumeData = async () => {
      try {
        const { data: resumes, error } = await supabase
          .from('resumes')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(1);

        if (error) {
          console.error('Error loading resume:', error);
          setLoading(false);
          return;
        }

        if (resumes && resumes.length > 0) {
          const resume = resumes[0];
          setCurrentResumeId(resume.id);
          
          const sanitizedData = sanitizeResumeData({
            personalInfo: resume.personal_info,
            summary: resume.summary,
            experience: resume.experience,
            education: resume.education,
            skills: resume.skills,
            achievements: resume.achievements,
            selectedTemplate: resume.selected_template
          });
          
          setResumeData(sanitizedData);
        } else {
          // Create a new resume for the user
          await createNewResume();
        }
      } catch (error) {
        console.error('Error in loadResumeData:', error);
        toast({
          title: "Error",
          description: "Failed to load resume data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadResumeData();
  }, [user]);

  const createNewResume = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('resumes')
        .insert([{
          user_id: user.id,
          title: 'My Resume',
          personal_info: resumeData.personalInfo,
          summary: resumeData.summary,
          experience: resumeData.experience,
          education: resumeData.education,
          skills: resumeData.skills,
          achievements: resumeData.achievements,
          selected_template: resumeData.selectedTemplate
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating resume:', error);
        return;
      }

      setCurrentResumeId(data.id);
    } catch (error) {
      console.error('Error in createNewResume:', error);
    }
  };

  const saveResumeData = async (newData: ResumeData) => {
    if (!user || !currentResumeId) return;

    try {
      const sanitizedData = sanitizeResumeData(newData);
      
      const { error } = await supabase
        .from('resumes')
        .update({
          personal_info: sanitizedData.personalInfo,
          summary: sanitizedData.summary,
          experience: sanitizedData.experience,
          education: sanitizedData.education,
          skills: sanitizedData.skills,
          achievements: sanitizedData.achievements,
          selected_template: sanitizedData.selectedTemplate,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentResumeId);

      if (error) {
        console.error('Error saving resume:', error);
        toast({
          title: "Error",
          description: "Failed to save resume data",
          variant: "destructive"
        });
        return;
      }

      setResumeData(sanitizedData);
    } catch (error) {
      console.error('Error in saveResumeData:', error);
      toast({
        title: "Error",
        description: "Invalid data format",
        variant: "destructive"
      });
    }
  };

  return {
    resumeData,
    setResumeData: saveResumeData,
    loading,
    currentResumeId
  };
};
