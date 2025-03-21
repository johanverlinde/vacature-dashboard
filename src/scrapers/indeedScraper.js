const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Scraper voor Indeed vacatures
 * Zoekt naar HR, Communicatie en recruitment marketing vacatures in Rotterdam
 * met minimaal 5 jaar werkervaring
 */
async function scrapeIndeed() {
  try {
    console.log('Starten met scrapen van Indeed...');
    
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
      
      // Bouw de URL voor Indeed
      const url = `https://nl.indeed.com/jobs?q=${query}&l=${location}&radius=${radius}`;
      console.log(`Scraping Indeed URL: ${url}`);
      
      // Haal de HTML op
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      // Laad de HTML in Cheerio
      const $ = cheerio.load(response.data);
      
      // Selecteer alle vacature elementen
      const jobElements = $('.job_seen_beacon');
      
      console.log(`Gevonden: ${jobElements.length} vacatures voor ${term}`);
      
      // Loop door alle vacature elementen
      jobElements.each((index, element) => {
        // Haal de benodigde informatie op
        const title = $(element).find('.jobTitle span').text().trim();
        const company = $(element).find('.companyName').text().trim();
        const location = $(element).find('.companyLocation').text().trim();
        const snippet = $(element).find('.job-snippet').text().trim();
        const datePosted = $(element).find('.date').text().trim();
        const url = 'https://nl.indeed.com' + $(element).find('.jobTitle a').attr('href');
        
        // Controleer of de vacature minimaal 5 jaar ervaring vereist
        const experienceMatch = snippet.match(/(\d+)\s+jaar\s+ervaring/i);
        const hasRequiredExperience = experienceMatch && parseInt(experienceMatch[1]) >= 5;
        
        // Alleen vacatures met minimaal 5 jaar ervaring toevoegen
        if (hasRequiredExperience) {
          // Bereken afstand tot Rotterdam centrum (dit is een benadering)
          // In een echte implementatie zou je geocoding gebruiken
          const distanceMatch = location.match(/(\d+(\.\d+)?)\s*km/);
          const distance = distanceMatch ? parseFloat(distanceMatch[1]) : 0;
          
          // Voeg de vacature toe aan de lijst
          allJobs.push({
            title,
            company,
            location,
            description: snippet,
            datePosted,
            url,
            category: term,
            source: 'Indeed',
            distanceToCenter: distance
          });
        }
      });
    }
    
    console.log(`Totaal aantal gevonden vacatures op Indeed: ${allJobs.length}`);
    return allJobs;
  } catch (error) {
    console.error('Fout bij het scrapen van Indeed:', error);
    return [];
  }
}

module.exports = { scrapeIndeed };
