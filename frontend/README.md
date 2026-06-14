# Eventleie – Frontend

React-frontend (Vite) for mannskaps- og oppdragssystemet. Kobler seg til
Spring Boot-backend-en via REST.

## Kjore lokalt

Du trenger Node.js installert. Backend ma kjore samtidig (pa port 8080).

    cd eventleie-frontend
    npm install
    npm run dev

Frontend starter pa http://localhost:5173. Apne den i nettleseren.

## Logg inn

Samme brukere som i backend (passord: passord):

- samuel -> admin-dashboard (ser og redigerer alle oppdrag)
- magne  -> ansatt-visning (ser kun egne vakter)

Appen finner selv ut om du er admin eller ansatt ved innlogging.

## Koble til en annen backend

API-adressen styres av VITE_API_URL i .env. Lokalt peker den pa
http://localhost:8080. Nar backend er deployet til Render, endrer du den til
backend-ens nettadresse, f.eks. https://eventleie-backend.onrender.com

## Bygge for produksjon

    npm run build

Lager en dist-mappe med statiske filer klar for deploy.

## Hva som gjenstar

- Velge mannskap (avkrysning) direkte i editoren
- Velge kjoretoy og logistikk-mal fra nedtrekksliste
- Vise hvem andre som er pa samme oppdrag i ansatt-visningen
- CORS-oppsett i backend nar frontend og backend kjorer pa ulike domener
