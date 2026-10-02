const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/User');
const Lead = require('./models/Lead');

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    console.log('Clearing existing database collections...');
    await User.deleteMany({});
    await Lead.deleteMany({});

    console.log('Creating Admin Account...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = await User.create({
      name: 'Admin Manager',
      email: 'admin@crm.com',
      password: hashedPassword,
      role: 'admin'
    });
    console.log(`✅ Created Admin: ${adminUser.email} / password: admin123`);

    console.log('Inserting sample leads...');
    const sampleLeads = [
      {
        name: 'Sarah Jenkins',
        email: 'sarah.jenkins@techcorp.com',
        phone: '+1 (555) 234-5678',
        company: 'TechCorp Solutions',
        source: 'Website Contact Form',
        status: 'New',
        value: 12500,
        message: 'Interested in enterprise CRM integration and team training.',
        notes: [
          { content: 'Lead submitted form requesting demo pricing.', author: 'System' }
        ],
        followups: [
          { title: 'Send Product Demo & Pricing Deck', date: new Date(Date.now() + 86400000), status: 'Pending', notes: 'Prepare custom quote for 25 seats' }
        ]
      },
      {
        name: 'Michael Chang',
        email: 'm.chang@innovatelabs.io',
        phone: '+1 (555) 876-5432',
        company: 'Innovate Labs',
        source: 'Referral',
        status: 'Contacted',
        value: 8400,
        message: 'Referred by Dave from Apex Ventures.',
        notes: [
          { content: 'Initial discovery call completed. Expressed strong interest in reporting dashboard.', author: 'Admin Manager' }
        ],
        followups: [
          { title: 'Follow-up Call regarding API capabilities', date: new Date(Date.now() + 172800000), status: 'Pending', notes: 'Connect with technical lead' }
        ]
      },
      {
        name: 'Elena Rostova',
        email: 'elena@growthagency.co',
        phone: '+1 (555) 345-6789',
        company: 'Growth Agency Co',
        source: 'Social Media',
        status: 'In Discussion',
        value: 18000,
        message: 'Looking for a client management system for our digital marketing agency.',
        notes: [
          { content: 'Sent contract proposal v1. Awaiting security team approval.', author: 'Admin Manager' }
        ],
        followups: [
          { title: 'Contract Review Call', date: new Date(Date.now() + 259200000), status: 'Pending', notes: 'Finalize SLA terms' }
        ]
      },
      {
        name: 'David Miller',
        email: 'david@nexuslogistics.com',
        phone: '+1 (555) 901-2345',
        company: 'Nexus Logistics',
        source: 'Direct',
        status: 'Converted',
        value: 25000,
        message: 'Urgent deployment needed for 50 sales agents.',
        notes: [
          { content: 'Deal closed! Annual subscription signed.', author: 'Admin Manager' }
        ],
        followups: [
          { title: 'Onboarding kick-off meeting', date: new Date(Date.now() - 86400000), status: 'Completed', notes: 'Successfully completed onboarding' }
        ]
      },
      {
        name: 'Jessica Taylor',
        email: 'jessica@blueocean.org',
        phone: '+1 (555) 432-1098',
        company: 'Blue Ocean Consulting',
        source: 'Website Contact Form',
        status: 'Lost',
        value: 5000,
        message: 'Inquiring about basic plan.',
        notes: [
          { content: 'Client selected internal alternative due to budget constraints.', author: 'Admin Manager' }
        ],
        followups: []
      }
    ];

    const createdLeads = await Lead.insertMany(sampleLeads);
    console.log(`✅ Successfully seeded ${createdLeads.length} sample leads!`);
    console.log('====================================================');
    console.log('Seeding completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
};

seedData();
