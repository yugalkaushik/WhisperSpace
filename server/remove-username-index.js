// Script to remove the unique index on username field
const { MongoClient } = require('mongodb');

async function removeUsernameIndex() {
  const client = new MongoClient('mongodb://localhost:27017');
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('whisperspace');
    const collection = db.collection('users');
    
    // List current indexes
    const indexes = await collection.indexes();
    console.log('Current indexes:', indexes);
    
    // Try to drop the username index
    try {
      await collection.dropIndex('username_1');
      console.log('✅ Successfully dropped username_1 index');
    } catch (error) {
      if (error.codeName === 'IndexNotFound') {
        console.log('ℹ️ username_1 index not found (already removed)');
      } else {
        console.error('❌ Error dropping index:', error.message);
      }
    }
    
    // List indexes after removal
    const indexesAfter = await collection.indexes();
    console.log('Indexes after removal:', indexesAfter);
    
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
  } finally {
    await client.close();
    console.log('Database connection closed');
  }
}

removeUsernameIndex();
