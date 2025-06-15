
-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  username TEXT,
  email TEXT,
  current_streak INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Create vocabulary table for daily words
CREATE TABLE public.vocabulary_words (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  word TEXT NOT NULL,
  pronunciation TEXT,
  part_of_speech TEXT,
  meaning TEXT,
  hindi_meaning TEXT,
  example_sentence TEXT,
  usage_tip TEXT,
  difficulty TEXT DEFAULT 'intermediate',
  synonyms TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user vocabulary progress
CREATE TABLE public.user_vocabulary (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  word_id UUID REFERENCES public.vocabulary_words NOT NULL,
  learned BOOLEAN DEFAULT FALSE,
  learned_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sentence corrections table
CREATE TABLE public.sentence_corrections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  original_sentence TEXT NOT NULL,
  corrected_sentence TEXT NOT NULL,
  explanation TEXT,
  errors JSONB,
  score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create speaking practice sessions
CREATE TABLE public.speaking_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  topic TEXT NOT NULL,
  conversation JSONB NOT NULL,
  score INTEGER,
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create daily activities for streak tracking
CREATE TABLE public.daily_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  activity_type TEXT NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, activity_type, date)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vocabulary_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_vocabulary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sentence_corrections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.speaking_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_activities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for vocabulary_words (public read, admin write)
CREATE POLICY "Anyone can view vocabulary words" ON public.vocabulary_words FOR SELECT TO authenticated USING (true);

-- Create RLS policies for user_vocabulary
CREATE POLICY "Users can view their vocabulary progress" ON public.user_vocabulary FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their vocabulary progress" ON public.user_vocabulary FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their vocabulary progress" ON public.user_vocabulary FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for sentence_corrections
CREATE POLICY "Users can view their corrections" ON public.sentence_corrections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their corrections" ON public.sentence_corrections FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for speaking_sessions
CREATE POLICY "Users can view their speaking sessions" ON public.speaking_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their speaking sessions" ON public.speaking_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for daily_activities
CREATE POLICY "Users can view their activities" ON public.daily_activities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their activities" ON public.daily_activities FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert some sample vocabulary words
INSERT INTO public.vocabulary_words (word, pronunciation, part_of_speech, meaning, hindi_meaning, example_sentence, usage_tip, difficulty, synonyms) VALUES
('Eloquent', '/ˈel.ə.kwənt/', 'adjective', 'Able to express ideas clearly and persuasively in speech or writing', 'वाक्पटु, स्पष्ट रूप से बोलने वाला', 'The eloquent speaker captivated the entire audience with her powerful message.', 'Use this word to describe someone who speaks very well and convincingly.', 'intermediate', ARRAY['articulate', 'fluent', 'expressive']),
('Serene', '/sɪˈriːn/', 'adjective', 'Calm, peaceful, and untroubled', 'शांत, निर्मल', 'The serene lake reflected the mountains perfectly on this quiet morning.', 'Perfect for describing peaceful places or calm states of mind.', 'intermediate', ARRAY['peaceful', 'tranquil', 'calm']),
('Resilient', '/rɪˈzɪl.i.ənt/', 'adjective', 'Able to recover quickly from difficulties; strong and flexible', 'लचीला, जल्दी उबरने वाला', 'Despite facing many challenges, she remained resilient and achieved her goals.', 'Use to describe people who bounce back from problems or materials that bend without breaking.', 'intermediate', ARRAY['tough', 'strong', 'adaptable']),
('Meticulous', '/mɪˈtɪk.jə.ləs/', 'adjective', 'Showing great attention to detail; very careful and precise', 'सूक्ष्म, बारीकी से', 'She was meticulous in her research, checking every source twice.', 'Use when describing someone who pays very close attention to small details.', 'advanced', ARRAY['careful', 'precise', 'thorough']),
('Profound', '/prəˈfaʊnd/', 'adjective', 'Very great or intense; having deep meaning', 'गहरा, गंभीर', 'The book had a profound impact on how I think about life.', 'Use to describe something that has a very deep or strong effect.', 'intermediate', ARRAY['deep', 'intense', 'meaningful']);
