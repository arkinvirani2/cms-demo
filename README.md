# Clinic Management Auth Setup

Production-ready authentication and role-based access control for a clinic system using:

- Next.js App Router
- TypeScript
- Supabase Auth + Database
- Zustand
- Tailwind CSS

## Business Rules Implemented

- There are only 2 roles: doctor and patient.
- There is only one doctor in the system (doctor account is created manually in backend/database).
- Doctor can login only (no signup flow for doctor).
- Patient can signup and login.
- Doctor and patient use the same login page.
- Role is detected after auth via database lookup by email.
- Redirects are automatic:
	- doctor -> /doctor/dashboard
	- patient -> /patient/dashboard
- Route protection is enforced by middleware and protected layouts.

## Folder Structure

```txt
src/
	app/
		(doctor)/doctor/
			dashboard/page.tsx
			layout.tsx
		(patient)/patient/
			dashboard/page.tsx
			layout.tsx
		login/page.tsx
		signup/page.tsx
		globals.css
		layout.tsx
		page.tsx
	components/
		auth/
			login-form.tsx
			logout-button.tsx
			signup-form.tsx
		providers/
			auth-provider.tsx
	lib/
		auth/
			roles.ts
		supabase/
			browser.ts
			env.ts
			middleware.ts
			server.ts
		types/
			database.ts
	services/
		auth.service.ts
	store/
		auth.store.ts
	middleware.ts
```

## Environment Variables

Copy .env.example to .env.local and set values:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Supabase Setup

### 1) Create tables

Run your provided SQL for doctors and patients tables.

### 2) Create doctor auth account manually

Create doctor account in Supabase Auth (Dashboard -> Authentication -> Users -> Invite/Add user).

Important:
- Doctor auth email must exactly match doctors.email row.
- Since business logic says one doctor, keep only one doctor record.

### 3) Enable RLS and policies

Use policies so users can only read/write what they need:

```sql
alter table public.doctors enable row level security;
alter table public.patients enable row level security;

-- Doctors can read their own doctor row by matching email with auth user email.
create policy "doctor can read own record"
on public.doctors
for select
to authenticated
using (email = auth.jwt() ->> 'email');

-- Patients can read their own patient row by matching email.
create policy "patient can read own record"
on public.patients
for select
to authenticated
using (email = auth.jwt() ->> 'email');

-- Patients can insert their own row at signup.
create policy "patient can insert own record"
on public.patients
for insert
to authenticated
with check (email = auth.jwt() ->> 'email');

-- Optional: allow patient to update their own row.
create policy "patient can update own record"
on public.patients
for update
to authenticated
using (email = auth.jwt() ->> 'email')
with check (email = auth.jwt() ->> 'email');
```

If you need doctor to manage all patients from frontend with anon key, add admin-safe policies carefully.

## Authentication Architecture

1. Supabase browser client handles signup/login/logout on client.
2. Supabase server client handles server-side redirects in App Router pages/layouts.
3. Supabase middleware client refreshes auth cookies and protects route segments.
4. Role detection uses database lookup by email:
	 - email in doctors -> doctor
	 - else email in patients -> patient
5. Zustand store holds auth state:
	 - user
	 - session
	 - role
	 - loading
	 - error
	 - login/signup/logout/fetchCurrentUser
6. Root route and auth pages auto-redirect based on resolved role.

## Flow Summary

### Doctor Login

1. Doctor signs in from /login.
2. System checks doctors table by email.
3. If found -> role=doctor -> redirect /doctor/dashboard.

### Patient Signup

1. Patient signs up from /signup.
2. Supabase Auth creates user.
3. Patient row is inserted into patients table automatically.
4. Role=patient -> redirect /patient/dashboard.

### Patient Login

1. Patient signs in from /login.
2. System checks patients table by email.
3. Role=patient -> redirect /patient/dashboard.

## Middleware Protection

- /doctor/* -> only doctor
- /patient/* -> only patient
- unauthenticated user -> /login
- authenticated user visiting /login or /signup is redirected to their dashboard

## Run Locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Security Considerations

- Always keep RLS enabled for doctors and patients.
- Never expose service_role key in frontend.
- Use strict policies for insert/select/update scope.
- Keep doctor account creation restricted to backend/admin only.
- Ensure doctor email uniqueness is enforced in doctors table.
- Consider enabling email verification and MFA based on clinic compliance requirements.
