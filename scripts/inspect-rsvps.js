#!/usr/bin/env node

/**
 * RSVP Table Inspector
 * 
 * Since the RSVPs table was empty, this script will try to inspect its structure
 * using the Airtable metadata API or create a test record to see the fields.
 */

require('dotenv').config({ path: '.env.local' });
const Airtable = require('airtable');

// Configure Airtable
Airtable.configure({
  endpointUrl: 'https://api.airtable.com',
  apiKey: process.env.AIRTABLE_API_KEY,
});

const base = Airtable.base(process.env.AIRTABLE_BASE_ID);

async function inspectRSVPs() {
  console.log('🔍 RSVP TABLE INSPECTION');
  console.log('=' .repeat(50));
  
  try {
    // First try to get any existing records
    console.log('🔄 Checking for existing RSVP records...');
    const existingRecords = await base('RSVPs').select({ maxRecords: 5 }).firstPage();
    
    if (existingRecords.length > 0) {
      console.log(`✅ Found ${existingRecords.length} existing RSVP records`);
      const allFields = new Set();
      existingRecords.forEach(record => {
        Object.keys(record.fields).forEach(field => allFields.add(field));
      });
      
      console.log('\n📊 RSVP Table Fields:');
      Array.from(allFields).sort().forEach(field => {
        const sampleValue = existingRecords[0].fields[field];
        const valueType = Array.isArray(sampleValue) ? 'Array' : typeof sampleValue;
        console.log(`  • ${field} (${valueType}): ${sampleValue}`);
      });
      
      return;
    }
    
    console.log('⚠️  No existing RSVP records found');
    
    // Get some session and guest IDs to create a test record
    console.log('\n🔄 Getting sample Session and Guest IDs...');
    
    const [sessions, guests] = await Promise.all([
      base('Sessions').select({ maxRecords: 1 }).firstPage(),
      base('Guests').select({ maxRecords: 1 }).firstPage()
    ]);
    
    if (sessions.length === 0 || guests.length === 0) {
      console.log('❌ Cannot create test RSVP - missing Sessions or Guests');
      return;
    }
    
    const sessionId = sessions[0].id;
    const guestId = guests[0].id;
    
    console.log(`📋 Using Session ID: ${sessionId}`);
    console.log(`👤 Using Guest ID: ${guestId}`);
    
    // Try to create a test RSVP record to see what fields exist
    console.log('\n🧪 Creating test RSVP to inspect table structure...');
    
    const testRSVP = await base('RSVPs').create([
      {
        fields: {
          Session: [sessionId],
          Guest: [guestId]
        }
      }
    ]);
    
    console.log('✅ Test RSVP created successfully!');
    console.log('\n📊 RSVP Table Structure:');
    Object.entries(testRSVP[0].fields).forEach(([field, value]) => {
      const valueType = Array.isArray(value) ? 'Array' : typeof value;
      console.log(`  • ${field} (${valueType}): ${value}`);
    });
    
    // Clean up the test record
    console.log('\n🧹 Cleaning up test record...');
    await base('RSVPs').destroy([testRSVP[0].id]);
    console.log('✅ Test record deleted');
    
  } catch (error) {
    console.log(`❌ Error inspecting RSVPs: ${error.message}`);
    
    // If the error suggests field doesn't exist, try different field names
    if (error.message.includes('Session') || error.message.includes('Guest')) {
      console.log('\n💡 Trying alternative field names...');
      
      // Try common alternative field names
      const alternatives = [
        { Session: 'Sessions', Guest: 'Guests' },
        { Session: 'session', Guest: 'guest' },
        { Session: 'Session ID', Guest: 'Guest ID' },
        { Session: 'session_id', Guest: 'guest_id' }
      ];
      
      for (const alt of alternatives) {
        try {
          console.log(`🧪 Trying: Session="${alt.Session}", Guest="${alt.Guest}"`);
          const testFields = {};
          testFields[alt.Session] = [sessions[0].id];
          testFields[alt.Guest] = [guests[0].id];
          
          const testRSVP = await base('RSVPs').create([{ fields: testFields }]);
          
          console.log(`✅ Success! Correct field names are:`);
          console.log(`  • Session field: "${alt.Session}"`);
          console.log(`  • Guest field: "${alt.Guest}"`);
          
          // Show the actual record structure
          console.log('\n📊 Actual RSVP record structure:');
          Object.entries(testRSVP[0].fields).forEach(([field, value]) => {
            const valueType = Array.isArray(value) ? 'Array' : typeof value;
            console.log(`  • ${field} (${valueType}): ${value}`);
          });
          
          // Clean up
          await base('RSVPs').destroy([testRSVP[0].id]);
          break;
          
        } catch (altError) {
          console.log(`  ❌ ${alt.Session}/${alt.Guest} failed: ${altError.message}`);
        }
      }
    }
  }
}

// Execute the inspection
inspectRSVPs()
  .then(() => {
    console.log('\n✅ RSVP inspection completed!');
  })
  .catch(error => {
    console.error('\n❌ RSVP inspection failed:', error);
  });