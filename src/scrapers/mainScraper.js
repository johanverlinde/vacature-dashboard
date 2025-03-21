const { scrapeIndeed } = require('./indeedScraper');
const { scrapeLinkedIn } = require('./linkedinScraper');
const { scrapeNationaleVacaturebank } = require('./nationaleVacaturebankScraper');

/**
 * Hoofdscraper die alle vacatures van verschillende bronnen verzamelt
 * Zoekt naar HR, Communicatie en recruitment marketing vacatures in Rotterdam
 * met minimaal 5 jaar werkervaring binnen 30km van het stadscentrum
 */
async function scrapeAllVacatures() {
  try {
    console.log('Start verzamelen van vacatures van alle bronnen...');
    
    // Verzamel vacatures van alle bronnen parallel
    const [indeedJobs, linkedinJobs, nationaleVacaturebankJobs] = await Promise.all([
      scrapeIndeed(),
      scrapeLinkedIn(),
      scrapeNationaleVacaturebank()
    ]);
    
    // Combineer alle vacatures
    const allJobs = [
      ...indeedJobs,
      ...linkedinJobs,
      ...nationaleVacaturebankJobs
    ];
    
    // Voeg unieke ID's toe aan alle vacatures
    const jobsWithIds = allJobs.map((job, index) => ({
      id: `job-${index + 1}`,
      ...job,
      // Zorg ervoor dat de datum consistent is
      publicatieDatum: job.datePosted || new Date().toISOString().split('T')[0],
      // Zorg ervoor dat alle velden aanwezig zijn
      afstandTotCentrum: job.distanceToCenter || 0
    }));
    
    console.log(`Totaal aantal verzamelde vacatures: ${jobsWithIds.length}`);
    
    // Filter duplicaten op basis van titel en bedrijf
    const uniqueJobs = removeDuplicates(jobsWithIds);
    console.log(`Aantal unieke vacatures na verwijderen duplicaten: ${uniqueJobs.length}`);
    
    return uniqueJobs;
  } catch (error) {
    console.error('Fout bij het verzamelen van vacatures:', error);
    return [];
  }
}

/**
 * Verwijdert duplicaten uit de lijst met vacatures
 * @param {Array} jobs - Lijst met vacatures
 * @returns {Array} - Lijst met unieke vacatures
 */
function removeDuplicates(jobs) {
  const uniqueMap = new Map();
  
  jobs.forEach(job => {
    // Maak een unieke sleutel op basis van titel en bedrijf
    const key = `${job.title.toLowerCase()}-${job.company.toLowerCase()}`;
    
    // Als deze combinatie nog niet bestaat of als de huidige vacature meer informatie heeft
    if (!uniqueMap.has(key) || job.description.length > uniqueMap.get(key).description.length) {
      uniqueMap.set(key, job);
    }
  });
  
  // Converteer de Map terug naar een array
  return Array.from(uniqueMap.values());
}

module.exports = { scrapeAllVacatures };
