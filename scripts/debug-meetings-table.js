const Airtable = require('airtable');
require('dotenv').config({ path: '.env.local' });

Airtable.configure({
  endpointUrl: 'https://api.airtable.com',
  apiKey: process.env.AIRTABLE_API_KEY,
});

const base = Airtable.base(process.env.AIRTABLE_BASE_ID);

async function debugMeetingsTable() {
  console.log('🔍 Debugging Meetings table...');
  
  try {
    // Try to get first record to see what fields exist
    const records = await base('Meetings').select({ maxRecords: 1 }).firstPage();
    
    if (records.length > 0) {
      console.log('✅ Meetings table found!');
      console.log('📋 Available fields:', Object.keys(records[0].fields));
    } else {
      console.log('✅ Meetings table exists but is empty');
      console.log('💡 Try adding a test record manually in Airtable to see field structure');
    }
    
  } catch (error) {
    console.error('❌ Error accessing Meetings table:', error.message);
    
    if (error.message.includes('Table not found')) {
      console.log('💡 The "Meetings" table does not exist');
      console.log('💡 Make sure the table name is exactly "Meetings" (case sensitive)');
    }
    
    if (error.message.includes('NOT_AUTHORIZED')) {
      console.log('💡 Check Airtable permissions - the API key may not have access to this table');
    }
  }
}

debugMeetingsTable();