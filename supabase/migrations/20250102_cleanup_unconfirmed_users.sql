create extension if not exists pg_cron;

create or replace function public.delete_unconfirmed_users()
returns void
language plpgsql
security definer
as $$
begin
  delete from auth.users
  where confirmed_at is null
    and created_at < now() - interval '1 hour';
end;
$$;

select cron.schedule(
  'delete-unconfirmed-users',
  '*/15 * * * *',
  'select public.delete_unconfirmed_users();'
);
