
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sentence } = await req.json();

    if (!sentence || sentence.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Sentence is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!geminiApiKey) {
      return new Response(JSON.stringify({ error: 'Gemini API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `As an English grammar expert, analyze this sentence and provide corrections if needed. Return ONLY a valid JSON response with this exact structure:

{
  "original": "${sentence}",
  "corrected": "corrected version here",
  "isCorrect": true/false,
  "explanation": "detailed explanation of what was wrong and why",
  "errors": [
    {
      "type": "grammar/spelling/punctuation",
      "original": "incorrect part",
      "corrected": "correct version",
      "explanation": "why this is wrong"
    }
  ],
  "score": 1-100,
  "tips": ["helpful tip 1", "helpful tip 2"]
}

Sentence to analyze: "${sentence}"`
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          topK: 1,
          topP: 1,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!response.ok) {
      console.error('Gemini API error:', response.status, response.statusText);
      return new Response(JSON.stringify({ error: 'Failed to analyze sentence' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    
    // Check if response has the expected structure
    if (!data.candidates || !Array.isArray(data.candidates) || data.candidates.length === 0) {
      console.error('Unexpected Gemini API response structure:', data);
      const fallbackResult = {
        original: sentence,
        corrected: sentence,
        isCorrect: true,
        explanation: "Unable to analyze sentence at this time.",
        errors: [],
        score: 50,
        tips: ["Try again later"]
      };
      
      return new Response(JSON.stringify(fallbackResult), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let result = data.candidates[0]?.content?.parts?.[0]?.text;
    
    if (!result) {
      console.error('No text in Gemini response:', data);
      const fallbackResult = {
        original: sentence,
        corrected: sentence,
        isCorrect: true,
        explanation: "Unable to analyze sentence at this time.",
        errors: [],
        score: 50,
        tips: ["Try again later"]
      };
      
      return new Response(JSON.stringify(fallbackResult), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Clean up the response to extract JSON
    result = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    try {
      const parsedResult = JSON.parse(result);
      return new Response(JSON.stringify(parsedResult), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (parseError) {
      console.error('JSON parsing error:', parseError, 'Raw result:', result);
      // Fallback if JSON parsing fails
      const fallbackResult = {
        original: sentence,
        corrected: sentence,
        isCorrect: true,
        explanation: "Unable to analyze sentence at this time.",
        errors: [],
        score: 50,
        tips: ["Try again later"]
      };
      
      return new Response(JSON.stringify(fallbackResult), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Error in correct-sentence function:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
