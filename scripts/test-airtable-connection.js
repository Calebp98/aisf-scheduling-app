const Airtable = require('airtable');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

Airtable.configure({
  endpointUrl: 'https://api.airtable.com',
  apiKey: process.env.AIRTABLE_API_KEY,
});

const base = Airtable.base(process.env.AIRTABLE_BASE_ID);

async function testConnection() {
  console.log('🧪 Testing Airtable Connection...\n');
  
  try {
    // Test Events table specifically (this is what the app tries first)
    console.log('📅 Testing Events table...');
    
    const events = await base('Events').select({
      fields: ['Name', 'Description', 'Website', 'Start', 'End'],
      maxRecords: 5
    }).firstPage();
    
    console.log(`✅ Found ${events.length} events`);
    
    if (events.length === 0) {
      console.log('⚠️  No events found! The app needs at least one event record.');
      console.log('💡 Add an event with these fields: Name, Description, Website, Start, End');
      return;
    }
    
    events.forEach((event, i) => {
      console.log(`📝 Event ${i + 1}:`, event.fields);
      
      // Check for required fields
      const required = ['Name', 'Start', 'End'];
      const missing = required.filter(field => !event.fields[field]);
      
      if (missing.length > 0) {
        console.log(`❌ Missing required fields: ${missing.join(', ')}`);
      } else {
        console.log(`✅ Event has all required fields`);
      }
    });
    
  } catch (error) {
    console.log('🔥 Error:', error.message);
    
    if (error.message.includes('Could not find table')) {
      console.log('💡 Make sure you have a table named "Events" (case sensitive)');
    } else if (error.message.includes('authentication')) {
      console.log('💡 Check your API key and base ID in .env.local');
    } else if (error.message.includes('field')) {
      console.log('💡 Make sure your Events table has the required fields');
    }
  }
}

testConnection();