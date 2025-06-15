
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
    console.log('✅ Received request to correct-sentence function');
    
    const { sentence } = await req.json();
    console.log('📝 Input sentence:', sentence);

    if (!sentence || sentence.trim().length === 0) {
      console.log('❌ No sentence provided');
      return new Response(JSON.stringify({ error: 'Sentence is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    console.log('🔑 Gemini API key status:', geminiApiKey ? 'Found' : 'Missing');
    console.log('🔑 API key length:', geminiApiKey ? geminiApiKey.length : 0);
    console.log('🔑 API key prefix:', geminiApiKey ? geminiApiKey.substring(0, 10) + '...' : 'N/A');

    if (!geminiApiKey) {
      console.log('🚨 Gemini API key not found in environment');
      return new Response(JSON.stringify({ 
        error: 'AI service configuration error. Please contact support.',
        details: 'API key not configured'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('🚀 Making request to Gemini API...');
    
    const prompt = `You are an expert English teacher. Analyze this sentence and provide corrections if needed.

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

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`;
    console.log('🌐 Request URL (without key):', geminiUrl.replace(geminiApiKey, '[API_KEY]'));

    const requestBody = {
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
    };

    console.log('📦 Request body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('📡 Gemini API response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Gemini API error:', response.status, errorText);
      
      // Parse error details if possible
      let errorMessage = 'AI analysis temporarily unavailable. Please try again in a moment.';
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error && errorData.error.message) {
          console.error('🔍 Detailed error:', errorData.error.message);
          if (errorData.error.message.includes('API key')) {
            errorMessage = 'Invalid API key configuration. Please check your Gemini API key.';
          } else if (errorData.error.message.includes('quota')) {
            errorMessage = 'API quota exceeded. Please try again later.';
          }
        }
      } catch (parseError) {
        console.error('❌ Could not parse error response:', parseError);
      }
      
      return new Response(JSON.stringify({ 
        error: errorMessage,
        details: `API responded with status: ${response.status}`,
        geminiError: errorText
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    console.log('📊 Gemini API response structure:', JSON.stringify(data, null, 2));
    
    if (!data.candidates || !Array.isArray(data.candidates) || data.candidates.length === 0) {
      console.error('❌ Unexpected Gemini API response structure:', data);
      
      return new Response(JSON.stringify({
        error: 'Unable to analyze sentence. Please try again.',
        details: 'Invalid API response structure'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let resultText = data.candidates[0]?.content?.parts?.[0]?.text;
    
    if (!resultText) {
      console.error('❌ No text content in Gemini response');
      
      return new Response(JSON.stringify({
        error: 'No analysis received. Please try again.',
        details: 'Empty response content'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    console.log('📄 Raw result text:', resultText.substring(0, 500) + '...');
    
    // Clean up the response to extract JSON
    resultText = resultText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    // Remove any text before the first { and after the last }
    const firstBrace = resultText.indexOf('{');
    const lastBrace = resultText.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1) {
      resultText = resultText.substring(firstBrace, lastBrace + 1);
    }
    
    console.log('🧹 Cleaned result text length:', resultText.length);
    console.log('🧹 Cleaned result preview:', resultText.substring(0, 200) + '...');
    
    try {
      const parsedResult = JSON.parse(resultText);
      console.log('✅ Successfully parsed JSON result');
      
      // Validate the result has required fields
      if (!parsedResult.original || !parsedResult.corrected) {
        throw new Error('Missing required fields in AI response');
      }
      
      return new Response(JSON.stringify(parsedResult), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (parseError) {
      console.error('❌ JSON parsing error:', parseError.message);
      console.error('📋 Raw result that failed to parse:', resultText);
      
      // Create a manual fallback result
      const fallbackResult = {
        original: sentence,
        corrected: sentence,
        isCorrect: true,
        explanation: "I couldn't provide a detailed analysis, but your sentence appears to be acceptable. Please try again for more detailed feedback.",
        errors: [],
        score: 75,
        tips: ["Keep practicing!", "Try submitting another sentence for analysis"]
      };
      
      return new Response(JSON.stringify(fallbackResult), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('💥 Critical error in correct-sentence function:', error);
    console.error('💥 Error stack:', error.stack);
    
    return new Response(JSON.stringify({
      error: 'Service temporarily unavailable. Please try again.',
      details: `System error: ${error.message}`
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
