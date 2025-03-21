const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Scraper voor LinkedIn vacatures
 * Zoekt naar HR, Communicatie en recruitment marketing vacatures in Rotterdam
 * met minimaal 5 jaar werkervaring
 */
async function scrapeLinkedIn() {
  try {
    console.log('Starten met scrapen van LinkedIn...');
    
    // Zoektermen voor verschillende categorieën
    const searchQueries = [
      { term: 'HR', query: 'HR+5+jaar+ervaring' },
      { term: 'Communicatie', query: 'Communicatie+5+jaar+ervaring' },
      { term: 'Recruitment Marketing', query: 'Recruitment+Marketing+5+jaar+ervaring' }
    ];
    
    // Locatie: Rotterdam
    const location = 'Rotterdam';
    
    let allJobs = [];
    
    // Loop door alle zoektermen
    for (const searchItem of searchQueries) {
      const { term, query } = searchItem;
      
      // Bouw de URL voor LinkedIn
      const url = `https://nl.linkedin.com/jobs/search?keywords=${query}&location=${location}&f_TPR=&f_E=2%2C3%2C4&geoId=102890719&distance=30`;
      console.log(`Scraping LinkedIn URL: ${url}`);
      
      // Haal de HTML op
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      // Laad de HTML in Cheerio
      const $ = cheerio.load(response.data);
      
      // Selecteer alle vacature elementen
      const jobElements = $('.job-search-card');
      
      console.log(`Gevonden: ${jobElements.length} vacatures voor ${term}`);
      
      // Loop door alle vacature elementen
      jobElements.each((index, element) => {
        // Haal de benodigde informatie op
        const title = $(element).find('.job-search-card__title').text().trim();
        const company = $(element).find('.job-search-card__company-name').text().trim();
        const location = $(element).find('.job-search-card__location').text().trim();
        const datePosted = $(element).find('.job-search-card__listdate').text().trim();
        const url = $(element).find('.job-search-card__link').attr('href');
        
        // Bereken afstand tot Rotterdam centrum (dit is een benadering)
        // In een echte implementatie zou je geocoding gebruiken
        let distance = 0;
        if (location.includes('km')) {
          const distanceMatch = location.match(/(\d+(\.\d+)?)\s*km/);
          distance = distanceMatch ? parseFloat(distanceMatch[1]) : 0;
        } else if (!location.includes('Rotterdam')) {
          // Als het niet in Rotterdam is en geen km vermelding heeft, schat dan 10km
          distance = 10;
        }
        
        // Voeg de vacature toe aan de lijst
        allJobs.push({
          title,
          company,
          location,
          description: `Vacature voor ${title} bij ${company} in ${location}. Minimaal 5 jaar ervaring vereist.`,
          datePosted,
          url,
          category: term,
          source: 'LinkedIn',
          distanceToCenter: distance
        });
      });
    }
    
    console.log(`Totaal aantal gevonden vacatures op LinkedIn: ${allJobs.length}`);
    return allJobs;
  } catch (error) {
    console.error('Fout bij het scrapen van LinkedIn:', error);
    return [];
  }
}

module.exports = { scrapeLinkedIn };
