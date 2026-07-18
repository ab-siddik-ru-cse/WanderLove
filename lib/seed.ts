/* eslint-disable no-console */
import path from 'path';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Template } from '@/models/Template';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI as string;

const seedTemplates = [
  {
    mood: 'romantic',
    destinationType: 'city',
    activities: [
      { title: 'Candlelit dinner at a rooftop restaurant', location: 'City center', time: '7:30 PM', cost: 3500, category: 'Food' },
      { title: 'Evening river cruise', location: 'Riverside', time: '5:00 PM', cost: 1800, category: 'Romantic' },
      { title: 'Walk through the old town lanes', location: 'Old town', time: '10:00 AM', cost: 0, category: 'Sightseeing' }
    ]
  },
  {
    mood: 'romantic',
    destinationType: 'beach',
    activities: [
      { title: 'Sunset beach dinner', location: 'Beachfront', time: '6:30 PM', cost: 2800, category: 'Food' },
      { title: 'Couples spa session', location: 'Beach resort spa', time: '2:00 PM', cost: 4000, category: 'Romantic' },
      { title: 'Morning walk along the shore', location: 'Beach', time: '7:00 AM', cost: 0, category: 'Romantic' }
    ]
  },
  {
    mood: 'adventure',
    destinationType: 'mountain',
    activities: [
      { title: 'Guided hiking trail', location: 'Mountain base camp', time: '6:00 AM', cost: 1200, category: 'Adventure' },
      { title: 'Zip-lining through the valley', location: 'Adventure park', time: '11:00 AM', cost: 2200, category: 'Adventure' },
      { title: 'Campfire and stargazing', location: 'Hilltop camp', time: '8:00 PM', cost: 500, category: 'Adventure' }
    ]
  },
  {
    mood: 'adventure',
    destinationType: 'city',
    activities: [
      { title: 'Street food crawl', location: 'Old market', time: '6:00 PM', cost: 900, category: 'Food' },
      { title: 'Bike tour of the city', location: 'City tour start point', time: '9:00 AM', cost: 1500, category: 'Adventure' },
      { title: 'Rooftop escape room', location: 'Downtown', time: '3:00 PM', cost: 1000, category: 'Adventure' }
    ]
  },
  {
    mood: 'relax',
    destinationType: 'beach',
    activities: [
      { title: 'Beach sunbathing and reading', location: 'Beach', time: '10:00 AM', cost: 0, category: 'Relax' },
      { title: 'Sunset yoga session', location: 'Beach yoga deck', time: '5:30 PM', cost: 800, category: 'Relax' },
      { title: 'Seaside massage', location: 'Beach spa', time: '2:00 PM', cost: 3000, category: 'Relax' }
    ]
  },
  {
    mood: 'relax',
    destinationType: 'mountain',
    activities: [
      { title: 'Slow morning with mountain views', location: 'Resort balcony', time: '8:00 AM', cost: 0, category: 'Relax' },
      { title: 'Tea garden walk', location: 'Nearby tea garden', time: '4:00 PM', cost: 300, category: 'Relax' },
      { title: 'Cozy bonfire evening', location: 'Resort courtyard', time: '7:30 PM', cost: 600, category: 'Relax' }
    ]
  }
];

async function seed() {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not set — cannot seed templates.');
  }

  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB, seeding templates...');

  for (const template of seedTemplates) {
    await Template.findOneAndUpdate(
      { mood: template.mood, destinationType: template.destinationType },
      template,
      { upsert: true, new: true }
    );
    console.log(`Seeded: ${template.mood} / ${template.destinationType}`);
  }

  console.log('Done seeding templates.');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
