
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Star, Clock, ArrowRight, Lightbulb, CheckCircle2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const FluencyTips = () => {
  const [completedExercises, setCompletedExercises] = useState(new Set());

  const dailyTips = [
    {
      id: 1,
      category: "Confidence Building",
      tip: "Practice speaking to yourself in the mirror for 5 minutes daily",
      explanation: "This helps you get comfortable with English sounds and builds confidence without pressure.",
      icon: "💪"
    },
    {
      id: 2,
      category: "Thinking in English",
      tip: "Narrate your daily activities in English inside your head",
      explanation: "Instead of thinking 'मैं अब खाना खा रहा हूं', think 'I am eating food now'.",
      icon: "🧠"
    },
    {
      id: 3,
      category: "Hesitation Reduction",
      tip: "Use filler phrases while you think: 'Let me think...', 'Well...', 'Actually...'",
      explanation: "These give you time to form sentences without awkward silences.",
      icon: "⏱️"
    }
  ];

  const speakingExercises = [
    {
      id: 1,
      title: "Describe Your Day",
      instruction: "Spend 2 minutes describing what you did today, from morning to now.",
      tips: [
        "Use past tense verbs",
        "Include time expressions (in the morning, at lunch, etc.)",
        "Don't worry about perfection, focus on fluency"
      ],
      level: "beginner"
    },
    {
      id: 2,
      title: "Picture Description",
      instruction: "Look around you and describe 5 things you can see in detail.",
      tips: [
        "Use colors, sizes, and positions",
        "Make complete sentences",
        "Practice using 'there is/there are'"
      ],
      level: "beginner"
    },
    {
      id: 3,
      title: "Opinion Practice",
      instruction: "Give your opinion on: 'Should students use mobile phones in school?'",
      tips: [
        "Start with 'I think...' or 'In my opinion...'",
        "Give 2-3 reasons for your view",
        "Use connecting words like 'because', 'also', 'however'"
      ],
      level: "intermediate"
    },
    {
      id: 4,
      title: "Story Telling",
      instruction: "Tell a short story about a memorable moment from your childhood.",
      tips: [
        "Use past tense consistently",
        "Include emotions and details",
        "Practice using sequence words: first, then, finally"
      ],
      level: "intermediate"
    }
  ];

  const fluencyHacks = [
    {
      title: "The Shadowing Technique",
      description: "Listen to English audio and repeat simultaneously",
      steps: [
        "Find a YouTube video or podcast with clear English",
        "Play it and try to speak along in real-time",
        "Don't worry about understanding every word",
        "Focus on copying rhythm and pronunciation"
      ],
      benefit: "Improves pronunciation and natural speech patterns"
    },
    {
      title: "Record & Review",
      description: "Record yourself speaking and listen back",
      steps: [
        "Use your phone to record 1-2 minutes of speaking",
        "Listen to identify areas for improvement",
        "Note hesitations, grammar mistakes, pronunciation issues",
        "Re-record the same topic and compare"
      ],
      benefit: "Builds self-awareness and tracks progress"
    },
    {
      title: "English-Only Hours",
      description: "Dedicate specific hours to thinking only in English",
      steps: [
        "Choose 1-2 hours daily (like evening walk time)",
        "Force yourself to think in English only",
        "If you think in Hindi, restart the sentence in English",
        "Practice internal conversations and planning"
      ],
      benefit: "Develops natural English thinking patterns"
    }
  ];

  const markExerciseComplete = (exerciseId) => {
    setCompletedExercises(prev => new Set([...prev, exerciseId]));
    toast({
      title: "Exercise completed! 🎉",
      description: "Great job practicing your speaking skills!"
    });
  };

  return (
    <div className="space-y-6">
      {/* Daily Tips */}
      <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lightbulb className="w-5 h-5 text-purple-500" />
            <span>Today's Fluency Tips</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dailyTips.map((tip) => (
              <div key={tip.id} className="p-4 bg-white border border-purple-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">{tip.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant="outline" className="text-xs text-purple-700 border-purple-300">
                        {tip.category}
                      </Badge>
                    </div>
                    <h4 className="font-medium text-gray-900 mb-2">{tip.tip}</h4>
                    <p className="text-sm text-gray-600">{tip.explanation}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="exercises" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="exercises">Speaking Exercises</TabsTrigger>
          <TabsTrigger value="hacks">Fluency Hacks</TabsTrigger>
        </TabsList>

        <TabsContent value="exercises" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-500" />
                <span>Daily Speaking Practice</span>
              </CardTitle>
              <p className="text-gray-600">
                Regular speaking practice is the key to fluency. Try these exercises daily!
              </p>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {speakingExercises.map((exercise) => (
              <Card key={exercise.id} className="border-blue-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{exercise.title}</CardTitle>
                    <Badge variant="outline" className="capitalize">
                      {exercise.level}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Exercise:</h4>
                    <p className="text-blue-800 text-sm">{exercise.instruction}</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Tips for Success:</h4>
                    <ul className="space-y-1">
                      {exercise.tips.map((tip, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start space-x-2">
                          <span className="text-green-500 mt-1">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button 
                    onClick={() => markExerciseComplete(exercise.id)}
                    disabled={completedExercises.has(exercise.id)}
                    className={`w-full ${
                      completedExercises.has(exercise.id) 
                        ? 'bg-green-500 hover:bg-green-600' 
                        : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                  >
                    {completedExercises.has(exercise.id) ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Completed!
                      </>
                    ) : (
                      <>
                        Start Exercise
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="hacks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <span>Proven Fluency Techniques</span>
              </CardTitle>
              <p className="text-gray-600">
                These methods are used by successful English learners worldwide.
              </p>
            </CardHeader>
          </Card>

          <div className="space-y-6">
            {fluencyHacks.map((hack, index) => (
              <Card key={index} className="border-green-200">
                <CardHeader>
                  <CardTitle className="text-green-700">{hack.title}</CardTitle>
                  <p className="text-gray-600">{hack.description}</p>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">How to do it:</h4>
                    <ol className="space-y-2">
                      {hack.steps.map((step, stepIndex) => (
                        <li key={stepIndex} className="flex items-start space-x-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-green-500 text-white text-xs rounded-full flex items-center justify-center">
                            {stepIndex + 1}
                          </span>
                          <span className="text-sm text-gray-700">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-1">Benefit:</h4>
                    <p className="text-green-800 text-sm">{hack.benefit}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Motivational Section */}
      <Card className="border-yellow-200 bg-yellow-50/50">
        <CardContent className="p-6 text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Remember: Fluency is a journey, not a destination! 🌟
          </h3>
          <p className="text-gray-600 mb-4">
            Every conversation, every mistake, every practice session brings you closer to confident English speaking.
          </p>
          <div className="flex justify-center space-x-6 text-sm">
            <div className="text-center">
              <div className="font-semibold text-blue-600">{completedExercises.size}</div>
              <div className="text-gray-600">Exercises Done</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-green-600">Daily</div>
              <div className="text-gray-600">Practice Goal</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-purple-600">Growing</div>
              <div className="text-gray-600">Confidence</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FluencyTips;
