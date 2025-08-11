const Airtable = require('airtable');
require('dotenv').config({ path: '.env.local' });

Airtable.configure({
  endpointUrl: 'https://api.airtable.com',
  apiKey: process.env.AIRTABLE_API_KEY,
});

const base = Airtable.base(process.env.AIRTABLE_BASE_ID);

async function testMeetingsSystem() {
  console.log('🧪 Testing 1:1 Meetings System...');
  
  try {
    // Test 1: Create a meeting request
    console.log('1. Testing meeting request creation...');
    
    const testRequesterUID = 'test-requester-123';
    const testRequesteeUID = 'test-requestee-456';
    const testStartTime = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // Tomorrow
    const testEndTime = new Date(Date.now() + 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(); // +30 mins
    
    const result = await base("Meetings").create([
      {
        fields: {
          'Requester UID': testRequesterUID,
          'Requestee UID': testRequesteeUID,
          'Start Time': testStartTime,
          'End Time': testEndTime,
          'Status': 'pending',
          'Title': 'Test 1:1 Meeting',
          'Notes': 'This is a test meeting request'
        }
      }
    ]);
    
    const newMeetingId = result[0].id;
    console.log(`✅ Test meeting created: ${newMeetingId}`);
    
    // Test 2: Check meeting structure
    console.log('2. Testing meeting reading...');
    const meetings = await base('Meetings').select({
      fields: [
        'Requester UID',
        'Requestee UID', 
        'Start Time',
        'End Time',
        'Status',
        'Created',
        'Title',
        'Notes'
      ]
    }).firstPage();
    
    console.log(`📊 Found ${meetings.length} total meetings`);
    if (meetings.length > 0) {
      const sample = meetings[0];
      console.log('Sample meeting:', {
        id: sample.id,
        requester: sample.fields['Requester UID'],
        requestee: sample.fields['Requestee UID'],
        status: sample.fields.Status,
        startTime: sample.fields['Start Time'],
        title: sample.fields.Title
      });
    }
    
    // Test 3: Update meeting status (confirm)
    console.log('3. Testing meeting confirmation...');
    await base("Meetings").update([
      {
        id: newMeetingId,
        fields: {
          Status: 'confirmed',
          'Confirmed At': new Date().toISOString()
        }
      }
    ]);
    console.log(`✅ Meeting confirmed: ${newMeetingId}`);
    
    // Test 4: Clean up
    console.log('4. Cleaning up test meeting...');
    await base("Meetings").destroy([newMeetingId]);
    console.log(`✅ Test meeting deleted: ${newMeetingId}`);
    
    console.log('🎉 1:1 Meetings System test passed!');
    console.log('✅ All database operations working correctly');
    console.log('✅ Ready for frontend integration');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.message.includes('Table not found')) {
      console.log('💡 Make sure you created the "Meetings" table in Airtable');
      console.log('💡 Run: node scripts/setup-meetings-table.js for instructions');
    }
    
    if (error.message.includes('Unknown field name')) {
      console.log('💡 Make sure all required fields are added to the Meetings table');
      console.log('💡 Check the setup script for the complete field list');
    }
  }
}

testMeetingsSystem();