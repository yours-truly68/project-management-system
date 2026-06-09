# V1 ROADMAP

## Included

Authentication

Workspaces

Projects

Boards

Columns

Tasks

Comments

Mentions

Notifications

Activity Logs

---

## Excluded

AI Features

Analytics

Calendar

Sprints

Attachments

WebSockets

Direct Messaging

---

## Development Order

1. Foundation
2. Design System
3. Application Shell
4. Authentication
5. Workspace Module
6. Project Module
7. Board Module
8. Task Module
9. Notifications
10. Activity Feed
11. Performance Pass
12. Accessibility Pass
13. Production Polish

---

## Documentation TODOs

* **API Path Prefix Alignment**: Completed. References to `/api/v1` across `API_SPEC_V1.md`, `API_CONTRACT.md`, `DEVELOPMENT_WORKFLOW.md`, and `AI_CONTEXT.md` have been updated to `/api` to align with the actual FastAPI router mounting prefix.
* **Refresh Token Request Body vs Cookie**: The backend `/auth/refresh` route expects a JSON body (`RefreshTokenRequest`), whereas the frontend enforces cookie propagation via HTTPOnly refresh tokens. The backend must be updated to support reading refresh tokens from HTTPOnly cookies, or documentation updated to align.
