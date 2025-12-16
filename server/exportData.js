const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
const csvWriter = require('csv-writer').createObjectCsvWriter;
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'hotelDB';
const COLLECTION = process.env.COLLECTION || 'rooms';

async function exportData() {
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const col = db.collection(COLLECTION);

    const cursor = col.find({}, {
      projection: {
        _id: 0,
        roomType: 1,
        pricePerNight: 1,
        hotelCity: 1,
        roomArea: 1,
        maxAdults: 1,
        maxChildren: 1,
        beds: 1,
        baths: 1,
        amenitiesCount: 1,
        createdAt: 1
      }
    });

    const outPath = path.join(__dirname, '..', 'data', 'room_data.csv');
    await fs.promises.mkdir(path.dirname(outPath), { recursive: true });

    const writer = csvWriter({
      path: outPath,
      header: [
        {id: 'roomType', title: 'roomType'},
        {id: 'pricePerNight', title: 'pricePerNight'},
        {id: 'hotelCity', title: 'hotelCity'},
        {id: 'roomArea', title: 'roomArea'},
        {id: 'maxAdults', title: 'maxAdults'},
        {id: 'maxChildren', title: 'maxChildren'},
        {id: 'beds', title: 'beds'},
        {id: 'baths', title: 'baths'},
        {id: 'amenitiesCount', title: 'amenitiesCount'},
        {id: 'createdAt', title: 'createdAt'}
      ]
    });

    const docs = await cursor.toArray();

    const rows = docs
      .filter(d => d && d.pricePerNight && d.pricePerNight > 0 && d.roomType && d.hotelCity)
      .map(d => ({
        roomType: String(d.roomType),
        pricePerNight: Number(d.pricePerNight),
        hotelCity: String(d.hotelCity),
        roomArea: d.roomArea ?? 0,
        maxAdults: d.maxAdults ?? 1,
        maxChildren: d.maxChildren ?? 0,
        beds: d.beds ?? 1,
        baths: d.baths ?? 1,
        amenitiesCount: d.amenitiesCount ?? 0,
        createdAt: d.createdAt ? new Date(d.createdAt).toISOString() : ''
      }));

    await writer.writeRecords(rows);
    console.log(`Exported ${rows.length} rows to ${outPath}`);
  } catch (err) {
    console.error('Export failed:', err);
  } finally {
    await client.close();
  }
}

exportData();
