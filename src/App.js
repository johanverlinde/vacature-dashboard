import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  // State voor vacatures en filters
  const [vacatures, setVacatures] = useState([
    {
      id: 1,
      titel: "Senior HR Manager",
      bedrijf: "Rotterdam Bedrijf BV",
      locatie: "Rotterdam Centrum",
      publicatieDatum: "2025-03-21",
      beschrijving: "Wij zoeken een ervaren HR Manager met minimaal 5 jaar ervaring.",
      categorie: "HR",
      bron: "Indeed",
      url: "#",
      coordinaten: { lat: 51.9225, lng: 4.47917 },
      afstandTotCentrum: 0
    },
    {
      id: 2,
      titel: "Communicatie Specialist",
      bedrijf: "Media Group",
      locatie: "Rotterdam Zuid",
      publicatieDatum: "2025-03-21",
      beschrijving: "Voor onze afdeling communicatie zoeken wij een specialist met ruime ervaring.",
      categorie: "Communicatie",
      bron: "LinkedIn",
      url: "#",
      coordinaten: { lat: 51.9000, lng: 4.4800 },
      afstandTotCentrum: 2.5
    },
    {
      id: 3,
      titel: "Recruitment Marketeer",
      bedrijf: "Talent Hunters",
      locatie: "Schiedam",
      publicatieDatum: "2025-03-21",
      beschrijving: "Wij zoeken een Recruitment Marketeer die onze werving kan versterken.",
      categorie: "Recruitment Marketing",
      bron: "Indeed",
      url: "#",
      coordinaten: { lat: 51.9184, lng: 4.3990 },
      afstandTotCentrum: 6.8
    }
  ]);
  
  const [filteredVacatures, setFilteredVacatures] = useState([]);
  const [filters, setFilters] = useState({
    categorie: 'alle',
    zoekterm: '',
    bedrijf: '',
    radius: 30
  });
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Pas filters toe wanneer ze veranderen
  useEffect(() => {
    applyFilters();
  }, [vacatures, filters]);

  // Functie om filters toe te passen
  const applyFilters = () => {
    let filtered = [...vacatures];
    
    // Filter op categorie
    if (filters.categorie !== 'alle') {
      filtered = filtered.filter(vacature => vacature.categorie === filters.categorie);
    }
    
    // Filter op zoekterm (in titel en beschrijving)
    if (filters.zoekterm) {
      const searchTerm = filters.zoekterm.toLowerCase();
      filtered = filtered.filter(vacature => 
        vacature.titel.toLowerCase().includes(searchTerm) || 
        (vacature.beschrijving && vacature.beschrijving.toLowerCase().includes(searchTerm))
      );
    }
    
    // Filter op bedrijf
    if (filters.bedrijf) {
      const companyTerm = filters.bedrijf.toLowerCase();
      filtered = filtered.filter(vacature => 
        vacature.bedrijf.toLowerCase().includes(companyTerm)
      );
    }
    
    // Filter op afstand tot Rotterdam centrum
    filtered = filtered.filter(vacature => 
      vacature.afstandTotCentrum <= filters.radius
    );
    
    setFilteredVacatures(filtered);
  };

  // Handler voor filter wijzigingen
  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
  };

  // Functie om handmatig vacatures te verversen
  const handleRefresh = () => {
    // In een echte implementatie zou dit een API call zijn
    setLastUpdated(new Date());
  };

  // Functie om de datum te formatteren
  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('nl-NL', options);
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Vacature Dashboard Rotterdam</h1>
        <div className="dashboard-meta">
          <p className="last-updated">
            Laatste update: {lastUpdated.toLocaleString('nl-NL')}
          </p>
          <button 
            className="refresh-button"
            onClick={handleRefresh}
          >
            Vernieuwen
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        <aside className="dashboard-sidebar">
          <div className="filter-panel">
            <div className="filter-panel-header">
              <h2>Filters</h2>
              <button 
                className="reset-filters-button"
                onClick={() => handleFilterChange({
                  categorie: 'alle',
                  zoekterm: '',
                  bedrijf: '',
                  radius: 30
                })}
              >
                Reset
              </button>
            </div>

            <div className="filter-section">
              <label htmlFor="search" className="filter-label">Zoeken</label>
              <input
                type="text"
                id="search"
                className="filter-input"
                placeholder="Zoek in vacaturetitels..."
                value={filters.zoekterm}
                onChange={(e) => handleFilterChange({ zoekterm: e.target.value })}
              />
            </div>

            <div className="filter-section">
              <label htmlFor="category" className="filter-label">Categorie</label>
              <select
                id="category"
                className="filter-select"
                value={filters.categorie}
                onChange={(e) => handleFilterChange({ categorie: e.target.value })}
              >
                <option value="alle">Alle categorieën</option>
                <option value="HR">HR</option>
                <option value="Communicatie">Communicatie</option>
                <option value="Recruitment Marketing">Recruitment Marketing</option>
              </select>
            </div>

            <div className="filter-section">
              <label htmlFor="company" className="filter-label">Bedrijf</label>
              <input
                type="text"
                id="company"
                className="filter-input"
                placeholder="Filteren op bedrijfsnaam..."
                value={filters.bedrijf}
                onChange={(e) => handleFilterChange({ bedrijf: e.target.value })}
              />
            </div>

            <div className="filter-section">
              <label htmlFor="radius" className="filter-label">
                Afstand tot Rotterdam centrum: {filters.radius} km
              </label>
              <input
                type="range"
                id="radius"
                className="filter-range"
                min="5"
                max="30"
                step="5"
                value={filters.radius}
                onChange={(e) => handleFilterChange({ radius: parseInt(e.target.value) })}
              />
              <div className="range-labels">
                <span>5 km</span>
                <span>30 km</span>
              </div>
            </div>

            <div className="filter-info">
              <p>
                Alle vacatures tonen functies in HR, Communicatie en Recruitment Marketing 
                met minimaal 5 jaar werkervaring.
              </p>
            </div>
          </div>
        </aside>
        
        <main className="dashboard-main">
          <div className="map-container">
            <div id="map"></div>
          </div>
          
          <div className="list-container">
            <div className="vacature-list">
              <div className="vacature-list-header">
                <h2>Gevonden vacatures ({filteredVacatures.length})</h2>
              </div>
              
              <div className="vacature-list-content">
                {filteredVacatures.length === 0 ? (
                  <div className="vacature-list-empty">
                    <p>Geen vacatures gevonden die aan de criteria voldoen.</p>
                    <p>Probeer andere filters of zoektermen.</p>
                  </div>
                ) : (
                  filteredVacatures.map((vacature) => (
                    <div key={vacature.id} className="vacature-card">
                      <div className="vacature-card-header">
                        <h3 className="vacature-title">{vacature.titel}</h3>
                        <span className="vacature-date">{formatDate(vacature.publicatieDatum)}</span>
                      </div>
                      
                      <div className="vacature-card-company">
                        <span className="vacature-company">{vacature.bedrijf}</span>
                        <span className="vacature-location">{vacature.locatie}</span>
                        <span className="vacature-distance">{vacature.afstandTotCentrum} km</span>
                      </div>
                      
                      {vacature.beschrijving && (
                        <p className="vacature-description">{vacature.beschrijving}</p>
                      )}
                      
                      <div className="vacature-card-footer">
                        <span className={`vacature-category category-${vacature.categorie.toLowerCase().replace(' ', '-')}`}>
                          {vacature.categorie}
                        </span>
                        <span className="vacature-source">{vacature.bron}</span>
                        <a 
                          href={vacature.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="vacature-link"
                        >
                          Bekijk vacature
                        </a>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
