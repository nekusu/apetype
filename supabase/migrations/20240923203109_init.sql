create type "public"."avatarShape" as enum ('rect', 'round');

create table "public"."personal_bests" (
    "userId" uuid not null,
    "testId" uuid not null,
    "mode" text not null,
    "mode2" text not null,
    "language" text not null,
    "lazyMode" boolean not null,
    "wpm" numeric(6,2) not null
);


alter table "public"."personal_bests" enable row level security;

create table "public"."tests" (
    "id" uuid not null default gen_random_uuid(),
    "userId" uuid default auth.uid(),
    "createdAt" timestamp with time zone not null default now(),
    "mode" text not null,
    "mode2" text not null,
    "language" text not null,
    "wpm" numeric(6,2) not null,
    "raw" numeric(6,2) not null,
    "accuracy" numeric(5,2) not null,
    "consistency" numeric(5,2) not null,
    "charStats" integer[] not null,
    "chartData" jsonb not null,
    "duration" numeric(11,2) not null,
    "blindMode" boolean not null default false,
    "lazyMode" boolean not null default false,
    "isPb" boolean not null default false
);


alter table "public"."tests" enable row level security;

create table "public"."user_stats" (
    "userId" uuid not null default auth.uid(),
    "startedTests" bigint not null default '0'::bigint,
    "completedTests" bigint not null default '0'::bigint,
    "timeTyping" real not null default '0'::real,
    "avgWpm" numeric(6,2) not null default '0'::numeric,
    "avgRaw" numeric(6,2) not null default '0'::numeric,
    "avgAccuracy" numeric(5,2) not null default '0'::numeric,
    "avgConsistency" numeric(5,2) not null default '0'::numeric,
    "highestWpm" numeric(6,2) not null default '0'::numeric,
    "highestRaw" numeric(6,2) not null default '0'::numeric,
    "highestAccuracy" numeric(5,2) not null default '0'::numeric,
    "highestConsistency" numeric(5,2) not null default '0'::numeric
);


alter table "public"."user_stats" enable row level security;

create table "public"."users" (
    "id" uuid not null default gen_random_uuid(),
    "joinedAt" timestamp with time zone not null default now(),
    "avatarURL" text,
    "avatarShape" "avatarShape" not null default 'rect'::"avatarShape",
    "bannerURL" text,
    "name" text not null,
    "nameLastChangedAt" timestamp with time zone,
    "bio" text not null default ''::text,
    "keyboard" text not null default ''::text,
    "socials" jsonb not null default '{"x": "", "github": "", "twitch": "", "website": "", "youtube": "", "monkeytype": ""}'::jsonb
);


alter table "public"."users" enable row level security;

CREATE UNIQUE INDEX personal_bests_pkey ON public.personal_bests USING btree ("userId", mode, mode2, language, "lazyMode");

CREATE UNIQUE INDEX tests_pkey ON public.tests USING btree (id);

CREATE UNIQUE INDEX user_stats_pkey ON public.user_stats USING btree ("userId");

CREATE UNIQUE INDEX users_name_key ON public.users USING btree (name);

CREATE UNIQUE INDEX users_pkey ON public.users USING btree (id);

alter table "public"."personal_bests" add constraint "personal_bests_pkey" PRIMARY KEY using index "personal_bests_pkey";

alter table "public"."tests" add constraint "tests_pkey" PRIMARY KEY using index "tests_pkey";

alter table "public"."user_stats" add constraint "user_stats_pkey" PRIMARY KEY using index "user_stats_pkey";

alter table "public"."users" add constraint "users_pkey" PRIMARY KEY using index "users_pkey";

alter table "public"."personal_bests" add constraint "personal_bests_testId_fkey" FOREIGN KEY ("testId") REFERENCES tests(id) ON DELETE CASCADE not valid;

alter table "public"."personal_bests" validate constraint "personal_bests_testId_fkey";

alter table "public"."personal_bests" add constraint "personal_bests_userId_fkey" FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE not valid;

alter table "public"."personal_bests" validate constraint "personal_bests_userId_fkey";

alter table "public"."tests" add constraint "tests_userId_fkey" FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE not valid;

alter table "public"."tests" validate constraint "tests_userId_fkey";

alter table "public"."user_stats" add constraint "user_stats_userId_fkey" FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE not valid;

alter table "public"."user_stats" validate constraint "user_stats_userId_fkey";

alter table "public"."users" add constraint "users_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."users" validate constraint "users_id_fkey";

alter table "public"."users" add constraint "users_name_key" UNIQUE using index "users_name_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.check_email("emailToCheck" text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$DECLARE
  email_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM auth.users
    WHERE email = "emailToCheck"
  ) INTO email_exists;
  
  RETURN email_exists;
END;$function$
;

CREATE OR REPLACE FUNCTION public.check_if_test_is_pb()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Check if the new test is a personal best for the user
  IF EXISTS (
    SELECT 1
    FROM personal_bests
    WHERE "userId" = NEW."userId"
      AND mode = NEW.mode
      AND mode2 = NEW.mode2
      AND language = NEW.language
      AND "lazyMode" = NEW."lazyMode"
      AND wpm >= NEW.wpm
  ) THEN
    -- The new test is not a personal best
    NEW."isPb" = FALSE;
  ELSE
    -- The new test is a personal best
    NEW."isPb" = TRUE;
  END IF;

  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  raw_name text;
  existing_name text;
  final_name text;
begin
  -- Determine the name from metadata, prioritizing "name" over "user_name"
  raw_name := coalesce(new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'user_name');

  -- Check if the name already exists
  select name into existing_name from public.users where name = raw_name limit 1;

  -- If the name exists, use the first part of the email
  if existing_name is not null then
    final_name := split_part(new.email, '@', 1);
  else
    final_name := raw_name;
  end if;

  -- Insert the user with the determined name
  insert into public.users (id, name, "avatarURL")
  values (
    new.id, 
    final_name, 
    -- Set the avatar image with the highest quality
    replace(new.raw_user_meta_data ->> 'avatar_url', 's96-c', 's500-c')
  );

  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.increment_stats(id uuid, "startedTests" bigint DEFAULT NULL::bigint, "completedTests" bigint DEFAULT NULL::bigint, "timeTyping" real DEFAULT NULL::real)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
  INSERT INTO user_stats ("userId", "startedTests", "completedTests", "timeTyping")
  VALUES (
    $1,
    COALESCE($2, 0),
    COALESCE($3, 0),
    COALESCE($4, 0)
  )
  ON CONFLICT ("userId")
  DO UPDATE SET 
    "startedTests" = user_stats."startedTests" + COALESCE(EXCLUDED."startedTests", 0),
    "completedTests" = user_stats."completedTests" + COALESCE(EXCLUDED."completedTests", 0),
    "timeTyping" = user_stats."timeTyping" + COALESCE(EXCLUDED."timeTyping", 0);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_user_data()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Update personal bests
  IF NEW."isPb" THEN
    INSERT INTO personal_bests ("userId", "testId", mode, mode2, language, "lazyMode", wpm)
    VALUES (NEW."userId", NEW.id, NEW.mode, NEW.mode2, NEW.language, NEW."lazyMode", NEW.wpm)
    ON CONFLICT ("userId", mode, mode2, language, "lazyMode") DO UPDATE
      SET "testId" = EXCLUDED."testId",
          wpm = EXCLUDED.wpm;
  END IF;

  -- Check if the user already exists in user_stats, otherwise insert a new row
  IF EXISTS (SELECT 1 FROM user_stats WHERE "userId" = NEW."userId") THEN
    -- Update existing stats for the user
    UPDATE user_stats
    SET
      -- Incremental average calculation
      "avgWpm" = (("avgWpm" * "completedTests") + NEW.wpm) / ("completedTests" + 1),
      "avgRaw" = (("avgRaw" * "completedTests") + NEW.raw) / ("completedTests" + 1),
      "avgAccuracy" = (("avgAccuracy" * "completedTests") + NEW.accuracy) / ("completedTests" + 1),
      "avgConsistency" = (("avgConsistency" * "completedTests") + NEW.consistency) / ("completedTests" + 1),

      -- Highest value calculations
      "highestWpm" = GREATEST("highestWpm", NEW.wpm),
      "highestRaw" = GREATEST("highestRaw", NEW.raw),
      "highestAccuracy" = GREATEST("highestAccuracy", NEW.accuracy),
      "highestConsistency" = GREATEST("highestConsistency", NEW.consistency),

      -- Increment completed tests
      "startedTests" = "startedTests" + 1,
      "completedTests" = "completedTests" + 1,
      "timeTyping" = "timeTyping" + NEW.duration
    WHERE "userId" = NEW."userId";
  ELSE
    -- Insert a new row for a new user, initializing the averages and highest values
    INSERT INTO user_stats ("userId", "startedTests", "completedTests", "timeTyping", "avgWpm", "avgRaw", "avgAccuracy", "avgConsistency", "highestWpm", "highestRaw", "highestAccuracy", "highestConsistency")
    VALUES (
      NEW."userId",
      1,
      1,
      NEW.duration,
      NEW.wpm,
      NEW.raw,
      NEW.accuracy,
      NEW.consistency,
      NEW.wpm,
      NEW.raw,
      NEW.accuracy,
      NEW.consistency
    );
  END IF;

  RETURN NEW;
END;
$function$
;

grant delete on table "public"."personal_bests" to "anon";

grant insert on table "public"."personal_bests" to "anon";

grant references on table "public"."personal_bests" to "anon";

grant select on table "public"."personal_bests" to "anon";

grant trigger on table "public"."personal_bests" to "anon";

grant truncate on table "public"."personal_bests" to "anon";

grant update on table "public"."personal_bests" to "anon";

grant delete on table "public"."personal_bests" to "authenticated";

grant insert on table "public"."personal_bests" to "authenticated";

grant references on table "public"."personal_bests" to "authenticated";

grant select on table "public"."personal_bests" to "authenticated";

grant trigger on table "public"."personal_bests" to "authenticated";

grant truncate on table "public"."personal_bests" to "authenticated";

grant update on table "public"."personal_bests" to "authenticated";

grant delete on table "public"."personal_bests" to "service_role";

grant insert on table "public"."personal_bests" to "service_role";

grant references on table "public"."personal_bests" to "service_role";

grant select on table "public"."personal_bests" to "service_role";

grant trigger on table "public"."personal_bests" to "service_role";

grant truncate on table "public"."personal_bests" to "service_role";

grant update on table "public"."personal_bests" to "service_role";

grant delete on table "public"."tests" to "anon";

grant insert on table "public"."tests" to "anon";

grant references on table "public"."tests" to "anon";

grant select on table "public"."tests" to "anon";

grant trigger on table "public"."tests" to "anon";

grant truncate on table "public"."tests" to "anon";

grant update on table "public"."tests" to "anon";

grant delete on table "public"."tests" to "authenticated";

grant insert on table "public"."tests" to "authenticated";

grant references on table "public"."tests" to "authenticated";

grant select on table "public"."tests" to "authenticated";

grant trigger on table "public"."tests" to "authenticated";

grant truncate on table "public"."tests" to "authenticated";

grant update on table "public"."tests" to "authenticated";

grant delete on table "public"."tests" to "service_role";

grant insert on table "public"."tests" to "service_role";

grant references on table "public"."tests" to "service_role";

grant select on table "public"."tests" to "service_role";

grant trigger on table "public"."tests" to "service_role";

grant truncate on table "public"."tests" to "service_role";

grant update on table "public"."tests" to "service_role";

grant delete on table "public"."user_stats" to "anon";

grant insert on table "public"."user_stats" to "anon";

grant references on table "public"."user_stats" to "anon";

grant select on table "public"."user_stats" to "anon";

grant trigger on table "public"."user_stats" to "anon";

grant truncate on table "public"."user_stats" to "anon";

grant update on table "public"."user_stats" to "anon";

grant delete on table "public"."user_stats" to "authenticated";

grant insert on table "public"."user_stats" to "authenticated";

grant references on table "public"."user_stats" to "authenticated";

grant select on table "public"."user_stats" to "authenticated";

grant trigger on table "public"."user_stats" to "authenticated";

grant truncate on table "public"."user_stats" to "authenticated";

grant update on table "public"."user_stats" to "authenticated";

grant delete on table "public"."user_stats" to "service_role";

grant insert on table "public"."user_stats" to "service_role";

grant references on table "public"."user_stats" to "service_role";

grant select on table "public"."user_stats" to "service_role";

grant trigger on table "public"."user_stats" to "service_role";

grant truncate on table "public"."user_stats" to "service_role";

grant update on table "public"."user_stats" to "service_role";

grant delete on table "public"."users" to "anon";

grant insert on table "public"."users" to "anon";

grant references on table "public"."users" to "anon";

grant select on table "public"."users" to "anon";

grant trigger on table "public"."users" to "anon";

grant truncate on table "public"."users" to "anon";

grant update on table "public"."users" to "anon";

grant delete on table "public"."users" to "authenticated";

grant insert on table "public"."users" to "authenticated";

grant references on table "public"."users" to "authenticated";

grant select on table "public"."users" to "authenticated";

grant trigger on table "public"."users" to "authenticated";

grant truncate on table "public"."users" to "authenticated";

grant update on table "public"."users" to "authenticated";

grant delete on table "public"."users" to "service_role";

grant insert on table "public"."users" to "service_role";

grant references on table "public"."users" to "service_role";

grant select on table "public"."users" to "service_role";

grant trigger on table "public"."users" to "service_role";

grant truncate on table "public"."users" to "service_role";

grant update on table "public"."users" to "service_role";

create policy "Enable delete for users based on id"
on "public"."personal_bests"
as permissive
for delete
to public
using ((( SELECT auth.uid() AS uid) = "userId"));


create policy "Enable insert for users based on id"
on "public"."personal_bests"
as permissive
for insert
to public
with check ((( SELECT auth.uid() AS uid) = "userId"));


create policy "Enable read access for all users"
on "public"."personal_bests"
as permissive
for select
to public
using (true);


create policy "Enable update for users based on id"
on "public"."personal_bests"
as permissive
for update
to public
using ((( SELECT auth.uid() AS uid) = "userId"))
with check ((( SELECT auth.uid() AS uid) = "userId"));


create policy "Enable delete for users based on id"
on "public"."tests"
as permissive
for delete
to public
using ((( SELECT auth.uid() AS uid) = "userId"));


create policy "Enable insert for users based on id"
on "public"."tests"
as permissive
for insert
to public
with check ((( SELECT auth.uid() AS uid) = "userId"));


create policy "Enable read access for all users"
on "public"."tests"
as permissive
for select
to public
using (true);


create policy "Enable update for users based on id"
on "public"."tests"
as permissive
for update
to public
using ((( SELECT auth.uid() AS uid) = "userId"))
with check ((( SELECT auth.uid() AS uid) = "userId"));


create policy "Enable delete for users based on id"
on "public"."user_stats"
as permissive
for delete
to public
using ((( SELECT auth.uid() AS uid) = "userId"));


create policy "Enable insert for users based on id"
on "public"."user_stats"
as permissive
for insert
to public
with check ((( SELECT auth.uid() AS uid) = "userId"));


create policy "Enable read access for all users"
on "public"."user_stats"
as permissive
for select
to public
using (true);


create policy "Enable update for users based on id"
on "public"."user_stats"
as permissive
for update
to public
using ((( SELECT auth.uid() AS uid) = "userId"))
with check ((( SELECT auth.uid() AS uid) = "userId"));


create policy "Enable delete for users based on id"
on "public"."users"
as permissive
for delete
to public
using ((( SELECT auth.uid() AS uid) = id));


create policy "Enable insert for users based on id"
on "public"."users"
as permissive
for insert
to public
with check ((( SELECT auth.uid() AS uid) = id));


create policy "Enable read access for all users"
on "public"."users"
as permissive
for select
to public
using (true);


create policy "Enable update for users based on id"
on "public"."users"
as permissive
for update
to public
using ((( SELECT auth.uid() AS uid) = id))
with check ((( SELECT auth.uid() AS uid) = id));


CREATE TRIGGER check_if_test_is_pb_trigger BEFORE INSERT ON public.tests FOR EACH ROW EXECUTE FUNCTION check_if_test_is_pb();

CREATE TRIGGER update_user_data_trigger AFTER INSERT ON public.tests FOR EACH ROW EXECUTE FUNCTION update_user_data();


