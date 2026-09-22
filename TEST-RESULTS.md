# Test Results Pass — Lab 03-03

| Request | Body | Expected Status | Actual Status | Notes / Response |
| --- | --- | --- | --- | --- |
| `GET /health` | — | 200 | 200 | `{"status":"ok"}` |
| `GET /issues` | — | 200 | 200 | Collection was empty; returns `[]`. |
| `GET /issues/3` | — | 400 | 400 | `{"error":"Invalid issue id"}`; old numeric IDs are no longer valid. |
| `GET /issues/ffffffffffffffffffffffff` | — | 404 | 404 | Valid ObjectId format, but no matching issue. |
| `POST /issues` | `{"title":"Lab MongoDB integration test"}` | 201 | 201 | Created issue returned `_id` `"6ab2fc0317c21b760026a094"`, a 24-character MongoDB ObjectId string. |
| `POST /issues` | `{}` | 400 | 400 | `{"error":"Title is required"}`; nothing added. |
| `PATCH /issues/:id` | `{"status":"closed"}` | 200 | 200 | Updated the issue created above using its ObjectId; response includes the same ObjectId-shaped `_id`. |
| `PATCH /issues/ffffffffffffffffffffffff` | `{"status":"closed"}` | 404 | 404 | Valid ObjectId format, but no matching issue. |
| `DELETE /issues/:id` | — | 204 | 204 | Deleted the ObjectId-created test issue; no response body. |
| `GET /issues/:deletedId` | — | 404 | 404 | Confirms the deleted ObjectId no longer resolves. |
| `DELETE /issues/ffffffffffffffffffffffff` | — | 404 | 404 | Valid ObjectId format, but no matching issue. |
| Restart persistence check | — | 200 | 200 | Created probe `_id` `"6ab2fc1b17c21b760026a095"`, restarted the server, then retrieved it by the same ObjectId. The probe was deleted after verification. |
