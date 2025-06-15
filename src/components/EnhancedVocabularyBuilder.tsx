
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Volume2, Check, X, RotateCcw, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface VocabularyWord {
  id: string;
  word: string;
  pronunciation: string;
  part_of_speech: string;
  meaning: string;
  hindi_meaning: string;
  example_sentence: string;
  usage_tip: string;
  difficulty: string;
  synonyms: string[];
}

interface UserProgress {
  learned: boolean;
  word_id: string;
}

const EnhancedVocabularyBuilder = () => {
  const [currentWord, setCurrentWord] = useState<VocabularyWord | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [showMeaning, setShowMeaning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [todayProgress, setTodayProgress] = useState(0);
  const { user } = useAuth();

  const dailyGoal = 5; // words per day

  useEffect(() => {
    if (user) {
      fetchDailyWord();
      fetchUserProgress();
    }
  }, [user]);

  const fetchDailyWord = async () => {
    try {
      const { data: words, error } = await supabase
        .from('vocabulary_words')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      if (words && words.length > 0) {
        // Get a random word from the collection
        const randomWord = words[Math.floor(Math.random() * words.length)];
        setCurrentWord(randomWord);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch vocabulary word",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProgress = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_vocabulary')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      setUserProgress(data || []);
      
      // Count today's learned words
      const today = new Date().toISOString().split('T')[0];
      const { data: todayData, error: todayError } = await supabase
        .from('user_vocabulary')
        .select('*')
        .eq('user_id', user.id)
        .gte('learned_at', `${today}T00:00:00`)
        .lte('learned_at', `${today}T23:59:59`);

      if (!todayError && todayData) {
        setTodayProgress(todayData.length);
      }
    } catch (error: any) {
      console.error('Error fetching progress:', error);
    }
  };

  const markAsLearned = async (learned: boolean) => {
    if (!user || !currentWord) return;

    try {
      const existingProgress = userProgress.find(p => p.word_id === currentWord.id);

      if (existingProgress) {
        await supabase
          .from('user_vocabulary')
          .update({ 
            learned,
            learned_at: learned ? new Date().toISOString() : null
          })
          .eq('user_id', user.id)
          .eq('word_id', currentWord.id);
      } else {
        await supabase
          .from('user_vocabulary')
          .insert({
            user_id: user.id,
            word_id: currentWord.id,
            learned,
            learned_at: learned ? new Date().toISOString() : null
          });
      }

      if (learned) {
        // Add daily activity points
        await supabase.from('daily_activities').insert({
          user_id: user.id,
          activity_type: 'vocabulary_learning',
          points_earned: 5
        });

        setTodayProgress(prev => prev + 1);
        
        toast({
          title: "Great job!",
          description: "You earned 5 points for learning this word!",
        });
      }

      // Fetch new progress and new word
      await fetchUserProgress();
      await fetchDailyWord();
      setShowMeaning(false);

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const speakWord = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.7;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p>Loading your vocabulary word...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentWord) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p>No vocabulary words available. Please try again later.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Star className="w-6 h-6 text-blue-600" />
            <span>Daily Vocabulary</span>
          </CardTitle>
          <Badge className={getDifficultyColor(currentWord.difficulty)}>
            {currentWord.difficulty}
          </Badge>
        </div>
        
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Today's Progress</span>
            <span>{Math.min(todayProgress, dailyGoal)}/{dailyGoal} words</span>
          </div>
          <Progress value={(Math.min(todayProgress, dailyGoal) / dailyGoal) * 100} className="h-2" />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Word Display */}
        <div className="text-center space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-center space-x-3">
              <h2 className="text-3xl font-bold text-gray-900">{currentWord.word}</h2>
              <Button
                variant="outline"
                size="icon"
                onClick={() => speakWord(currentWord.word)}
              >
                <Volume2 className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex items-center justify-center space-x-3">
              <span className="text-lg text-gray-600">{currentWord.pronunciation}</span>
              <Badge variant="outline">{currentWord.part_of_speech}</Badge>
            </div>
          </div>

          {!showMeaning ? (
            <Button onClick={() => setShowMeaning(true)} className="w-full">
              Show Meaning & Examples
            </Button>
          ) : (
            <div className="space-y-4 text-left">
              {/* Meanings */}
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-700">Meaning:</h3>
                <p className="text-gray-900">{currentWord.meaning}</p>
                <p className="text-blue-600 text-sm">हिंदी: {currentWord.hindi_meaning}</p>
              </div>

              {/* Example */}
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-700">Example:</h3>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-gray-800 italic">"{currentWord.example_sentence}"</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => speakWord(currentWord.example_sentence)}
                    className="mt-2 p-1"
                  >
                    <Volume2 className="w-3 h-3 mr-1" />
                    Listen
                  </Button>
                </div>
              </div>

              {/* Usage Tip */}
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-700">💡 Usage Tip:</h3>
                <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                  {currentWord.usage_tip}
                </p>
              </div>

              {/* Synonyms */}
              {currentWord.synonyms && currentWord.synonyms.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-700">Synonyms:</h3>
                  <div className="flex flex-wrap gap-2">
                    {currentWord.synonyms.map((synonym, index) => (
                      <Badge key={index} variant="secondary">
                        {synonym}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <Button
                  onClick={() => markAsLearned(true)}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <Check className="w-4 h-4 mr-2" />
                  I Know This Word
                </Button>
                <Button
                  onClick={() => markAsLearned(false)}
                  variant="outline"
                  className="flex-1"
                >
                  <X className="w-4 h-4 mr-2" />
                  Need More Practice
                </Button>
              </div>

              <Button
                onClick={() => {
                  fetchDailyWord();
                  setShowMeaning(false);
                }}
                variant="outline"
                className="w-full"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Get New Word
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedVocabularyBuilder;
