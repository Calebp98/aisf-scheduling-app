const Airtable = require('airtable');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

Airtable.configure({
  endpointUrl: 'https://api.airtable.com',
  apiKey: process.env.AIRTABLE_API_KEY,
});

const base = Airtable.base(process.env.AIRTABLE_BASE_ID);

async function checkSchema() {
  console.log('🔍 Checking Airtable Schema...\n');
  
  const requiredTables = ['Events', 'Sessions', 'Days', 'Locations', 'Guests', 'RSVPs'];
  
  for (const tableName of requiredTables) {
    console.log(`📋 Checking table: ${tableName}`);
    
    try {
      const records = await base(tableName).select({
        maxRecords: 1,
        view: 'Grid view' // Default view name
      }).firstPage();
      
      if (records.length > 0) {
        console.log(`✅ Table '${tableName}' exists`);
        console.log(`📝 Available fields:`, Object.keys(records[0].fields));
        console.log(`📊 Sample record:`, records[0].fields);
      } else {
        console.log(`⚠️  Table '${tableName}' exists but has no records`);
      }
      
    } catch (error) {
      if (error.statusCode === 404) {
        console.log(`❌ Table '${tableName}' not found`);
      } else {
        console.log(`🔥 Error accessing '${tableName}':`, error.message);
      }
    }
    console.log('---');
  }
}

checkSchema().catch(console.error);