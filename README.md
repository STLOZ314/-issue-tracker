# Issue Tracker

A RESTful API issue tracker built with Node.js, Express, TypeScript, and React.

## Live Deployment
- **Cloud Run Service URL**: https://issue-tracker-ivnvgl25oa-uc.a.run.app
- **Health Check**: https://issue-tracker-ivnvgl25oa-uc.a.run.app/health
- **Issues Endpoint**: https://issue-tracker-ivnvgl25oa-uc.a.run.app/issues

The live service is backed by the MongoDB Atlas `issueTracker.issues` collection.

## Module 4 Deployment Check — 2026-10-07

The live Cloud Run service at https://issue-tracker-ivnvgl25oa-uc.a.run.app is still on revision `issue-tracker-00005-mqq` and does not yet reflect Module 4. Production checks returned 200 for both `?sort=title` and `?limit=51`, which should return 400 after the update. The local Module 4 build and API retest pass. No Cloud Build triggers or recent builds are configured for this project, so automatic redeployment has not occurred.

