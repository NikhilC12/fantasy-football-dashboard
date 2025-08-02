# sentiment_analyzer.py
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

def get_sentiment_score(text):
    """
    Analyzes the sentiment of a given text and returns the compound score.
    A score > 0.05 is positive, < -0.05 is negative, and between is neutral.
    """
    analyzer = SentimentIntensityAnalyzer()
    vs = analyzer.polarity_scores(text)
    return vs['compound']

def get_sentiment_label(text):
    """
    Analyzes the sentiment of a given text and returns a label ('Positive', 'Negative', 'Neutral').
    """
    score = get_sentiment_score(text)
    if score >= 0.05:
        return 'Positive'
    elif score <= -0.05:
        return 'Negative'
    else:
        return 'Neutral'

if __name__ == '__main__':
    # Example usage
    print(f"Sentiment for 'He is a great player': {get_sentiment_label('He is a great player')}")
    print(f"Sentiment for 'He will never be good at his sport': {get_sentiment_label('He will never be good at his sport')}")
    print(f"Sentiment for 'He is a football player': {get_sentiment_label('He is a football player')}")