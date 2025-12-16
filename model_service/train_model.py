import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import mean_absolute_error, mean_squared_error
import joblib

ROOT = os.path.join(os.path.dirname(__file__), '..')
DATA_CSV = os.path.join(ROOT, 'data', 'room_data.csv')
MODEL_DIR = os.path.join(ROOT, 'models')
os.makedirs(MODEL_DIR, exist_ok=True)

print("Loading data:", DATA_CSV)
df = pd.read_csv(DATA_CSV)

# Basic cleaning
df = df.dropna(subset=['pricePerNight', 'roomType', 'hotelCity'])
df = df[df['pricePerNight'] > 0]

# Feature engineering
if 'createdAt' in df.columns:
    df['createdAt'] = pd.to_datetime(df['createdAt'], errors='coerce')
    df['month'] = df['createdAt'].dt.month.fillna(0).astype(int)
    df['isWeekend'] = df['createdAt'].dt.weekday.isin([5,6]).astype(int)
else:
    df['month'] = 0
    df['isWeekend'] = 0

numeric_cols = ['roomArea','maxAdults','maxChildren','beds','baths','amenitiesCount']
for c in numeric_cols:
    if c in df.columns:
        df[c] = pd.to_numeric(df[c], errors='coerce').fillna(0)
    else:
        df[c] = 0

# Encode categorical
le_room = LabelEncoder()
le_city = LabelEncoder()
df['roomType'] = df['roomType'].astype(str).str.strip().str.lower()
df['hotelCity'] = df['hotelCity'].astype(str).str.strip().str.lower()

df['roomType_enc'] = le_room.fit_transform(df['roomType'])
df['city_enc'] = le_city.fit_transform(df['hotelCity'])

features = ['roomArea','maxAdults','maxChildren','beds','baths','amenitiesCount','roomType_enc','city_enc','month','isWeekend']
X = df[features]
y = df['pricePerNight']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = RandomForestRegressor(n_estimators=200, random_state=42, n_jobs=-1)
model.fit(X_train, y_train)

pred = model.predict(X_test)
mae = mean_absolute_error(y_test, pred)
rmse = mean_squared_error(y_test, pred, squared=False)
print(f'MAE: {mae:.2f}, RMSE: {rmse:.2f}')

# Save model and encoders and features
joblib.dump(model, os.path.join(MODEL_DIR, 'room_price_model.pkl'))
joblib.dump(le_room, os.path.join(MODEL_DIR, 'le_room_type.pkl'))
joblib.dump(le_city, os.path.join(MODEL_DIR, 'le_city.pkl'))
joblib.dump(features, os.path.join(MODEL_DIR, 'features_list.pkl'))
print('Saved model and encoders to', MODEL_DIR)
