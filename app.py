from flask import Flask, request, jsonify, render_template
from transformers import pipeline
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Load model once at startup
emotion_classifier = pipeline(
    "text-classification",
    model="j-hartmann/emotion-english-distilroberta-base",
    return_all_scores=True
)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data received"}), 400

    text = data.get('text', '').strip()

    if not text:
        return jsonify({"error": "No text provided"}), 400

    try:
        results = emotion_classifier(text)[0]
        scores = {item['label']: round(item['score'] * 100, 1) for item in results}
        main_emotion = max(scores, key=scores.get)

        return jsonify({
            "emotions": scores,
            "main_emotion": main_emotion
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)
