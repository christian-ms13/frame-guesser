CREATE TABLE public.password_policy (
  id INT PRIMARY KEY DEFAULT 1,
  min_length INT DEFAULT 8,
  require_uppercase BOOLEAN DEFAULT TRUE,
  require_lowercase BOOLEAN DEFAULT TRUE,
  require_numbers BOOLEAN DEFAULT TRUE,
  require_special_chars BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

INSERT INTO public.password_policy (id, min_length, require_uppercase, require_lowercase, require_numbers, require_special_chars)
VALUES (1, 8, TRUE, TRUE, TRUE, FALSE);

ALTER TABLE public.password_policy ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Password policy is viewable by everyone." ON public.password_policy FOR SELECT USING (TRUE);

CREATE POLICY "Only admins can update password policy." ON public.password_policy FOR UPDATE USING (FALSE);
