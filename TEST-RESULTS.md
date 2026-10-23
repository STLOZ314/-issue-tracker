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

Local checks were performed against `npm run dev` with Better Auth configured in
the ignored `.env`. No sign-up request was sent, so no test account was created.

| Request / Check | Expected | Actual | Notes |
| --- | --- | --- | --- |
| `GET /` | 200 with landing-page HTML | 200 | Public landing page is available without a session. |
| `GET /health` | 200 | 200 | `{"status":"ok"}`. |
| `GET /api/auth/get-session` without a cookie | 200 with `null` | 200 | No signed-in session was present. |
| `npm test` | All tests pass | 12 passed | Vitest uses the shared auth stand-in in `tests/setup.ts`; database connection reuse has a separate mocked test. |
| `npx tsc --noEmit` | No TypeScript errors | Passed | |
| `npm run build` | Backend and frontend build | Passed | |

Postman account flows, password/duplicate-email errors, and MongoDB auth
collections were not manually verified in this pass.
