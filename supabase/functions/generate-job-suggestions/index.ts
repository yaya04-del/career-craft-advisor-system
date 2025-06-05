
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

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
    // Get the authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(supabaseUrl!, supabaseServiceKey!);
    
    // Create Supabase client with user's token for user operations
    const supabaseUser = createClient(supabaseUrl!, authHeader.replace('Bearer ', ''));

    // Get user from token
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Rate limiting check - max 10 requests per hour per user
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: recentRequests, error: countError } = await supabaseAdmin
      .from('job_suggestions_audit')
      .select('id')
      .eq('user_id', user.id)
      .gte('created_at', oneHourAgo);

    if (countError) {
      console.error('Error checking rate limit:', countError);
      return new Response(JSON.stringify({ error: 'Database error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (recentRequests && recentRequests.length >= 10) {
      return new Response(JSON.stringify({ 
        error: 'Rate limit exceeded. Please try again later.' 
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse and validate request body
    const { userProfile, jobRequirements, location } = await req.json();

    // Input validation
    if (!userProfile || !jobRequirements) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Sanitize inputs
    const sanitizedJobRequirements = String(jobRequirements).slice(0, 1000);
    const sanitizedLocation = location ? String(location).slice(0, 100) : 'Remote/Any';

    const prompt = `
      Based on the following user profile, suggest 5 relevant job opportunities:
      
      User Profile:
      - Skills: ${userProfile.skills?.slice(0, 20)?.join(', ') || 'Not specified'}
      - Experience: ${userProfile.experience?.slice(0, 10)?.map((exp: any) => `${exp.position} at ${exp.company}`)?.join(', ') || 'Not specified'}
      - Education: ${userProfile.education?.slice(0, 5)?.map((edu: any) => `${edu.degree} in ${edu.field} from ${edu.institution}`)?.join(', ') || 'Not specified'}
      - Summary: ${userProfile.summary?.slice(0, 500) || 'Not specified'}
      
      Job Requirements: ${sanitizedJobRequirements}
      Preferred Location: ${sanitizedLocation}
      
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
            content: 'You are a career advisor AI that provides realistic job suggestions based on user profiles. Always respond with valid JSON. Keep responses professional and helpful.'
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
    
    let parsedContent;
    try {
      parsedContent = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      return new Response(JSON.stringify({ error: 'Failed to process AI response' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Log the request for audit purposes
    const { error: auditError } = await supabaseAdmin
      .from('job_suggestions_audit')
      .insert([{
        user_id: user.id,
        job_requirements: sanitizedJobRequirements,
        location: sanitizedLocation,
        suggestions_count: parsedContent.jobs?.length || 0
      }]);

    if (auditError) {
      console.error('Error logging audit:', auditError);
      // Don't fail the request for audit logging errors
    }

    return new Response(JSON.stringify({ jobs: parsedContent.jobs || [] }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-job-suggestions function:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
