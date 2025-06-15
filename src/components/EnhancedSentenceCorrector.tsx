
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Lightbulb, BookOpen, AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface CorrectionResult {
  original: string;
  corrected: string;
  isCorrect: boolean;
  explanation: string;
  errors: Array<{
    type: string;
    original: string;
    corrected: string;
    explanation: string;
  }>;
  score: number;
  tips: string[];
}

const EnhancedSentenceCorrector = () => {
  const [sentence, setSentence] = useState('');
  const [result, setResult] = useState<CorrectionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const correctSentence = async () => {
    if (!sentence.trim()) {
      toast({
        title: "Error",
        description: "Please enter a sentence to check.",
        variant: "destructive"
      });
      return;
    }
    
    if (!user) {
      toast({
        title: "Error",
        description: "Please sign in to use this feature.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      console.log('🔄 Sending sentence for correction:', sentence);
      
      const { data, error: functionError } = await supabase.functions.invoke('correct-sentence', {
        body: { sentence: sentence.trim() }
      });

      console.log('📨 Function response data:', data);
      console.log('⚠️ Function error:', functionError);

      if (functionError) {
        console.error('🚨 Supabase function error:', functionError);
        throw new Error('Connection failed. Please check your internet connection and try again.');
      }

      if (data && data.error) {
        console.error('❌ Function returned error:', data.error, data.details);
        throw new Error(data.error);
      }

      if (!data || !data.original) {
        console.error('⚠️ Invalid response format:', data);
        throw new Error('Invalid response received. Please try again.');
      }

      setResult(data);
      setError(null);

      // Save correction to database if successful
      try {
        const { error: dbError } = await supabase.from('sentence_corrections').insert({
          user_id: user.id,
          original_sentence: sentence,
          corrected_sentence: data.corrected,
          explanation: data.explanation,
          errors: data.errors,
          score: data.score
        });

        if (dbError) {
          console.error('📝 Database error:', dbError);
        }

        // Add daily activity points
        const points = data.isCorrect ? 5 : 10;
        const { error: activityError } = await supabase.from('daily_activities').insert({
          user_id: user.id,
          activity_type: 'sentence_correction',
          points_earned: points
        });

        if (activityError && activityError.code !== '23505') {
          console.error('📊 Activity tracking error:', activityError);
        }

        toast({
          title: "Analysis Complete!",
          description: `You earned ${points} points for this correction.`,
        });
      } catch (dbError) {
        console.error('💾 Database operation failed:', dbError);
        // Don't show error to user since the main function worked
      }

    } catch (error: any) {
      console.error('💥 Error in sentence correction:', error);
      const errorMessage = error.message || "Service temporarily unavailable. Please try again.";
      setError(errorMessage);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 dark:text-white">
          <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <span>AI Sentence Corrector</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Enter a sentence to check for grammar, spelling, and style:
          </label>
          <Textarea
            value={sentence}
            onChange={(e) => setSentence(e.target.value)}
            placeholder="Type your sentence here... (e.g., 'I am go to the store yesterday')"
            className="min-h-[100px] dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
          />
          <div className="flex gap-2">
            <Button
              onClick={correctSentence}
              disabled={loading || !sentence.trim() || !user}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Check My Sentence'
              )}
            </Button>
            {error && (
              <Button
                onClick={correctSentence}
                variant="outline"
                disabled={loading || !sentence.trim() || !user}
                className="dark:border-gray-600"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            )}
          </div>
          
          {!user && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Please sign in to use the sentence corrector feature.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p>{error}</p>
                <div className="text-sm">
                  <p className="font-medium">Troubleshooting tips:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Check your internet connection</li>
                    <li>Try a shorter sentence</li>
                    <li>Refresh the page and try again</li>
                    <li>Contact support if the problem persists</li>
                  </ul>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {result && !error && (
          <div className="space-y-4">
            {/* Score and Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {result.isCorrect ? (
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                )}
                <span className="font-medium dark:text-white">
                  {result.isCorrect ? 'Perfect!' : 'Needs Improvement'}
                </span>
              </div>
              <Badge variant={getScoreBadgeVariant(result.score)}>
                Score: {result.score}/100
              </Badge>
            </div>

            {/* Original vs Corrected */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-gray-700 dark:text-gray-300">Your Sentence:</h4>
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-red-800 dark:text-red-300">{result.original}</p>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-gray-700 dark:text-gray-300">Corrected Version:</h4>
                <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-green-800 dark:text-green-300">{result.corrected}</p>
                </div>
              </div>
            </div>

            {/* Explanation */}
            <Alert className="dark:bg-blue-900/20 dark:border-blue-800">
              <Lightbulb className="h-4 w-4" />
              <AlertDescription className="dark:text-blue-300">
                <strong>Explanation:</strong> {result.explanation}
              </AlertDescription>
            </Alert>

            {/* Specific Errors */}
            {result.errors && result.errors.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-700 dark:text-gray-300">Specific Issues Found:</h4>
                {result.errors.map((error, index) => (
                  <div key={index} className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant="outline" className="dark:border-yellow-600 dark:text-yellow-300">{error.type}</Badge>
                    </div>
                    <div className="grid md:grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium text-red-600 dark:text-red-400">Wrong: </span>
                        <span className="text-red-700 dark:text-red-300">{error.original}</span>
                      </div>
                      <div>
                        <span className="font-medium text-green-600 dark:text-green-400">Correct: </span>
                        <span className="text-green-700 dark:text-green-300">{error.corrected}</span>
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mt-2">{error.explanation}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Tips */}
            {result.tips && result.tips.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-700 dark:text-gray-300">💡 Tips for Improvement:</h4>
                <ul className="space-y-1">
                  {result.tips.map((tip, index) => (
                    <li key={index} className="text-sm text-gray-600 dark:text-gray-300 flex items-start">
                      <span className="text-blue-600 dark:text-blue-400 mr-2">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedSentenceCorrector;
