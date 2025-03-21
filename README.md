# Vacature Dashboard Rotterdam

Een dashboard dat dagelijks de nieuwste vacatures toont in de regio Rotterdam (binnen 30km van het stadscentrum), specifiek voor functies in HR, Communicatie en recruitment marketing met minimaal 5 jaar werkervaring.

## Functionaliteiten

- **Dagelijkse updates**: Het dashboard wordt elke dag automatisch bijgewerkt met de nieuwste vacatures.
- **Vacaturelijst**: Overzichtelijke lijst met alle relevante vacatures.
- **Kaartvisualisatie**: Interactieve kaart die de locaties van de bedrijven weergeeft.
- **Filtering**: Filter vacatures op categorie, bedrijf, zoekterm en afstand tot Rotterdam centrum.
- **Meertalig**: Volledig in het Nederlands voor de Nederlandse arbeidsmarkt.

## Technische details

### Frontend
- React applicatie met Tailwind CSS voor styling
- Leaflet voor interactieve kaartvisualisatie
- Responsive design voor desktop en mobiel gebruik

### Backend
- Node.js server met Express
- MongoDB database voor opslag van vacatures
- Cron jobs voor dagelijkse automatische updates
- API endpoints voor vacaturegegevens

### Scraping
- Scraping van Indeed en LinkedIn voor vacatures
- Filters voor HR, Communicatie en recruitment marketing functies
- Filter voor minimaal 5 jaar werkervaring
- Filter voor 30km radius rond Rotterdam centrum

## Installatie

Zie [DEPLOYMENT.md](DEPLOYMENT.md) voor gedetailleerde installatie- en deployment-instructies.

## Gebruik

1. Open de website in een browser
2. Bekijk de vacatures in de lijst of op de kaart
3. Gebruik de filters om specifieke vacatures te vinden
4. Klik op een vacature voor meer details en een link naar de originele vacature

## Ontwikkeling

### Vereisten
- Node.js 16+
- MongoDB
- pnpm package manager

### Lokale ontwikkeling
```bash
# Installeer dependencies
pnpm install

# Start de ontwikkelserver
pnpm run dev

# Bouw voor productie
pnpm run build
```

### Testen
```bash
# Voer tests uit
node test.js
```

## Projectstructuur

```
vacature-dashboard/
├── src/
│   ├── components/        # React componenten
│   ├── database/          # Database modellen en services
│   ├── scrapers/          # Scraping scripts
│   ├── updater/           # Update mechanisme
│   └── server.js          # Express server
├── public/                # Statische bestanden
├── build/                 # Gebouwde applicatie (na build)
├── test.js                # Test script
├── DEPLOYMENT.md          # Deployment instructies
└── README.md              # Dit bestand
```

## Licentie

Dit project is ontwikkeld voor persoonlijk gebruik en is niet bedoeld voor commerciële doeleinden.

## Contact

Voor vragen of ondersteuning, neem contact op met de ontwikkelaar.
