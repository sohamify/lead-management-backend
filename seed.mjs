import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Lead from './models/Lead.mjs';
import User from './models/User.mjs';
import connectDB from './config/db.mjs';
import { faker } from '@faker-js/faker';

dotenv.config();

const seedLeads = async () => {
  await connectDB();

  try {
    // find or create test user
    let user = await User.findOne({ email: 'test@example.com' });
    if (!user) {
      user = await User.create({
        email: 'test@example.com', // Test email
        password: 'password123', // Test password
      });
    }

    await Lead.deleteMany({ user: user._id });

    // 100 lead generation
    const leads = Array.from({ length: 100 }, () => ({
      first_name: faker.person.firstName(),
      last_name: faker.person.lastName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      company: faker.company.name(),
      city: faker.location.city(),
      state: faker.location.state(),
      source: faker.helpers.arrayElement(['website', 'facebook_ads', 'google_ads', 'referral', 'events', 'other']),
      status: faker.helpers.arrayElement(['new', 'contacted', 'qualified', 'lost', 'won']),
      score: faker.number.int({ min: 0, max: 100 }),
      lead_value: faker.number.float({ min: 0, max: 10000, precision: 0.01 }),
      last_activity_at: faker.date.recent({ days: 30 }),
      is_qualified: faker.datatype.boolean(),
      user: user._id,
    }));

    await Lead.insertMany(leads);
    console.log('100 leads seeded successfully');
    console.log('Test user credentials:');
    console.log('Email: test@example.com');
    console.log('Password: password123');
  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedLeads();