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

