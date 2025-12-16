import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { FaCcVisa, FaCcMastercard, FaWallet, FaMobileAlt, FaUniversity, FaCopy } from "react-icons/fa";
import Swal from "sweetalert2";
import { useAppContext } from "../conext/AppContext.jsx";

const BookingPage = () => {
    const { axios, getToken } = useAppContext();
    const location = useLocation()
    const navigate = useNavigate()
    const room = location.state?.room || {}
    const discountPercent = Number(room.discountPercent) || 0
    const pricePerNight = room.pricePerNight || room.price || 200000

    // Helper function to calculate final price with discount
    const calcFinalPrice = (price, discount) => {
        const p = Number(price) || 0
        const d = Number(discount) || 0
        return Math.round(p * (1 - d / 100))
    }

    const finalPricePerNight = calcFinalPrice(pricePerNight, discountPercent)

    // Helper to format currency
    const formatVND = (v) =>
        typeof v === 'number'
            ? v.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
            : 'Liên hệ'

    // --- Lịch ---
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [checkInDate, setCheckInDate] = useState(null)
    const [checkOutDate, setCheckOutDate] = useState(null)
    const [bookedDates, setBookedDates] = useState([])
    const today = new Date()

    // ====== Lấy dữ liệu ngày đã có người đặt ======
    useEffect(() => {
        if (!room._id) return;

        const fetchBookedDates = async () => {
            try {
                const res = await axios.get(`/api/bookings/room/${room._id}`);
                if (res.data?.success && Array.isArray(res.data.bookings)) {
                    const dates = [];

                    res.data.bookings.forEach((b) => {
                        const start = new Date(b.checkIn || b.checkInDate);
                        const end = new Date(b.checkOut || b.checkOutDate);

                        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                            const iso = new Date(d).toISOString().split("T")[0]
                            dates.push(iso)
                        }
                    });

                    console.log("📅 Ngày đã đặt:", dates);
                    setBookedDates(dates);
                }
            } catch (err) {
                console.error("Lỗi khi tải ngày đã đặt:", err);
            }
        };

        fetchBookedDates();
    }, [room._id]);


    // ====== Tính toán số ngày / số ô lịch ======
    const daysInMonth = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1,
        0
    ).getDate()

    const firstDayOfMonth = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        1
    ).getDay()

    // ====== Xử lý click ngày ======
    const handleDateClick = (day) => {
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        const iso = date.toISOString().split("T")[0];
        if (bookedDates.includes(iso)) return;


        if (!checkInDate || (checkInDate && checkOutDate)) {
            setCheckInDate(date);
            setCheckOutDate(null);
        } else if (date > checkInDate) {
            setCheckOutDate(date);
        } else {
            setCheckInDate(date);
        }
    };

    const isToday = (day) => {
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
        return (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
        )
    }

    const isSelected = (day) => {
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
        if (checkInDate && checkOutDate) {
            return date >= checkInDate && date <= checkOutDate
        }
        if (checkInDate && !checkOutDate) {
            return date.toDateString() === checkInDate.toDateString()
        }
        return false
    }

    const calculateNights = () => {
        if (!checkInDate || !checkOutDate) return 0
        const diffTime = Math.abs(checkOutDate - checkInDate)
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    }

    const totalPrice = calculateNights() * finalPricePerNight
    const originalTotalPrice = calculateNights() * pricePerNight

    // --- Form ---
    const [form, setForm] = useState({
        name: "",
        phone: "",
        email: "",
        note: "",
    })

    // --- Payment ---
    const [paymentMethod, setPaymentMethod] = useState("pay_at_hotel")
    const [card, setCard] = useState({ cardNumber: "", cardName: "", expiry: "", cvc: "" })
    const [ewalletPhone, setEwalletPhone] = useState("")
    const [selectedBank, setSelectedBank] = useState("")
    const [bankCard, setBankCard] = useState({ number: "", name: "", expiry: "", promo: "" })
    const handleBankCardChange = (e) => setBankCard({ ...bankCard, [e.target.name]: e.target.value })
    const [processingPayment, setProcessingPayment] = useState(false)
    const [showConfirmModal, setShowConfirmModal] = useState(false)

    const handleCardChange = (e) => setCard({ ...card, [e.target.name]: e.target.value })

    const validateCard = () => {
        const num = card.cardNumber.replace(/\s+/g, "")
        if (!/^\d{13,19}$/.test(num)) return "Số thẻ không hợp lệ"
        if (!card.cardName || card.cardName.trim().length < 2) return "Tên trên thẻ không hợp lệ"
        if (!/^(0[1-9]|1[0-2])\/(\d{2})$/.test(card.expiry)) return "Hạn dùng thẻ phải có định dạng MM/YY"
        if (!/^\d{3,4}$/.test(card.cvc)) return "Mã CVC không hợp lệ"
        return null
    }

    const fakeProcessPayment = () =>
        new Promise((res) => setTimeout(() => res({ success: true, transactionId: `tx_${Date.now()}` }), 1200))

    // --- Bank accounts for transfer ---
    const banks = [
        { id: 'vcb', name: 'Vietcombank', accountName: 'Công ty Homechan', accountNumber: '0123456789012', branch: 'Hà Nội', initials: 'VCB', color: 'bg-green-600' },
        { id: 'vietin', name: 'VietinBank', accountName: 'Công ty Homechan', accountNumber: '0112233445566', branch: 'Hà Nội', initials: 'VIB', color: 'bg-blue-700' },
        { id: 'bidv', name: 'BIDV', accountName: 'Công ty Homechan', accountNumber: '0120001122334', branch: 'Hà Nội', initials: 'BIDV', color: 'bg-indigo-600' },
        { id: 'agribank', name: 'Agribank', accountName: 'Công ty Homechan', accountNumber: '0223344556677', branch: 'Hà Nội', initials: 'AGR', color: 'bg-red-600' },
        { id: 'sacombank', name: 'Sacombank', accountName: 'Công ty Homechan', accountNumber: '0321122334455', branch: 'Hà Nội', initials: 'SCB', color: 'bg-orange-500' },
        { id: 'techcom', name: 'Techcombank', accountName: 'Công ty Homechan', accountNumber: '0423344556677', branch: 'Hà Nội', initials: 'TCB', color: 'bg-yellow-600' },
        { id: 'mb', name: 'MB Bank', accountName: 'Công ty Homechan', accountNumber: '0523344556677', branch: 'Hà Nội', initials: 'MB', color: 'bg-red-500' },
        { id: 'acb', name: 'ACB', accountName: 'Công ty Homechan', accountNumber: '0987654321098', branch: 'Hồ Chí Minh', initials: 'ACB', color: 'bg-sky-600' },
        { id: 'vpbank', name: 'VPBank', accountName: 'Công ty Homechan', accountNumber: '0623344556677', branch: 'Hà Nội', initials: 'VPB', color: 'bg-emerald-600' },
        { id: 'vib', name: 'VIB', accountName: 'Công ty Homechan', accountNumber: '0723344556677', branch: 'Hà Nội', initials: 'VIB', color: 'bg-purple-600' },
        { id: 'shb', name: 'SHB', accountName: 'Công ty Homechan', accountNumber: '0823344556677', branch: 'Hà Nội', initials: 'SHB', color: 'bg-rose-500' },
        { id: 'eximbank', name: 'Eximbank', accountName: 'Công ty Homechan', accountNumber: '0923344556677', branch: 'Hà Nội', initials: 'EXB', color: 'bg-indigo-500' },
        { id: 'hsbc', name: 'HSBC', accountName: 'Công ty Homechan', accountNumber: '1023344556677', branch: 'Hà Nội', initials: 'HSBC', color: 'bg-gray-700' },
        { id: 'tpb', name: 'TPBank', accountName: 'Công ty Homechan', accountNumber: '1123344556677', branch: 'Hà Nội', initials: 'TPB', color: 'bg-red-400' },
        { id: 'ncb', name: 'NCB', accountName: 'Công ty Homechan', accountNumber: '1223344556677', branch: 'Hà Nội', initials: 'NCB', color: 'bg-teal-600' },
        { id: 'msb', name: 'MSB', accountName: 'Công ty Homechan', accountNumber: '1323344556677', branch: 'Hà Nội', initials: 'MSB', color: 'bg-orange-400' },
        { id: 'hdbank', name: 'HDBank', accountName: 'Công ty Homechan', accountNumber: '1423344556677', branch: 'Hà Nội', initials: 'HDB', color: 'bg-amber-600' },
        { id: 'namabank', name: 'Nam A Bank', accountName: 'Công ty Homechan', accountNumber: '1523344556677', branch: 'Hà Nội', initials: 'NAB', color: 'bg-lime-600' },
        { id: 'ocb', name: 'OCB', accountName: 'Công ty Homechan', accountNumber: '1623344556677', branch: 'Hà Nội', initials: 'OCB', color: 'bg-cyan-600' },
        { id: 'scb', name: 'SCB', accountName: 'Công ty Homechan', accountNumber: '1723344556677', branch: 'Hà Nội', initials: 'SCB', color: 'bg-fuchsia-600' },
        { id: 'ivb', name: 'IVB', accountName: 'Công ty Homechan', accountNumber: '1823344556677', branch: 'Hà Nội', initials: 'IVB', color: 'bg-slate-600' },
        { id: 'abbank', name: 'ABBANK', accountName: 'Công ty Homechan', accountNumber: '1923344556677', branch: 'Hà Nội', initials: 'ABB', color: 'bg-rose-600' },
        { id: 'vietabank', name: 'Viet A Bank', accountName: 'Công ty Homechan', accountNumber: '2023344556677', branch: 'Hà Nội', initials: 'VAB', color: 'bg-emerald-400' },
    ]

    const [bankRef, setBankRef] = useState("")

    // --- Promo / discount code ---
    const [promoCode, setPromoCode] = useState("")
    const [applyingPromo, setApplyingPromo] = useState(false)
    const [appliedPromo, setAppliedPromo] = useState(null) // { code, type, value }

    const promoCatalog = {
        HOME10: { type: 'percent', value: 10 },
        VIP20: { type: 'percent', value: 20 },
        SAVE50: { type: 'amount', value: 50000 },
    }

    const applyPromoCode = async (code) => {
        if (!code || typeof code !== 'string') return Swal.fire({ icon: 'warning', title: 'Nhập mã khuyến mại' })
        const key = code.trim().toUpperCase()
        setApplyingPromo(true)
        // simulate validate call
        await new Promise(r => setTimeout(r, 500))
        const info = promoCatalog[key]
        setApplyingPromo(false)
        if (!info) {
            setAppliedPromo(null)
            return Swal.fire({ icon: 'error', title: 'Mã không hợp lệ', text: 'Vui lòng kiểm tra lại mã khuyến mại.' })
        }
        setAppliedPromo({ code: key, ...info })
        setPromoCode(key)
        Swal.fire({ icon: 'success', title: 'Áp dụng thành công', text: `Đã áp dụng mã ${key}` })
    }

    const removePromo = () => {
        setAppliedPromo(null)
        setPromoCode("")
    }

    const getTotalAfterPromo = () => {
        const t = Number(totalPrice) || 0
        if (!appliedPromo) return t
        if (appliedPromo.type === 'percent') return Math.max(0, Math.round(t * (1 - appliedPromo.value / 100)))
        return Math.max(0, t - (Number(appliedPromo.value) || 0))
    }

    const totalAfterPromo = getTotalAfterPromo()

    const handleCopy = async (text) => {
        try {
            await navigator.clipboard.writeText(text)
            Swal.fire({ icon: 'success', title: 'Đã sao chép', text: 'Đã sao chép vào clipboard.' })
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Không thể sao chép' })
        }
    }

    // payment detail modal removed: selection only sets method now

    // payment detail save removed (inputs handled outside)

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleBookingSubmit = async (e) => {
        // open confirm modal instead of immediate submit
        setShowConfirmModal(true)
    };

    const processPaymentAndBook = async () => {
        // 🔒 Kiểm tra người dùng đã đăng nhập
        const token = await getToken();
        if (!token) {
            Swal.fire({
                icon: "info",
                title: "Bạn phải đăng nhập trước khi đặt phòng",
                text: "Vui lòng đăng nhập để tiếp tục đặt phòng.",
                confirmButtonText: "Đăng nhập ngay",
                confirmButtonColor: "#3085d6",
            }).then(() => navigate("/login"));
            return;
        }

        // kiểm tra form
        if (!form.name.trim() || !form.phone.trim() || !form.email.trim()) {
            Swal.fire({ icon: "warning", title: "Thiếu thông tin!", text: "Vui lòng nhập đầy đủ họ tên, số điện thoại và email.", confirmButtonColor: "#3085d6" });
            return;
        }

        if (!checkInDate || !checkOutDate) {
            Swal.fire({ icon: "warning", title: "Thiếu ngày!", text: "Vui lòng chọn ngày nhận và trả phòng.", confirmButtonColor: "#3085d6" });
            return;
        }

        // xử lý thanh toán mô phỏng theo phương thức
        if (paymentMethod === 'card') {
            const cardErr = validateCard()
            if (cardErr) {
                Swal.fire({ icon: 'warning', title: 'Lỗi thông tin thẻ', text: cardErr })
                return
            }
            setProcessingPayment(true)
            const payRes = await fakeProcessPayment()
            setProcessingPayment(false)
            if (!payRes?.success) {
                Swal.fire({ icon: 'error', title: 'Thanh toán thất bại', text: 'Vui lòng thử lại.' })
                return
            }
        } else if (paymentMethod === 'ewallet') {
            if (ewalletPhone && !/^0?9\d{8,9}$/.test(ewalletPhone)) {
                Swal.fire({ icon: 'warning', title: 'Số điện thoại ví không hợp lệ' })
                return
            }
            setProcessingPayment(true)
            const payRes = await fakeProcessPayment()
            setProcessingPayment(false)
            if (!payRes?.success) {
                Swal.fire({ icon: 'error', title: 'Thanh toán thất bại', text: 'Vui lòng thử lại.' })
                return
            }
        } else if (paymentMethod === 'bank') {
            // bank transfer: manual
        }

        try {
            const { data } = await axios.post(
                "/api/bookings/book",
                {
                    room: room._id,
                    checkInDate,
                    checkOutDate,
                    customerName: form.name.trim(),
                    customerPhone: form.phone.trim(),
                    customerEmail: form.email.trim(),
                    note: form.note,
                    paymentMethod: paymentMethod === "pay_at_hotel" ? "Pay At Hotel" : paymentMethod,
                    paymentInfo: { bankRef, ewalletPhone, bankCard, selectedBank },
                    promo: appliedPromo ? { code: appliedPromo.code, type: appliedPromo.type, value: appliedPromo.value } : null,
                },
                { headers: { Authorization: `Bearer ${await getToken()}` } }
            );

            if (data.success) {
                setShowConfirmModal(false)
                Swal.fire({ icon: "success", title: "Đặt phòng thành công!", text: "Phòng của bạn đã được lưu vào lịch sử đặt phòng.", showConfirmButton: false, timer: 2000, timerProgressBar: true, });
                setTimeout(() => navigate("/my-bookings"), 2000);
            } else {
                Swal.fire({ icon: "error", title: "Lỗi khi đặt phòng", text: data.message || "Không thể đặt phòng. Vui lòng thử lại!", });
            }
        } catch (error) {
            Swal.fire({ icon: "error", title: "Lỗi máy chủ", text: error.message || "Đã xảy ra lỗi khi gửi yêu cầu đặt phòng.", });
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-28 py-10 px-4">
            <div className="max-w-6xl mx-auto">
                {/* 2 cột chính */}
                <div className="bg-white rounded-2xl shadow-lg grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
                    {/* Cột trái - Lịch */}
                    <div className="p-6 border-r border-gray-100">
                        <h2 className="text-xl font-bold mb-4">Chọn ngày đặt phòng</h2>

                        {/* Tiêu đề tháng */}
                        <div className="flex justify-between items-center mb-4">
                            <button
                                onClick={() =>
                                    setCurrentMonth(
                                        new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
                                    )
                                }
                                className="text-lg"
                            >
                                <FaChevronLeft />
                            </button>
                            <p className="font-semibold">
                                {currentMonth.toLocaleString("vi-VN", {
                                    month: "long",
                                    year: "numeric",
                                })}
                            </p>
                            <button
                                onClick={() =>
                                    setCurrentMonth(
                                        new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
                                    )
                                }
                                className="text-lg"
                            >
                                <FaChevronRight />
                            </button>
                        </div>

                        {/* Lịch */}
                        <div className="grid grid-cols-7 gap-1 text-center text-sm">
                            {["CN", "Hai", "Ba", "Tư", "Năm", "Sáu", "Bảy"].map((d) => (
                                <div key={d} className="font-medium text-gray-600">
                                    {d}
                                </div>
                            ))}

                            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                                <div key={`empty-${i}`} />
                            ))}

                            {Array.from({ length: daysInMonth }).map((_, i) => {
                                const day = i + 1
                                return (
                                    <div
                                        key={day}
                                        onClick={() => handleDateClick(day)}
                                        className={`cursor-pointer py-2 rounded-lg ${(() => {
                                            const iso = new Date(
                                                currentMonth.getFullYear(),
                                                currentMonth.getMonth(),
                                                day
                                            ).toISOString().split("T")[0];

                                            if (bookedDates.includes(iso)) return "bg-yellow-400 text-white cursor-not-allowed";
                                            if (isToday(day)) return "bg-blue-500 text-white";
                                            if (isSelected(day)) return "bg-green-500 text-white";
                                            return "hover:bg-gray-200";
                                        })()
                                            }`}
                                    >
                                        {day}
                                    </div>
                                )
                            })}
                        </div>

                        {/* Thông tin ngày */}
                        <div className="mt-4 text-sm text-gray-700 space-y-2">
                            <p>
                                Ngày nhận phòng:{" "}
                                <strong>
                                    {checkInDate
                                        ? checkInDate.toLocaleDateString("vi-VN")
                                        : "--/--/----"}
                                </strong>
                            </p>
                            <p>
                                Ngày trả phòng:{" "}
                                <strong>
                                    {checkOutDate
                                        ? checkOutDate.toLocaleDateString("vi-VN")
                                        : "--/--/----"}
                                </strong>
                            </p>
                            <p>
                                Thời gian lưu trú:{" "}
                                <strong>{calculateNights()} đêm</strong>
                            </p>

                            {/* Giá display */}
                            <div className="pt-3 border-t space-y-1">
                                {discountPercent > 0 && (
                                    <>
                                        <p className="text-sm text-gray-500 line-through">
                                            Giá gốc: {formatVND(originalTotalPrice)}
                                        </p>
                                        <p className="font-bold text-green-600">
                                            Sau giảm {discountPercent}%: <span className="text-lg text-orange-600">{formatVND(totalPrice)}</span>
                                        </p>
                                        <p className="text-xs text-green-600">
                                            Tiết kiệm: {formatVND(originalTotalPrice - totalPrice)}
                                        </p>
                                    </>
                                )}
                                {discountPercent === 0 && (
                                    <p className="font-bold">
                                        Tổng giá tiền:{" "}
                                        <span className="text-orange-600 text-lg">
                                            {formatVND(totalPrice)}
                                        </span>
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Cột phải - Form */}
                    <div className="p-6">
                        <h2 className="text-xl font-bold mb-4">
                            Nhập thông tin đặt phòng của bạn
                        </h2>

                        <form className="space-y-4">
                            <div className="flex gap-4">
                                <div className="w-1/2">
                                    <label className="text-sm font-medium">Họ và tên *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        className="w-full border rounded-lg p-2 mt-1"
                                        required
                                    />
                                </div>
                                <div className="w-1/2">
                                    <label className="text-sm font-medium">Số điện thoại *</label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={form.phone}
                                        onChange={handleChange}
                                        className="w-full border rounded-lg p-2 mt-1"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium">Địa chỉ Email *</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    className="w-full border rounded-lg p-2 mt-1"
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">Ghi chú</label>
                                <textarea
                                    name="note"
                                    value={form.note}
                                    onChange={handleChange}
                                    className="w-full border rounded-lg p-2 mt-1"
                                    rows="2"
                                />
                            </div>

                            {/* Thanh toán */}
                            <div>
                                <label className="text-sm font-medium">Phương thức thanh toán</label>

                                <div className="flex flex-col gap-3 mt-2">
                                    {[{ id: 'pay_at_hotel', title: 'Thanh toán khi đến nơi', icon: null }, { id: 'ewallet', title: 'Thanh toán qua MoMo/VNPay', icon: FaWallet }, { id: 'card', title: 'Thẻ quốc tế (Visa/Mastercard)', icon: FaCcVisa }, { id: 'bank', title: 'Chuyển khoản ngân hàng', icon: FaUniversity }].map(opt => {
                                        const Icon = opt.icon
                                        return (
                                            <button key={opt.id} type="button" onClick={() => setPaymentMethod(opt.id)} className={`w-full text-left flex items-center gap-3 p-3 border rounded-lg ${paymentMethod === opt.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                                                <input readOnly type="radio" name="payment" checked={paymentMethod === opt.id} className="mr-2" />
                                                {Icon && <Icon className="text-2xl" />}
                                                <div className="flex-1 text-sm">{opt.title}</div>
                                            </button>
                                        )
                                    })}
                                </div>

                                {/* Payment method selection only (no bank/details here) */}
                            </div>
                        </form>
                    </div>
                </div>

                {/* THẺ PHÒNG ĐÃ CHỌN */}
                <div className="mt-6 bg-white shadow-lg rounded-2xl p-6 flex flex-col md:flex-row gap-4">
                    {/* Ảnh phòng */}
                    <div className="relative w-full md:w-[280px] h-[180px] rounded-lg overflow-hidden flex-shrink-0">
                        {Array.isArray(room.roomImages) && room.roomImages.length > 0 ? (
                            <img
                                src={room.roomImages[0]}
                                alt="room"
                                className="w-full h-full object-cover"
                            />
                        ) : Array.isArray(room.hotel?.images) && room.hotel.images.length > 0 ? (
                            <img
                                src={room.hotel.images[0]}
                                alt="hotel"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <img
                                src="/fallback.jpg"
                                alt="fallback"
                                className="w-full h-full object-cover"
                            />
                        )}
                    </div>

                    {/* Thông tin phòng */}
                    <div className="flex-1 flex flex-col justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                {room.title || room.roomType || "Phòng"}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                                Diện tích phòng:{" "}
                                {room.roomArea ? `${room.roomArea} m²` : "Chưa có thông tin"}
                            </p>

                            <div className="mt-3 flex items-center gap-4 text-sm text-gray-700">
                                <span>👤 {room.maxGuests || 1} người lớn</span>
                                <span>🧒 {room.maxChildren || 0} trẻ em</span>
                                {room.beds && <span>🛏️ {room.beds} giường</span>}
                            </div>

                            {/* Tiện nghi */}
                            {Array.isArray(room.amenities) && room.amenities.length > 0 && (
                                <div className="mt-3 grid grid-cols-2 gap-y-2 gap-x-4 text-sm text-gray-600">
                                    {room.amenities.slice(0, 6).map((a, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <span className="text-green-500">✔️</span>
                                            <span className="truncate">{a}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="mt-3 text-right">
                            {discountPercent > 0 && (
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-500 line-through">
                                        {formatVND(pricePerNight)}/đêm
                                    </p>
                                    <p className="text-orange-600 font-bold text-lg">
                                        {formatVND(finalPricePerNight)}/đêm
                                    </p>
                                    <p className="text-xs text-green-600 font-semibold">
                                        Tiết kiệm {formatVND(pricePerNight - finalPricePerNight)} ({discountPercent}%)
                                    </p>
                                </div>
                            )}
                            {discountPercent === 0 && (
                                <p className="text-orange-600 font-bold text-lg">
                                    {formatVND(pricePerNight)}/đêm
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* NÚT HỦY VÀ HOÀN TẤT */}
                <div className="mt-6 flex justify-end gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 px-6 rounded-lg transition"
                    >
                        Hủy bỏ
                    </button>
                    <button
                        onClick={handleBookingSubmit}
                        disabled={processingPayment}
                        className={`bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition ${processingPayment ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                        {processingPayment ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
                    </button>

                </div>

            </div>

            {showConfirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black opacity-40" onClick={() => setShowConfirmModal(false)} />

                    <div className="relative bg-white rounded-lg shadow-xl w-full max-w-5xl mx-4 overflow-hidden max-h-[90vh]">
                        <div className="grid grid-cols-1 md:grid-cols-2 overflow-y-auto max-h-[78vh]">
                            {/* Left - order summary */}
                            <div className="p-6 border-r">
                                <h3 className="text-lg font-semibold mb-3">Thông tin đơn hàng (Test)</h3>
                                <div className="text-sm text-gray-600 mb-4">
                                    <div>Số tiền thanh toán</div>
                                    <div className="text-2xl font-bold text-orange-600 mt-2">{formatVND(totalAfterPromo || totalPrice || 0)} {appliedPromo && (<span className="text-sm text-gray-500 line-through ml-2">{formatVND(totalPrice || 0)}</span>)}</div>

                                    <div className="mt-3 flex items-center gap-2">
                                        <input value={promoCode} onChange={(e) => setPromoCode(e.target.value)} placeholder="Mã khuyến mại" className="border rounded-lg p-2 text-sm" />
                                        <button onClick={() => applyPromoCode(promoCode)} disabled={applyingPromo} className="px-3 py-2 bg-green-600 text-white rounded-md text-sm">{applyingPromo ? 'Đang...' : 'Áp dụng'}</button>
                                        {appliedPromo && (<button onClick={removePromo} className="px-3 py-2 border rounded-md text-sm">Hủy</button>)}
                                    </div>
                                </div>

                                <div className="text-sm text-gray-700 space-y-2">
                                    <div><strong>Khách hàng:</strong> {form.name || '—'}</div>
                                    <div><strong>Điện thoại:</strong> {form.phone || '—'}</div>
                                    <div><strong>Email:</strong> {form.email || '—'}</div>
                                    <div><strong>Phòng:</strong> {room.title || room.roomType || '—'}</div>
                                    <div><strong>Ngày:</strong> {checkInDate ? checkInDate.toLocaleDateString('vi-VN') : '--/--/----'} — {checkOutDate ? checkOutDate.toLocaleDateString('vi-VN') : '--/--/----'}</div>
                                    <div><strong>Thời gian:</strong> {calculateNights()} đêm</div>
                                </div>

                                <div className="mt-6 text-xs text-gray-500">
                                    <div>Mã đơn hàng: {`ORD${Date.now().toString().slice(-6)}`}</div>
                                    <div className="mt-2">Nhà cung cấp: {room.hotel?.name || 'HOMECHAN'}</div>
                                </div>
                            </div>

                            {/* Right - payment selection */}
                            <div className="p-6">
                                <h3 className="text-lg font-semibold mb-3">Chọn phương thức thanh toán</h3>

                                <div className="space-y-3">
                                    {[{ id: 'pay_at_hotel', title: 'Thanh toán khi đến nơi', desc: 'Thanh toán bằng tiền mặt tại khách sạn' }, { id: 'ewallet', title: 'Thẻ/Ứng dụng ngân hàng (Ví điện tử)', desc: 'Thanh toán nhanh qua MoMo, VNPay' }, { id: 'card', title: 'Thẻ thanh toán quốc tế', desc: 'Visa, Mastercard' }, { id: 'bank', title: 'Thẻ nội địa và chuyển khoản', desc: 'Chuyển khoản qua ngân hàng' }].map(opt => (
                                        <button key={opt.id} type="button" onClick={() => setPaymentMethod(opt.id)} className={`w-full text-left flex items-center gap-3 p-3 border rounded-lg ${paymentMethod === opt.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                                            <input readOnly type="radio" name="modalPayment" checked={paymentMethod === opt.id} className="mr-2" />
                                            <div className="flex-1">
                                                <div className="font-medium">{opt.title}</div>
                                                <div className="text-xs text-gray-500">{opt.desc}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                <div className="mt-4">
                                    {paymentMethod === 'card' && (
                                        <div className="space-y-3">
                                            <div className="text-sm text-gray-600">Nhập thông tin thẻ (chỉ trên bước xác nhận)</div>
                                            <input name="cardNumber" value={card.cardNumber} onChange={handleCardChange} placeholder="Số thẻ (4242 4242 4242 4242)" className="w-full border rounded-lg p-2" />
                                            <input name="cardName" value={card.cardName} onChange={handleCardChange} placeholder="Tên chủ thẻ" className="w-full border rounded-lg p-2" />
                                            <div className="flex gap-3">
                                                <input name="expiry" value={card.expiry} onChange={handleCardChange} placeholder="MM/YY" className="w-1/2 border rounded-lg p-2" />
                                                <input name="cvc" value={card.cvc} onChange={handleCardChange} placeholder="CVC" className="w-1/2 border rounded-lg p-2" />
                                            </div>
                                        </div>
                                    )}

                                    {paymentMethod === 'ewallet' && (
                                        <div>
                                            <div className="flex items-center gap-3 mb-2"><FaMobileAlt /> <div className="font-medium">Ví điện tử / Ứng dụng ngân hàng</div></div>
                                            <input value={ewalletPhone} onChange={(e) => setEwalletPhone(e.target.value)} placeholder="Số điện thoại thanh toán" className="w-full border rounded-lg p-2" />
                                        </div>
                                    )}

                                    {paymentMethod === 'bank' && (
                                        <div className="space-y-3">
                                            <label className="text-sm font-medium">Chọn ngân hàng</label>

                                            <select value={selectedBank} onChange={(e) => setSelectedBank(e.target.value)} className="w-full border rounded-lg p-2">
                                                <option value="">Chọn ngân hàng</option>
                                                {banks.map(b => (<option key={b.id} value={b.id}>{b.name}</option>))}
                                            </select>

                                            <div className="mt-3">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    <div className="col-span-2">
                                                        <label className="text-sm font-medium">Số thẻ / Số tài khoản</label>
                                                        <input name="number" value={bankCard.number} onChange={handleBankCardChange} placeholder="Số thẻ hoặc số tài khoản" className="w-full border rounded-lg p-2 mt-1" />
                                                    </div>

                                                    <div>
                                                        <label className="text-sm font-medium">Tên chủ thẻ / chủ tài khoản</label>
                                                        <input name="name" value={bankCard.name} onChange={handleBankCardChange} placeholder="Tên chủ (không dấu)" className="w-full border rounded-lg p-2 mt-1" />
                                                    </div>

                                                    <div>
                                                        <label className="text-sm font-medium">Ngày phát hành / MM/YY</label>
                                                        <input name="expiry" value={bankCard.expiry} onChange={handleBankCardChange} placeholder="MM/YY" className="w-full border rounded-lg p-2 mt-1" />
                                                    </div>

                                                    <div className="col-span-2">
                                                        <label className="text-sm font-medium">Nội dung chuyển khoản (tùy chọn)</label>
                                                        <input value={bankRef} onChange={(e) => setBankRef(e.target.value)} placeholder="Họ tên - Mã đặt phòng" className="w-full border rounded-lg p-2 mt-1" />
                                                        <p className="text-xs text-gray-500 mt-1">Sau khi chuyển, hãy ghi mã giao dịch vào nội dung hoặc lưu lại để xác thực.</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-6 flex justify-end gap-3">
                                    <button onClick={() => setShowConfirmModal(false)} className="px-4 py-2 border rounded-md">Hủy thanh toán</button>
                                    <button onClick={() => processPaymentAndBook()} disabled={processingPayment} className="px-4 py-2 bg-blue-600 text-white rounded-md">{processingPayment ? 'Đang xử lý...' : `Xác nhận thanh toán • ${formatVND(totalAfterPromo || totalPrice || 0)}`}</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment detail modal removed — inputs are handled in-page */}
        </div >
    )
}

export default BookingPage
