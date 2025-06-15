
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import ProgressDashboard from '@/components/ProgressDashboard';
import EnhancedSentenceCorrector from '@/components/EnhancedSentenceCorrector';
import EnhancedVocabularyBuilder from '@/components/EnhancedVocabularyBuilder';
import SpeakingPractice from '@/components/SpeakingPractice';
import GrammarFocus from '@/components/GrammarFocus';
import FluencyTips from '@/components/FluencyTips';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, MessageCircle, Target, Lightbulb, Trophy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      setUserProfile(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center transition-colors">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading your English learning dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 transition-colors">
        <Card className="max-w-lg w-full dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="text-center py-8">
            <BookOpen className="w-16 h-16 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Welcome to EnglishAI Tutor
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Master English with AI-powered personalized learning. Practice speaking, 
              improve grammar, and build vocabulary with instant feedback.
            </p>
            <Button 
              onClick={() => navigate('/auth')}
              size="lg"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Start Learning English
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {userProfile?.username || user.email?.split('@')[0]}! 🎯
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Ready to improve your English today? Let's continue your learning journey.
          </p>
        </div>

        {/* Progress Dashboard */}
        <ProgressDashboard 
          currentStreak={userProfile?.current_streak || 0}
          totalPoints={userProfile?.total_points || 0}
        />

        {/* Main Learning Tabs */}
        <Tabs defaultValue="sentence-correction" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 dark:bg-gray-800">
            <TabsTrigger value="sentence-correction" className="flex items-center space-x-1 dark:data-[state=active]:bg-gray-700">
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">Grammar</span>
            </TabsTrigger>
            <TabsTrigger value="vocabulary" className="flex items-center space-x-1 dark:data-[state=active]:bg-gray-700">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Vocabulary</span>
            </TabsTrigger>
            <TabsTrigger value="speaking" className="flex items-center space-x-1 dark:data-[state=active]:bg-gray-700">
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Speaking</span>
            </TabsTrigger>
            <TabsTrigger value="grammar-focus" className="flex items-center space-x-1 dark:data-[state=active]:bg-gray-700">
              <Trophy className="w-4 h-4" />
              <span className="hidden sm:inline">Lessons</span>
            </TabsTrigger>
            <TabsTrigger value="fluency-tips" className="flex items-center space-x-1 dark:data-[state=active]:bg-gray-700">
              <Lightbulb className="w-4 h-4" />
              <span className="hidden sm:inline">Tips</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sentence-correction">
            <EnhancedSentenceCorrector />
          </TabsContent>

          <TabsContent value="vocabulary">
            <EnhancedVocabularyBuilder />
          </TabsContent>

          <TabsContent value="speaking">
            <SpeakingPractice />
          </TabsContent>

          <TabsContent value="grammar-focus">
            <GrammarFocus />
          </TabsContent>

          <TabsContent value="fluency-tips">
            <FluencyTips />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Index;
