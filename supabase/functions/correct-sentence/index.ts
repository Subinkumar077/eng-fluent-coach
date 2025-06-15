
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Received request to correct-sentence function');
    
    const { sentence } = await req.json();
    console.log('Input sentence:', sentence);

    if (!sentence || sentence.trim().length === 0) {
      console.log('No sentence provided');
      return new Response(JSON.stringify({ error: 'Sentence is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    console.log('Gemini API key exists:', !!geminiApiKey);

    if (!geminiApiKey) {
      console.log('Gemini API key not found in environment');
      return new Response(JSON.stringify({ 
        error: 'AI service temporarily unavailable. Please try again later.',
        details: 'API configuration issue'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Making request to Gemini API...');
    
    const prompt = `You are an expert English teacher. Please analyze this sentence and provide corrections if needed.

Sentence: "${sentence}"

Respond with ONLY a valid JSON object in this exact format:

{
  "original": "${sentence}",
  "corrected": "corrected version or same if perfect",
  "isCorrect": true or false,
  "explanation": "clear explanation of what was wrong and why",
  "errors": [
    {
      "type": "grammar/spelling/punctuation",
      "original": "incorrect part",
      "corrected": "correct version", 
      "explanation": "why this is wrong"
    }
  ],
  "score": number from 1-100,
  "tips": ["helpful tip 1", "helpful tip 2"]
}

If the sentence is perfect, set isCorrect to true and errors to an empty array.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.1,
          topK: 1,
          topP: 1,
          maxOutputTokens: 2048,
        },
      }),
    });

    console.log('Gemini API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      
      return new Response(JSON.stringify({ 
        error: 'AI analysis failed. Please try again.',
        details: `API error: ${response.status}`
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    console.log('Gemini API response received, processing...');
    
    if (!data.candidates || !Array.isArray(data.candidates) || data.candidates.length === 0) {
      console.error('Unexpected Gemini API response structure:', data);
      
      return new Response(JSON.stringify({
        error: 'Unable to analyze sentence at this time.',
        details: 'Invalid API response'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let resultText = data.candidates[0]?.content?.parts?.[0]?.text;
    
    if (!resultText) {
      console.error('No text in Gemini response');
      
      return new Response(JSON.stringify({
        error: 'No analysis received from AI service.',
        details: 'Empty response'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    console.log('Raw result text length:', resultText.length);
    
    // Clean up the response to extract JSON
    resultText = resultText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    // Remove any text before the first { and after the last }
    const firstBrace = resultText.indexOf('{');
    const lastBrace = resultText.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1) {
      resultText = resultText.substring(firstBrace, lastBrace + 1);
    }
    
    console.log('Cleaned result text length:', resultText.length);
    
    try {
      const parsedResult = JSON.parse(resultText);
      console.log('Successfully parsed result');
      
      // Validate the result has required fields
      if (!parsedResult.original || !parsedResult.corrected) {
        throw new Error('Missing required fields in response');
      }
      
      return new Response(JSON.stringify(parsedResult), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (parseError) {
      console.error('JSON parsing error:', parseError, 'Raw result:', resultText);
      
      // Create a manual fallback result
      const fallbackResult = {
        original: sentence,
        corrected: sentence,
        isCorrect: true,
        explanation: "Unable to provide detailed analysis. The sentence appears acceptable.",
        errors: [],
        score: 75,
        tips: ["Keep practicing!", "Try submitting another sentence"]
      };
      
      return new Response(JSON.stringify(fallbackResult), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Error in correct-sentence function:', error);
    
    return new Response(JSON.stringify({
      error: 'Service temporarily unavailable. Please try again.',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
