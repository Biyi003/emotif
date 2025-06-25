
from flask import Flask, request, jsonify, render_template
import requests
from flask_cors import CORS
import os
from dotenv import load_dotenv
load_dotenv()  # This will load .env contents into environment


app = Flask(__name__)
CORS(app)

# Hugging Face API setup
HF_API_URL = "https://api-inference.huggingface.co/models/j-hartmann/emotion-english-distilroberta-base"
HF_API_TOKEN = os.getenv("HF_API_TOKEN")  # Correct: using environment variable name

# Optional safety check
if not HF_API_TOKEN:
    raise EnvironmentError("HF_API_TOKEN not found in environment variables")

headers = {
    "Authorization": f"Bearer {HF_API_TOKEN}"
}

@app.route('/')
def home():
    return render_template('index.html')  # Make sure 'templates/index.html' exists

@app.route('/analyze', methods=['POST'])
def analyze_emotion():
    data = request.get_json()
    text = data.get('text', '').strip()

    if not text:
        return jsonify({"error": "No text provided"}), 400

    payload = {
        "inputs": text
    }

    try:
        response = requests.post(HF_API_URL, headers=headers, json=payload)
        response.raise_for_status()
        result = response.json()

        # Convert to emotion: percentage dictionary
        emotion_scores = {item['label']: round(item['score'] * 100, 1) for item in result[0]}

        return jsonify(emotion_scores)

    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))  # Default to 5000 if PORT is not set (local dev)
    app.run(host='0.0.0.0', port=port)




# from flask import Flask, request, jsonify, render_template
# from transformers import pipeline
# from flask_cors import CORS

# app = Flask(__name__)
# CORS(app)

# # Load model once at startup
# emotion_classifier = pipeline(
#     "text-classification",
#     model="j-hartmann/emotion-english-distilroberta-base",
#     return_all_scores=True
# )

# @app.route('/')
# def home():
#     return render_template('index.html')

# @app.route('/analyze', methods=['POST'])
# def analyze():
#     data = request.get_json()
#     if not data:
#         return jsonify({"error": "No data received"}), 400

#     text = data.get('text', '').strip()

#     if not text:
#         return jsonify({"error": "No text provided"}), 400

#     try:
#         results = emotion_classifier(text)[0]
#         scores = {item['label']: round(item['score'] * 100, 1) for item in results}
#         main_emotion = max(scores, key=scores.get)

#         return jsonify({
#             "emotions": scores,
#             "main_emotion": main_emotion
#         })

#     except Exception as e:
#         return jsonify({"error": str(e)}), 500


# if __name__ == '__main__':
#     # app.run(debug=True)
#     import os
#     port = int(os.environ.get("PORT", 5000))
#     app.run(host='0.0.0.0', port=port)

