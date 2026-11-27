# Frontend Integration Status

## Ready

- Login uses `POST /api/auth/login`.
- Registration uses `POST /api/auth/register`.
- Session restoration uses `GET /api/auth/me`.
- Logout uses `POST /api/auth/logout`.
- Authentication uses the backend HttpOnly `community.sid` cookie through Axios
  with `withCredentials: true`.
- Protected routes wait for session verification before showing account settings.
- Backend error messages and validation messages are displayed on login and
  registration forms.
- The frontend Vite development server proxies `/api` to
  `http://localhost:5000`.

## Preserved pages

These routes remain available with their Nexus visual direction:

- `/login`
- `/register`
- `/profile`
- `/settings` and `/settings/profile`

The profile page displays the authenticated user's real username, email,
avatar, bio, role, and creation date. Profile activity and counts show honest
empty states because those APIs do not exist yet.

## Placeholders

The following routes remain in the router but are intentionally minimal:

- `/search`
- `/u/:username/followers`
- `/u/:username/following`

They use the shared `FeaturePlaceholder` component and do not contain fake
results or local follow state.

## Backend endpoints connected

| Method | Endpoint | Frontend usage |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Registration |
| `POST` | `/api/auth/login` | Login |
| `POST` | `/api/auth/logout` | Logout |
| `GET` | `/api/auth/me` | Session restoration |

## Backend endpoints still required

The backend currently does not expose endpoints for:

- Public user profile lookup by username
- Profile updates for username, avatar, or bio
- Password changes
- Followers/following lists and follow/unfollow actions
- Posts, comments, communities, and profile activity
- Search
- Privacy preferences, connected accounts, or session management

The frontend leaves controls for these areas disabled or displays an empty
state instead of claiming that data was saved.

## Removed mock data

- `frontend/src/features/profile/data/mockprofile.ts`
- Mock search posts, communities, and users
- Mock followers and following lists
- Anonymous guest names stored in `sessionStorage`

## Validation

The following commands pass:

```powershell
cd frontend
npm run build
npm run lint

cd ..\backend
npm run build
npm run lint
```

Real registration, login, and session persistence require a running MongoDB
instance and a configured backend `.env` file. The frontend itself does not
store session tokens or trusted authentication state in browser storage.

