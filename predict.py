import joblib
import pandas as pd

# Tải mô hình và encoders đã lưu
model = joblib.load('room_price_model.pkl')
le_room_type = joblib.load('le_room_type.pkl')
le_city = joblib.load('le_city.pkl')

def predict_price(room_type, city):
    """
    Dự đoán giá phòng dựa trên loại phòng và thành phố.
    """
    try:
        # Mã hóa đầu vào
        room_type_encoded = le_room_type.transform([room_type])[0]
        city_encoded = le_city.transform([city])[0]

        # Tạo DataFrame cho dự đoán
        input_data = pd.DataFrame({
            'roomType_encoded': [room_type_encoded],
            'hotelCity_encoded': [city_encoded]
        })

        # Dự đoán giá
        predicted_price = model.predict(input_data)[0]

        return round(predicted_price, 2)
    except Exception as e:
        return f"Lỗi: {str(e)}"

# Ví dụ sử dụng
if __name__ == "__main__":
    price = predict_price("Deluxe", "Hanoi")
    print(f"Giá dự đoán: {price}")
