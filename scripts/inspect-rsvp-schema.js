const Airtable = require('airtable');
require('dotenv').config({ path: '.env.local' });

Airtable.configure({
  endpointUrl: 'https://api.airtable.com',
  apiKey: process.env.AIRTABLE_API_KEY,
});

const base = Airtable.base(process.env.AIRTABLE_BASE_ID);

async function inspectRSVPSchema() {
  console.log('🔍 Inspecting RSVPs table schema and recent records...\n');

  try {
    // Get recent RSVP records to see the actual structure
    const records = await base('RSVPs').select({
      maxRecords: 5,
      sort: [{ field: 'Created', direction: 'desc' }]
    }).firstPage();

    if (records.length === 0) {
      console.log('❌ No RSVP records found in the table');
      return;
    }

    console.log(`📊 Found ${records.length} recent RSVP records`);
    console.log('📋 Sample RSVP record structure:\n');

    records.forEach((record, index) => {
      console.log(`--- RSVP Record ${index + 1} (ID: ${record.id}) ---`);
      console.log('Fields:');
      
      Object.keys(record.fields).forEach(fieldName => {
        const value = record.fields[fieldName];
        const type = Array.isArray(value) ? 'array' : typeof value;
        console.log(`  • ${fieldName}: ${JSON.stringify(value)} (${type})`);
      });
      console.log('');
    });

    // Test the current filter logic
    console.log('🧪 Testing current filter logic...');
    
    const testGuestId = records[0].fields.Guest?.[0] || 'test-id';
    console.log(`Testing filter: {Guest} = "${testGuestId}"`);
    
    try {
      const filteredRecords = await base('RSVPs').select({
        filterByFormula: `{Guest} = "${testGuestId}"`,
        maxRecords: 1
      }).firstPage();
      
      console.log(`✅ Filter returned ${filteredRecords.length} records`);
    } catch (filterError) {
      console.log('❌ Filter failed:', filterError.message);
    }

  } catch (error) {
    console.error('❌ Error inspecting RSVPs table:', error.message);
  }
}

inspectRSVPSchema();