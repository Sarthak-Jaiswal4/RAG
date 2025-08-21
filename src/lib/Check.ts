'use server'
import "dotenv/config"
import { MongoClient }  from 'mongodb'

async function main() {
  const uri = process.env.MONGO_URL;
  if (!uri) {
    console.error('MONGODB_URI not found in env');
    process.exit(1);
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const info = await client.db().admin().serverInfo();
    console.log('MongoDB version:', info.version);
  } catch (err) {
    console.error('Error fetching server info:', err);
  } finally {
    await client.close();
  }
}

main();
