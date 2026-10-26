-- 방명록 테이블 · 보안 정책 (Supabase SQL Editor에 붙여 넣고 Run)

-- 1. 테이블: 이름 1~20자, 내용 1~300자를 DB 제약 조건으로 강제
create table if not exists public.guestbook (
  id         bigint generated always as identity primary key,
  name       text not null check (char_length(btrim(name)) between 1 and 20),
  message    text not null check (char_length(btrim(message)) between 1 and 300),
  created_at timestamptz not null default now()
);

-- 2. Row Level Security: 정책으로 허용한 일만 할 수 있음
alter table public.guestbook enable row level security;

-- 방문자(anon)는 읽기 · 쓰기만. 수정 · 삭제 정책은 만들지 않음 → 아무도 바꾸거나 지울 수 없음
drop policy if exists "guestbook_read" on public.guestbook;
create policy "guestbook_read" on public.guestbook
  for select to anon, authenticated
  using (true);

drop policy if exists "guestbook_write" on public.guestbook;
create policy "guestbook_write" on public.guestbook
  for insert to anon, authenticated
  with check (true);

-- 테이블 권한도 읽기 · 쓰기만 열어 둠
revoke all on public.guestbook from anon, authenticated;
grant select on public.guestbook to anon, authenticated;
grant insert (name, message) on public.guestbook to anon, authenticated;

-- 3. 도배 방지: 최근 1분 동안 전체 10건이 넘으면 저장 거부
create or replace function public.guestbook_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (select count(*) from public.guestbook
      where created_at > now() - interval '1 minute') >= 10 then
    raise exception 'too many posts, try again later';
  end if;
  new.created_at := now();   -- 작성 시각은 클라이언트가 바꿀 수 없음
  return new;
end;
$$;

drop trigger if exists guestbook_rate_limit on public.guestbook;
create trigger guestbook_rate_limit
  before insert on public.guestbook
  for each row execute function public.guestbook_rate_limit();
