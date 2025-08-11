const Airtable = require('airtable');
require('dotenv').config({ path: '.env.local' });

Airtable.configure({
  endpointUrl: 'https://api.airtable.com',
  apiKey: process.env.AIRTABLE_API_KEY,
});

const base = Airtable.base(process.env.AIRTABLE_BASE_ID);

async function addFirebaseUIDField() {
  console.log('🔧 Adding Firebase UID field to RSVPs table...');
  
  try {
    // Test if we can write to the RSVPs table with the new field
    console.log('✅ Note: You need to manually add a "Firebase UID" field to the RSVPs table in Airtable');
    console.log('   - Go to your Airtable base');
    console.log('   - Open the RSVPs table');
    console.log('   - Add a new field called "Firebase UID" of type "Single line text"');
    console.log('   - This will store the Firebase user identifiers');
    
    // Check current RSVPs structure
    const rsvps = await base('RSVPs').select({ maxRecords: 1 }).firstPage();
    if (rsvps.length > 0) {
      console.log('📊 Current RSVP structure:', Object.keys(rsvps[0].fields));
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

addFirebaseUIDField();