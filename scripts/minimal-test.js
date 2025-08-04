const Airtable = require('airtable');
require('dotenv').config({ path: '.env.local' });

Airtable.configure({
  endpointUrl: 'https://api.airtable.com',
  apiKey: process.env.AIRTABLE_API_KEY,
});

const base = Airtable.base(process.env.AIRTABLE_BASE_ID);

async function minimalTest() {
  console.log('🧪 Testing with minimal fields only...\n');
  
  try {
    // Test with just the basic fields
    console.log('📅 Testing Events...');
    const events = await base('Events').select({
      fields: ['Name', 'Start', 'End'],
      maxRecords: 1
    }).firstPage();
    
    console.log('✅ Events work:', events.length);
    
    console.log('📋 Testing Sessions...');
    const sessions = await base('Sessions').select({
      fields: ['Title', 'Start time', 'End time'],
      maxRecords: 1
    }).firstPage();
    
    console.log('✅ Sessions work:', sessions.length);
    
    console.log('🏢 Testing Locations...');
    const locations = await base('Locations').select({
      maxRecords: 1
    }).firstPage();
    
    console.log('✅ Locations work:', locations.length);
    
  } catch (error) {
    console.log('🔥 Error:', error.message);
  }
}

minimalTest();