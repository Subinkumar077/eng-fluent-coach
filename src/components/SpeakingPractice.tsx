
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Mic, Send, MessageCircle, Volume2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

const topics = [
  "Daily Routine", "Travel & Tourism", "Food & Cooking", "Work & Career",
  "Hobbies & Interests", "Technology", "Environment", "Health & Fitness"
];

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const SpeakingPractice = () => {
  const [selectedTopic, setSelectedTopic] = useState('');
  const [conversation, setConversation] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const { user } = useAuth();

  const startConversation = (topic: string) => {
    setSelectedTopic(topic);
    setConversation([{
      role: 'assistant',
      content: `Hi! Let's practice speaking English about ${topic}. I'll help you improve your conversation skills. What would you like to talk about regarding ${topic}?`
    }]);
  };

  const sendMessage = async () => {
    if (!currentMessage.trim() || !user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('speaking-practice', {
        body: {
          topic: selectedTopic,
          conversation: conversation,
          userMessage: currentMessage
        }
      });

      if (error) throw error;

      setConversation(data.conversation);
      setCurrentMessage('');

      // Save session to database
      await supabase.from('speaking_sessions').insert({
        user_id: user.id,
        topic: selectedTopic,
        conversation: data.conversation,
        score: 80 // Basic score for now
      });

      // Add daily activity
      await supabase.from('daily_activities').insert({
        user_id: user.id,
        activity_type: 'speaking_practice',
        points_earned: 10
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const startListening = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setCurrentMessage(transcript);
      };

      recognition.start();
    } else {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Please use a supported browser or type your message.",
        variant: "destructive"
      });
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  if (!selectedTopic) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageCircle className="w-6 h-6 text-blue-600" />
            <span>Speaking Practice</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Choose a topic to start practicing your English conversation skills with our AI tutor.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {topics.map((topic) => (
              <Button
                key={topic}
                variant="outline"
                onClick={() => startConversation(topic)}
                className="h-auto py-3 text-center"
              >
                {topic}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <MessageCircle className="w-6 h-6 text-blue-600" />
            <span>Speaking Practice</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">{selectedTopic}</Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedTopic('');
                setConversation([]);
              }}
            >
              Change Topic
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        {/* Conversation Area */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 bg-gray-50 rounded-lg">
          {conversation.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-800 shadow-sm'
                }`}
              >
                <div className="flex items-start space-x-2">
                  <span className="flex-1">{message.content}</span>
                  {message.role === 'assistant' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => speakText(message.content)}
                      className="p-1 h-auto"
                    >
                      <Volume2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="flex space-x-2">
          <Input
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            placeholder="Type your message or use voice input..."
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            className="flex-1"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={startListening}
            disabled={isListening}
            className={isListening ? 'bg-red-100 border-red-300' : ''}
          >
            <Mic className={`w-4 h-4 ${isListening ? 'text-red-600' : ''}`} />
          </Button>
          <Button
            onClick={sendMessage}
            disabled={loading || !currentMessage.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SpeakingPractice;
