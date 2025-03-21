const express = require('express');
const cors = require('cors');
const { scrapeAllVacatures } = require('./scrapers/mainScraper');

// Initialiseer Express app
const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory opslag voor vacatures
let cachedVacatures = [];
let lastUpdated = null;

// API endpoint voor het ophalen van alle vacatures
app.get('/api/vacatures', async (req, res) => {
  try {
    // Stuur gecachte vacatures als ze beschikbaar zijn
    if (cachedVacatures.length > 0) {
      return res.json({
        success: true,
        data: {
          vacatures: cachedVacatures,
          lastUpdated
        }
      });
    }
    
    // Anders, haal nieuwe vacatures op
    const vacatures = await scrapeAllVacatures();
    
    // Update de cache
    cachedVacatures = vacatures;
    lastUpdated = new Date().toISOString();
    
    res.json({
      success: true,
      data: {
        vacatures,
        lastUpdated
      }
    });
  } catch (error) {
    console.error('Fout bij het ophalen van vacatures:', error);
    res.status(500).json({
      success: false,
      error: 'Er is een fout opgetreden bij het ophalen van vacatures'
    });
  }
});

// API endpoint voor het handmatig vernieuwen van vacatures
app.post('/api/refresh', async (req, res) => {
  try {
    console.log('Handmatig vernieuwen van vacatures gestart...');
    
    // Haal nieuwe vacatures op
    const vacatures = await scrapeAllVacatures();
    
    // Update de cache
    cachedVacatures = vacatures;
    lastUpdated = new Date().toISOString();
    
    res.json({
      success: true,
      message: 'Vacatures succesvol vernieuwd',
      data: {
        count: vacatures.length,
        lastUpdated
      }
    });
  } catch (error) {
    console.error('Fout bij het vernieuwen van vacatures:', error);
    res.status(500).json({
      success: false,
      error: 'Er is een fout opgetreden bij het vernieuwen van vacatures'
    });
  }
});

// Statische bestanden serveren vanuit de build directory
app.use(express.static('build'));

// Alle overige routes naar index.html sturen (voor client-side routing)
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../build', 'index.html'));
});

// Start de server
app.listen(port, () => {
  console.log(`Server draait op poort ${port}`);
  
  // Initiële scraping bij opstarten
  console.log('Initiële scraping starten...');
  scrapeAllVacatures()
    .then(vacatures => {
      cachedVacatures = vacatures;
      lastUpdated = new Date().toISOString();
      console.log(`Initiële scraping voltooid. ${vacatures.length} vacatures opgehaald.`);
    })
    .catch(error => {
      console.error('Fout bij initiële scraping:', error);
    });
});

module.exports = app;
