# CondoTransparente

Web app for logging and tracking maintenance issues in condominium common areas.
Academic MVP built for the UC00615 course (CINEL) with Node.js, Express, EJS and MySQL.

Each administrator registers, adds their own condominiums and (soon) logs occurrences
for them. Data is isolated per administrator: nobody can see another user's records.

## Status

Work in progress. Implemented so far:

- [x] Registration, login and logout (hashed passwords, sessions)
- [x] Access control: protected pages redirect visitors to the login
- [x] Condominiums: list with occurrence count, create (with validation)
- [x] Condominiums: create and edit
- [ ] Occurrences: full CRUD, search/filter and detail page
- [ ] Browser-side validation
- [ ] Account page and account deletion (GDPR)

## Tech stack

- Node.js 22 and Express 5
- EJS templates, HTML, CSS and plain JavaScript
- MySQL (mysql2 with a connection pool)
- bcryptjs (password hashing) and express-session (sessions)

## Data model

Three tables linked by one-to-many relationships:
`utilizadores` → `condominios` → `ocorrencias`.

- A user (administrator) owns many condominiums. Deleting a user deletes their
  condominiums (`ON DELETE CASCADE`).
- A condominium has many occurrences. A condominium that still has occurrences
  cannot be deleted (`ON DELETE RESTRICT`).
- An occurrence has a priority (Baixa, Média, Alta) and a status (Pendente,
  Em curso, Resolvida), stored as `ENUM` columns and also validated on the server.

## Security measures

- Passwords stored as bcrypt hashes, never in plain text
- Parameterized queries everywhere (protection against SQL injection)
- Server-side validation of every form
- Protected pages (`exigirLogin` middleware) and per-user data isolation
- Explicit privacy consent at registration, and a privacy policy page
- Output escaped in the views (protection against XSS)

## Run it locally

1. Install Node.js (LTS) and start MySQL (for example with Laragon).
2. Import `condotransparente.sql` (phpMyAdmin: Import tab). It creates the
   `condotransparente` database and its tables.
3. Copy `.env.exemplo` to `.env` and fill in your database settings. Generate a
   session secret with:
   `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
4. Install the dependencies: `npm install`
5. Start the server: `node app.js`
6. Open <http://localhost:3000>

## Project structure

- `app.js`: server setup, middleware and routers
- `routes/`: `auth.js` (register, login, logout) and `condominios.js`
- `middleware/auth.js`: access control (`exigirLogin`)
- `views/`: EJS pages and partials
- `public/`: static files (CSS)
- `condotransparente.sql`: database schema

## Use of AI

I used Claude (Anthropic) as a tutor while building this project: to explain the
concepts, review my code and point out mistakes. I wrote the code myself, following
the course materials (Stack B manual and the "Biblioteca" reference app)
