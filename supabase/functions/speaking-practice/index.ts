
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
    const { topic, conversation, userMessage } = await req.json();
    
    const conversationHistory = conversation || [];
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

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`, {
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

    const data = await response.json();
    const aiResponse = data.candidates[0].content.parts[0].text.trim();

    return new Response(JSON.stringify({ 
      response: aiResponse,
      conversation: [
        ...conversationHistory,
        { role: 'user', content: userMessage },
        { role: 'assistant', content: aiResponse }
      ]
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in speaking-practice function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
