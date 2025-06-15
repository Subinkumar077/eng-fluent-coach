
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
    console.log('✅ Received request to speaking-practice function');
    
    const body = await req.json();
    const { topic, conversation, userMessage } = body;
    console.log('📝 Topic:', topic);
    console.log('📝 User message:', userMessage);
    console.log('📝 Conversation length:', conversation ? conversation.length : 0);
    
    // Validate required inputs
    if (!userMessage || userMessage.trim().length === 0) {
      console.log('❌ No user message provided');
      return new Response(JSON.stringify({ 
        error: 'Message is required for conversation practice.' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!topic || topic.trim().length === 0) {
      console.log('❌ No topic provided');
      return new Response(JSON.stringify({ 
        error: 'Topic is required for conversation practice.' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    if (!geminiApiKey) {
      console.log('🚨 Gemini API key not found');
      return new Response(JSON.stringify({ 
        error: 'AI service configuration error. Please contact support.' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const conversationHistory = Array.isArray(conversation) ? conversation : [];
    const prompt = `You are an English conversation partner helping a student practice speaking. 

Topic: ${topic}

Conversation so far:
${conversationHistory.map((msg: any) => `${msg.role}: ${msg.content}`).join('\n')}

User just said: "${userMessage}"

Respond as a helpful English tutor. Keep your response:
1. Natural and conversational
2. Appropriate for intermediate English learners
3. Encouraging and supportive
4. Ask follow-up questions to continue the conversation
5. Gently correct any major grammar mistakes by rephrasing in your response
6. Keep responses under 100 words

Response:`;

    console.log('🚀 Making request to Gemini API...');

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 200,
        },
      }),
    });

    console.log('📡 Gemini API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Gemini API error:', response.status, errorText);
      
      let errorMessage = 'AI service temporarily unavailable. Please try again.';
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
        details: `API responded with status: ${response.status}`
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    console.log('📊 Gemini API response received');
    
    // Check if response has the expected structure
    if (!data.candidates || !Array.isArray(data.candidates) || data.candidates.length === 0) {
      console.error('❌ Unexpected Gemini API response structure:', data);
      
      return new Response(JSON.stringify({
        error: 'Unable to generate response. Please try again.',
        details: 'Invalid API response structure'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const candidate = data.candidates[0];
    if (!candidate || !candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
      console.error('❌ No content in Gemini response candidate');
      
      return new Response(JSON.stringify({
        error: 'No response generated. Please try again.',
        details: 'Empty response content'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiResponseText = candidate.content.parts[0].text;
    
    if (!aiResponseText || aiResponseText.trim().length === 0) {
      console.error('❌ Empty text content in Gemini response');
      
      return new Response(JSON.stringify({
        error: 'No response generated. Please try again.',
        details: 'Empty response text'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiResponse = aiResponseText.trim();
    console.log('✅ AI response generated successfully');
    console.log('📄 Response preview:', aiResponse.substring(0, 100) + '...');

    const updatedConversation = [
      ...conversationHistory,
      { role: 'user', content: userMessage },
      { role: 'assistant', content: aiResponse }
    ];

    return new Response(JSON.stringify({ 
      response: aiResponse,
      conversation: updatedConversation
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('💥 Critical error in speaking-practice function:', error);
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
