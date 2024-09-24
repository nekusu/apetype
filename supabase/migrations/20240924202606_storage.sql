create policy "All access 1ufimg_0"
on "storage"."objects"
as permissive
for select
to authenticated
using ((bucket_id = 'users'::text));


create policy "Enable access for users based on id 1ufimg_0"
on "storage"."objects"
as permissive
for update
to authenticated
using (((bucket_id = 'users'::text) AND (storage.filename(name) = (auth.uid() || '.webp'::text))));


create policy "Enable access for users based on id 1ufimg_1"
on "storage"."objects"
as permissive
for insert
to authenticated
with check (((bucket_id = 'users'::text) AND (storage.filename(name) = (auth.uid() || '.webp'::text))));


create policy "Enable access for users based on id 1ufimg_2"
on "storage"."objects"
as permissive
for delete
to authenticated
using (((bucket_id = 'users'::text) AND (storage.filename(name) = (auth.uid() || '.webp'::text))));



