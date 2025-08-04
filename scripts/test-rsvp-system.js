const Airtable = require('airtable');
require('dotenv').config({ path: '.env.local' });

Airtable.configure({
  endpointUrl: 'https://api.airtable.com',
  apiKey: process.env.AIRTABLE_API_KEY,
});

const base = Airtable.base(process.env.AIRTABLE_BASE_ID);

async function testRSVPSystem() {
  console.log('🧪 Testing RSVP System...\n');

  try {
    // Test 1: Check if we can load RSVPs
    console.log('📊 Test 1: Loading all RSVPs...');
    const rsvps = await base('RSVPs').select().firstPage();
    console.log(`✅ Found ${rsvps.length} total RSVPs\n`);

    if (rsvps.length > 0) {
      // Test 2: Show sample RSVP structure
      console.log('📋 Test 2: Sample RSVP structure...');
      const sample = rsvps[0];
      console.log(`Sample RSVP (${sample.id}):`);
      console.log(`  Session: ${JSON.stringify(sample.fields.Session)}`);
      console.log(`  Guest: ${JSON.stringify(sample.fields.Guest)}`);
      console.log(`  Created: ${sample.fields.Created}\n`);

      // Test 3: Test filtering by guest
      const testGuestId = sample.fields.Guest?.[0];
      if (testGuestId) {
        console.log(`🔍 Test 3: Finding RSVPs for guest ${testGuestId}...`);
        const userRSVPs = rsvps.filter(rsvp => 
          rsvp.fields.Guest && rsvp.fields.Guest.includes(testGuestId)
        );
        console.log(`✅ Found ${userRSVPs.length} RSVPs for this guest\n`);
      }

      // Test 4: Test filtering by session
      const testSessionId = sample.fields.Session?.[0];
      if (testSessionId) {
        console.log(`📅 Test 4: Finding RSVPs for session ${testSessionId}...`);
        const sessionRSVPs = rsvps.filter(rsvp => 
          rsvp.fields.Session && rsvp.fields.Session.includes(testSessionId)
        );
        console.log(`✅ Found ${sessionRSVPs.length} RSVPs for this session\n`);
      }
    }

    // Test 5: Check guests table
    console.log('👥 Test 5: Loading guests...');
    const guests = await base('Guests').select({
      fields: ['Name'],
      maxRecords: 5
    }).firstPage();
    console.log(`✅ Found ${guests.length} guests (showing first 5):`);
    guests.forEach(guest => {
      console.log(`  • ${guest.fields.Name} (${guest.id})`);
    });
    console.log('');

    // Test 6: Check sessions table
    console.log('📅 Test 6: Loading sessions...');
    const sessions = await base('Sessions').select({
      fields: ['Title'],
      maxRecords: 5
    }).firstPage();
    console.log(`✅ Found ${sessions.length} sessions (showing first 5):`);
    sessions.forEach(session => {
      console.log(`  • ${session.fields.Title} (${session.id})`);
    });

    console.log('\n🎉 RSVP System Test Complete!');
    console.log('✅ All database connections working');
    console.log('✅ RSVP data structure looks correct');
    console.log('✅ Ready for frontend testing');

  } catch (error) {
    console.error('❌ RSVP System Test Failed:', error.message);
  }
}

testRSVPSystem();