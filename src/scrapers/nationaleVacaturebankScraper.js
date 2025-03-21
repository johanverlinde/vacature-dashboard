const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Scraper voor Nationale Vacaturebank
 * Zoekt naar HR, Communicatie en recruitment marketing vacatures in Rotterdam
 * met minimaal 5 jaar werkervaring
 */
async function scrapeNationaleVacaturebank() {
  try {
    console.log('Starten met scrapen van Nationale Vacaturebank...');
    
    // Zoektermen voor verschillende categorieën
    const searchQueries = [
      { term: 'HR', query: 'HR+5+jaar+ervaring' },
      { term: 'Communicatie', query: 'Communicatie+5+jaar+ervaring' },
      { term: 'Recruitment Marketing', query: 'Recruitment+Marketing+5+jaar+ervaring' }
    ];
    
    // Locatie: Rotterdam, radius 30km
    const location = 'Rotterdam';
    const radius = 30;
    
    let allJobs = [];
    
    // Loop door alle zoektermen
    for (const searchItem of searchQueries) {
      const { term, query } = searchItem;
      
      // Bouw de URL voor Nationale Vacaturebank
      const url = `https://www.nationalevacaturebank.nl/vacature/zoeken?query=${query}&location=${location}&distance=${radius}&sort=relevance`;
      console.log(`Scraping Nationale Vacaturebank URL: ${url}`);
      
      // Haal de HTML op
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      // Laad de HTML in Cheerio
      const $ = cheerio.load(response.data);
      
      // Selecteer alle vacature elementen
      const jobElements = $('.vacature-item');
      
      console.log(`Gevonden: ${jobElements.length} vacatures voor ${term}`);
      
      // Loop door alle vacature elementen
      jobElements.each((index, element) => {
        // Haal de benodigde informatie op
        const title = $(element).find('.vacature-title').text().trim();
        const company = $(element).find('.company-name').text().trim();
        const location = $(element).find('.location').text().trim();
        const snippet = $(element).find('.description').text().trim();
        const datePosted = $(element).find('.date').text().trim() || new Date().toLocaleDateString('nl-NL');
        const url = 'https://www.nationalevacaturebank.nl' + $(element).find('a.job-title').attr('href');
        
        // Controleer of de vacature minimaal 5 jaar ervaring vereist
        const experienceMatch = snippet.match(/(\d+)\s+jaar\s+ervaring/i);
        const hasRequiredExperience = experienceMatch && parseInt(experienceMatch[1]) >= 5;
        
        // Als er geen expliciete vermelding is van ervaring, nemen we aan dat het voldoet
        // omdat we al op "5 jaar ervaring" zoeken in de query
        if (hasRequiredExperience || !experienceMatch) {
          // Bereken afstand tot Rotterdam centrum (dit is een benadering)
          // In een echte implementatie zou je geocoding gebruiken
          let distance = 0;
          if (location.includes('km')) {
            const distanceMatch = location.match(/(\d+(\.\d+)?)\s*km/);
            distance = distanceMatch ? parseFloat(distanceMatch[1]) : 0;
          } else if (!location.toLowerCase().includes('rotterdam')) {
            // Als het niet in Rotterdam is en geen km vermelding heeft, schat dan 15km
            distance = 15;
          }
          
          // Voeg de vacature toe aan de lijst
          allJobs.push({
            title,
            company,
            location,
            description: snippet,
            datePosted,
            url,
            category: term,
            source: 'Nationale Vacaturebank',
            distanceToCenter: distance
          });
        }
      });
    }
    
    console.log(`Totaal aantal gevonden vacatures op Nationale Vacaturebank: ${allJobs.length}`);
    return allJobs;
  } catch (error) {
    console.error('Fout bij het scrapen van Nationale Vacaturebank:', error);
    return [];
  }
}

module.exports = { scrapeNationaleVacaturebank };
