// server/utils/recommendation.js
import _ from "lodash";

/* --- helpers --- */
export function normalizeArray(arr) {
    if (!arr || arr.length === 0) return [];
    const min = Math.min(...arr);
    const max = Math.max(...arr);
    if (max === min) return arr.map(() => 0.5);
    return arr.map(v => (v - min) / (max - min));
}

export function cosineSim(a, b) {
    const dot = a.reduce((s, ai, i) => s + ai * (b[i] || 0), 0);
    const na = Math.sqrt(a.reduce((s, v) => s + v * v, 0));
    const nb = Math.sqrt(b.reduce((s, v) => s + v * v, 0));
    if (na === 0 || nb === 0) return 0;
    return dot / (na * nb);
}

export function buildVocab(docs, getter) {
    const set = new Set();
    docs.forEach(d => {
        const v = getter(d);
        if (Array.isArray(v)) v.forEach(x => set.add(String(x).trim()));
        else if (v != null) set.add(String(v).trim());
    });
    return Array.from(set);
}

export function roomToVector(room, opts) {
    const vec = [];
    const price = Number(room.pricePerNight || room.price || 0);
    vec.push(opts.priceNormalizer(price));

    const adults = Number(room.maxAdults || room.maxGuests || 0);
    vec.push(opts.adultsNormalizer(adults));

    const type = String(room.roomType || room.type || "").trim();
    opts.typeVocab.forEach(t => vec.push(t === type ? 1 : 0));

    const city = String((room.hotel && (room.hotel.city || room.hotelCity)) || room.hotelCity || '').trim();
    opts.cityVocab.forEach(c => vec.push(c === city ? 1 : 0));

    const amenities = Array.isArray(room.amenities) ? room.amenities.map(x => String(x).trim()) : [];
    opts.amenityVocab.forEach(a => vec.push(amenities.includes(a) ? 1 : 0));

    return vec;
}

/* --- chính: getSimilarRooms --- 
   Input:
     - roomsRaw: array room objects (may already have .hotel populated)
     - targetRoomId: id string of room to find similar to
     - topN: number results
   Output: array [{ room, score }]
*/
export function getSimilarRooms(roomsRaw, targetRoomId, topN = 6) {
    // copy plain objects
    const rooms = roomsRaw.map(r => (_.isPlainObject(r) ? r : r.toObject ? r.toObject() : r));

    // vocabs
    const typeVocab = buildVocab(rooms, r => r.roomType || r.type || "");
    const cityVocab = buildVocab(rooms, r => (r.hotel && (r.hotel.city || r.hotelCity)) || r.hotelCity || "");
    const amenityVocab = buildVocab(rooms, r => r.amenities || []);

    // numeric arrays
    const prices = rooms.map(r => Number(r.pricePerNight || r.price || 0) || 0);
    const adultsArr = rooms.map(r => Number(r.maxAdults || r.maxGuests || 0) || 0);

    const priceNormed = normalizeArray(prices);
    const adultsNormed = normalizeArray(adultsArr);

    const priceNormalizer = val => {
        const idx = prices.indexOf(Number(val || 0));
        if (idx >= 0) return priceNormed[idx];
        const min = Math.min(...prices), max = Math.max(...prices);
        if (max === min) return 0.5;
        return (val - min) / (max - min);
    };

    const adultsNormalizer = val => {
        const idx = adultsArr.indexOf(Number(val || 0));
        if (idx >= 0) return adultsNormed[idx];
        const min = Math.min(...adultsArr), max = Math.max(...adultsArr);
        if (max === min) return 0.5;
        return (val - min) / (max - min);
    };

    const opts = { priceNormalizer, adultsNormalizer, typeVocab, cityVocab, amenityVocab };

    const vectors = rooms.map(r => roomToVector(r, opts));

    const targetIndex = rooms.findIndex(r => String(r._id) === String(targetRoomId));
    if (targetIndex === -1) return [];

    const scores = rooms.map((r, i) => {
        if (i === targetIndex) return { idx: i, score: -1 };
        return { idx: i, score: cosineSim(vectors[targetIndex], vectors[i]) };
    });

    const sorted = scores.sort((a, b) => b.score - a.score).slice(0, topN);

    return sorted.map(s => ({ room: rooms[s.idx], score: s.score }));
}
