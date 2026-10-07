# Issue Tracker

A RESTful API issue tracker built with Node.js, Express, TypeScript, and React.

## Live Deployment
- **Cloud Run Service URL**: https://issue-tracker-517911843323.us-central1.run.app
- **Health Check**: https://issue-tracker-517911843323.us-central1.run.app/health
- **Issues Endpoint**: https://issue-tracker-517911843323.us-central1.run.app/issues

The live service is backed by the MongoDB Atlas `issueTracker.issues` collection.

## Module 4 Deployment — 2026-10-07

Deployed current `main` source to revision `issue-tracker-00006-s5z`. Cloud Build `68a78faf-1dbc-4da6-ad75-01d6e22551bd` completed with `SUCCESS`.

Live checks passed: status and combined filters returned matching issues; mixed-case `?q=oRcHiD` matched words in both titles and descriptions; `?sort=-createdOn` was newest-first; page 1 and page 2 returned distinct batches; invalid sort and `limit=51` each returned 400 `ValidationFailed`. Temporary verification issues were deleted after testing.

