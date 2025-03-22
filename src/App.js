import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// API URL - dit wordt bijgewerkt naar de gedeployde backend URL
const API_URL = 'https://vacature-backend.vercel.app/api';

function App() {
  // State voor vacatures en filters
  const [vacatures, setVacatures] = useState([]);
  const [filteredVacatures, setFilteredVacatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    categorie: 'alle',
    zoekterm: '',
    bedrijf: '',
    radius: 30
  });
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Haal vacatures op bij het laden van de pagina
  useEffect(() => {
    fetchVacatures();
  }, []);

  // Pas filters toe wanneer ze veranderen of wanneer vacatures veranderen
  useEffect(() => {
    applyFilters();
  }, [vacatures, filters]);

  // Functie om vacatures op te halen van de API
  const fetchVacatures = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${API_URL}/vacatures`);
      
      if (response.data.success) {
        setVacatures(response.data.data.vacatures);
        setLastUpdated(new Date(response.data.data.lastUpdated));
      } else {
        setError('Er is een fout opgetreden bij het ophalen van vacatures.');
      }
    } catch (err) {
      console.error('Fout bij het ophalen van vacatures:', err);
      setError('Er is een fout opgetreden bij het ophalen van vacatures. Probeer het later opnieuw.');
    } finally {
      setLoading(false);
    }
  };

  // Functie om vacatures handmatig te verversen
  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setError(null);
      
      const response = await axios.post(`${API_URL}/refresh`);
      
      if (response.data.success) {
        // Haal de nieuwe vacatures op
        await fetchVacatures();
      } else {
        setError('Er is een fout opgetreden bij het vernieuwen van vacatures.');
      }
    } catch (err) {
      console.error('Fout bij het vernieuwen van vacatures:', err);
      setError('Er is een fout opgetreden bij het vernieuwen van vacatures. Probeer het later opnieuw.');
    } finally {
      setRefreshing(false);
    }
  };

  // Functie om filters toe te passen
  const applyFilters = () => {
    let filtered = [...vacatures];
    
    // Filter op categorie
    if (filters.categorie !== 'alle') {
      filtered = filtered.filter(vacature => vacature.category === filters.categorie);
    }
    
    // Filter op zoekterm (in titel en beschrijving)
    if (filters.zoekterm) {
      const searchTerm = filters.zoekterm.toLowerCase();
      filtered = filtered.filter(vacature => 
        vacature.title.toLowerCase().includes(searchTerm) || 
        (vacature.description && vacature.description.toLowerCase().includes(searchTerm))
      );
    }
    
    // Filter op bedrijf
    if (filters.bedrijf) {
      const companyTerm = filters.bedrijf.toLowerCase();
      filtered = filtered.filter(vacature => 
        vacature.company.toLowerCase().includes(companyTerm)
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

  // Functie om de datum te formatteren
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('nl-NL', options);
  };

  // Functie om de kaart te initialiseren
  useEffect(() => {
    if (typeof window !== 'undefined' && window.L && filteredVacatures.length > 0) {
      // Verwijder bestaande kaart als die er is
      const mapContainer = document.getElementById('map');
      if (mapContainer && mapContainer._leaflet_id) {
        mapContainer._leaflet_id = null;
      }
      
      // Initialiseer de kaart
      const map = window.L.map('map').setView([51.9225, 4.47917], 11);
      
      // Voeg de OpenStreetMap tile layer toe
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18
      }).addTo(map);
      
      // Voeg een cirkel toe die de 30km radius rond Rotterdam centrum weergeeft
      window.L.circle([51.9225, 4.47917], {
        color: '#2563eb',
        fillColor: '#2563eb',
        fillOpacity: 0.1,
        radius: filters.radius * 1000 // km naar meters
      }).addTo(map);
      
      // Functie om markerkleur te bepalen op basis van categorie
      function getMarkerColorByCategory(category) {
        switch (category) {
          case 'HR':
            return 'blue';
          case 'Communicatie':
            return 'green';
          case 'Recruitment Marketing':
            return 'orange';
          default:
            return 'gray';
        }
      }
      
      // Voeg markers toe voor elke vacature
      filteredVacatures.forEach(vacature => {
        // Bepaal marker kleur op basis van categorie
        const markerColor = getMarkerColorByCategory(vacature.category);
        
        // Bepaal coördinaten (in een echte implementatie zou je geocoding gebruiken)
        // Hier gebruiken we een simpele benadering op basis van afstand
        const angle = Math.random() * Math.PI * 2; // willekeurige hoek
        const distance = vacature.afstandTotCentrum * 0.009; // ongeveer 1km = 0.009 graden
        const lat = 51.9225 + Math.sin(angle) * distance;
        const lng = 4.47917 + Math.cos(angle) * distance;
        
        // Voeg de marker toe aan de kaart
        const marker = window.L.marker([lat, lng]).addTo(map);
        
        // Voeg een popup toe met informatie over de vacature
        marker.bindPopup(`
          <div>
            <h3 class="font-bold">${vacature.title}</h3>
            <p><strong>${vacature.company}</strong></p>
            <p>${vacature.location}</p>
            <p class="mt-2">${vacature.category}</p>
            <a href="${vacature.url}" target="_blank" class="text-blue-600 font-medium hover:underline">Bekijk vacature</a>
          </div>
        `);
      });
      
      // Voeg een legenda toe
      const legend = window.L.control({ position: 'bottomright' });
      legend.onAdd = function(map) {
        const div = window.L.DomUtil.create('div', 'map-legend');
        div.innerHTML = `
          <h3 class="font-semibold mb-2">Legenda</h3>
          <div class="legend-items">
            <div class="legend-item">
              <span class="legend-marker marker-blue"></span>
              <span>HR</span>
            </div>
            <div class="legend-item">
              <span class="legend-marker marker-green"></span>
              <span>Communicatie</span>
            </div>
            <div class="legend-item">
              <span class="legend-marker marker-orange"></span>
              <span>Recruitment Marketing</span>
            </div>
          </div>
        `;
        return div;
      };
      legend.addTo(map);
    }
  }, [filteredVacatures, filters.radius]);

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Vacature Dashboard Rotterdam</h1>
        <div className="dashboard-meta">
          <p className="last-updated">
            Laatste update: {lastUpdated ? lastUpdated.toLocaleString('nl-NL') : 'Laden...'}
          </p>
          <button 
            className="refresh-button"
            onClick={handleRefresh}
            disabled={refreshing || loading}
          >
            {refreshing ? 'Bezig met vernieuwen...' : 'Vernieuwen'}
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
                {loading ? (
                  <div className="vacature-list-loading">
                    <p>Vacatures laden...</p>
                  </div>
                ) : error ? (
                  <div className="error-message">
                    <p>{error}</p>
                  </div>
                ) : filteredVacatures.length === 0 ? (
                  <div className="vacature-list-empty">
                    <p>Geen vacatures gevonden die aan de criteria voldoen.</p>
                    <p>Probeer andere filters of zoektermen.</p>
                  </div>
                ) : (
                  filteredVacatures.map((vacature) => (
                    <div key={vacature.id} className="vacature-card">
                      <div className="vacature-card-header">
                        <h3 className="vacature-title">{vacature.title}</h3>
                        <span className="vacature-date">{formatDate(vacature.publicatieDatum)}</span>
                      </div>
                      
                      <div className="vacature-card-company">
                        <span className="vacature-company">{vacature.company}</span>
                        <span className="vacature-location">{vacature.location}</span>
                        <span className="vacature-distance">{vacature.afstandTotCentrum} km</span>
                      </div>
                      
                      {vacature.description && (
                        <p className="vacature-description">{vacature.description}</p>
                      )}
                      
                      <div className="vacature-card-footer">
                        <span className={`vacature-category category-${vacature.category.toLowerCase().replace(' ', '-')}`}>
                          {vacature.category}
                        </span>
                        <span className="vacature-source">{vacature.source}</span>
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
