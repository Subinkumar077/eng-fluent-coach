
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Edit, Star, Users, Calendar, CheckCircle2 } from 'lucide-react';
import SentenceCorrector from '@/components/SentenceCorrector';
import VocabularyBuilder from '@/components/VocabularyBuilder';
import GrammarFocus from '@/components/GrammarFocus';
import FluencyTips from '@/components/FluencyTips';
import ProgressDashboard from '@/components/ProgressDashboard';

const Index = () => {
  const [currentStreak, setCurrentStreak] = useState(5);
  const [totalPoints, setTotalPoints] = useState(1250);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  EnglishAI Tutor
                </h1>
                <p className="text-sm text-gray-600">Your Personal English Learning Companion</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium text-gray-700">{currentStreak} day streak</span>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                {totalPoints} XP
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back to your English journey! 🚀
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Continue improving your grammar, vocabulary, and fluency with AI-powered personalized lessons
            </p>
          </div>
          
          <ProgressDashboard currentStreak={currentStreak} totalPoints={totalPoints} />
        </div>

        {/* Main Learning Tabs */}
        <Tabs defaultValue="correct" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8 h-12">
            <TabsTrigger value="correct" className="flex items-center space-x-2">
              <Edit className="w-4 h-4" />
              <span className="hidden sm:inline">Sentence Correct</span>
              <span className="sm:hidden">Correct</span>
            </TabsTrigger>
            <TabsTrigger value="vocabulary" className="flex items-center space-x-2">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Vocabulary</span>
              <span className="sm:hidden">Vocab</span>
            </TabsTrigger>
            <TabsTrigger value="grammar" className="flex items-center space-x-2">
              <Star className="w-4 h-4" />
              <span className="hidden sm:inline">Grammar</span>
            </TabsTrigger>
            <TabsTrigger value="tips" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Fluency Tips</span>
              <span className="sm:hidden">Tips</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="correct">
            <SentenceCorrector />
          </TabsContent>

          <TabsContent value="vocabulary">
            <VocabularyBuilder />
          </TabsContent>

          <TabsContent value="grammar">
            <GrammarFocus />
          </TabsContent>

          <TabsContent value="tips">
            <FluencyTips />
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Practice</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="hover:shadow-md transition-shadow cursor-pointer border-green-200 hover:border-green-300">
              <CardContent className="p-6 text-center">
                <Calendar className="w-8 h-8 text-green-500 mx-auto mb-3" />
                <h4 className="font-medium text-gray-900 mb-2">Daily Challenge</h4>
                <p className="text-sm text-gray-600">Complete today's speaking exercise</p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-shadow cursor-pointer border-blue-200 hover:border-blue-300">
              <CardContent className="p-6 text-center">
                <BookOpen className="w-8 h-8 text-blue-500 mx-auto mb-3" />
                <h4 className="font-medium text-gray-900 mb-2">Flashcards</h4>
                <p className="text-sm text-gray-600">Review your saved vocabulary</p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-shadow cursor-pointer border-purple-200 hover:border-purple-300">
              <CardContent className="p-6 text-center">
                <Star className="w-8 h-8 text-purple-500 mx-auto mb-3" />
                <h4 className="font-medium text-gray-900 mb-2">Speaking Practice</h4>
                <p className="text-sm text-gray-600">AI conversation partner</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
