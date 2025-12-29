create table public.password_policy (
  id int primary key default 1,
  min_length int default 8,
  require_uppercase boolean default true,
  require_lowercase boolean default true,
  require_numbers boolean default true,
  require_special_chars boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

insert into public.password_policy (id, min_length, require_uppercase, require_lowercase, require_numbers, require_special_chars)
values (1, 8, true, true, true, false);

alter table public.password_policy enable row level security;

create policy "Password policy is viewable by everyone." on public.password_policy for select using (true);

create policy "Only admins can update password policy." on public.password_policy for update using (false);
