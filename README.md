# Eventleie – Mannskaps- og oppdragsstyring

Et internt system for Eventleie AS som erstatter en offentlig fritekstliste med en sikker, innlogget webapplikasjon. Ansatte logger inn og ser sine egne vakter, mens admin styrer oppdrag og mannskap.

**Live:** [eventleie.vercel.app](https://eventleie.vercel.app)

---

## Funksjonalitet

- Admin oppretter og administrerer oppdrag med dato, tid, adresse og maks antall mannskap
- Ansatte melder seg på ledige vakter eller blir satt opp av admin
- Rød varselindikator når en ansatt blir tildelt en vakt av admin
- Fravær krever begrunnelse
- Persistent innlogging (2 dager)
- Rollebasert tilgangskontroll: Sjef → Utvikler → Admin → Ansatt
- Passordbytte og brukernavn-endring via profilmeny

## Teknologi

| Lag | Teknologi |
|-----|-----------|
| Backend | Spring Boot 3, Spring Security, Spring Data JPA, Java 21 |
| Frontend | React + Vite |
| Database | PostgreSQL (produksjon) / H2 (lokalt) |
| Hosting | Railway (backend) + Vercel (frontend) |
| Auth | HTTP Basic med BCrypt-krypterte passord |

## Kjøre lokalt

Du trenger Java 21. Maven-wrapperen laster ned det den trenger automatisk.

```bash
cd eventleie
./mvnw spring-boot:run        # macOS/Linux
mvnw.cmd spring-boot:run      # Windows
```

Backend starter på `http://localhost:8080`. Testdata lastes inn automatisk.

Frontend:

```bash
cd eventleie-frontend/eventleie-frontend
npm install
npm run dev
```

Frontend starter på `http://localhost:5173`.

## Testbrukere

Alle testbrukere har passord `passord`.

| Brukernavn  | Navn               | Rolle    |
|-------------|--------------------|----------|
| `samuel`    | Samuel Løvland     | Sjef     |
| `thor`      | Thor Haugen        | Utvikler |
| `magne`     | Magne Wallin       | Ansatt   |
| `adrianf`   | Adrian Fearnley    | Ansatt   |
| `nathaniel` | Nathaniel Singstad | Ansatt   |
| `johannes`  | Johannes Kjønndal  | Ansatt   |

## Struktur

```
eventleie-backend/eventleie/   ← Spring Boot-prosjekt (git-rot)
├── src/main/java/no/eventleie/mannskap/
│   ├── controller/            ← REST-endepunkter
│   ├── model/                 ← JPA-entiteter
│   ├── repository/            ← Spring Data-interfaces
│   ├── dto/                   ← Dataoverføringsobjekter
│   └── config/                ← Security, CORS, DataSeeder
└── frontend/                  ← React-frontend (kopiert hit ved deploy)
```
