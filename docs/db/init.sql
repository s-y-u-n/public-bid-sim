-- game_sessions テーブル
create table if not exists game_sessions (
  id uuid primary key default gen_random_uuid(),
  status text not null,
  round int not null default 1,
  created_by uuid not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- participants テーブル
create table if not exists participants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  game_session_id uuid not null references game_sessions(id) on delete cascade,
  joined_at timestamp with time zone default now()
);

-- RLS有効化
alter table game_sessions enable row level security;
alter table participants enable row level security;

-- game_sessions: 各種ポリシー
create policy "select_own_game_sessions" on game_sessions
  for select using (auth.uid() = created_by);
create policy "insert_game_sessions" on game_sessions
  for insert with check (auth.uid() = created_by);
create policy "update_own_game_sessions" on game_sessions
  for update using (auth.uid() = created_by);
create policy "delete_own_game_sessions" on game_sessions
  for delete using (auth.uid() = created_by);

-- participants: 各種ポリシー
create policy "select_own_participants" on participants
  for select using (auth.uid() = user_id);
create policy "insert_self_participants" on participants
  for insert with check (auth.uid() = user_id);
create policy "update_own_participants" on participants
  for update using (auth.uid() = user_id);
create policy "delete_own_participants" on participants
  for delete using (auth.uid() = user_id);