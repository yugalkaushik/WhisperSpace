import mongoose from 'mongoose';
import { getMongoUri } from '../utils/env';

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = getMongoUri();
    
    const conn = await mongoose.connect(mongoURI, {
      // Remove deprecated options as they're no longer needed in newer versions
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Fix username index issue
    try {
      const db = conn.connection.db;
      if (db) {
        const collection = db.collection('users');
        
        // Try to drop the unique username index if it exists
        try {
          await collection.dropIndex('username_1');
          console.log('✅ Removed unique constraint from username field');
        } catch (indexError: any) {
          if (indexError.codeName !== 'IndexNotFound') {
            console.log('ℹ️ Username index management:', indexError.message);
          }
        }
      }
    } catch (error) {
      console.log('Index management completed');
    }
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

export default connectDB;