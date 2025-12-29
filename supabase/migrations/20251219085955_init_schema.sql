create table public.profiles (
  id uuid not null primary key references auth.users(id) on delete cascade,
  username text unique not null,
  email text unique not null,
  display_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;

alter table public.profiles
  add constraint profiles_username_allowed_chars
  check (username ~ '^[A-Za-z0-9_\-]+$' and username !~ ' ');

create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);

create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, email)
  values (
    new.id,
    new.raw_user_meta_data ->> 'username',
    new.email
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
