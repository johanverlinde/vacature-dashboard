# Deployment instructies voor het Vacature Dashboard

Dit document bevat instructies voor het deployen van het Vacature Dashboard.

## Vereisten

- Node.js 16+ en npm/pnpm
- MongoDB database
- Toegang tot een server of cloud platform

## Stappen voor deployment op Vercel (aanbevolen)

### 1. Voorbereiden van je project

Zorg ervoor dat je project op GitHub staat:
1. Maak een repository aan op GitHub
2. Push je code naar de repository

### 2. Vercel setup

1. Maak een account aan op [Vercel](https://vercel.com)
2. Klik op "New Project"
3. Importeer je GitHub repository
4. Vercel detecteert automatisch dat het een React app is
5. Configureer de volgende instellingen:
   - Build Command: `npm run build` of `pnpm run build`
   - Output Directory: `build`
   - Install Command: `npm install` of `pnpm install`

### 3. Omgevingsvariabelen instellen

Voeg de volgende omgevingsvariabelen toe in het Vercel dashboard:
```
MONGODB_URI=mongodb+srv://gebruikersnaam:wachtwoord@cluster.mongodb.net/vacature-dashboard
API_KEY=jouw_geheime_api_sleutel
```

### 4. Deploy

Klik op "Deploy" en wacht tot het deployment proces is voltooid. Je krijgt een URL waar je website beschikbaar is.

## MongoDB Atlas setup

Voor de database raden we MongoDB Atlas aan:

1. Maak een account aan op [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Creëer een nieuw cluster (de gratis tier is voldoende)
3. Maak een database gebruiker aan
4. Whitelist je IP adres of sta toegang toe van overal (0.0.0.0/0)
5. Verkrijg je MongoDB connection string en gebruik deze in je omgevingsvariabelen

## Alternatieve deployment opties

### Netlify

Vergelijkbaar met Vercel:
1. Maak een account aan op [Netlify](https://www.netlify.com)
2. Importeer je GitHub repository
3. Configureer build settings vergelijkbaar met Vercel
4. Voeg dezelfde omgevingsvariabelen toe

### Heroku

1. Maak een account aan op [Heroku](https://www.heroku.com)
2. Installeer de Heroku CLI
3. Login via de CLI: `heroku login`
4. Creëer een nieuwe app: `heroku create vacature-dashboard`
5. Push je code: `git push heroku main`
6. Voeg de omgevingsvariabelen toe via het dashboard of CLI

### DigitalOcean App Platform

1. Maak een account aan op [DigitalOcean](https://www.digitalocean.com)
2. Ga naar App Platform
3. Creëer een nieuwe app en verbind je GitHub repository
4. Configureer de build settings
5. Voeg de omgevingsvariabelen toe

## Dagelijkse updates

Voor dagelijkse updates heb je een server nodig die 24/7 draait. Bij gebruik van Vercel of Netlify kun je:

1. Een aparte server opzetten voor alleen de scraper en updater
2. Gebruik maken van serverless functies met een cron trigger
3. Gebruik maken van services zoals GitHub Actions of IFTTT voor dagelijkse triggers

## Monitoring

Controleer regelmatig de logs in je deployment platform voor eventuele fouten.

## Backup

Maak regelmatig backups van de MongoDB database via MongoDB Atlas.
