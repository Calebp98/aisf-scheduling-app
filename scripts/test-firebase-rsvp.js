const Airtable = require('airtable');
require('dotenv').config({ path: '.env.local' });

Airtable.configure({
  endpointUrl: 'https://api.airtable.com',
  apiKey: process.env.AIRTABLE_API_KEY,
});

const base = Airtable.base(process.env.AIRTABLE_BASE_ID);

async function testFirebaseRSVP() {
  console.log('🧪 Testing Firebase RSVP system...');
  
  try {
    // Test creating an RSVP with Firebase UID
    console.log('1. Testing RSVP creation with Firebase UID...');
    
    const testUID = 'test-firebase-uid-123';
    const testSessionId = 'recEyVzMzFQlfCALd'; // Opening Plenary session
    
    const result = await base("RSVPs").create([
      {
        fields: {
          Session: [testSessionId],
          'Firebase UID': testUID
        }
      }
    ]);
    
    const newRSVPId = result[0].id;
    console.log(`✅ Test RSVP created: ${newRSVPId}`);
    
    // Test reading RSVPs with Firebase UID
    console.log('2. Testing RSVP reading...');
    const rsvps = await base('RSVPs').select({
      fields: ['Session', 'Guest', 'Firebase UID', 'Created']
    }).firstPage();
    
    console.log(`📊 Found ${rsvps.length} RSVPs`);
    const firebaseRSVPs = rsvps.filter(r => r.fields['Firebase UID']);
    console.log(`🔥 Firebase RSVPs: ${firebaseRSVPs.length}`);
    
    if (firebaseRSVPs.length > 0) {
      console.log('Sample Firebase RSVP:', {
        id: firebaseRSVPs[0].id,
        session: firebaseRSVPs[0].fields.Session,
        firebaseUID: firebaseRSVPs[0].fields['Firebase UID']
      });
    }
    
    // Clean up test RSVP
    console.log('3. Cleaning up test RSVP...');
    await base("RSVPs").destroy([newRSVPId]);
    console.log(`✅ Test RSVP deleted: ${newRSVPId}`);
    
    console.log('🎉 Firebase RSVP system test passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.message.includes('Unknown field name')) {
      console.log('💡 Make sure you added the "Firebase UID" field to the RSVPs table in Airtable');
    }
  }
}

testFirebaseRSVP();