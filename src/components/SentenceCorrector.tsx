
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, ArrowRight, Lightbulb } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const SentenceCorrector = () => {
  const [inputText, setInputText] = useState('');
  const [correction, setCorrection] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Mock AI correction function
  const correctSentence = async () => {
    if (!inputText.trim()) {
      toast({
        title: "Please enter a sentence",
        description: "Type or paste the sentence you'd like me to check.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate AI processing
    setTimeout(() => {
      const mockCorrection = {
        original: inputText,
        corrected: inputText.includes('goed') ? inputText.replace('goed', 'went') : 
                  inputText.includes('dont') ? inputText.replace('dont', "don't") :
                  inputText.charAt(0).toUpperCase() + inputText.slice(1) + (inputText.endsWith('.') ? '' : '.'),
        errors: [
          {
            type: 'Grammar',
            issue: 'Verb tense',
            explanation: 'Use "went" instead of "goed" for past tense of "go"',
            severity: 'high'
          }
        ],
        score: 85,
        suggestions: [
          'Try using more descriptive adjectives',
          'Consider varying your sentence structure'
        ]
      };
      
      setCorrection(mockCorrection);
      setIsLoading(false);
      
      toast({
        title: "Sentence corrected! ✨",
        description: "Your sentence has been analyzed and improved."
      });
    }, 1500);
  };

  const resetCorrection = () => {
    setCorrection(null);
    setInputText('');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <span>Sentence Correction & Feedback</span>
          </CardTitle>
          <p className="text-gray-600">
            Type or paste your sentence below, and I'll help you improve it with detailed explanations.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Sentence
            </label>
            <Textarea
              placeholder="Example: I goed to the store yesterday and buy some apples..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="min-h-20"
              disabled={isLoading}
            />
          </div>
          
          <div className="flex space-x-3">
            <Button 
              onClick={correctSentence} 
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
            >
              {isLoading ? 'Analyzing...' : 'Correct My Sentence'}
            </Button>
            {correction && (
              <Button variant="outline" onClick={resetCorrection}>
                Try Another
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {correction && (
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader>
            <CardTitle className="text-green-700">Correction Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Score */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Grammar Score:</span>
              <Badge variant={correction.score >= 80 ? "default" : "secondary"} 
                     className={correction.score >= 80 ? "bg-green-500" : "bg-yellow-500"}>
                {correction.score}/100
              </Badge>
            </div>

            {/* Original vs Corrected */}
            <div className="space-y-3">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-red-700 text-sm mb-1">Original:</p>
                    <p className="text-red-600">{correction.original}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <ArrowRight className="w-6 h-6 text-gray-400" />
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-green-700 text-sm mb-1">Corrected:</p>
                    <p className="text-green-600">{correction.corrected}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Errors and Explanations */}
            {correction.errors.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                  <Lightbulb className="w-4 h-4 text-yellow-500" />
                  <span>Learning Points:</span>
                </h4>
                <div className="space-y-2">
                  {correction.errors.map((error, index) => (
                    <div key={index} className="p-3 bg-white border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {error.type}
                        </Badge>
                        <span className="text-sm font-medium text-gray-700">{error.issue}</span>
                      </div>
                      <p className="text-sm text-gray-600">{error.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Suggestions */}
            {correction.suggestions.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Pro Tips:</h4>
                <ul className="space-y-1">
                  {correction.suggestions.map((suggestion, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start space-x-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Example sentences */}
      <Card className="border-blue-200 bg-blue-50/30">
        <CardHeader>
          <CardTitle className="text-blue-700 text-lg">Try These Practice Sentences:</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              "I have went to the market yesterday",
              "She dont like coffee very much",
              "Me and my friend are going shopping",
              "I am understanding this concept now"
            ].map((sentence, index) => (
              <button
                key={index}
                onClick={() => setInputText(sentence)}
                className="p-3 text-left bg-white hover:bg-blue-50 border border-blue-200 hover:border-blue-300 rounded-lg transition-colors text-sm"
              >
                {sentence}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SentenceCorrector;
