const Airtable = require('airtable');
require('dotenv').config({ path: '.env.local' });

Airtable.configure({
  endpointUrl: 'https://api.airtable.com',
  apiKey: process.env.AIRTABLE_API_KEY,
});

const base = Airtable.base(process.env.AIRTABLE_BASE_ID);

async function testSessions() {
  console.log('🧪 Testing Sessions with safe fields only...\n');
  
  try {
    // Test with minimal fields first
    const sessions = await base('Sessions').select({
      fields: ["Title", "Start time", "End time", "Location name", "Capacity"],
      maxRecords: 3
    }).firstPage();
    
    console.log(`✅ Found ${sessions.length} sessions`);
    sessions.forEach((session, i) => {
      console.log(`📋 Session ${i + 1}:`, session.fields);
    });
    
  } catch (error) {
    console.log('🔥 Error:', error.message);
  }
}

testSessions();