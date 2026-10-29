# Test Results Pass — Lab 03-03

Verified against the deployed Cloud Run service backed by MongoDB Atlas.

| Request | Body | Expected Status | Actual Status | Notes / Response |
| --- | --- | --- | --- | --- |
| `GET /health` | — | 200 | 200 | `{"status":"ok"}` |
| `GET /issues` | — | 200 | 200 | Returns the Atlas collection; it was empty during verification. |
| `GET /issues/3` | — | 400 | 400 | Numeric Module 2 IDs are invalid: `{"error":"Invalid issue id"}`. |
| `GET /issues/000000000000000000000000` | — | 404 | 404 | A valid ObjectId with no matching document returns not found. |
| `POST /issues` | `{"title":"Cloud Run MongoDB verification"}` | 201 | 201 | Created document returned ObjectId-shaped `_id` `"6ab30bedff61406f774fcc0b"`. |
| `POST /issues` | `{}` | 400 | 400 | `{"error":"Title is required"}`; no document added. |
| `PATCH /issues/:id` | `{"status":"closed"}` | 200 | 200 | Updated the created document using its ObjectId. |
| `PATCH /issues/000000000000000000000000` | `{"status":"closed"}` | 404 | 404 | Valid ObjectId with no matching document. |
| `DELETE /issues/:id` | — | 204 | 204 | Deleted the temporary ObjectId-created document; no response body. |
| `GET /issues/:deletedId` | — | 404 | 404 | Confirms the deleted ObjectId no longer resolves. |
| `DELETE /issues/000000000000000000000000` | — | 404 | 404 | Valid ObjectId with no matching document. |

# Test Results Pass — Day 24/25 (Zod Validation + Server-Side author)

Verified locally against `npm run dev` backed by MongoDB Atlas.

| Request | Body | Expected Status | Actual Status | Notes / Response |
| --- | --- | --- | --- | --- |
| `POST /issues` | `{"title":"Login button unresponsive","description":"...","stepsToReproduce":"...","priority":"high"}` | 201 | 201 | `author` in the response was `{"userId":"user-placeholder-001","fullName":"Jordan Casey"}` — the `attachCurrentUser` placeholder, not anything sent in the request. |
| `POST /issues` | `{"description":"No title here","stepsToReproduce":"do a thing","priority":"low"}` (no `title`) | 400 | 400 | `{"error":"ValidationFailed","details":[{"path":"title","message":"Invalid input: expected string, received undefined"}]}`; no document created. |
| `POST /issues` | Valid body plus `"author":{"userId":"attacker-999","fullName":"Not Me"}` | 201 | 201 | Response `author` was still the server placeholder `{"userId":"user-placeholder-001","fullName":"Jordan Casey"}`; the client-supplied `author` was stripped by `validateBody`/`createIssueSchema` and never reached the controller. |
| `PATCH /issues/:id` | `{"priority":"high"}` | 200 | 200 | Only `priority` changed (`"medium"` → `"high"`); `title`, `description`, `stepsToReproduce`, `status`, `classification`, `author`, `createdOn`, `comments`, `testCases`, and `timeLog` were all unchanged. |

Test documents created during this pass were deleted via `DELETE /issues/:id` after verification.

# Test Results Pass — Lab 04-02 (Semantic Endpoints: status, classify, assign)

Verified locally against `npm run dev` backed by MongoDB Atlas.

| Request | Body | Expected Status | Actual Status | Notes / Response |
| --- | --- | --- | --- | --- |
| `PATCH /issues/:id/status` | `{"status":"in-progress"}` | 200 | 200 | Response `status` changed to `"in-progress"`; only that field was touched. |
| `PATCH /issues/:id/status` | `{"status":"done"}` | 400 | 400 | `{"error":"ValidationFailed","details":[{"path":"status","message":"Invalid option: expected one of \"open\"\|\"in-progress\"\|\"closed\""}]}`; no write occurred. |
| `PATCH /issues/:id/classify` | `{"classification":"approved"}` | 200 | 200 | Response `classification` changed to `"approved"`; only that field was touched. |
| `PATCH /issues/:id/classify` | `{"classification":"spam"}` | 400 | 400 | `{"error":"ValidationFailed","details":[{"path":"classification","message":"Invalid option: expected one of \"unclassified\"\|\"approved\"\|\"unapproved\"\|\"duplicate\""}]}`; no write occurred. |
| `PATCH /issues/:id/assign` | `{"userId":"dev-noor-7","fullName":"Noor Haddad"}` | 200 | 200 | Response `assignedTo` was exactly `{"userId":"dev-noor-7","fullName":"Noor Haddad"}` — taken directly from the request body, unlike `author`'s fixed server placeholder. |
| `PATCH /issues/:id/assign` | `{"userId":"dev-noor-7"}` (no `fullName`) | 400 | 400 | `{"error":"ValidationFailed","details":[{"path":"fullName","message":"Invalid input: expected string, received undefined"}]}`; no write occurred. |

`getIssueById` was re-tested with an invalid id (`GET /issues/not-a-valid-id`) after the `parseId()` refactor and still returned `400 {"error":"Invalid issue id"}`, confirming the shared helper preserved existing behavior. Test documents created during this pass were deleted via `DELETE /issues/:id` after verification.

# Test Results Pass — Day 28 (Comments + Test Cases)

Verified locally against the running API on 2026-10-07. The temporary issue was deleted after the checks.

| Request | Body | Expected Status | Actual Status | Notes / Response |
| --- | --- | --- | --- | --- |
| `POST /issues/:id/comments` | `{"comment":"comment to remove"}` | 201 | 201 | Comment was appended with `userId` `user-placeholder-001` and `fullName` `Jordan Casey`, matching the server placeholder identity. |
| `POST /issues/:id/comments` | `{"comment":""}` | 400 | 400 | `{"error":"ValidationFailed","details":[{"path":"comment","message":"Comment is required"}]}`; no comment was added. |
| `DELETE /issues/:id/comments/:commentId` | — | 200 | 200 | Deleted the first of two comments. The response contained only the other comment, unchanged. |
| `POST /issues/:id/test-cases` | — | 201 | 201 | No request body was sent. The new test case had `passed: false`. |
| `PATCH /issues/:id/test-cases/:testCaseId` | `{"passed":true}` | 200 | 200 | The selected test case changed to `passed: true`; the second test case remained `passed: false` and otherwise unchanged. Exactly one test case was passed. |
| `DELETE /issues/:id` | — | 204 | 204 | Removed the temporary verification issue. |

# Test Results Pass — Day 29/30 (Query and Pagination)

Verified locally against `npm run dev` backed by MongoDB Atlas on 2026-10-07. Temporary test issues were deleted after verification.

| Request | Expected Status | Actual Status | Notes / Response |
| --- | --- | --- | --- |
| `GET /issues?status=open` | 200 | 200 | Every returned issue had `status: "open"`. |
| `GET /issues?status=open&priority=high` | 200 | 200 | Every result matched both filters. |
| `GET /issues?priority=medium` | 200 | 200 | Every result had `priority: "medium"`. |
| `GET /issues?classification=approved` | 200 | 200 | Returned the approved fixture and every result was approved. |
| `GET /issues?assignedTo=retest-assignee-alpha` | 200 | 200 | Returned only the three issues assigned to that user id. |
| `GET /issues?status=closed&priority=high&classification=unapproved&assignedTo=retest-assignee-alpha` | 200 | 200 | Returned only the issue matching all four filters. |
| `GET /issues?sort=-createdOn` | 200 | 200 | Results were newest-first. |
| `GET /issues?sort=title` | 400 | 400 | `{"error":"ValidationFailed","details":[{"path":"sort","message":"Invalid option: expected one of \"createdOn\"|\"-createdOn\""}]}`. |
| `GET /issues?q=orchid` | 200 | 200 | Matched `ORCHID` in the title and `Orchid` in the description of a separate issue whose title did not contain the keyword. |
| `GET /issues?page=1&limit=2&sort=-createdOn` | 200 | 200 | Returned exactly two issues. |
| `GET /issues?page=2&limit=2&sort=-createdOn` | 200 | 200 | Returned two different issues, the next batch in newest-first order. |
| `GET /issues?limit=51` | 400 | 400 | `{"error":"ValidationFailed","details":[{"path":"limit","message":"Too big: expected number to be <=50"}]}`. |

Atlas Search index on `issueTracker.issues`: name `default`, mapping `{ "mappings": { "dynamic": true } }`, Atlas UI status `READY` (search index ready). The application startup completed `createIndex({ status: 1, createdOn: -1 })` before the local API began listening.


# Live Cloud Run Verification — 2026-10-07

Service: https://issue-tracker-517911843323.us-central1.run.app. Deployed revision: `issue-tracker-00006-s5z`. Cloud Build `68a78faf-1dbc-4da6-ad75-01d6e22551bd` completed with `SUCCESS` after deploying current `main`.

| Request | Expected Status | Actual Status | Notes / Response |
| --- | --- | --- | --- |
| `GET /issues?status=open` | 200 | 200 | Every returned issue had `status: "open"`. |
| `GET /issues?status=open&priority=high` | 200 | 200 | Every returned issue matched both filters. |
| `GET /issues?priority=medium` | 200 | 200 | Every returned issue had `priority: "medium"`. |
| `GET /issues?classification=approved` | 200 | 200 | Returned approved issues only. |
| `GET /issues?assignedTo=live-retest-alpha` | 200 | 200 | Returned only issues assigned to that user id. |
| `GET /issues?status=closed&priority=high&classification=unapproved&assignedTo=live-retest-alpha` | 200 | 200 | Returned only the issue satisfying all four filters. |
| `GET /issues?sort=-createdOn` | 200 | 200 | Results were newest-first. |
| `GET /issues?sort=title` | 400 | 400 | `{"error":"ValidationFailed","details":[{"path":"sort",...}]}`. |
| `GET /issues?limit=51` | 400 | 400 | `{"error":"ValidationFailed","details":[{"path":"limit",...}]}`. |
| `GET /issues?q=oRcHiD` | 200 | 200 | Case-insensitive search matched both `ORCHID` in a title and `Orchid` in the description of a separate issue whose title did not contain the word. |
| `GET /issues?page=1&limit=2&sort=-createdOn` | 200 | 200 | Returned exactly two issues. |
| `GET /issues?page=2&limit=2&sort=-createdOn` | 200 | 200 | Returned two different issues from the next page. |

Six temporary production fixtures were removed; all cleanup requests returned 204. Atlas Search index on `issueTracker.issues` is named `default`, has dynamic mapping, and showed `READY` in the Atlas UI.

# Day 31 Automated Test Coverage — 2026-10-11

`npx vitest run` completed with 5 tests passing in `tests/warmup.test.ts`. Automated checks cover the arithmetic warm-up, `createIssueSchema` accepting a valid issue and rejecting a missing title or invalid priority, and `POST /issues` rejecting an empty body with 400 `ValidationFailed` through Supertest and a mocked database module.

The previous manual results above are retained. `tests/issues.test.ts` was not present in the workspace, so the instructor-provided 33-test suite was not run; the remaining manually documented route and live Atlas Search checks are not yet covered by that suite here.

# Test Results — Lab 05-01 (Better Auth Setup) — 2026-10-23

All manual checks were run after starting a fresh `npm run dev` server with
Better Auth configured in the ignored `.env`. A randomly generated test email
and password were used; the temporary records were removed after verification.

| Request / Check | Expected | Actual | Notes |
| --- | --- | --- | --- |
| `GET /` without a cookie | 200 HTML | 200 HTML | The landing page remains public. |
| `POST /api/auth/sign-up/email` with valid details and `Origin: http://localhost:5173` | 200 and session cookie | 200; `better-auth.session_token` set | Used a temporary, generated test account. |
| `GET /api/auth/get-session` with sign-up cookie | 200 with session/user | 200 with signed-in user | Session user matched the new test account. |
| `GET /api/auth/get-session` without a cookie | 200 and `null` | 200 `null` | Verified before sign-up and again after sign-out. |
| `POST /api/auth/sign-out` | 200 `{"success":true}` | 200 `{"success":true}` | Session was ended. |
| `POST /api/auth/sign-in/email` with correct password | 200 and session cookie | 200; session cookie set | `GET /api/auth/get-session` then returned the user. |
| `POST /api/auth/sign-in/email` with wrong password | 401 `INVALID_EMAIL_OR_PASSWORD` | 401 `INVALID_EMAIL_OR_PASSWORD` | Response did not distinguish email from password. |
| Sign up with duplicate email | 422 `USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL` | 422 `USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL` | |
| Sign up with a password shorter than 8 characters | 400 `PASSWORD_TOO_SHORT` | 400 `PASSWORD_TOO_SHORT` | |
| Sign in with a cookie but no `Origin` header | 403 `MISSING_OR_NULL_ORIGIN` | 403 `MISSING_OR_NULL_ORIGIN` | |
| `GET /` while signed in and after sign-out | 200 HTML both times | 200 HTML both times | Landing page is public in either state. |
| MongoDB `user`, `account`, and `session` records after sign-up | Records exist; account password is a hash | All three records existed; password field was a long salted hash (over 100 characters, colon-separated), not the submitted password | Hash value was not copied. Temporary user, account, and session were deleted after verification. |
| `npm test` | All tests pass | 12 passed across 4 files | Tests use the shared auth stand-in from `tests/setup.ts`; no test uses Atlas credentials. |
| `npx tsc --noEmit` | No TypeScript errors | Passed | |
| `npm run build` | Backend and frontend build | Passed | |

# Test Results — Lab 05-02 (Protect Your Routes) — 2026-10-23

| Automated check | Expected | Actual | Notes |
| --- | --- | --- | --- |
| Unauthenticated `GET /issues` | 401 `{"error":"Please sign in first"}` | 401 with expected response | Issue collection was not accessed. |
| Authenticated `POST /issues` | 201 with signed-in person as author | 201; author id/name matched the mocked Better Auth session | A request-supplied author is not used. |
| Fresh-server `GET /api/me` with sign-in cookie | 200 with real user id and name | 200 `{"userId":"6adb9189e06f87a2cd5d44dc","fullName":"Dana Dev"}` | Temporary test user; removed after verification. |
| Fresh-server `GET /issues` with sign-in cookie | 200 issue list | 200 `[]` | Atlas issue collection had no remaining issues after temporary test cleanup. |
| Fresh-server `POST /issues` with sign-in cookie and a forged body author | 201; author from session | 201; response author matched authenticated user, not the forged body | Temporary test issue was deleted after verification. |
| Fresh-server `GET /` and `GET /health` | Public, 200 | 200 HTML and 200 `{"status":"ok"}` | |
| Fresh-server `GET /api/auth/get-session` without a cookie | 200 `null` | 200 `null` | Sign-in endpoints remain public. |
| Fresh-server `GET /api/me` without a cookie | 401 `{"error":"Please sign in first"}` | 401 with expected JSON response | |
| Fresh-server `GET /issues` without a cookie | 401 `{"error":"Please sign in first"}` | 401 with expected JSON response | |
| Fresh-server `GET /issues/64f000000000000000000001` without a cookie | 401 before issue lookup | 401 with expected JSON response | |
| Fresh-server `POST /issues` without a cookie | 401 before controller/validation work | 401 with expected JSON response | |
| `npm test` | All tests pass | 18 passed across 5 files | Shared Vitest setup provides an authenticated fixture; guard tests override it to simulate no session. |
| `npx tsc --noEmit` | No TypeScript errors | Passed | |

# Lab 05-02 Re-Test — 2026-10-24

The local server was stopped and restarted before the signed-out and signed-in
requests. A randomly generated test account was used; its account, session, and
temporary issue were removed after testing.

| Check | Expected | Actual | Notes |
| --- | --- | --- | --- |
| Signed out: `GET /issues` | 401 `{"error":"Please sign in first"}` | 401 with expected JSON | |
| Signed out: `GET /issues/64f000000000000000000001` | 401 before issue lookup | 401 with expected JSON | |
| Signed out: `POST /issues` | 401 `{"error":"Please sign in first"}` | 401 with expected JSON | |
| Signed out: `GET /api/me` | 401 `{"error":"Please sign in first"}` | 401 with expected JSON | |
| Signed out: `GET /` | 200 HTML | 200 HTML | |
| Signed out: `GET /health` | 200 | 200 `{"status":"ok"}` | |
| Signed out: `GET /api/auth/get-session` | 200 `null` | 200 `null` | |
| Signed in: `GET /api/me` | 200 with real id and full name | 200 `{"userId":"6adce6d9935b8853185fdcdb","fullName":"Retest User"}` | Temporary test account, removed after test. |
| Signed in: `GET /issues` | 200 issue list | 200 `[]` | No pre-existing issues were returned. |
| Signed in: `POST /issues` with fake author in request body | 201 with authenticated user as author | 201; author was `{"userId":"6adce6d9935b8853185fdcdb","fullName":"Retest User"}` | Did not use body author `hacker` / `Not Me`; temporary issue deleted. |
| Old session cookie after sign-out: `GET /issues` | 401 | 401 `{"error":"Please sign in first"}` | Sign-out returned 200 `{"success":true}` first. |
| Temporary experiment: mount guard after router, signed-out `GET /issues` | Demonstrate route-order bug | 200 `[]` | Restored `app.use("/issues", requireAuth, issuesRouter)` immediately afterward. |
| Temporary experiment: fake-user middleware after guard on `POST /issues` | Demonstrate fake identity overwrites session | 201; author was `{"userId":"user-placeholder-001","fullName":"Jordan Casey"}` instead of the signed-in test user | Removed the temporary middleware afterward; deleted test issue and account records. |
| `npm test` including `tests/auth.test.ts` | All tests pass | 21 passed across 5 files | `tests/auth.test.ts` has a file-local auth mock and covers anonymous `/issues`, anonymous/authenticated `/api/me`, and public `/health`. |
| `npx tsc --noEmit` | No TypeScript errors | Passed | |

# Lab 05-03 - Roles and Permissions - 2026-10-28

Six temporary accounts (Eve, Bo, Quinn, Pat, Tia, Nate; password `password123`) were signed up through
`POST /api/auth/sign-up/email`. Tia was promoted to `technicalManager` by hand in the `user` collection
(`matchedCount` 1, `modifiedCount` 1). The other roles were handed out through `PATCH /users/:id/role`.
Requests were sent from a script with the same method, URL, headers and body as the Postman requests.
The accounts stay in the database until Lab 05-04.

| Check | Expected | Actual | Notes |
| --- | --- | --- | --- |
| New sign-up `GET /api/me` | `"role":"user"` | `"role":"user"` for all six | The plugin's label for "no role yet". |
| Nate (no role): `GET /api/me` | 200, role `user` | 200 | |
| Nate: `GET /issues` | 200 | 200 `[]` | Reading needs only a sign-in. |
| Nate: `POST /issues` | 403 `Your role may not issue:create` | 403 `{"error":"Your role may not issue:create"}` | |
| Nate: `POST /issues/64f000000000000000000001/comments` | 403 `Your role may not comment:create` | 403 `{"error":"Your role may not comment:create"}` | Guard answers before the id is looked up. |
| Tia: `PATCH /users/<id>/role` developer / businessAnalyst / qualityAnalyst / productManager | 200 each | 200 each | Eve, Bo, Quinn, Pat. |
| Tia: role `wizard` | 400 ValidationFailed | 400 `ValidationFailed` | |
| Tia: change her own role | 400 `You cannot change your own role` | 400 `{"error":"You cannot change your own role"}` | |
| Tia: unknown user id | 404 `User not found` | 404 `{"error":"User not found"}` | |
| Eve: `GET /api/me` after the change, no new sign-in | role `developer` | `"role":"developer"` | Role is read from the database each time. |
| Eve creates an issue | 201 | 201 | |
| Eve: classify | 403 `issue:classify` | 403 `Your role may not issue:classify` | |
| Bo: classify | 200 | 200, `classification` `approved` | |
| Eve: status `closed` | 403 `issue:close` | 403 `Your role may not issue:close` | |
| Eve: status `in-progress` | 200 | 200 | No role needed; ownership is Lab 05-04. |
| Bo: status `closed` | 200 | 200 | |
| Eve: assign | 403 `issue:assign` | 403 | |
| Pat: assign | 200 | 200 | |
| Eve: add test case | 403 `testCase:create` | 403 | |
| Quinn: add test case | 201 | 201 | |
| Bo: set test case result | 403 `testCase:setResult` | 403 | |
| Quinn: set test case result | 200 | 200 | |
| Pat: `DELETE /issues/<id>` | 403 `issue:delete` | 403 | |
| Tia: `DELETE /issues/<id>` | 204, then 404 | 204, then 404 | |
| Signed out: classify | 401, not 403 | 401 | "Who are you?" is answered before "may you?". |
| Break it: misspell permission `"clsoe"` | `tsc` refuses | `TS2345: Argument of type '"clsoe"' is not assignable ...` | Fixed afterwards. |
| Break it: remove the classify guard, Eve classifies | 200 with no warning | 200, `classification` `approved` | Guard restored; Eve gets 403 again. |
| Break it: Nate promotes himself | 403 `user:set-role` | 403 `{"error":"Your role may not user:set-role"}` | |
| Break it: sign-up with `"role":"technicalManager"` | 400 `FIELD_NOT_ALLOWED` | 400 `{"message":"role is not allowed to be set","code":"FIELD_NOT_ALLOWED"}` | No account was created. |
| Break it: change Quinn's role in the database, repeat setResult without signing in again | 403 | 403 `Your role may not testCase:setResult` | Role changed back to `qualityAnalyst` afterwards. |
| `npm test` | All tests pass | 30 passed across 6 files | Includes `tests/permissions.test.ts`. |
| `npx tsc --noEmit` | No errors | Passed | |

The permissions in `src/permissions.ts` match the chart in `docs/PERMISSIONS.md`, which uses the class chart unchanged.
The expected results above follow that chart.
