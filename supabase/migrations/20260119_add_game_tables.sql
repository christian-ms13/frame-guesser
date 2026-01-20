CREATE TABLE IF NOT EXISTS public.leaderboard (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  score INTEGER NOT NULL DEFAULT 0,
  rounds_completed INTEGER NOT NULL DEFAULT 0,
  lives_remaining INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.game_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  score INTEGER NOT NULL DEFAULT 0,
  rounds_completed INTEGER NOT NULL DEFAULT 0,
  lives_remaining INTEGER NOT NULL DEFAULT 0,
  round_results JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_leaderboard_user_id ON public.leaderboard(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_difficulty ON public.leaderboard(difficulty);
CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON public.leaderboard(score DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_created_at ON public.leaderboard(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_game_sessions_user_id ON public.game_sessions(user_id);
CREATE INDEX IF NOT EXISTS ids_game_sessions_difficulty ON public.game_sessions(difficulty);
CREATE INDEX IF NOT EXISTS ids_game_sessions_created_at ON public.game_sessions(created_at DESC);

ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view leaderboard" ON public.leaderboard FOR SELECT USING (true);
CREATE POLICY "Users can insert own leaderboard entries" ON public.leaderboard FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own leaderboard entries" ON public.leaderboard FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own game sessions" ON public.game_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own game sessions" ON public.game_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own game sessions" ON public.game_sessions FOR UPDATE USING (auth.uid() = user_id);
