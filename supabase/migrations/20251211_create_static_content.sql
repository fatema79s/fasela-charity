create table if not exists public.static_content (
    key text primary key,
    title_ar text not null,
    content_ar text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Enable RLS
alter table public.static_content enable row level security;

-- Policies
create policy "Allow public read access"
    on public.static_content
    for select
    to public
    using (true);

create policy "Allow admin full access"
    on public.static_content
    for all
    to authenticated
    using (
        exists (
            select 1 from public.user_roles
            where user_roles.user_id = auth.uid()
            and user_roles.role = 'admin'
        )
    );

-- Insert initial data
insert into public.static_content (key, title_ar, content_ar)
values 
    ('selection_criteria', 'معايير الاختيار', '<ul><li>أن يكون يتيم الأب.</li><li>أن تكون الأم متعلمة أو حريصة على تعليم أبنائها.</li><li>عدم وجود أبناء في سن الزواج لتجنب استنزاف الموارد في نفقات الزواج.</li></ul>'),
    ('funding_channels', 'قنوات الدعم', '<ul><li>التبرع المباشر</li><li>التحويل البنكي</li><li>دعم عيني</li></ul>')
on conflict (key) do nothing;
