import React, { useState, useEffect } from 'react';

// Main App component for your Fantasy Football Dashboard
function App() {
  // State to hold player data fetched from the backend
  const [players, setPlayers] = useState([]);
  // State to manage loading status
  const [loading, setLoading] = useState(true);
  // State to hold any error messages
  const [error, setError] = useState(null);

  // useEffect hook to fetch data from the Flask backend when the component mounts
  useEffect(() => {
    // Define the asynchronous function to fetch data
    const fetchPlayers = async () => {
      try {
        // Make a fetch request to your Flask backend's '/api/players' endpoint
        // Assuming Flask runs on http://127.0.0.1:5000
        const response = await fetch('http://127.0.0.1:5000/api/players');

        // Check if the response was successful (status code 200-299)
        if (!response.ok) {
          // If not successful, throw an error with the status text
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Parse the JSON response
        const data = await response.json();
        // Update the players state with the fetched data
        setPlayers(data);
      } catch (err) {
        // Catch any errors during the fetch operation and set the error state
        console.error("Failed to fetch players:", err);
        setError("Failed to load player data. Please check the backend server.");
      } finally {
        // Set loading to false once the fetch operation is complete (success or failure)
        setLoading(false);
      }
    };

    // Call the fetchPlayers function
    fetchPlayers();
  }, []); // Empty dependency array means this effect runs only once after the initial render

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

        .loading-container, .error-message, .no-data-message {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 10rem; /* Equivalent to h-40 */
          text-align: center;
          padding: 1rem; /* Equivalent to p-4 */
          border-radius: 0.5rem; /* Equivalent to rounded-lg */
          font-weight: 600; /* Equivalent to font-semibold */
          color: #ffffff;
        }

        .loading-spinner {
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-top: 4px solid #63b3ed; /* Equivalent to border-t-4 border-blue-500 */
          border-bottom: 4px solid #63b3ed; /* Equivalent to border-b-4 border-blue-500 */
          border-radius: 50%;
          width: 4rem; /* Equivalent to w-16 */
          height: 4rem; /* Equivalent to h-16 */
          animation: spin 1s linear infinite; /* Equivalent to animate-spin */
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .loading-text {
          margin-left: 1rem; /* Equivalent to ml-4 */
          font-size: 1.25rem; /* Equivalent to text-xl */
          color: #a0aec0; /* Equivalent to text-gray-400 */
        }

        .error-message {
          background-color: #dc2626; /* Equivalent to bg-red-600 */
        }

        .error-message p:last-child {
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
        }

        .player-card:hover {
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); /* Equivalent to hover:shadow-lg */
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
        `}
      </style>

      <div className="container">
        <header>
          <h1>Fantasy Football Dashboard</h1>
          <p>Player Stats & Social Sentiment Analysis</p>
        </header>

        <section>
          <h2>Top Players</h2>
          {/* Conditional rendering based on loading, error, or data availability */}
          {loading && (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p className="loading-text">Loading players...</p>
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
            <div className="player-grid">
              {/* Map through the players array and render each player */}
              {players.map((player) => (
                <div key={player.id} className="player-card">
                  <h3>{player.name}</h3>
                  <p><span>Team:</span> {player.team}</p>
                  <p><span>Position:</span> {player.position}</p>
                  <p><span>Stats:</span> {player.stats}</p>
                  <p><span>Sentiment:</span> {player.sentiment}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        <footer>
          <p>&copy; {new Date().getFullYear()} Fantasy Football Dashboard. All rights reserved.</p>
        </footer>
      </div>
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
