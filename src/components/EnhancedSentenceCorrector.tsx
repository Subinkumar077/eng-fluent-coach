
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Lightbulb, BookOpen } from 'lucide-react';
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
  const { user } = useAuth();

  const correctSentence = async () => {
    if (!sentence.trim() || !user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('correct-sentence', {
        body: { sentence: sentence.trim() }
      });

      if (error) throw error;

      setResult(data);

      // Save correction to database
      await supabase.from('sentence_corrections').insert({
        user_id: user.id,
        original_sentence: sentence,
        corrected_sentence: data.corrected,
        explanation: data.explanation,
        errors: data.errors,
        score: data.score
      });

      // Add daily activity points
      const points = data.isCorrect ? 5 : 10; // More points for learning from mistakes
      await supabase.from('daily_activities').insert({
        user_id: user.id,
        activity_type: 'sentence_correction',
        points_earned: points
      });

      toast({
        title: "Sentence Analyzed!",
        description: `You earned ${points} points for this correction.`,
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

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BookOpen className="w-6 h-6 text-blue-600" />
          <span>AI Sentence Corrector</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">
            Enter a sentence to check for grammar, spelling, and style:
          </label>
          <Textarea
            value={sentence}
            onChange={(e) => setSentence(e.target.value)}
            placeholder="Type your sentence here... (e.g., 'I am go to the store yesterday')"
            className="min-h-[100px]"
          />
          <Button
            onClick={correctSentence}
            disabled={loading || !sentence.trim()}
            className="w-full"
          >
            {loading ? 'Analyzing...' : 'Check My Sentence'}
          </Button>
        </div>

        {result && (
          <div className="space-y-4">
            {/* Score and Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {result.isCorrect ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <span className="font-medium">
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
                <h4 className="font-medium text-gray-700">Your Sentence:</h4>
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800">{result.original}</p>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-gray-700">Corrected Version:</h4>
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800">{result.corrected}</p>
                </div>
              </div>
            </div>

            {/* Explanation */}
            <Alert>
              <Lightbulb className="h-4 w-4" />
              <AlertDescription>
                <strong>Explanation:</strong> {result.explanation}
              </AlertDescription>
            </Alert>

            {/* Specific Errors */}
            {result.errors.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-700">Specific Issues Found:</h4>
                {result.errors.map((error, index) => (
                  <div key={index} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant="outline">{error.type}</Badge>
                    </div>
                    <div className="grid md:grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium text-red-600">Wrong: </span>
                        <span className="text-red-700">{error.original}</span>
                      </div>
                      <div>
                        <span className="font-medium text-green-600">Correct: </span>
                        <span className="text-green-700">{error.corrected}</span>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mt-2">{error.explanation}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Tips */}
            {result.tips.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-700">💡 Tips for Improvement:</h4>
                <ul className="space-y-1">
                  {result.tips.map((tip, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
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
