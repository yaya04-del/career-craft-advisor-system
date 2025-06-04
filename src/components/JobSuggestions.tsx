
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Loader2, MapPin, DollarSign } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

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
  const [apiKey, setApiKey] = useState('');
  const [jobRequirements, setJobRequirements] = useState('');
  const [location, setLocation] = useState('');
  const [jobSuggestions, setJobSuggestions] = useState<JobSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load API key from localStorage on component mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem('openai_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  // Save API key to localStorage when it changes
  const handleApiKeyChange = (value: string) => {
    setApiKey(value);
    if (value.trim()) {
      localStorage.setItem('openai_api_key', value);
    } else {
      localStorage.removeItem('openai_api_key');
    }
  };

  // Clear saved API key
  const clearApiKey = () => {
    setApiKey('');
    localStorage.removeItem('openai_api_key');
    toast({
      title: "API Key Cleared",
      description: "Your saved API key has been removed.",
    });
  };

  const generateJobSuggestions = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your OpenAI API key to get job suggestions.",
        variant: "destructive",
      });
      return;
    }

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

      const prompt = `
        Based on the following user profile, suggest 5 relevant job opportunities:
        
        User Profile:
        - Skills: ${userProfile.skills.join(', ')}
        - Experience: ${userProfile.experience.map(exp => `${exp.position} at ${exp.company}`).join(', ')}
        - Education: ${userProfile.education.map(edu => `${edu.degree} in ${edu.field} from ${edu.institution}`).join(', ')}
        - Summary: ${userProfile.summary}
        
        Job Requirements: ${jobRequirements}
        Preferred Location: ${location || 'Remote/Any'}
        
        Please provide job suggestions in the following JSON format:
        {
          "jobs": [
            {
              "title": "Job Title",
              "company": "Company Name",
              "location": "City, State/Country",
              "salaryRange": "$XX,XXX - $XX,XXX",
              "description": "Brief job description",
              "requirements": ["requirement1", "requirement2", "requirement3"],
              "matchScore": 85
            }
          ]
        }
        
        Focus on real job titles and realistic salary ranges. Match score should be 1-100 based on profile alignment.
      `;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a career advisor AI that provides realistic job suggestions based on user profiles. Always respond with valid JSON.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      try {
        const parsedContent = JSON.parse(content);
        setJobSuggestions(parsedContent.jobs || []);
        toast({
          title: "Job Suggestions Generated!",
          description: `Found ${parsedContent.jobs?.length || 0} job suggestions for you.`,
        });
      } catch (parseError) {
        console.error('Failed to parse OpenAI response:', parseError);
        toast({
          title: "Error Processing Response",
          description: "Failed to process the AI response. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error generating job suggestions:', error);
      toast({
        title: "Error",
        description: "Failed to generate job suggestions. Please check your API key and try again.",
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
        {/* API Key Input */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              OpenAI API Key
            </label>
            {apiKey && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearApiKey}
                className="text-xs text-gray-500 hover:text-red-500"
              >
                Clear Saved Key
              </Button>
            )}
          </div>
          <Input
            type="password"
            placeholder={apiKey ? "API key saved ✓" : "sk-..."}
            value={apiKey}
            onChange={(e) => handleApiKeyChange(e.target.value)}
          />
          <p className="text-xs text-gray-500 mt-1">
            {apiKey ? "Your API key is saved locally for this session." : "Your API key will be saved locally for convenience."}
          </p>
        </div>

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
            <li>API key is stored locally and never sent to our servers</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default JobSuggestions;
