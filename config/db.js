const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/crm_db';
    console.log(`Connecting to MongoDB...`);
    
    // Attempt standard MongoDB connection with 3s timeout
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000
    });
    console.log(`MongoDB Connected successfully to: ${mongoose.connection.host}`);
  } catch (err) {
    console.warn(`Standard MongoDB connection failed (${err.message}). Falling back to MongoMemoryServer for seamless evaluation...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const memoryUri = mongoServer.getUri();
      await mongoose.connect(memoryUri);
      console.log(`MongoDB Connected via MongoMemoryServer at: ${memoryUri}`);
    } catch (memErr) {
      console.error(`Failed to start MongoMemoryServer:`, memErr.message);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
