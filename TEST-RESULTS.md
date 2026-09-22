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
