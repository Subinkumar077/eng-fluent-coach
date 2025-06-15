
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Star, Book, CheckCircle2, ArrowRight } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const GrammarFocus = () => {
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const grammarTopics = [
    {
      id: 'past-tense',
      title: 'Past Tense Verbs',
      difficulty: 'beginner',
      description: 'Learn when and how to use past tense correctly',
      progress: 75,
      examples: [
        'I went to the store (not "goed")',
        'She studied hard for the exam',
        'They played football yesterday'
      ],
      explanation: 'Past tense shows actions that happened before now. Regular verbs add -ed, but irregular verbs change completely.',
      quiz: [
        {
          question: 'Choose the correct past tense: "Yesterday, I ___ to the market."',
          options: ['go', 'went', 'goed', 'going'],
          correct: 1,
          explanation: '"Went" is the past tense of "go". "Goed" is not a real word.'
        },
        {
          question: 'Which sentence is correct?',
          options: [
            'I eated breakfast this morning',
            'I ate breakfast this morning', 
            'I eat breakfast this morning',
            'I eating breakfast this morning'
          ],
          correct: 1,
          explanation: '"Ate" is the past tense of "eat". "Eated" is incorrect.'
        }
      ]
    },
    {
      id: 'articles',
      title: 'Articles (a, an, the)',
      difficulty: 'beginner',
      description: 'Master the usage of a, an, and the',
      progress: 45,
      examples: [
        'I saw a dog in the park',
        'She is an engineer',
        'The sun is bright today'
      ],
      explanation: 'Use "a" before consonant sounds, "an" before vowel sounds, and "the" for specific things.',
      quiz: [
        {
          question: 'Fill in the blank: "I need ___ umbrella because it\'s raining."',
          options: ['a', 'an', 'the', 'no article'],
          correct: 1,
          explanation: 'Use "an" before words that start with vowel sounds like "umbrella".'
        }
      ]
    },
    {
      id: 'prepositions',
      title: 'Prepositions (in, on, at)',
      difficulty: 'intermediate',
      description: 'Learn to use prepositions for time and place',
      progress: 60,
      examples: [
        'I live in Mumbai (city)',
        'Meet me at 5 PM (specific time)',
        'The book is on the table (surface)'
      ],
      explanation: 'IN = inside/months/years, ON = surface/days/dates, AT = specific point/time',
      quiz: [
        {
          question: 'Choose the correct preposition: "I have a meeting ___ Monday."',
          options: ['in', 'on', 'at', 'by'],
          correct: 1,
          explanation: 'Use "on" with days of the week: on Monday, on Tuesday, etc.'
        }
      ]
    }
  ];

  const selectTopic = (topic) => {
    setSelectedTopic(topic);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowResults(false);
  };

  const selectAnswer = (questionIndex, answerIndex) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }));
  };

  const submitQuiz = () => {
    setShowResults(true);
    const correctAnswers = selectedTopic.quiz.filter((q, index) => 
      selectedAnswers[index] === q.correct
    ).length;
    
    toast({
      title: "Quiz completed! 🎉",
      description: `You got ${correctAnswers} out of ${selectedTopic.quiz.length} questions correct.`
    });
  };

  const backToTopics = () => {
    setSelectedTopic(null);
    setShowResults(false);
  };

  if (selectedTopic) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Book className="w-5 h-5 text-blue-500" />
                  <span>{selectedTopic.title}</span>
                </CardTitle>
                <p className="text-gray-600 mt-1">{selectedTopic.description}</p>
              </div>
              <Button variant="outline" onClick={backToTopics}>
                ← Back to Topics
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Explanation */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Key Concept:</h4>
              <p className="text-blue-800">{selectedTopic.explanation}</p>
            </div>

            {/* Examples */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Examples:</h4>
              <div className="space-y-2">
                {selectedTopic.examples.map((example, index) => (
                  <div key={index} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800">✓ {example}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quiz Section */}
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Practice Quiz:</h4>
              <div className="space-y-4">
                {selectedTopic.quiz.map((question, qIndex) => (
                  <Card key={qIndex} className="border-gray-200">
                    <CardContent className="p-4">
                      <p className="font-medium text-gray-900 mb-3">
                        {qIndex + 1}. {question.question}
                      </p>
                      
                      <div className="space-y-2">
                        {question.options.map((option, oIndex) => (
                          <button
                            key={oIndex}
                            onClick={() => selectAnswer(qIndex, oIndex)}
                            className={`w-full p-3 text-left border rounded-lg transition-colors ${
                              selectedAnswers[qIndex] === oIndex
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
                            }`}
                          >
                            {String.fromCharCode(65 + oIndex)}. {option}
                          </button>
                        ))}
                      </div>

                      {showResults && (
                        <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            {selectedAnswers[qIndex] === question.correct ? (
                              <CheckCircle2 className="w-5 h-5 text-green-500" />
                            ) : (
                              <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                                <span className="text-white text-xs">✗</span>
                              </div>
                            )}
                            <span className={`font-medium ${
                              selectedAnswers[qIndex] === question.correct ? 'text-green-700' : 'text-red-700'
                            }`}>
                              {selectedAnswers[qIndex] === question.correct ? 'Correct!' : 'Incorrect'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{question.explanation}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {!showResults && Object.keys(selectedAnswers).length === selectedTopic.quiz.length && (
                <Button onClick={submitQuiz} className="w-full mt-4 bg-green-500 hover:bg-green-600">
                  Submit Quiz
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="w-5 h-5 text-yellow-500" />
            <span>Grammar Focus Areas</span>
          </CardTitle>
          <p className="text-gray-600">
            Master these essential grammar topics with explanations, examples, and practice quizzes.
          </p>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {grammarTopics.map((topic) => (
          <Card key={topic.id} className="cursor-pointer hover:shadow-lg transition-shadow border-gray-200 hover:border-blue-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{topic.title}</CardTitle>
                <Badge variant="outline" className="capitalize">
                  {topic.difficulty}
                </Badge>
              </div>
              <p className="text-gray-600 text-sm">{topic.description}</p>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progress</span>
                  <span>{topic.progress}%</span>
                </div>
                <Progress value={topic.progress} className="h-2" />
              </div>
              
              <Button 
                onClick={() => selectTopic(topic)}
                className="w-full"
                variant="outline"
              >
                Start Learning
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Tips */}
      <Card className="border-yellow-200 bg-yellow-50/50">
        <CardHeader>
          <CardTitle className="text-yellow-700">Quick Grammar Tips 💡</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Common Mistakes to Avoid:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Don't say "I am understanding" → Say "I understand"</li>
                <li>• Don't say "I have many informations" → Say "I have much information"</li>
                <li>• Don't say "I am having a car" → Say "I have a car"</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Memory Tricks:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Use "an" before A, E, I, O, U sounds</li>
                <li>• Past tense = action finished before now</li>
                <li>• "The" = you both know what we're talking about</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GrammarFocus;
