from flask import Flask, jsonify, request
from flask_cors import CORS
import requests # Import the requests library

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return "Fantasy Football Backend is running!"

@app.route('/api/players', methods=['GET'])
def get_players():
    """
    Fetches NFL player data (name, team, position) from the Fantasy Football Data Pros API,
    and returns it with placeholders for stats and sentiment.
    This version fetches ALL available players from the API for the specified season.
    """
    # Using 2019 season for testing, as it's an example year in their documentation
    # This helps verify if the API is functional and returning data for known years.
    current_season_year = 2019 
    ffdp_players_url = f"https://www.fantasyfootballdatapros.com/api/players/{current_season_year}/all"
    players_data = []

    try:
        # Make a GET request to the Fantasy Football Data Pros API
        print(f"Attempting to fetch ALL players from: {ffdp_players_url}")
        response = requests.get(ffdp_players_url)
        response.raise_for_status() # Raise an HTTPError for bad responses (4xx or 5xx)
        all_ffdp_players = response.json()

        print(f"Received {len(all_ffdp_players)} player entries from FFDP API for {current_season_year} season.")
        
        # --- DEBUGGING: Print a portion of the raw response to inspect structure ---
        if all_ffdp_players:
            print("--- First 5 player entries from FFDP API (raw JSON): ---")
            for i, entry in enumerate(all_ffdp_players[:5]):
                print(f"  Entry {i}: {entry}")
            print("-------------------------------------------------------")
        else:
            print(f"FFDP API returned an empty list for {current_season_year} season.")
        # --- END DEBUGGING ---

        # Process ALL players (removed the players_processed_count limit)
        for player_info in all_ffdp_players:
            # The FFDP API provides 'player_name', 'team', 'position' directly.
            # We'll use 'player_name' as the 'id' for the frontend, as it's what the user searches by.
            player_name = player_info.get('player_name', 'N/A')
            team = player_info.get('team', 'N/A')
            position = player_info.get('position', 'N/A')

            # Ensure essential data is present before adding the player
            if player_name != 'N/A' and team != 'N/A' and position != 'N/A':
                players_data.append({
                    "id": player_name, # Using player_name as the ID for frontend consistency with search
                    "name": player_name,
                    "team": team,
                    "position": position,
                    "stats": "N/A (Stats not required for this view)", # Simplified as per your request
                    "sentiment": "N/A (Sentiment integration pending)" # Placeholder for future sentiment
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
    Fetches details for a specific player by their name (which is used as ID)
    from the Fantasy Football Data Pros API.
    Since FFDP doesn't have a direct single-player endpoint by ID, we fetch all
    players for the season and then find the matching one by name.
    """
    current_season_year = 2019 # Using 2019 for consistency with get_players for testing
    ffdp_players_url = f"https://www.fantasyfootballdatapros.com/api/players/{current_season_year}/all"
    
    try:
        # Fetch all players from FFDP API
        print(f"Attempting to fetch all players to find details for ID (name): {player_id}")
        response = requests.get(ffdp_players_url)
        response.raise_for_status()
        all_ffdp_players = response.json()

        player_info = None
        # The player_id passed here is actually the player's name (e.g., "Christian McCaffrey")
        for p_info in all_ffdp_players:
            # Compare the player's name from the API with the player_id (which is the search term/name)
            if p_info.get('player_name', '').lower() == player_id.lower(): 
                player_info = p_info
                break

        if player_info:
            player_name = player_info.get('player_name', 'N/A')
            team = player_info.get('team', 'N/A')
            position = player_info.get('position', 'N/A')
            
            # Extract the raw 'stats' dictionary directly from player_info
            # This will contain 'passing', 'receiving', and 'rushing' keys
            detailed_stats = player_info.get('stats', {}) # Default to empty dict if no stats

            player_details = {
                "id": player_name, # Consistent with how it's stored in get_players
                "name": player_name,
                "team": team,
                "position": position,
                "detailed_stats": detailed_stats, # Now contains the actual stats dictionary
                "sentiment": "N/A (Sentiment integration pending)" # Placeholder for sentiment
            }
            print(f"Found details for player ID (name) {player_id}: {player_details['name']}")
            return jsonify(player_details)
        else:
            print(f"Player with ID (name) {player_id} not found in FFDP data for {current_season_year} season.")
            return jsonify({"error": "Player not found."}), 404

    except requests.exceptions.RequestException as e:
        print(f"ERROR: Failed to fetch player details from FFDP API: {e}")
        return jsonify({"error": f"Failed to fetch player details from external API: {e}"}), 500
    except Exception as e:
        print(f"ERROR: An unexpected error occurred: {e}")
        return jsonify({"error": f"An internal server error occurred: {e}"}), 500

if __name__ == '__main__':
    app.run(debug=True)
