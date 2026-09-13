# Test Results Pass — Day 14

| Request | Body | Expected Status | Actual Status | Notes / Response |
| --- | --- | --- | --- | --- |
| `GET /health` | — | 200 | 200 | `{"status":"ok"}` |
| `GET /issues` | — | 200 | 200 | Returns all 3 seeded issues |
| `GET /issues/1` | — | 200 | 200 | Returns first seeded issue (id 1) |
| `GET /issues/999` | — | 404 | 404 | `{"error":"Issue not found"}` |
| `POST /issues` | `{"title":"New issue"}` | 201 | 201 | Created with status `"open"`, priority `"medium"` |
| `POST /issues` | `{}` | 400 | 400 | `{"error":"Title is required"}`; nothing added |
| `PATCH /issues/1` | `{"status":"closed"}` | 200 | 200 | Issue 1's status updated to `"closed"` |
| `PATCH /issues/999` | `{"status":"closed"}` | 404 | 404 | `{"error":"Issue not found"}` |
| `DELETE /issues/2` | — | 204 | 204 | No response body |
| `GET /issues/2` | — | 404 | 404 | Confirms issue 2 was deleted |
| `DELETE /issues/999` | — | 404 | 404 | `{"error":"Issue not found"}` |
