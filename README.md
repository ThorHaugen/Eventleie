# Eventleie – Mannskaps- og oppdragsstyring

Backend for å holde styr på hvem som jobber hvor, når, og med hvilket utstyr.
Erstatter den offentlige fritekstlista med en innlogget app der admin styrer alt
og hver ansatt ser kun sine egne vakter.

Bygget med Spring Boot 3 + Spring Data JPA + Spring Security, Java 21.
Kjører på H2 (in-memory) lokalt uten oppsett; bytter til PostgreSQL i produksjon.

## Kjøre lokalt

Du trenger Java 21 installert. Maven trengs ikke – wrapperen (`./mvnw`) laster
ned det den trenger første gang.

```bash
cd eventleie
./mvnw spring-boot:run        # macOS/Linux
mvnw.cmd spring-boot:run      # Windows
```

Appen starter på http://localhost:8080. Testdata fra den ekte juli-lista lastes
inn automatisk.

## Logg inn

Innlogging skjer med HTTP Basic (brukernavn + passord). Alle testbrukere har
passord `passord`.

| Brukernavn  | Navn              | Rolle  |
|-------------|-------------------|--------|
| `samuel`    | Samuel Løvland    | ADMIN  |
| `magne`     | Magne Wallin      | ANSATT |
| `adrianf`   | Adrian Fearnley   | ANSATT |
| `nathaniel` | Nathaniel Singstad| ANSATT |
| `johannes`  | Johannes Kjønndal | ANSATT |

## Prøv API-et

Hent alle oppdrag som admin:

```bash
curl -u samuel:passord http://localhost:8080/api/oppdrag
```

Hent Magnes egne vakter (ANSATT ser kun sine):

```bash
curl -u magne:passord http://localhost:8080/api/mine-oppdrag
```

Prøv å nå admin-endepunktet som ansatt – dette skal gi 403 Forbidden,
som beviser at rollesperren virker:

```bash
curl -u magne:passord http://localhost:8080/api/oppdrag
```

Magne bekrefter en vakt:

```bash
curl -u magne:passord -X POST http://localhost:8080/api/mine-oppdrag/{oppdragId}/bekreft
```

## Endepunkter

ADMIN (krever rolle ADMIN):
- `GET    /api/oppdrag`        – alle oppdrag, sortert på dato
- `GET    /api/oppdrag/{id}`   – ett oppdrag
- `POST   /api/oppdrag`        – opprett oppdrag
- `PUT    /api/oppdrag/{id}`   – endre oppdrag (kunde, tid, mannskap, bil, mal)
- `DELETE /api/oppdrag/{id}`   – slett oppdrag

ANSATT (krever innlogging):
- `GET  /api/mine-oppdrag`                  – kun innlogget ansatt sine vakter
- `POST /api/mine-oppdrag/{id}/bekreft`     – bekreft oppmøte
- `POST /api/mine-oppdrag/{id}/fravaer`     – meld fravær

## Databasekonsoll

H2-konsollet ligger på http://localhost:8080/h2-console
(JDBC URL: `jdbc:h2:mem:mannskap`, bruker `sa`, tomt passord).

## Bytte til PostgreSQL for produksjon

I `application.properties`: kommenter ut H2-blokka, kommenter inn produksjonsblokka,
og sett miljøvariablene `DATABASE_URL`, `DATABASE_USER`, `DATABASE_PASSWORD`
(f.eks. fra Render eller Supabase).

## Hva som gjenstår

Dette er backend-grunnmuren. Neste steg:
- React-frontend (admin-dashboard + ansatt-mobilvisning – se den klikkbare demoen)
- Token-basert innlogging (JWT) i stedet for HTTP Basic
- Flere kjøretøy per oppdrag (i dag støttes ett primærkjøretøy + notat)
- Dobbeltbookings-sjekk på kjøretøy
- SMS-varsel når en ansatt blir satt opp (Twilio – som i Værket-systemet)
