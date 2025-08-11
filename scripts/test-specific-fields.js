const Airtable = require('airtable');
require('dotenv').config({ path: '.env.local' });

Airtable.configure({
  endpointUrl: 'https://api.airtable.com',
  apiKey: process.env.AIRTABLE_API_KEY,
});

const base = Airtable.base(process.env.AIRTABLE_BASE_ID);

async function testSpecificFields() {
  console.log('🔍 Testing each field individually...');
  
  const fieldsToTest = [
    'Title',
    'Requester UID',
    'Requestee UID', 
    'Start Time',
    'End Time',
    'Status',
    'Created',
    'Confirmed At',
    'Notes'
  ];
  
  for (const fieldName of fieldsToTest) {
    try {
      console.log(`\n📝 Testing field: "${fieldName}"`);
      
      const testData = {};
      
      // Set appropriate test value based on field type
      if (fieldName === 'Start Time' || fieldName === 'End Time' || fieldName === 'Confirmed At') {
        testData[fieldName] = new Date().toISOString();
      } else if (fieldName === 'Status') {
        testData[fieldName] = 'pending';
      } else if (fieldName === 'Created') {
        // Skip created field as it's auto-filled
        console.log(`   ⏭️  Skipping auto-filled field`);
        continue;
      } else {
        testData[fieldName] = `Test ${fieldName}`;
      }
      
      const result = await base("Meetings").create([{
        fields: testData
      }]);
      
      console.log(`   ✅ Successfully created record with "${fieldName}"`);
      
      // Fetch it back to verify
      const record = await base("Meetings").find(result[0].id);
      const fieldValue = record.fields[fieldName];
      
      if (fieldValue !== undefined) {
        console.log(`   ✅ Field value stored: ${fieldValue}`);
      } else {
        console.log(`   ❌ Field value is undefined - field may not exist`);
      }
      
      // Clean up
      await base("Meetings").destroy([result[0].id]);
      
    } catch (error) {
      console.log(`   ❌ Failed to create record with "${fieldName}": ${error.message}`);
    }
  }
}

testSpecificFields();