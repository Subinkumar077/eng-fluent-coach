
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Calendar, Star, CheckCircle2, TrendingUp } from 'lucide-react';

interface ProgressDashboardProps {
  currentStreak: number;
  totalPoints: number;
}

const ProgressDashboard = ({ currentStreak, totalPoints }: ProgressDashboardProps) => {
  const weeklyGoal = 5; // days per week
  const dailyGoalProgress = 75; // percentage of today's goals completed
  const currentLevel = Math.floor(totalPoints / 500) + 1;
  const pointsToNextLevel = (currentLevel * 500) - totalPoints;

  const achievements = [
    { name: "First Correction", icon: "🎯", earned: true },
    { name: "5-Day Streak", icon: "🔥", earned: true },
    { name: "Vocabulary Master", icon: "📚", earned: false },
    { name: "Grammar Guru", icon: "✍️", earned: false }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Streak Card */}
      <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-red-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-700 font-medium">Current Streak</p>
              <p className="text-2xl font-bold text-orange-900">{currentStreak} days</p>
            </div>
            <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-xs text-orange-600 mb-1">
              <span>Weekly Goal</span>
              <span>{Math.min(currentStreak, weeklyGoal)}/{weeklyGoal}</span>
            </div>
            <Progress value={(Math.min(currentStreak, weeklyGoal) / weeklyGoal) * 100} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Level Card */}
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 font-medium">Current Level</p>
              <p className="text-2xl font-bold text-blue-900">Level {currentLevel}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
              <Star className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-xs text-blue-600 mb-1">
              <span>Next Level</span>
              <span>{pointsToNextLevel} XP to go</span>
            </div>
            <Progress value={((500 - pointsToNextLevel) / 500) * 100} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Today's Progress */}
      <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 font-medium">Today's Progress</p>
              <p className="text-2xl font-bold text-green-900">{dailyGoalProgress}%</p>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-xs text-green-600 mb-1">
              <span>Daily Goals</span>
              <span>3/4 completed</span>
            </div>
            <Progress value={dailyGoalProgress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-purple-700 font-medium">Achievements</p>
              <p className="text-2xl font-bold text-purple-900">
                {achievements.filter(a => a.earned).length}/{achievements.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="flex space-x-1">
            {achievements.map((achievement, index) => (
              <div key={index} className="relative group">
                <span className={`text-lg ${achievement.earned ? 'opacity-100' : 'opacity-30'}`}>
                  {achievement.icon}
                </span>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  {achievement.name}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgressDashboard;
