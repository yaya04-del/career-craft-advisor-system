
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Loader2, MapPin, DollarSign } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface JobSuggestion {
  title: string;
  company: string;
  location: string;
  salaryRange: string;
  description: string;
  requirements: string[];
  matchScore: number;
}

interface JobSuggestionsProps {
  resumeData: any;
}

const JobSuggestions: React.FC<JobSuggestionsProps> = ({ resumeData }) => {
  const [jobRequirements, setJobRequirements] = useState('');
  const [location, setLocation] = useState('');
  const [jobSuggestions, setJobSuggestions] = useState<JobSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const generateJobSuggestions = async () => {
    if (!jobRequirements.trim()) {
      toast({
        title: "Requirements Missing",
        description: "Please describe what type of job you're looking for.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const userProfile = {
        skills: resumeData.skills,
        experience: resumeData.experience,
        education: resumeData.education,
        summary: resumeData.summary
      };

      const { data, error } = await supabase.functions.invoke('generate-job-suggestions', {
        body: {
          userProfile,
          jobRequirements,
          location
        }
      });

      if (error) {
        throw error;
      }

      setJobSuggestions(data.jobs || []);
      toast({
        title: "Job Suggestions Generated!",
        description: `Found ${data.jobs?.length || 0} job suggestions for you.`,
      });
    } catch (error) {
      console.error('Error generating job suggestions:', error);
      toast({
        title: "Error",
        description: "Failed to generate job suggestions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="w-5 h-5" />
          AI Job Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Job Requirements */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What type of job are you looking for?
          </label>
          <Textarea
            placeholder="e.g., Software engineer role, remote work, startup environment, full-stack development..."
            value={jobRequirements}
            onChange={(e) => setJobRequirements(e.target.value)}
            rows={3}
          />
        </div>

        {/* Location Preference */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preferred Location (Optional)
          </label>
          <Input
            placeholder="e.g., San Francisco, CA or Remote"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        <Button 
          onClick={generateJobSuggestions} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating Suggestions...
            </>
          ) : (
            'Get Job Suggestions'
          )}
        </Button>

        {/* Job Suggestions Results */}
        {jobSuggestions.length > 0 && (
          <div className="space-y-4 mt-6">
            <h3 className="font-semibold text-lg">Recommended Jobs</h3>
            {jobSuggestions.map((job, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-lg">{job.title}</h4>
                    <p className="text-gray-600">{job.company}</p>
                  </div>
                  <Badge variant={job.matchScore >= 80 ? "default" : "secondary"}>
                    {job.matchScore}% match
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {job.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    {job.salaryRange}
                  </div>
                </div>

                <p className="text-sm text-gray-700">{job.description}</p>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Key Requirements:</p>
                  <div className="flex flex-wrap gap-2">
                    {job.requirements.map((req, reqIndex) => (
                      <Badge key={reqIndex} variant="outline" className="text-xs">
                        {req}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Help Text */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>💡 Tips:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Be specific about your job preferences for better suggestions</li>
            <li>Include industry, role level, and work environment preferences</li>
            <li>Your resume data is used to match you with relevant opportunities</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default JobSuggestions;
