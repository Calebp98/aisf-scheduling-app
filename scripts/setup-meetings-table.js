const Airtable = require('airtable');
require('dotenv').config({ path: '.env.local' });

Airtable.configure({
  endpointUrl: 'https://api.airtable.com',
  apiKey: process.env.AIRTABLE_API_KEY,
});

const base = Airtable.base(process.env.AIRTABLE_BASE_ID);

async function setupMeetingsTable() {
  console.log('🔧 Setting up Meetings table for 1:1 functionality...');
  
  try {
    console.log('✅ You need to manually create the "Meetings" table in Airtable with these fields:');
    console.log('');
    console.log('📋 Required Fields:');
    console.log('   1. "Requester UID" - Single line text (Firebase UID of person requesting)');
    console.log('   2. "Requestee UID" - Single line text (Firebase UID of person being requested)');
    console.log('   3. "Start Time" - Date with time (when meeting starts)');
    console.log('   4. "End Time" - Date with time (when meeting ends)');
    console.log('   5. "Status" - Single select with options: pending, confirmed, declined');
    console.log('   6. "Created" - Date with time (auto-filled creation time)');
    console.log('   7. "Confirmed At" - Date with time (when request was confirmed)');
    console.log('   8. "Title" - Single line text (meeting title, optional)');
    console.log('   9. "Notes" - Long text (meeting notes, optional)');
    console.log('');
    console.log('📝 Instructions:');
    console.log('   - Go to your Airtable base');
    console.log('   - Click "Add a table" and name it "Meetings"');
    console.log('   - Add each field with the specified type');
    console.log('   - For Status field, add the three options: pending, confirmed, declined');
    console.log('   - Set Created field to auto-fill with current date/time');
    
    // Test if we can access the table (will fail until created)
    try {
      const meetings = await base('Meetings').select({ maxRecords: 1 }).firstPage();
      console.log('');
      console.log('🎉 Meetings table found! Current structure:');
      if (meetings.length > 0) {
        console.log('   Fields:', Object.keys(meetings[0].fields));
      } else {
        console.log('   Table exists but is empty - ready for use!');
      }
    } catch (error) {
      console.log('');
      console.log('⚠️  Meetings table not found - please create it first');
      console.log('   Error:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

setupMeetingsTable();