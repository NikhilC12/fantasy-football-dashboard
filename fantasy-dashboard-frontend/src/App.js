import React, { useState, useEffect } from 'react';

// PlayerDetailsModal Component
const PlayerDetailsModal = ({ player, onClose }) => {
  const [activeTab, setActiveTab] = useState('stats'); // 'stats' or 'sentiment'

  if (!player) return null;

  // Function to render stats for a given category (e.g., 'passing', 'receiving', 'rushing')
  const renderStatsCategory = (categoryName, stats) => {
    if (!stats || Object.keys(stats).length === 0) {
      return <p className="text-gray-300">No {categoryName} stats available.</p>;
    }
    return (
      <div className="stats-category">
        <h4 className="text-lg font-semibold text-blue-300 mb-2">{categoryName.charAt(0).toUpperCase() + categoryName.slice(1)} Stats:</h4>
        <ul className="list-disc list-inside">
          {Object.entries(stats).map(([key, value]) => (
            <li key={key} className="text-gray-200">
              <span className="font-medium text-blue-200">{key.replace(/_/g, ' ')}:</span> {value !== null ? value : 'N/A'}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close-button" onClick={onClose}>&times;</button>
        <h2 className="text-3xl font-bold text-green-400 mb-4">{player.name}</h2>
        <p className="text-gray-300 mb-4">
          <span className="font-medium text-blue-200">Team:</span> {player.team} &nbsp;&nbsp;
          <span className="font-medium text-blue-200">Position:</span> {player.position}
        </p>

        <div className="tabs-container">
          <button
            className={`tab-button ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            Stats
          </button>
          <button
            className={`tab-button ${activeTab === 'sentiment' ? 'active' : ''}`}
            onClick={() => setActiveTab('sentiment')}
          >
            Sentiment
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'stats' && (
            <div className="stats-section">
              <h3 className="text-2xl font-bold text-blue-300 mb-4">Player Statistics</h3>
              {player.detailed_stats ? (
                <>
                  {renderStatsCategory('passing', player.detailed_stats.passing)}
                  {renderStatsCategory('receiving', player.detailed_stats.receiving)}
                  {renderStatsCategory('rushing', player.detailed_stats.rushing)}
                </>
              ) : (
                <p className="text-gray-300">No detailed stats available for this player.</p>
              )}
            </div>
          )}

          {activeTab === 'sentiment' && (
            <div className="sentiment-section">
              <h3 className="text-2xl font-bold text-blue-300 mb-4">Player Sentiment</h3>
              {/* Display the sentiment received from the backend */}
              {player.sentiment && player.sentiment !== "N/A (Sentiment integration pending)" ? (
                <p className="text-gray-300">Current Sentiment: <span className="font-semibold text-blue-200">{player.sentiment}</span></p>
              ) : (
                <p className="text-gray-300">Sentiment data is not yet available.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


// Main App component for your Fantasy Football Dashboard
function App() {
  // State to hold player data fetched from the backend (for the initial list)
  const [players, setPlayers] = useState([]);
  // State to hold the details of the currently searched player
  const [searchedPlayer, setSearchedPlayer] = useState(null);
  // State to manage loading status for the initial list
  const [loading, setLoading] = useState(true);
  // State to manage loading status for player search
  const [searchLoading, setSearchLoading] = useState(false);
  // State to hold any error messages for initial list
  const [error, setError] = useState(null);
  // State for the search input field
  const [searchTerm, setSearchTerm] = useState('');
  // State for search-specific errors
  const [searchError, setSearchError] = useState(null);
  // State to control modal visibility
  const [isModalOpen, setIsModalOpen] = useState(false);
  // State to hold the player whose details are shown in the modal
  const [playerForModal, setPlayerForModal] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [playersPerPage] = useState(15); // Number of players to display per page
  const [pageInput, setPageInput] = useState(''); // State for the page number input field

  // Calculate players for the current page
  const indexOfLastPlayer = currentPage * playersPerPage;
  const indexOfFirstPlayer = indexOfLastPlayer - playersPerPage;
  const currentPlayers = players.slice(indexOfFirstPlayer, indexOfLastPlayer);

  // Calculate total pages
  const totalPages = Math.ceil(players.length / playersPerPage);

  // Function to change page
  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      setPageInput(''); // Clear the input after navigating
    }
  };

  // Handle direct page input
  const handleGoToPage = () => {
    const pageNum = parseInt(pageInput, 10);
    if (isNaN(pageNum) || pageNum < 1 || pageNum > totalPages) {
      setSearchError(`Please enter a valid page number between 1 and ${totalPages}.`);
      setPageInput(''); // Clear invalid input
    } else {
      paginate(pageNum);
      setSearchError(null); // Clear any previous errors
    }
  };

  // useEffect hook to fetch initial player list from the Flask backend when the component mounts
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/api/players');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setPlayers(data);
      } catch (err) {
        console.error("Failed to fetch initial players list:", err);
        setError("Failed to load initial player data. Please check the backend server.");
      } finally {
        setLoading(false);
      }
    };
    fetchPlayers();
  }, []); // Empty dependency array means this effect runs only once

  // Function to handle player search
  const handlePlayerSearch = async () => {
    setSearchLoading(true);
    setSearchError(null);
    setSearchedPlayer(null); // Clear previous search results

    if (!searchTerm.trim()) {
      setSearchError("Please enter a player name to search.");
      setSearchLoading(false);
      return;
    }

    // Find the player ID (name) from the initially loaded players list
    const foundPlayer = players.find(player => 
      player.name.toLowerCase() === searchTerm.toLowerCase().trim()
    );

    if (!foundPlayer) {
      setSearchError(`Player "${searchTerm}" not found in the list. Please try a full name.`);
      setSearchLoading(false);
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:5000/api/player/${encodeURIComponent(foundPlayer.id)}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setSearchedPlayer(data);
    } catch (err) {
      console.error("Failed to fetch searched player details:", err);
      setSearchError(`Failed to load player details: ${err.message}`);
    } finally {
      setSearchLoading(false);
    }
  };

  // Function to open the modal with player details
  const openPlayerModal = async (playerToDisplay) => {
    let playerDetails = playerToDisplay;

    // Always fetch detailed data for the modal to ensure we have the latest stats and sentiment
    try {
      setSearchLoading(true); // Use searchLoading to indicate fetching for modal
      const response = await fetch(`http://127.0.0.1:5000/api/player/${encodeURIComponent(playerToDisplay.id)}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      playerDetails = await response.json();
    } catch (err) {
      console.error("Failed to fetch detailed stats and sentiment for modal:", err);
      setSearchError("Failed to load detailed player data for modal.");
      setSearchLoading(false);
      return;
    } finally {
      setSearchLoading(false);
    }

    setPlayerForModal(playerDetails);
    setIsModalOpen(true);
  };

  // Function to close the modal
  const closePlayerModal = () => {
    setIsModalOpen(false);
    setPlayerForModal(null);
    setSearchError(null); // Clear any search errors when closing modal
  };

  // Render the dashboard UI
  return (
    <div style={styles.appContainer}>
      {/* Basic CSS styles for responsive design and aesthetics */}
      <style>
        {`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        body {
          margin: 0;
          font-family: 'Inter', sans-serif;
          background-color: #1a202c; /* Equivalent to bg-gray-900 */
          color: #ffffff; /* Equivalent to text-white */
        }

        .container {
          max-width: 1280px; /* Equivalent to max-w-7xl */
          margin: 0 auto; /* Equivalent to mx-auto */
          background-color: #2d3748; /* Equivalent to bg-gray-800 */
          border-radius: 0.5rem; /* Equivalent to rounded-lg */
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); /* Equivalent to shadow-xl */
          padding: 2rem; /* Equivalent to p-8 */
        }

        header {
          text-align: center;
          margin-bottom: 2.5rem; /* Equivalent to mb-10 */
        }

        header h1 {
          font-size: 3rem; /* Equivalent to text-5xl */
          font-weight: 800; /* Equivalent to font-extrabold */
          color: #63b3ed; /* Equivalent to text-blue-400 */
          margin-bottom: 1rem; /* Equivalent to mb-4 */
        }

        header p {
          font-size: 1.125rem; /* Equivalent to text-lg */
          color: #a0aec0; /* Equivalent to text-gray-300 */
        }

        section {
          margin-bottom: 2.5rem; /* Equivalent to mb-10 */
        }

        section h2 {
          font-size: 2rem; /* Equivalent to text-3xl */
          font-weight: 700; /* Equivalent to font-bold */
          color: #90cdf4; /* Equivalent to text-blue-300 */
          margin-bottom: 1.5rem; /* Equivalent to mb-6 */
          border-bottom: 2px solid #3182ce; /* Equivalent to border-b border-blue-600 */
          padding-bottom: 0.5rem; /* Equivalent to pb-2 */
        }

        .loading-container, .error-message, .no-data-message, .search-status {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 5rem; /* Adjusted for search */
          text-align: center;
          padding: 1rem; /* Equivalent to p-4 */
          border-radius: 0.5rem; /* Equivalent to rounded-lg */
          font-weight: 600; /* Equivalent to font-semibold */
          color: #ffffff;
          margin-top: 1rem;
        }

        .loading-spinner {
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-top: 4px solid #63b3ed; /* Equivalent to border-t-4 border-blue-500 */
          border-bottom: 4px solid #63b3ed; /* Equivalent to border-b-4 border-blue-500 */
          border-radius: 50%;
          width: 2rem; /* Smaller for search */
          height: 2rem; /* Smaller for search */
          animation: spin 1s linear infinite; /* Equivalent to animate-spin */
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .loading-text {
          margin-left: 1rem; /* Equivalent to ml-4 */
          font-size: 1rem; /* Adjusted for search */
          color: #a0aec0; /* Equivalent to text-gray-400 */
        }

        .error-message, .search-error {
          background-color: #dc2626; /* Equivalent to bg-red-600 */
        }

        .error-message p:last-child, .search-error p:last-child {
          font-size: 0.875rem; /* Equivalent to text-sm */
          margin-top: 0.5rem; /* Equivalent to mt-2 */
        }

        .no-data-message {
          background-color: #d97706; /* Equivalent to bg-yellow-600 */
        }

        .player-grid {
          display: grid;
          grid-template-columns: 1fr; /* Equivalent to grid-cols-1 */
          gap: 1.5rem; /* Equivalent to gap-6 */
        }

        @media (min-width: 768px) { /* Equivalent to md: */
          .player-grid {
            grid-template-columns: repeat(2, 1fr); /* Equivalent to md:grid-cols-2 */
          }
        }

        @media (min-width: 1024px) { /* Equivalent to lg: */
          .player-grid {
            grid-template-columns: repeat(3, 1fr); /* Equivalent to lg:grid-cols-3 */
          }
        }

        .player-card {
          background-color: #4a5568; /* Equivalent to bg-gray-700 */
          padding: 1.5rem; /* Equivalent to p-6 */
          border-radius: 0.5rem; /* Equivalent to rounded-lg */
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); /* Equivalent to shadow-md */
          transition: box-shadow 0.3s ease-in-out; /* Equivalent to transition-shadow duration-300 */
          cursor: pointer; /* Indicate clickable */
        }

        .player-card:hover {
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); /* Equivalent to hover:shadow-lg */
          transform: translateY(-2px); /* Slight lift on hover */
        }

        .player-card h3 {
          font-size: 1.5rem; /* Equivalent to text-2xl */
          font-weight: 600; /* Equivalent to font-semibold */
          color: #48bb78; /* Equivalent to text-green-400 */
          margin-bottom: 0.5rem; /* Equivalent to mb-2 */
        }

        .player-card p {
          color: #a0aec0; /* Equivalent to text-gray-300 */
          margin-bottom: 0.25rem; /* Equivalent to mb-1 */
        }

        .player-card p span {
          font-weight: 500; /* Equivalent to font-medium */
          color: #90cdf4; /* Equivalent to text-blue-200 */
        }

        footer {
          text-align: center;
          color: #a0aec0; /* Equivalent to text-gray-500 */
          margin-top: 2.5rem; /* Equivalent to mt-10 */
          font-size: 0.875rem; /* Equivalent to text-sm */
        }

        .search-container {
            display: flex;
            gap: 1rem;
            margin-bottom: 2rem;
            align-items: center;
            justify-content: center;
        }

        .search-input {
            padding: 0.75rem 1rem;
            border-radius: 0.5rem;
            border: 1px solid #4a5568;
            background-color: #2d3748;
            color: #ffffff;
            font-size: 1rem;
            width: 100%;
            max-width: 300px;
        }

        .search-input::placeholder {
            color: #a0aec0;
        }

        .search-button {
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            background-color: #48bb78; /* Green */
            color: #ffffff;
            font-weight: 600;
            border: none;
            cursor: pointer;
            transition: background-color 0.2s ease-in-out;
        }

        .search-button:hover {
            background-color: #38a169; /* Darker green */
        }

        .search-button:disabled {
            background-color: #6b7280; /* Gray */
            cursor: not-allowed;
        }

        .searched-player-card {
            background-color: #3182ce; /* Blue */
            padding: 1.5rem;
            border-radius: 0.5rem;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            margin-top: 1.5rem;
            text-align: center;
            cursor: pointer; /* Indicate clickable */
        }
        .searched-player-card h3 {
            color: #ffffff;
            margin-bottom: 0.5rem;
        }
        .searched-player-card p {
            color: #e2e8f0;
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .modal-content {
          background-color: #2d3748; /* bg-gray-800 */
          padding: 2rem;
          border-radius: 0.75rem; /* rounded-xl */
          width: 90%;
          max-width: 600px;
          position: relative;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          color: #ffffff;
          max-height: 90vh; /* Limit height */
          overflow-y: auto; /* Enable scrolling */
        }

        .modal-close-button {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: none;
          border: none;
          font-size: 2rem;
          color: #a0aec0;
          cursor: pointer;
          transition: color 0.2s;
        }

        .modal-close-button:hover {
          color: #ffffff;
        }

        .tabs-container {
          display: flex;
          border-bottom: 2px solid #4a5568; /* border-gray-700 */
          margin-bottom: 1.5rem;
        }

        .tab-button {
          padding: 0.75rem 1.5rem;
          background-color: transparent;
          border: none;
          color: #a0aec0; /* text-gray-300 */
          font-size: 1.125rem;
          font-weight: 600;
          cursor: pointer;
          transition: color 0.2s, border-bottom 0.2s;
          border-bottom: 2px solid transparent;
        }

        .tab-button.active {
          color: #63b3ed; /* text-blue-400 */
          border-bottom: 2px solid #63b3ed; /* border-blue-400 */
        }

        .tab-button:hover:not(.active) {
          color: #ffffff;
        }

        .tab-content {
          padding-top: 1rem;
        }

        .stats-category {
          background-color: #4a5568; /* bg-gray-700 */
          padding: 1rem;
          border-radius: 0.5rem;
          margin-bottom: 1rem;
        }
        .stats-category:last-child {
            margin-bottom: 0;
        }

        /* Pagination Styles */
        .pagination {
            display: flex;
            justify-content: center;
            align-items: center;
            margin-top: 2rem;
            gap: 0.5rem;
        }

        .pagination-button {
            padding: 0.5rem 1rem;
            border-radius: 0.375rem; /* rounded-md */
            background-color: #4a5568; /* bg-gray-700 */
            color: #ffffff;
            border: 1px solid #4a5568;
            cursor: pointer;
            transition: background-color 0.2s ease-in-out, border-color 0.2s ease-in-out;
            font-weight: 500;
        }

        .pagination-button:hover:not(:disabled) {
            background-color: #63b3ed; /* bg-blue-500 */
            border-color: #63b3ed;
        }

        .pagination-button:disabled {
            background-color: #2d3748; /* bg-gray-800 */
            color: #a0aec0; /* text-gray-400 */
            cursor: not-allowed;
        }

        .pagination-button.active {
            background-color: #63b3ed; /* bg-blue-500 */
            border-color: #63b3ed;
            font-weight: 700;
        }

        .page-input {
            width: 4rem; /* Smaller width for page number input */
            padding: 0.5rem 0.75rem;
            border-radius: 0.375rem;
            border: 1px solid #4a5568;
            background-color: #2d3748;
            color: #ffffff;
            font-size: 1rem;
            text-align: center;
        }

        .go-button {
            padding: 0.5rem 1rem;
            border-radius: 0.375rem;
            background-color: #48bb78; /* Green */
            color: #ffffff;
            font-weight: 600;
            border: none;
            cursor: pointer;
            transition: background-color 0.2s ease-in-out;
        }

        .go-button:hover:not(:disabled) {
            background-color: #38a169; /* Darker green */
        }

        .go-button:disabled {
            background-color: #6b7280; /* Gray */
            cursor: not-allowed;
        }
        `}
      </style>

      <div className="container">
        <header>
          <h1>Fantasy Football Dashboard</h1>
          <p>Player Info & Social Sentiment Analysis</p>
        </header>

        <section>
          <h2>Search Player</h2>
          <div className="search-container">
            <input
              type="text"
              placeholder="Enter player name (e.g., Christian McCaffrey)"
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => { if (e.key === 'Enter') handlePlayerSearch(); }}
            />
            <button 
              className="search-button" 
              onClick={handlePlayerSearch}
              disabled={searchLoading || loading}
            >
              {searchLoading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {searchLoading && (
            <div className="search-status">
              <div className="loading-spinner"></div>
              <p className="loading-text">Searching for player...</p>
            </div>
          )}

          {searchError && (
            <div className="error-message search-error">
              <p>{searchError}</p>
            </div>
          )}

          {searchedPlayer && (
            <div className="player-card searched-player-card" onClick={() => openPlayerModal(searchedPlayer)}>
              <h3>{searchedPlayer.name}</h3>
              <p><span>Team:</span> {searchedPlayer.team}</p>
              <p><span>Position:</span> {searchedPlayer.position}</p>
              {/* Stats and Sentiment removed from direct display */}
              <p className="text-sm text-gray-400 mt-2">Click for more details!</p>
            </div>
          )}
        </section>

        <section>
          <h2>Top Players (Initial List)</h2>
          {/* Conditional rendering based on loading, error, or data availability */}
          {loading && (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p className="loading-text">Loading initial players list...</p>
            </div>
          )}

          {error && (
            <div className="error-message">
              <p>{error}</p>
              <p>Make sure your Flask backend is running.</p>
            </div>
          )}

          {!loading && !error && players.length === 0 && (
            <div className="no-data-message">
              No player data available.
            </div>
          )}

          {!loading && !error && players.length > 0 && (
            <>
              <div className="player-grid">
                {/* Map through the players array for the current page and render each player */}
                {currentPlayers.map((player) => (
                  <div key={player.id} className="player-card" onClick={() => openPlayerModal(player)}>
                    <h3>{player.name}</h3>
                    <p><span>Team:</span> {player.team}</p>
                    <p><span>Position:</span> {player.position}</p>
                    {/* Stats and Sentiment removed from direct display */}
                    <p className="text-sm text-gray-400 mt-2">Click for more details!</p>
                  </div>
                ))}
              </div>

              {/* Enhanced Pagination Controls */}
              <div className="pagination">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="pagination-button"
                >
                  Previous
                </button>
                
                <span className="text-gray-300 mx-2">Page {currentPage} of {totalPages}</span>

                <input
                    type="number"
                    value={pageInput}
                    onChange={(e) => setPageInput(e.target.value)}
                    onKeyPress={(e) => { if (e.key === 'Enter') handleGoToPage(); }}
                    className="page-input"
                    min="1"
                    max={totalPages}
                    placeholder="#"
                />
                <button
                    onClick={handleGoToPage}
                    disabled={!pageInput || isNaN(parseInt(pageInput, 10)) || parseInt(pageInput, 10) < 1 || parseInt(pageInput, 10) > totalPages}
                    className="go-button"
                >
                    Go
                </button>

                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="pagination-button"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </section>

        <footer>
          <p>&copy; {new Date().getFullYear()} Fantasy Football Dashboard. All rights reserved.</p>
        </footer>
      </div>

      {/* Player Details Modal */}
      {isModalOpen && playerForModal && (
        <PlayerDetailsModal player={playerForModal} onClose={closePlayerModal} />
      )}
    </div>
  );
}

// Inline styles for the main app container (can also be moved to a CSS file)
const styles = {
  appContainer: {
    minHeight: '100vh',
    padding: '1.5rem', // Equivalent to p-6
  },
};

export default App;
