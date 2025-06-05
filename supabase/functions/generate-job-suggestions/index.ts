
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userProfile, jobRequirements, location } = await req.json();

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
        'Authorization': `Bearer ${openAIApiKey}`,
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
      return new Response(JSON.stringify({ jobs: parsedContent.jobs || [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      return new Response(JSON.stringify({ error: 'Failed to process AI response' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Error in generate-job-suggestions function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
