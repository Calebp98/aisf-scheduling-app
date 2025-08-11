const Airtable = require('airtable');
require('dotenv').config({ path: '.env.local' });

Airtable.configure({
  endpointUrl: 'https://api.airtable.com',
  apiKey: process.env.AIRTABLE_API_KEY,
});

const base = Airtable.base(process.env.AIRTABLE_BASE_ID);

async function checkFieldNames() {
  console.log('🔍 Checking actual field names in Meetings table...');
  
  try {
    // Get all records to see field structure
    const records = await base('Meetings').select().firstPage();
    
    console.log(`📊 Found ${records.length} records`);
    
    if (records.length > 0) {
      console.log('\n📋 Raw record data:');
      records.forEach((record, index) => {
        console.log(`\nRecord ${index + 1} (ID: ${record.id}):`);
        console.log('Fields:', record.fields);
        console.log('Field names:', Object.keys(record.fields));
      });
    } else {
      console.log('📝 No records found. Let me try to create a test record to see field structure...');
      
      // Try creating a minimal record to trigger field validation
      try {
        const result = await base("Meetings").create([{
          fields: {
            'Title': 'Test Meeting'
          }
        }]);
        console.log('✅ Created test record:', result[0].id);
        
        // Now fetch it back to see what fields are available
        const testRecord = await base("Meetings").find(result[0].id);
        console.log('📋 Available fields:', Object.keys(testRecord.fields));
        
        // Clean up
        await base("Meetings").destroy([result[0].id]);
        console.log('🗑️ Cleaned up test record');
        
      } catch (createError) {
        console.error('❌ Error creating test record:', createError.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkFieldNames();