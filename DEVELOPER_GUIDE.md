# Lions Event Management Hub - Entwickler-Anleitung

## Übersicht

Dieses Projekt ist eine Multi-Tenant SaaS-Plattform für Lions Clubs zur Verwaltung von Events, Mitgliedern und Clubaktivitäten.

### Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Sprache:** TypeScript
- **Datenbank:** PostgreSQL (Supabase in Cloud, Docker lokal)
- **ORM:** Prisma
- **Monorepo:** Turborepo + pnpm
- **Styling:** Tailwind CSS
- **Auth:** Clerk (geplant)
- **Deployment:** Vercel

---

## Umgebungen

| Umgebung | Branch | URL | Datenbank |
|----------|--------|-----|-----------|
| **Lokal** | feature/* | localhost:3000 | Docker PostgreSQL |
| **DEV** | `develop` | Preview-URL auf Vercel | Supabase `lions-hub-dev` |
| **TEST** | `main` | Production-URL auf Vercel | Supabase `lions-hub-test` |

---

## Erste Einrichtung (Neuer Entwickler)

### 1. Voraussetzungen installieren

| Tool | Version | Installation |
|------|---------|--------------|
| Node.js | 18.x oder 20.x | [nodejs.org](https://nodejs.org) |
| pnpm | 8.x | `npm install -g pnpm` |
| Git | 2.x | [git-scm.com](https://git-scm.com) |
| Docker Desktop | 4.x | [docker.com](https://www.docker.com/products/docker-desktop) |
| VS Code | (empfohlen) | [code.visualstudio.com](https://code.visualstudio.com) |

### 2. Repository klonen

```bash
git clone https://github.com/MichaelFerschl/lions-event-management.git
cd lions-event-management
```

### 3. Dependencies installieren

```bash
pnpm install
```

### 4. Environment-Dateien erstellen

#### `packages/database/.env`

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/lions_hub?schema=public"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/lions_hub?schema=public"
```

#### `apps/web/.env.local`

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/lions_hub?schema=public"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/lions_hub?schema=public"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_placeholder
CLERK_SECRET_KEY=sk_test_placeholder
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> ⚠️ **Wichtig:** Diese Dateien sind in `.gitignore` und werden NICHT committed!

### 5. Docker starten und Datenbank einrichten

```bash
# Docker Container starten
docker compose up -d

# Datenbank-Schema erstellen
pnpm db:push

# Demo-Daten einfügen
pnpm db:seed
```

### 6. Entwicklungsserver starten

```bash
pnpm dev
```

Öffne [http://localhost:3000](http://localhost:3000) im Browser.

---

## Projekt-Struktur

```
lions-event-management/
├── apps/
│   └── web/                    # Next.js Web-Anwendung
│       ├── src/
│       │   ├── app/            # App Router (Seiten)
│       │   ├── components/     # React-Komponenten
│       │   ├── lib/            # Hilfsfunktionen (db, auth, etc.)
│       │   └── types/          # TypeScript-Typen
│       ├── prisma/
│       │   └── schema.prisma   # Datenbank-Schema (Kopie für Vercel)
│       └── .env.local          # Lokale Umgebungsvariablen
│
├── packages/
│   └── database/               # Shared Database Package
│       ├── prisma/
│       │   ├── schema.prisma   # Haupt-Datenbank-Schema
│       │   └── seed.ts         # Demo-Daten
│       ├── src/
│       │   └── index.ts        # Exports
│       └── .env                # Datenbank-Verbindung
│
├── docker-compose.yml          # Lokale Datenbank + Services
├── turbo.json                  # Turborepo-Konfiguration
├── pnpm-workspace.yaml         # Workspace-Definition
└── package.json                # Root-Package
```

---

## Verfügbare Scripts

| Befehl | Beschreibung |
|--------|--------------|
| `pnpm dev` | Startet Entwicklungsserver |
| `pnpm build` | Erstellt Production-Build |
| `pnpm lint` | Führt ESLint aus |
| `pnpm db:push` | Synchronisiert Schema mit Datenbank |
| `pnpm db:seed` | Fügt Demo-Daten ein |
| `pnpm db:studio` | Öffnet Prisma Studio (DB-GUI) |

---

## Git Workflow

### Feature entwickeln

```bash
# 1. Vom develop-Branch starten
git checkout develop
git pull

# 2. Feature-Branch erstellen
git checkout -b feature/mein-feature

# 3. Entwickeln und committen
git add .
git commit -m "feat: Beschreibung des Features"

# 4. Nach develop mergen
git checkout develop
git merge feature/mein-feature
git push
# → Vercel deployed automatisch auf DEV-Umgebung

# 5. Feature-Branch löschen
git branch -d feature/mein-feature
```

### Von DEV nach TEST deployen

```bash
# Wenn DEV stabil ist:
git checkout main
git merge develop
git push
# → Vercel deployed automatisch auf TEST-Umgebung
```

### Commit-Konventionen

Wir verwenden [Conventional Commits](https://www.conventionalcommits.org/):

| Prefix | Verwendung |
|--------|------------|
| `feat:` | Neues Feature |
| `fix:` | Bugfix |
| `docs:` | Dokumentation |
| `style:` | Formatierung (kein Code-Change) |
| `refactor:` | Code-Refactoring |
| `test:` | Tests hinzufügen/ändern |
| `chore:` | Build, Dependencies, etc. |

---

## Environment-Variablen

### Übersicht

| Variable | Beschreibung | Lokal | DEV/TEST |
|----------|--------------|-------|----------|
| `DATABASE_URL` | Datenbank-Verbindung (Pooled) | Docker | Supabase |
| `DIRECT_URL` | Direkte DB-Verbindung (Migrationen) | Docker | Supabase |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk Public Key | Placeholder | Clerk Dashboard |
| `CLERK_SECRET_KEY` | Clerk Secret Key | Placeholder | Clerk Dashboard |
| `NEXT_PUBLIC_APP_URL` | App-URL | localhost:3000 | Vercel-URL |

### Supabase Connection Strings

Format für Supabase:

```
# Pooled Connection (für App)
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-1-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct Connection (für Migrationen)
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-1-eu-central-1.pooler.supabase.com:5432/postgres"
```

> **Hinweis:** Port 6543 = Pooled (App), Port 5432 = Direct (Migrationen)

---

## Datenbank-Schema ändern

### 1. Schema bearbeiten

Bearbeite `packages/database/prisma/schema.prisma`.

### 2. Lokal testen

```bash
pnpm db:push
```

### 3. Schema nach apps/web kopieren

Da Vercel das Schema aus `apps/web/prisma/` benötigt:

```bash
cp packages/database/prisma/schema.prisma apps/web/prisma/schema.prisma
```

### 4. Committen

```bash
git add .
git commit -m "feat: Datenbank-Schema erweitert"
git push
```

---

## Troubleshooting

### Docker startet nicht

- Prüfe ob Docker Desktop läuft
- Führe `docker compose down` und dann `docker compose up -d` aus

### Port 5432 bereits belegt

Ein anderes PostgreSQL läuft bereits. Stoppe es oder ändere den Port in `docker-compose.yml`.

### Prisma-Fehler nach Schema-Änderung

```bash
pnpm db:push
```

### Vercel-Deployment schlägt fehl

1. Prüfe Build-Logs in Vercel Dashboard
2. Stelle sicher, dass `apps/web/prisma/schema.prisma` aktuell ist
3. Prüfe Environment-Variablen in Vercel Settings

---

## Nützliche Links

- [Next.js Dokumentation](https://nextjs.org/docs)
- [Prisma Dokumentation](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Turborepo](https://turbo.build/repo/docs)
- [Supabase](https://supabase.com/docs)
- [Vercel](https://vercel.com/docs)
- [Lions International Brand Guidelines](./docs/LionsClubsInternationalOrganizationBrandGuidelines_de.pdf)

---

## Kontakt

Bei Fragen wende dich an das Entwicklungsteam.
