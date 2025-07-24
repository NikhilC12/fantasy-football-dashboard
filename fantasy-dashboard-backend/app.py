# app.py
from flask import Flask, jsonify, request
from flask_cors import CORS # Import CORS for handling Cross-Origin Resource Sharing

app = Flask(__name__)
# Enable CORS for all routes, allowing your React frontend to make requests
CORS(app)

# A simple root route to confirm the backend is running
@app.route('/')
def home():
    return "Fantasy Football Backend is running!"

# API endpoint to get player data
@app.route('/api/players', methods=['GET'])
def get_players():
    """
    This endpoint will eventually fetch real player data from an external API
    and potentially integrate sentiment analysis from web scraping.
    For now, it returns dummy data.
    """
    # Dummy player data to simulate an API response
    players_data = [
        {"id": "p1", "name": "Patrick Mahomes", "team": "KC", "position": "QB", "stats": "3000 Yds, 25 TD", "sentiment": "Positive (85%)"},
        {"id": "p2", "name": "Christian McCaffrey", "team": "SF", "position": "RB", "stats": "1200 Rush Yds, 10 TD", "sentiment": "Very Positive (92%)"},
        {"id": "p3", "name": "Justin Jefferson", "team": "MIN", "position": "WR", "stats": "1500 Rec Yds, 12 TD", "sentiment": "Positive (78%)"},
        {"id": "p4", "name": "Travis Kelce", "team": "KC", "position": "TE", "stats": "1000 Rec Yds, 9 TD", "sentiment": "Neutral (60%)"},
    ]
    return jsonify(players_data)

# You can add more routes here for specific player details,
# triggering scraping, etc.

# Example route for a single player (conceptual)
@app.route('/api/player/<player_id>', methods=['GET'])
def get_player_details(player_id):
    # In a real application, you'd fetch this from a database or a more detailed API
    # and then potentially trigger specific scraping for this player.
    # For now, just a placeholder.
    player_details = {
        "id": player_id,
        "name": "Player Name",
        "team": "Team",
        "position": "POS",
        "detailed_stats": "Detailed stats for " + player_id,
        "social_mentions": [
            {"platform": "X/Twitter", "text": "Great game!", "sentiment": "positive"},
            {"platform": "Reddit", "text": "Underrated performance.", "sentiment": "positive"}
        ]
    }
    return jsonify(player_details)


if __name__ == '__main__':
    # Run the Flask app in debug mode.
    # It will be accessible at http://127.0.0.1:5000
    app.run(debug=True)
