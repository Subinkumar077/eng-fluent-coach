
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Star, Clock, ArrowRight } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const VocabularyBuilder = () => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [showMeaning, setShowMeaning] = useState(false);
  const [learnedToday, setLearnedToday] = useState(2);

  const dailyWords = [
    {
      word: "Eloquent",
      pronunciation: "/ˈel.ə.kwənt/",
      partOfSpeech: "adjective",
      meaning: "Able to express ideas clearly and persuasively in speech or writing",
      hindiMeaning: "वाक्पटु, स्पष्ट रूप से बोलने वाला",
      example: "The eloquent speaker captivated the entire audience with her powerful message.",
      usage: "Use this word to describe someone who speaks very well and convincingly.",
      difficulty: "intermediate",
      synonyms: ["articulate", "fluent", "expressive"],
      learned: false
    },
    {
      word: "Serene",
      pronunciation: "/sɪˈriːn/",
      partOfSpeech: "adjective", 
      meaning: "Calm, peaceful, and untroubled",
      hindiMeaning: "शांत, निर्मल",
      example: "The serene lake reflected the mountains perfectly on this quiet morning.",
      usage: "Perfect for describing peaceful places or calm states of mind.",
      difficulty: "intermediate",
      synonyms: ["peaceful", "tranquil", "calm"],
      learned: false
    },
    {
      word: "Resilient",
      pronunciation: "/rɪˈzɪl.i.ənt/",
      partOfSpeech: "adjective",
      meaning: "Able to recover quickly from difficulties; strong and flexible",
      hindiMeaning: "लचीला, जल्दी उबरने वाला",
      example: "Despite facing many challenges, she remained resilient and achieved her goals.",
      usage: "Use to describe people who bounce back from problems or materials that bend without breaking.",
      difficulty: "intermediate",
      synonyms: ["tough", "strong", "adaptable"],
      learned: false
    }
  ];

  const currentWord = dailyWords[currentWordIndex];

  const markAsLearned = () => {
    toast({
      title: "Word learned! 🎉",
      description: `Great job learning "${currentWord.word}". Keep building your vocabulary!`
    });
    setLearnedToday(prev => prev + 1);
    if (currentWordIndex < dailyWords.length - 1) {
      setCurrentWordIndex(prev => prev + 1);
      setShowMeaning(false);
    }
  };

  const nextWord = () => {
    if (currentWordIndex < dailyWords.length - 1) {
      setCurrentWordIndex(prev => prev + 1);
      setShowMeaning(false);
    }
  };

  const prevWord = () => {
    if (currentWordIndex > 0) {
      setCurrentWordIndex(prev => prev - 1);
      setShowMeaning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Card */}
      <Card className="border-green-200 bg-gradient-to-r from-green-50 to-blue-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Today's Progress</h3>
              <p className="text-gray-600">Keep up the great work!</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{learnedToday}</div>
              <div className="text-sm text-gray-600">words learned</div>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Daily Goal</span>
              <span>{learnedToday}/5 words</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(learnedToday / 5) * 100}%` }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Word Card */}
      <Card className="border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-blue-500" />
              <span>Word of the Moment</span>
            </CardTitle>
            <Badge variant="outline" className="capitalize">
              {currentWord.difficulty}
            </Badge>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Word {currentWordIndex + 1} of {dailyWords.length}</span>
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>Daily Vocabulary</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Word Display */}
          <div className="text-center space-y-2">
            <h2 className="text-4xl font-bold text-gray-900">{currentWord.word}</h2>
            <p className="text-lg text-gray-600">{currentWord.pronunciation}</p>
            <Badge variant="secondary">{currentWord.partOfSpeech}</Badge>
          </div>

          {/* Reveal Meaning Button */}
          {!showMeaning ? (
            <div className="text-center">
              <Button 
                onClick={() => setShowMeaning(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                Reveal Meaning
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Meaning */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">English Meaning:</h4>
                <p className="text-blue-800">{currentWord.meaning}</p>
              </div>

              {/* Hindi Meaning */}
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <h4 className="font-medium text-orange-900 mb-2">Hindi Meaning:</h4>
                <p className="text-orange-800">{currentWord.hindiMeaning}</p>
              </div>

              {/* Example */}
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Example Sentence:</h4>
                <p className="text-green-800 italic">"{currentWord.example}"</p>
              </div>

              {/* Usage Tip */}
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h4 className="font-medium text-purple-900 mb-2">Usage Tip:</h4>
                <p className="text-purple-800">{currentWord.usage}</p>
              </div>

              {/* Synonyms */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Similar Words:</h4>
                <div className="flex flex-wrap gap-2">
                  {currentWord.synonyms.map((synonym, index) => (
                    <Badge key={index} variant="outline" className="bg-gray-50">
                      {synonym}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {showMeaning && (
            <div className="flex space-x-3">
              <Button 
                onClick={markAsLearned}
                className="flex-1 bg-green-500 hover:bg-green-600"
              >
                <Star className="w-4 h-4 mr-2" />
                Mark as Learned
              </Button>
              <Button 
                variant="outline" 
                onClick={nextWord}
                disabled={currentWordIndex >= dailyWords.length - 1}
                className="flex-1"
              >
                Next Word
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between">
            <Button 
              variant="ghost" 
              onClick={prevWord}
              disabled={currentWordIndex === 0}
              className="text-gray-600"
            >
              ← Previous
            </Button>
            <Button 
              variant="ghost" 
              onClick={nextWord}
              disabled={currentWordIndex >= dailyWords.length - 1}
              className="text-gray-600"
            >
              Next →
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Word List Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Vocabulary List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {dailyWords.map((word, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentWordIndex(index);
                  setShowMeaning(false);
                }}
                className={`p-3 text-left border rounded-lg transition-colors ${
                  index === currentWordIndex 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
                }`}
              >
                <div className="font-medium text-gray-900">{word.word}</div>
                <div className="text-sm text-gray-600">{word.partOfSpeech}</div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VocabularyBuilder;
