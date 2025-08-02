# app.py (updated)

from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
from sentiment_analyzer import get_sentiment_label
import random # For generating random sentiment in the placeholder

app = Flask(__name__)
CORS(app)

# Dummy function to simulate fetching tweets or news articles
# For a real application, you would connect to a social media API like Twitter, Reddit, etc.
def fetch_social_media_data(player_name):
    """
    This is a placeholder function. In a real app, you would
    fetch real-time data from social media platforms.
    """
    # Simulate a list of recent headlines/tweets for a few players
    sample_data = {
        'Christian McCaffrey': [
            "Christian McCaffrey is having an incredible season!",
            "McCaffrey has been a game-changer for the team.",
            "His performance last week was disappointing."
        ],
        'Patrick Mahomes': [
            "Mahomes is the best quarterback in the league, period.",
            "Another MVP-caliber season for Mahomes.",
            "Mahomes struggled with turnovers in the last game."
        ],
        'Travis Kelce': [
            "Travis Kelce is a fantasy football cheat code.",
            "Great catch by Kelce to win the game!",
            "Kelce had a quiet day with limited targets."
        ],
        # If the player is not in our sample, provide a generic message
        'default': [
            f"{player_name} is a key part of the offense.",
            f"{player_name} has been inconsistent this season.",
            f"The team is hoping for a bounce-back game from {player_name}."
        ]
    }
    
    player_data = sample_data.get(player_name, sample_data['default'])
    
    # Select a random sample to simulate recent chatter
    return random.sample(player_data, 1)[0] # Return a single random item from the list

@app.route('/')
def home():
    return "Fantasy Football Backend is running!"

@app.route('/api/players', methods=['GET'])
def get_players():
    # ... (Keep this function as is. It returns a placeholder for sentiment) ...
    current_season_year = 2019 
    ffdp_players_url = f"https://www.fantasyfootballdatapros.com/api/players/{current_season_year}/all"
    players_data = []

    try:
        response = requests.get(ffdp_players_url)
        response.raise_for_status() 
        all_ffdp_players = response.json()

        for player_info in all_ffdp_players:
            player_name = player_info.get('player_name', 'N/A')
            team = player_info.get('team', 'N/A')
            position = player_info.get('position', 'N/A')

            if player_name != 'N/A' and team != 'N/A' and position != 'N/A':
                players_data.append({
                    "id": player_name,
                    "name": player_name,
                    "team": team,
                    "position": position,
                    "stats": "N/A (Stats not required for this view)",
                    # Still a placeholder here, as we only need sentiment on the detail view
                    "sentiment": "N/A (Sentiment data pending)"
                })
        
        print(f"Successfully processed {len(players_data)} players from FFDP for {current_season_year} season.")
        return jsonify(players_data)

    except requests.exceptions.RequestException as e:
        print(f"ERROR: Failed to fetch players from Fantasy Football Data Pros API: {e}")
        return jsonify({"error": f"Failed to fetch player data from external API: {e}"}), 500
    except Exception as e:
        print(f"ERROR: An unexpected error occurred: {e}")
        return jsonify({"error": f"An internal server error occurred: {e}"}), 500

@app.route('/api/player/<player_id>', methods=['GET'])
def get_player_details(player_id):
    """
    Fetches details for a specific player and now includes a sentiment score.
    """
    current_season_year = 2019
    ffdp_players_url = f"https://www.fantasyfootballdatapros.com/api/players/{current_season_year}/all"
    
    try:
        response = requests.get(ffdp_players_url)
        response.raise_for_status()
        all_ffdp_players = response.json()

        player_info = None
        for p_info in all_ffdp_players:
            if p_info.get('player_name', '').lower() == player_id.lower():
                player_info = p_info
                break

        if player_info:
            # --- New Logic for Sentiment Analysis ---
            # 1. Fetch some simulated social media data for the player.
            social_data = fetch_social_media_data(player_info.get('player_name', 'N/A'))
            
            # 2. Analyze the sentiment of that data using your new module.
            sentiment_result = get_sentiment_label(social_data)
            print(f"Analyzed sentiment for {player_info.get('player_name', '')}: {sentiment_result}")
            # --- End New Logic ---

            player_details = {
                "id": player_info.get('player_name', 'N/A'),
                "name": player_info.get('player_name', 'N/A'),
                "team": player_info.get('team', 'N/A'),
                "position": player_info.get('position', 'N/A'),
                "detailed_stats": player_info.get('stats', {}),
                "sentiment": sentiment_result # Now returns the actual sentiment label
            }
            return jsonify(player_details)
        else:
            return jsonify({"error": "Player not found."}), 404

    except requests.exceptions.RequestException as e:
        print(f"ERROR: Failed to fetch player details from FFDP API: {e}")
        return jsonify({"error": f"Failed to fetch player details from external API: {e}"}), 500
    except Exception as e:
        print(f"ERROR: An unexpected error occurred: {e}")
        return jsonify({"error": f"An internal server error occurred: {e}"}), 500

if __name__ == '__main__':
    app.run(debug=True)