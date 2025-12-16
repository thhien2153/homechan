from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import numpy as np

app = Flask(__name__)
CORS(app)

# Load the trained model and encoders
try:
    model = joblib.load('room_price_model.pkl')
    le_room_type = joblib.load('le_room_type.pkl')
    le_city = joblib.load('le_city.pkl')
    print("Model and encoders loaded successfully")
except Exception as e:
    print(f"Error loading model: {e}")
    model = None
    le_room_type = None
    le_city = None

@app.route('/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({'error': 'Model not loaded'}), 500

    try:
        data = request.get_json()

        # Extract features from request
        room_type = data.get('roomType', '')
        city = data.get('city', '')
        room_area = float(data.get('roomArea', 20))
        max_adults = int(data.get('maxAdults', 1))
        max_children = int(data.get('maxChildren', 0))
        beds = int(data.get('beds', 1))
        baths = int(data.get('baths', 1))
        amenities_count = int(data.get('amenitiesCount', 0))

        # Encode categorical variables
        try:
            room_type_encoded = le_room_type.transform([room_type])[0]
            city_encoded = le_city.transform([city])[0]
        except Exception as e:
            # If encoding fails, use default values
            room_type_encoded = 0
            city_encoded = 0

        # Create input DataFrame
        input_data = pd.DataFrame({
            'roomType_encoded': [room_type_encoded],
            'hotelCity_encoded': [city_encoded],
            'roomArea': [room_area],
            'maxAdults': [max_adults],
            'maxChildren': [max_children],
            'beds': [beds],
            'baths': [baths],
            'amenitiesCount': [amenities_count]
        })

        # Make prediction
        predicted_price = model.predict(input_data)[0]

        # Round to nearest thousand VND
        optimal_price = round(predicted_price / 1000) * 1000

        return jsonify({
            'optimalPrice': int(optimal_price),
            'predictedPrice': float(predicted_price)
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
