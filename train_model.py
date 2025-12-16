import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error
from sklearn.preprocessing import LabelEncoder
import joblib

# Bước 1: Tải dữ liệu từ CSV
data = pd.read_csv('server/room_data.csv')

# Bước 2: Khám phá dữ liệu
print("Dữ liệu mẫu:")
print(data.head())
print("\nThông tin dữ liệu:")
print(data.info())
print("\nThống kê mô tả:")
print(data.describe())

# Bước 3: Tiền xử lý dữ liệu
# Mã hóa biến phân loại
le_room_type = LabelEncoder()
le_city = LabelEncoder()

data['roomType_encoded'] = le_room_type.fit_transform(data['roomType'])
data['hotelCity_encoded'] = le_city.fit_transform(data['hotelCity'])

# Chọn đặc trưng và mục tiêu
features = ['roomType_encoded', 'hotelCity_encoded']
target = 'pricePerNight'

X = data[features]
y = data[target]

# Chia dữ liệu thành tập huấn luyện và kiểm tra
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Bước 4: Huấn luyện mô hình
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Bước 5: Đánh giá mô hình
y_pred = model.predict(X_test)
mae = mean_absolute_error(y_test, y_pred)
mse = mean_squared_error(y_test, y_pred)
rmse = mse ** 0.5

print(f"\nĐánh giá mô hình:")
print(f"MAE: {mae}")
print(f"RMSE: {rmse}")

# Bước 6: Lưu mô hình và encoders
joblib.dump(model, 'room_price_model.pkl')
joblib.dump(le_room_type, 'le_room_type.pkl')
joblib.dump(le_city, 'le_city.pkl')

print("\nMô hình và encoders đã được lưu.")
