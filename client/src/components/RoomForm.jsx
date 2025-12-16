import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaTimes } from "react-icons/fa";

export default function RoomForm({
    isOpen,
    onCancel,
    onSubmit,
    initialValues = {},
    amenitiesList = [
        "Wi-Fi miễn phí",
        "Bữa sáng miễn phí",
        "Dịch vụ phòng",
        "Hướng biển",
        "Hồ bơi",
    ],
}) {
    const [values, setValues] = useState({
        roomNumber: "",
        roomType: "",
        pricePerNight: "",
        discountPercent: "",
        roomArea: "",
        maxAdults: "",
        maxChildren: "",
        bedsDetails: {},
        bathroomsDetails: {},
        amenities: [],
        existingImages: [],
    });
    const [newImages, setNewImages] = useState([]);
    const [loading, setLoading] = useState(false);

    //  Mapping dữ liệu khi mở form
    useEffect(() => {
        if (!isOpen) return;
        const defaultBeds = {
            'Giường đơn': 0,
            'Giường đôi nhỏ': 0,
            'Giường đôi lớn vừa': 0,
            'Giường cỡ lớn': 0,
            'Giường siêu lớn': 0
        };
        const defaultBathrooms = {
            'Tiêu chuẩn': 0,
            'Nâng cao': 0,
            'Cao cấp': 0,
            'Hạng sang': 0
        };
        const v = {
            roomNumber: initialValues.roomNumber || "",
            roomType: initialValues.roomType || initialValues.name || "",
            pricePerNight:
                initialValues.pricePerNight ??
                initialValues.price ??
                initialValues.roomPrice ??
                "",
            discountPercent: initialValues.discountPercent ?? "",
            roomArea: initialValues.roomArea ?? "",
            maxAdults: initialValues.maxAdults ?? initialValues.guests ?? "",
            maxChildren: initialValues.maxChildren ?? "",
            bedsDetails: { ...defaultBeds, ...(initialValues.bedsDetails || {}) },
            bathroomsDetails: { ...defaultBathrooms, ...(initialValues.bathroomsDetails || {}) },
            amenities: Array.isArray(initialValues.amenities)
                ? initialValues.amenities
                : [],
            existingImages:
                initialValues.roomImages ||
                initialValues.images ||
                initialValues.imageUrls ||
                [],
        };
        setValues(v);
        setNewImages([]);
    }, [initialValues, isOpen]);

    //  Các hàm chỉnh dữ liệu
    const handleImageAdd = (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length) setNewImages((prev) => [...prev, ...files]);
        e.target.value = null;
    };

    const removeNewImage = (idx) =>
        setNewImages((prev) => prev.filter((_, i) => i !== idx));

    const removeExistingImage = (idx) =>
        setValues((prev) => ({
            ...prev,
            existingImages: prev.existingImages.filter((_, i) => i !== idx),
        }));

    const changeBeds = (key, delta) =>
        setValues((prev) => ({
            ...prev,
            bedsDetails: {
                ...prev.bedsDetails,
                [key]: Math.max(0, (prev.bedsDetails[key] || 0) + delta),
            },
        }));

    const changeBaths = (key, delta) =>
        setValues((prev) => ({
            ...prev,
            bathroomsDetails: {
                ...prev.bathroomsDetails,
                [key]: Math.max(0, (prev.bathroomsDetails[key] || 0) + delta),
            },
        }));

    const toggleAmenity = (a) =>
        setValues((prev) =>
            prev.amenities.includes(a)
                ? {
                    ...prev,
                    amenities: prev.amenities.filter((x) => x !== a),
                }
                : { ...prev, amenities: [...prev.amenities, a] }
        );

    const submit = async (e) => {
        e?.preventDefault?.();
        setLoading(true);
        try {
            const payload = {
                ...values,
                bedsDetails: values.bedsDetails,
                bathroomsDetails: values.bathroomsDetails,
                amenities: values.amenities,
                existingImages: values.existingImages,
            };
            await onSubmit(payload, { newImages });
        } catch (err) {
            console.error("RoomForm submit error", err);
        } finally {
            setLoading(false);
        }
    };

    //  Hiển thị form
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black bg-opacity-40 overflow-auto"
                >
                    <motion.div
                        initial={{ scale: 0.98, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.98, opacity: 0 }}
                        className="bg-white rounded-2xl max-w-4xl w-full p-6 mt-12 mb-12"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">Thông tin phòng</h3>
                            <button
                                onClick={onCancel}
                                className="p-2 text-gray-500 hover:text-gray-700"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <form onSubmit={submit} className="space-y-5">
                            {/* ===== Thông tin cơ bản ===== */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <input
                                    placeholder="Số phòng"
                                    value={values.roomNumber}
                                    onChange={(e) =>
                                        setValues({ ...values, roomNumber: e.target.value })
                                    }
                                    className="border p-2 rounded"
                                />
                                <input
                                    placeholder="Tên / Loại phòng"
                                    value={values.roomType}
                                    onChange={(e) =>
                                        setValues({ ...values, roomType: e.target.value })
                                    }
                                    className="border p-2 rounded"
                                />
                                <input
                                    placeholder="Giá / đêm"
                                    value={values.pricePerNight}
                                    onChange={(e) =>
                                        setValues({ ...values, pricePerNight: e.target.value })
                                    }
                                    className="border p-2 rounded"
                                />
                            </div>

                            {/* ===== Giảm giá % ===== */}
                            <div className="mb-4">
                                <label className="block text-sm text-gray-700">Giảm giá % (không bắt buộc)</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={values.discountPercent}
                                    onChange={(e) => setValues(prev => ({ ...prev, discountPercent: e.target.value }))}
                                    placeholder="VD: 10"
                                    className="w-full px-3 py-2 border rounded mt-1"
                                />
                            </div>

                            {/* ===== Diện tích & Số lượng khách ===== */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <input
                                    type="number"
                                    placeholder="Diện tích phòng (m²)"
                                    value={values.roomArea}
                                    onChange={(e) =>
                                        setValues({ ...values, roomArea: e.target.value })
                                    }
                                    className="border p-2 rounded"
                                />
                                <input
                                    type="number"
                                    placeholder="Người lớn (max)"
                                    value={values.maxAdults}
                                    onChange={(e) =>
                                        setValues({ ...values, maxAdults: e.target.value })
                                    }
                                    className="border p-2 rounded"
                                />
                                <input
                                    type="number"
                                    placeholder="Trẻ em (max)"
                                    value={values.maxChildren}
                                    onChange={(e) =>
                                        setValues({ ...values, maxChildren: e.target.value })
                                    }
                                    className="border p-2 rounded"
                                />
                            </div>

                            {/* ===== Giường & Nhà vệ sinh ===== */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="font-medium mb-2">🛏️ Giường</p>
                                    {Object.entries(values.bedsDetails || {}).length === 0 && (
                                        <p className="text-sm text-gray-500 italic">
                                            (Chưa có dữ liệu giường)
                                        </p>
                                    )}
                                    {Object.entries(values.bedsDetails || {}).map(([k, v]) => (
                                        <div
                                            key={k}
                                            className="flex items-center justify-between border rounded-lg p-2 mb-2"
                                        >
                                            <div>{k}</div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => changeBeds(k, -1)}
                                                    className="px-2 py-1 border rounded"
                                                >
                                                    -
                                                </button>
                                                <div className="px-2">{v}</div>
                                                <button
                                                    type="button"
                                                    onClick={() => changeBeds(k, 1)}
                                                    className="px-2 py-1 border rounded"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div>
                                    <p className="font-medium mb-2">🚿 Nhà vệ sinh</p>
                                    {Object.entries(values.bathroomsDetails || {}).length ===
                                        0 && (
                                            <p className="text-sm text-gray-500 italic">
                                                (Chưa có dữ liệu nhà vệ sinh)
                                            </p>
                                        )}
                                    {Object.entries(values.bathroomsDetails || {}).map(
                                        ([k, v]) => (
                                            <div
                                                key={k}
                                                className="flex items-center justify-between border rounded-lg p-2 mb-2"
                                            >
                                                <div>{k}</div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => changeBaths(k, -1)}
                                                        className="px-2 py-1 border rounded"
                                                    >
                                                        -
                                                    </button>
                                                    <div className="px-2">{v}</div>
                                                    <button
                                                        type="button"
                                                        onClick={() => changeBaths(k, 1)}
                                                        className="px-2 py-1 border rounded"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>

                            {/* ===== Tiện nghi ===== */}
                            <div>
                                <p className="font-medium mb-2">✨ Tiện nghi</p>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {amenitiesList.map((a) => (
                                        <label
                                            key={a}
                                            className={`border rounded-lg p-2 flex items-center gap-2 cursor-pointer transition ${values.amenities.includes(a) ||
                                                values.amenities.includes(
                                                    {
                                                        "Wi-Fi miễn phí": "Free WiFi",
                                                        "Bữa sáng miễn phí": "Free Breakfast",
                                                        "Dịch vụ phòng": "Room Service",
                                                        "Hướng biển": "Mountain View",
                                                        "Hồ bơi": "Pool Access",
                                                    }[a]
                                                )
                                                ? "bg-indigo-50 border-indigo-300"
                                                : "hover:bg-gray-50"
                                                }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={
                                                    values.amenities.includes(a) ||
                                                    values.amenities.includes(
                                                        {
                                                            "Wi-Fi miễn phí": "Free WiFi",
                                                            "Bữa sáng miễn phí": "Free Breakfast",
                                                            "Dịch vụ phòng": "Room Service",
                                                            "Hướng biển": "Mountain View",
                                                            "Hồ bơi": "Pool Access",
                                                        }[a]
                                                    )
                                                }
                                                onChange={() => toggleAmenity(a)}
                                            />
                                            <span className="text-sm">{a}</span>
                                        </label>
                                    ))}

                                </div>
                            </div>

                            {/* ===== Ảnh phòng ===== */}
                            <div>
                                <p className="font-medium mb-2">🖼️ Ảnh phòng</p>
                                <label className="block border-2 border-dashed border-indigo-300 rounded-md p-3 text-center hover:bg-indigo-50 transition cursor-pointer">
                                    <span className="text-sm text-gray-600">
                                        Kéo thả hoặc chọn ảnh phòng
                                    </span>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleImageAdd}
                                        className="hidden"
                                    />
                                </label>

                                <div className="flex flex-wrap gap-3 mt-3">
                                    {values.existingImages?.map((src, i) => (
                                        <div
                                            key={`exist-${i}`}
                                            className="relative group w-28 h-28 rounded-lg overflow-hidden border"
                                        >
                                            <img
                                                src={src}
                                                alt={`exist-${i}`}
                                                className="w-full h-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeExistingImage(i)}
                                                className="absolute top-1 right-1 bg-white rounded-full p-1 text-red-600 opacity-0 group-hover:opacity-100 transition"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                    {newImages.map((f, i) => (
                                        <div
                                            key={`new-${i}`}
                                            className="relative group w-28 h-28 rounded-lg overflow-hidden border"
                                        >
                                            <img
                                                src={URL.createObjectURL(f)}
                                                alt={`new-${i}`}
                                                className="w-full h-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeNewImage(i)}
                                                className="absolute top-1 right-1 bg-white rounded-full p-1 text-red-600 opacity-0 group-hover:opacity-100 transition"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* ===== Nút ===== */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={onCancel}
                                    className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700"
                                >
                                    {loading ? "Đang lưu..." : "Lưu phòng"}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
