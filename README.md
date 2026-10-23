# Issue Tracker

A RESTful API issue tracker built with Node.js, Express, TypeScript, and React.

## Live Deployment

- **Cloud Run Service URL**: https://issue-tracker-517911843323.us-central1.run.app
- **Health Check**: https://issue-tracker-517911843323.us-central1.run.app/health
- **Issues Endpoint**: https://issue-tracker-517911843323.us-central1.run.app/issues

The live service is backed by the MongoDB Atlas `issueTracker.issues` collection.

## Sign-in

Email/password authentication is provided by Better Auth 1.7.7 and stored in the
same MongoDB database (`issueTracker`). Configure these environment variables
before starting the server:

- `BETTER_AUTH_SECRET`: a private random value at least 32 characters long.
  Generate one with
  `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.
- `BETTER_AUTH_URL`: the API's base URL, such as `http://localhost:3000`.
- `CLIENT_ORIGIN`: the allowed front-end origin, such as
  `http://localhost:5173`. Do not include a path.

The API exposes Better Auth's email/password endpoints:

- `POST /api/auth/sign-up/email` creates an account and starts a session.
- `POST /api/auth/sign-in/email` signs in and starts a session.
- `GET /api/auth/get-session` returns the current session, or `null`.
- `POST /api/auth/sign-out` ends the current session.

Send `{"name":"Alex Example","email":"alex@example.com","password":"a-long-password"}`
to sign up, or `{"email":"alex@example.com","password":"a-long-password"}` to
sign in. Retain the returned cookie for subsequent requests. The landing page
and issue routes remain public; this authentication setup does not yet enforce
authorization.

## Module 4 Deployment — 2026-10-07

Deployed current `main` source to revision `issue-tracker-00006-s5z`. Cloud Build `68a78faf-1dbc-4da6-ad75-01d6e22551bd` completed with `SUCCESS`.

Live checks passed: status and combined filters returned matching issues; mixed-case `?q=oRcHiD` matched words in both titles and descriptions; `?sort=-createdOn` was newest-first; page 1 and page 2 returned distinct batches; invalid sort and `limit=51` each returned 400 `ValidationFailed`. Temporary verification issues were deleted after testing.
