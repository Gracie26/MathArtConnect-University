# External setup

The app uses **real Supabase Auth**. Until the Supabase values below are set, it still runs, but the sign-in screens say accounts are not connected. Development builds also say exactly what is missing. No account is ever faked.

For offline UI work only, a development build can opt into a local, device-only test backend with `EXPO_PUBLIC_AUTH_BACKEND=device-dev`. It is clearly labelled, offers "simulate link" buttons in place of emails, and is ignored in release builds. The automated tests use it.

## 1. Environment file

```bash
cp .env.example .env.local
```

`.env.local` is git-ignored. Only `EXPO_PUBLIC_*` values reach the app, and anyone with the app can read them. Never put the Supabase service-role key or any OAuth client secret in them. Restart `npx expo start` after changing env values.

| Variable                               | Purpose                                                          |
| -------------------------------------- | ---------------------------------------------------------------- |
| `EXPO_PUBLIC_SUPABASE_URL`             | Base project URL (`https://<ref>.supabase.co`)                   |
| `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key `sb_publishable_…` (public by design)            |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY`        | Older name for the same key; used only if the one above is empty |
| `EXPO_PUBLIC_AUTH_GOOGLE_ENABLED`      | `true` only after section 4 is complete                          |
| `EXPO_PUBLIC_AUTH_APPLE_ENABLED`       | `true` only after section 5 is complete                          |
| `EXPO_PUBLIC_ACTIVE_TOPIC_ID`          | Optional local topic override                                    |

## 2. Supabase: email accounts and profiles

1. Create a project at https://supabase.com.
2. Copy the **Project URL** and the **publishable (anon public) key** into the two `EXPO_PUBLIC_SUPABASE_*` variables. Never use the secret / service_role key: the app detects it and refuses to use it.
3. Apply **all three** migrations in order, then the seed:
   - `supabase/migrations/20261009000000_initial_schema.sql`
   - `supabase/migrations/20261010000000_profile_setup_and_avatars.sql` (profile completion + private `avatars` bucket)
   - `supabase/migrations/20261011000000_explicit_api_grants.sql` (table privileges for the app; newer Supabase projects do not grant them automatically, which shows up as `42501 permission denied`)
   - `supabase/seed.sql`

   Either paste them into the SQL editor, or use the CLI:

   ```bash
   npx supabase link --project-ref <project-ref>
   npx supabase db push
   ```

4. Go to **Authentication › URL Configuration**:
   - **Site URL:** your web address (for local web: `http://localhost:8081`).
   - **Redirect URLs.** Add these; the `**` wildcard covers the `?flow=recovery` variant:
     - `mathartconnect://**` (installed app / development build)
     - `http://localhost:8081/**` (local web)
     - `exp://**` (only if you test email links in Expo Go)
     - your production web domain, if any, e.g. `https://app.example.org/**`
5. Go to **Authentication › Sign In / Providers › Email**: keep **Confirm email** on. Minimum password length 8 matches the app's rule.
   - Supabase's built-in email service is for testing only. It sends a few emails per hour, and only to addresses of members of your Supabase organisation. Test with your own address, or add custom SMTP under **Authentication › Emails › SMTP Settings** before inviting other learners.
6. Optional: under **Authentication › Emails**, adjust the confirmation and reset email wording. Keep `{{ .ConfirmationURL }}` in the templates.

How the links work: sign-up and reset emails link to `/auth/callback` (with `?flow=recovery` for resets). The app exchanges the one-time code for a session (PKCE). Open the link **on the same device** where you signed up or requested the reset. If the link is opened elsewhere, the email is still verified, and the app asks the learner to sign in.

Row-level security: learners can read and update **only their own** `profiles` row, and only descriptive columns (name, institution, programme, year, avatar, profile completion). XP, streaks and research fields are server-controlled. Avatars live in a **private** bucket under `<user id>/…` and are shown through short-lived signed URLs.

## 3. EAS (cloud builds and store submission)

```bash
npx eas-cli@latest login
npx eas-cli@latest init          # creates the EAS project; copy the id
```

Set `EAS_PROJECT_ID` (in your shell or the EAS environment). `app.config.ts` reads it into `extra.eas.projectId`. Add the `EXPO_PUBLIC_*` values as EAS environment variables for the `development`, `preview` and `production` environments used in `eas.json`.

```bash
npx eas-cli@latest build --profile development --platform android
npx eas-cli@latest build --profile preview --platform android   # installable APK
```

Before the first store build, confirm the bundle ID and Android package (`com.mathartconnect.mobile`). They cannot be changed after the app is published.

## 4. Google sign-in (Supabase OAuth)

The app opens Google through Supabase (`signInWithOAuth`, PKCE) in a secure browser sheet on iOS and Android, and with a normal redirect on web. The Google client **secret** lives only in Supabase.

1. In **Google Cloud Console › APIs & Services**:
   - Configure the **OAuth consent screen** (app name, support email, logo, privacy policy URL once final).
   - Create an **OAuth client ID** of type **Web application**.
   - Under **Authorized redirect URIs**, add `https://<project-ref>.supabase.co/auth/v1/callback`.
2. In **Supabase › Authentication › Sign In / Providers › Google**: enable it, then paste the Web client ID and client secret.
3. Make sure the redirect URLs from section 2 step 4 are present.
4. Set `EXPO_PUBLIC_AUTH_GOOGLE_ENABLED=true` and restart.

Works in Expo Go, development builds and web. On Android, a Google account must be available in the browser.

## 5. Apple sign-in ("Continue with Apple")

These steps need an **Apple Developer Program** membership. Some of them need a Mac or an EAS build; none can be finished on Windows alone.

- **iOS:** uses the native Sign in with Apple sheet (`expo-apple-authentication`) and passes the ID token to Supabase with a SHA-256 nonce.
- **Android and web:** use Supabase OAuth with Apple's web flow.

1. In **Apple Developer › Certificates, IDs & Profiles**:
   - **App ID** `com.mathartconnect.mobile`: enable **Sign in with Apple**. `app.config.ts` already sets `ios.usesAppleSignIn`, and EAS Build syncs the capability.
   - **Services ID** (for example `com.mathartconnect.mobile.web`): enable Sign in with Apple, then add domain `<project-ref>.supabase.co` and return URL `https://<project-ref>.supabase.co/auth/v1/callback`.
   - **Key** with Sign in with Apple enabled: download the `.p8` file and note the Key ID and your Team ID.
2. In **Supabase › Authentication › Sign In / Providers › Apple**: enable it.
   - **Client IDs:** add both the bundle ID (`com.mathartconnect.mobile`, for native iOS) and the Services ID (for Android and web).
   - **Secret key:** generate it from the `.p8` key, Team ID and Key ID, following Supabase's Apple guide. Apple secrets expire after at most 6 months, so set a reminder to rotate it.
3. Set `EXPO_PUBLIC_AUTH_APPLE_ENABLED=true`.
4. Test native iOS in a **development build** (`eas build --profile development --platform ios`) or Expo Go on an iPhone. Test Android and web through the browser flow.

App Store rule: because the app offers Google sign-in, Apple requires Sign in with Apple on iOS. Keep both enabled together for iOS releases.

## 6. Research participation

Account creation never includes research consent. The `profiles` table already has `research_participant`, `research_consent_given`, `research_consent_version`, `research_consent_date` and `research_withdrawn_at`. All are server-controlled and off by default. Keep `researchConsentFlow: false` (`config/features.ts`) until the research instrument, consent wording, consent version and ethics approval are confirmed.

## 7. Legal pages

`/terms` and `/privacy` are marked "Draft / pending final research and legal review". Replace their content once the approved texts exist; the Privacy Policy URL is also needed for the Google consent screen and the app stores.
