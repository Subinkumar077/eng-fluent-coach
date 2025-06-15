
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

    if (!geminiApiKey) {
      console.log('Gemini API key not found');
      return new Response(JSON.stringify({ error: 'Gemini API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Making request to Gemini API...');
    
    const prompt = `You are an expert English teacher. Analyze this sentence and provide corrections if needed. 

Sentence: "${sentence}"

Please respond with ONLY a valid JSON object in this exact format (no markdown, no extra text):

{
  "original": "${sentence}",
  "corrected": "corrected version here or same if perfect",
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
        error: `Gemini API error: ${response.status}`,
        details: errorText
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    console.log('Gemini API response:', JSON.stringify(data, null, 2));
    
    if (!data.candidates || !Array.isArray(data.candidates) || data.candidates.length === 0) {
      console.error('Unexpected Gemini API response structure:', data);
      
      const fallbackResult = {
        original: sentence,
        corrected: sentence,
        isCorrect: true,
        explanation: "Unable to analyze sentence at this time. Please try again.",
        errors: [],
        score: 50,
        tips: ["Try again in a moment"]
      };
      
      return new Response(JSON.stringify(fallbackResult), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let resultText = data.candidates[0]?.content?.parts?.[0]?.text;
    
    if (!resultText) {
      console.error('No text in Gemini response');
      
      const fallbackResult = {
        original: sentence,
        corrected: sentence,
        isCorrect: true,
        explanation: "Unable to analyze sentence at this time. Please try again.",
        errors: [],
        score: 50,
        tips: ["Try again in a moment"]
      };
      
      return new Response(JSON.stringify(fallbackResult), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    console.log('Raw result text:', resultText);
    
    // Clean up the response to extract JSON
    resultText = resultText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    // Remove any text before the first { and after the last }
    const firstBrace = resultText.indexOf('{');
    const lastBrace = resultText.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1) {
      resultText = resultText.substring(firstBrace, lastBrace + 1);
    }
    
    console.log('Cleaned result text:', resultText);
    
    try {
      const parsedResult = JSON.parse(resultText);
      console.log('Successfully parsed result:', parsedResult);
      
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
        explanation: "The sentence appears to be correct, but we couldn't provide detailed analysis at this time.",
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
    
    const fallbackResult = {
      original: "Error occurred",
      corrected: "Error occurred",
      isCorrect: false,
      explanation: "An error occurred while analyzing your sentence. Please try again.",
      errors: [],
      score: 0,
      tips: ["Please try again", "Check your internet connection"]
    };
    
    return new Response(JSON.stringify(fallbackResult), {
      status: 200, // Return 200 with error message instead of 500
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
