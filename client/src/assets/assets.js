import logo from './logo.svg'
import logokonghou from './logokonghou.svg'
import searchIcon from './searchIcon.svg'
import userIcon from './userIcon.svg'
import calenderIcon from './calenderIcon.svg'
import locationIcon from './locationIcon.svg'
import starIconFilled from './starIconFilled.svg'
import arrowIcon from './arrowIcon.svg'
import starIconOutlined from './starIconOutlined.svg'
import instagramIcon from './instagramIcon.svg'
import facebookIcon from './facebookIcon.svg'
import twitterIcon from './twitterIcon.svg'
import linkendinIcon from './linkendinIcon.svg'
import freeWifiIcon from './freeWifiIcon.svg'
import freeBreakfastIcon from './freeBreakfastIcon.svg'
import roomServiceIcon from './roomServiceIcon.svg'
import mountainIcon from './mountainIcon.svg'
import poolIcon from './poolIcon.svg'
import homeIcon from './homeIcon.svg'
import closeIcon from './closeIcon.svg'
import locationFilledIcon from './locationFilledIcon.svg'
import heartIcon from './heartIcon.svg'
import badgeIcon from './badgeIcon.svg'
import menuIcon from './menuIcon.svg'
import closeMenu from './closeMenu.svg'
import guestsIcon from './guestsIcon.svg'
import roomImg1 from './roomImg1.png'
import roomImg2 from './roomImg2.png'
import roomImg3 from './roomImg3.png'
import roomImg4 from './roomImg4.png'
import regImage from './regImage.png'
import exclusiveOfferCardImg1 from "./exclusiveOfferCardImg1.png";
import exclusiveOfferCardImg2 from "./exclusiveOfferCardImg2.png";
import exclusiveOfferCardImg3 from "./exclusiveOfferCardImg3.png";
import addIcon from "./addIcon.svg";
import dashboardIcon from "./dashboardIcon.svg";
import listIcon from "./listIcon.svg";
import uploadArea from "./uploadArea.svg";
import totalBookingIcon from "./totalBookingIcon.svg";
import totalRevenueIcon from "./totalRevenueIcon.svg";


export const assets = {
  logokonghou,
  logo,
  searchIcon,
  userIcon,
  calenderIcon,
  locationIcon,
  starIconFilled,
  arrowIcon,
  starIconOutlined,
  instagramIcon,
  facebookIcon,
  twitterIcon,
  linkendinIcon,
  freeWifiIcon,
  freeBreakfastIcon,
  roomServiceIcon,
  mountainIcon,
  poolIcon,
  closeIcon,
  homeIcon,
  locationFilledIcon,
  heartIcon,
  badgeIcon,
  menuIcon,
  closeMenu,
  guestsIcon,
  regImage,
  addIcon,
  dashboardIcon,
  listIcon,
  uploadArea,
  totalBookingIcon,
  totalRevenueIcon,
}

export const cities = [
  "Đà Nẵng",
  "Hà Nội",
  "Hồ Chí Minh",
  "Nha Trang",
  "Hải Phòng",
  "Quảng Ninh",
  "Thừa Thiên Huế",
  "Nghệ An",
  "Quảng Trị",
  "Thanh Hóa",
  "Lâm Đồng",
  "Cà Mau",
  "Cần Thơ",
  "Đồng Nai",
  "Lai Châu",
  "Yên Bái",
  "Thái Nguyên",
  "Bắc Giang",
  "Quảng Ngãi",
  "Long An",
  "Tiền Giang",
  "Kiên Giang",
  "Hưng Yên",
  "Tuyên Quang",
  "Phú Thọ",
  "Điện Biên",
  "Lạng Sơn",
  "Cao Bằng",
  "Hà Tĩnh",
  "Lào Cai",
  "Bắc Ninh",
  "Ninh Bình",
  "Gia Lai",
  "Khánh Hòa"
];

// Exclusive Offers Dummy Data
export const exclusiveOffers = [
  {
    _id: 1,
    title: "Combo hè sảng khoái",
    description: "Ở 3 đêm tặng thêm 1 – tiết kiệm cực đỉnh cho chuyến đi dài ngày.",
    priceOff: 25,
    expiryDate: "31/08/2025",
    image: exclusiveOfferCardImg1
  },
  {
    _id: 2,
    title: "Ưu đãi nghỉ dưỡng đôi lứa",
    description: "Trọn gói spa, trả phòng trễ, khoảnh khắc riêng dành cho hai bạn.",
    priceOff: 20,
    expiryDate: "20/09/2025",
    image: exclusiveOfferCardImg2
  },
  {
    _id: 3,
    title: "Đặt sớm - Ưu đãi lớn",
    description: "Đặt trước 60+ ngày để mở khóa các điểm nghỉ dưỡng đẳng cấp với giá tốt nhất.",
    priceOff: 30,
    expiryDate: "25/09/2025",
    image: exclusiveOfferCardImg3
  }
];


// Testimonials Dummy Data
export const testimonials = [
  {
    id: 1,
    name: "Nguyễn Minh Anh",
    address: "TP. Hồ Chí Minh, Việt Nam",
    image: "https://images.unsplash.com/photo-1749253851355-3529792f0d34?q=80&w=687&auto=format&fit=crop",
    rating: 5,
    review: "Đặt phòng siêu nhanh và dễ dàng. Tìm được khách sạn ưng ý chỉ trong vài phút. Trải nghiệm cực kỳ mượt!"
  },
  {
    id: 2,
    name: "Phạm Bảo Hân",
    address: "Hà Nội, Việt Nam",
    image: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=200",
    rating: 4,
    review: "Giao diện trực quan, dễ dùng. Mình rất thích tính năng gợi ý thông minh – đúng nhu cầu luôn!"
  },
  {
    id: 3,
    name: "Trần Quốc Duy",
    address: "Đà Nẵng, Việt Nam",
    image: "https://images.unsplash.com/photo-1743875929006-803ea54cafc1?q=80&w=765&auto=format&fit=crop",
    rating: 5,
    review: "Mọi thứ đều suôn sẻ từ lúc đặt cho đến nhận phòng. Rất ấn tượng với cách hệ thống cá nhân hóa trải nghiệm!"
  }
]


// Facility Icon
export const facilityIcons = {
  "Free WiFi": assets.freeWifiIcon,
  "Free Breakfast": assets.freeBreakfastIcon,
  "Room Service": assets.roomServiceIcon,
  "Mountain View": assets.mountainIcon,
  "Pool Access": assets.poolIcon,
};

// For Room Details Page
export const roomCommonData = [
  {
    icon: assets.homeIcon,
    title: "Không gian sạch sẽ & an toàn",
    description: "Không gian được vệ sinh kỹ lưỡng và bảo trì cẩn thận dành riêng cho bạn."
  },
  {
    icon: assets.badgeIcon,
    title: "Vệ sinh nâng cao",
    description: "Chủ nhà tuân thủ tiêu chuẩn vệ sinh nghiêm ngặt của Staybnb."
  },
  {
    icon: assets.locationFilledIcon,
    title: "Vị trí tuyệt vời",
    description: "90% khách đánh giá vị trí 5 sao."
  },
  {
    icon: assets.heartIcon,
    title: "Nhận phòng dễ dàng",
    description: "100% khách đánh giá 5 sao cho trải nghiệm nhận phòng."
  },
];


// User Dummy Data
export const userDummyData = {
  "_id": "user_2unqyL4diJFP1E3pIBnasc7w8hP",
  "username": "Great Stack",
  "email": "user.greatstack@gmail.com",
  "image": "https://i.pravatar.cc/150?img=32",
  "role": "hotelOwner",
  "createdAt": "2025-03-25T09:29:16.367Z",
  "updatedAt": "2025-04-10T06:34:48.719Z",
  "__v": 1,
  "recentSearchedCities": [
    "New York"
  ]
}

// Hotel Dummy Data
export const hotelDummyData = {
  "_id": "67f76393197ac559e4089b72",
  "name": "Urbanza Suites",
  "address": "Main Road  123 Street , 23 Colony",
  "contact": "+0123456789",
  "owner": userDummyData,
  "city": "New York",
  "createdAt": "2025-04-10T06:22:11.663Z",
  "updatedAt": "2025-04-10T06:22:11.663Z",
  "__v": 0
}

// Rooms Dummy Data
export const roomsDummyData = [
  {
    "_id": "67f7647c197ac559e4089b96",
    "hotel": hotelDummyData,
    "roomType": "Double Bed",
    "pricePerNight": 399,
    "amenities": ["Room Service", "Mountain View", "Pool Access"],
    "images": [roomImg1, roomImg2, roomImg3, roomImg4],
    "isAvailable": true,
    "createdAt": "2025-04-10T06:26:04.013Z",
    "updatedAt": "2025-04-10T06:26:04.013Z",
    "__v": 0
  },
  {
    "_id": "67f76452197ac559e4089b8e",
    "hotel": hotelDummyData,
    "roomType": "Double Bed",
    "pricePerNight": 299,
    "amenities": ["Room Service", "Mountain View", "Pool Access"],
    "images": [roomImg2, roomImg3, roomImg4, roomImg1],
    "isAvailable": true,
    "createdAt": "2025-04-10T06:25:22.593Z",
    "updatedAt": "2025-04-10T06:25:22.593Z",
    "__v": 0
  },
  {
    "_id": "67f76406197ac559e4089b82",
    "hotel": hotelDummyData,
    "roomType": "Double Bed",
    "pricePerNight": 249,
    "amenities": ["Free WiFi", "Free Breakfast", "Room Service"],
    "images": [roomImg3, roomImg4, roomImg1, roomImg2],
    "isAvailable": true,
    "createdAt": "2025-04-10T06:24:06.285Z",
    "updatedAt": "2025-04-10T06:24:06.285Z",
    "__v": 0
  },
  {
    "_id": "67f763d8197ac559e4089b7a",
    "hotel": hotelDummyData,
    "roomType": "Single Bed",
    "pricePerNight": 199,
    "amenities": ["Free WiFi", "Room Service", "Pool Access"],
    "images": [roomImg4, roomImg1, roomImg2, roomImg3],
    "isAvailable": true,
    "createdAt": "2025-04-10T06:23:20.252Z",
    "updatedAt": "2025-04-10T06:23:20.252Z",
    "__v": 0
  }
]



// User Bookings Dummy Data
export const userBookingsDummyData = [
  {
    "_id": "67f76839994a731e97d3b8ce",
    "user": userDummyData,
    "room": roomsDummyData[1],
    "hotel": hotelDummyData,
    "checkInDate": "2025-04-30T00:00:00.000Z",
    "checkOutDate": "2025-05-01T00:00:00.000Z",
    "totalPrice": 299,
    "guests": 1,
    "status": "pending",
    "paymentMethod": "Stripe",
    "isPaid": true,
    "createdAt": "2025-04-10T06:42:01.529Z",
    "updatedAt": "2025-04-10T06:43:54.520Z",
    "__v": 0
  },
  {
    "_id": "67f76829994a731e97d3b8c3",
    "user": userDummyData,
    "room": roomsDummyData[0],
    "hotel": hotelDummyData,
    "checkInDate": "2025-04-27T00:00:00.000Z",
    "checkOutDate": "2025-04-28T00:00:00.000Z",
    "totalPrice": 399,
    "guests": 1,
    "status": "pending",
    "paymentMethod": "Pay At Hotel",
    "isPaid": false,
    "createdAt": "2025-04-10T06:41:45.873Z",
    "updatedAt": "2025-04-10T06:41:45.873Z",
    "__v": 0
  },
  {
    "_id": "67f76810994a731e97d3b8b4",
    "user": userDummyData,
    "room": roomsDummyData[3],
    "hotel": hotelDummyData,
    "checkInDate": "2025-04-11T00:00:00.000Z",
    "checkOutDate": "2025-04-12T00:00:00.000Z",
    "totalPrice": 199,
    "guests": 1,
    "status": "pending",
    "paymentMethod": "Pay At Hotel",
    "isPaid": false,
    "createdAt": "2025-04-10T06:41:20.501Z",
    "updatedAt": "2025-04-10T06:41:20.501Z",
    "__v": 0
  }
]

// Dashboard Dummy Data
export const dashboardDummyData = {
  "totalBookings": 3,
  "totalRevenue": 897,
  "bookings": userBookingsDummyData
}

// --------- SVG code for Book Icon------
/* 
const BookIcon = ()=>(
    <svg className="w-4 h-4 text-gray-700" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" >
    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 19V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v13H7a2 2 0 0 0-2 2Zm0 0a2 2 0 0 0 2 2h12M9 3v14m7 0v4" />
</svg>
)

*/