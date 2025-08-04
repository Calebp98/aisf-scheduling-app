#!/usr/bin/env node

/**
 * Airtable Schema Inspector
 * 
 * This script fetches the complete schema for all tables in the Airtable base
 * to help identify field mismatches between code expectations and actual Airtable structure.
 */

require('dotenv').config({ path: '.env.local' });
const Airtable = require('airtable');

// Configure Airtable
Airtable.configure({
  endpointUrl: 'https://api.airtable.com',
  apiKey: process.env.AIRTABLE_API_KEY,
});

const base = Airtable.base(process.env.AIRTABLE_BASE_ID);

// Tables that the app expects to exist
const expectedTables = ['Events', 'Sessions', 'Days', 'Locations', 'Guests', 'RSVPs'];

// Fields that the app is trying to access
const expectedFields = {
  Sessions: [
    'Title', 'Description', 'Start time', 'End time', 'Duration', 'Location', 
    'Hosts', 'Host name', 'Event', 'Day', 'Attendee scheduled'
  ],
  RSVPs: [
    'Session', 'Guest'
  ],
  Guests: [
    'Name', 'Email', 'Company', 'Event'
  ],
  Events: [
    'Name', 'Slug', 'Timezone', 'Guests'
  ],
  Days: [
    'Name', 'Date', 'Event'
  ],
  Locations: [
    'Name', 'Capacity', 'Color', 'Hidden', 'Bookable', 'Community Sessions'
  ]
};

async function fetchTableSchema(tableName) {
  console.log(`\n🔍 Inspecting table: ${tableName}`);
  console.log('=' .repeat(50));
  
  try {
    // Fetch a small sample of records to see the actual field structure
    const records = await base(tableName).select({
      maxRecords: 3, // Just get a few records to see the field structure
      fields: [] // This will return all fields
    }).firstPage();

    if (records.length === 0) {
      console.log('⚠️  Table is empty - cannot determine field structure');
      return { tableName, fields: [], isEmpty: true };
    }

    // Get all unique field names from the records
    const allFields = new Set();
    records.forEach(record => {
      Object.keys(record.fields).forEach(field => allFields.add(field));
    });

    const actualFields = Array.from(allFields).sort();
    console.log(`📊 Found ${actualFields.length} fields:`);
    
    // Show each field with sample data
    actualFields.forEach(fieldName => {
      const sampleValue = records[0].fields[fieldName];
      const valueType = Array.isArray(sampleValue) ? 'Array' : typeof sampleValue;
      const displayValue = Array.isArray(sampleValue) 
        ? `[${sampleValue.length} items]` 
        : String(sampleValue).length > 50 
          ? String(sampleValue).substring(0, 50) + '...'
          : sampleValue;
      
      console.log(`  • ${fieldName} (${valueType}): ${displayValue}`);
    });

    // Check for missing expected fields
    if (expectedFields[tableName]) {
      const missingFields = expectedFields[tableName].filter(field => !actualFields.includes(field));
      if (missingFields.length > 0) {
        console.log(`\n❌ Missing expected fields:`);
        missingFields.forEach(field => console.log(`  • ${field}`));
      }

      const extraFields = actualFields.filter(field => !expectedFields[tableName].includes(field));
      if (extraFields.length > 0) {
        console.log(`\n➕ Additional fields not expected by code:`);
        extraFields.forEach(field => console.log(`  • ${field}`));
      }
    }

    return { 
      tableName, 
      fields: actualFields, 
      recordCount: records.length,
      sampleRecord: records[0].fields 
    };

  } catch (error) {
    console.log(`❌ Error accessing table: ${error.message}`);
    return { tableName, error: error.message };
  }
}

async function inspectAirtableSchema() {
  console.log('🔍 AIRTABLE SCHEMA INSPECTION');
  console.log('=' .repeat(60));
  console.log(`Base ID: ${process.env.AIRTABLE_BASE_ID}`);
  console.log(`API Key: ${process.env.AIRTABLE_API_KEY ? 'Present' : 'Missing'}`);
  
  const results = {};
  
  // Test each expected table
  for (const tableName of expectedTables) {
    try {
      const result = await fetchTableSchema(tableName);
      results[tableName] = result;
    } catch (error) {
      console.log(`\n❌ Failed to inspect ${tableName}: ${error.message}`);
      results[tableName] = { tableName, error: error.message };
    }
  }

  // Summary section
  console.log('\n\n📋 SUMMARY');
  console.log('=' .repeat(60));
  
  Object.entries(results).forEach(([tableName, result]) => {
    if (result.error) {
      console.log(`❌ ${tableName}: ERROR - ${result.error}`);
    } else if (result.isEmpty) {
      console.log(`⚠️  ${tableName}: EMPTY (${result.fields.length} fields visible)`);
    } else {
      console.log(`✅ ${tableName}: ${result.fields.length} fields, ${result.recordCount} records sampled`);
    }
  });

  // Critical field analysis
  console.log('\n\n🎯 CRITICAL FIELD ANALYSIS');
  console.log('=' .repeat(60));
  
  // Check the problematic "Attendee scheduled" field
  const sessionsResult = results.Sessions;
  if (sessionsResult && !sessionsResult.error) {
    console.log('\n📋 Sessions table field analysis:');
    const hasAttendeeScheduled = sessionsResult.fields.includes('Attendee scheduled');
    console.log(`  • "Attendee scheduled" field: ${hasAttendeeScheduled ? '✅ EXISTS' : '❌ MISSING'}`);
    
    if (!hasAttendeeScheduled) {
      console.log('    💡 Possible alternatives found:');
      const possibleAlternatives = sessionsResult.fields.filter(field => 
        field.toLowerCase().includes('attendee') || 
        field.toLowerCase().includes('scheduled') ||
        field.toLowerCase().includes('schedule')
      );
      if (possibleAlternatives.length > 0) {
        possibleAlternatives.forEach(alt => console.log(`      - "${alt}"`));
      } else {
        console.log('      - No similar fields found');
      }
    }
  }

  // Check RSVPs table structure
  const rsvpsResult = results.RSVPs;
  if (rsvpsResult && !rsvpsResult.error) {
    console.log('\n🎫 RSVPs table field analysis:');
    const hasSession = rsvpsResult.fields.includes('Session');
    const hasGuest = rsvpsResult.fields.includes('Guest');
    console.log(`  • "Session" field: ${hasSession ? '✅ EXISTS' : '❌ MISSING'}`);
    console.log(`  • "Guest" field: ${hasGuest ? '✅ EXISTS' : '❌ MISSING'}`);
  }

  console.log('\n\n💡 RECOMMENDATIONS');
  console.log('=' .repeat(60));
  console.log('1. Review the field names above and update your code to match the actual Airtable fields');
  console.log('2. Pay special attention to fields marked as MISSING - these may cause runtime errors');
  console.log('3. Consider the "Additional fields" as they might provide useful functionality');
  console.log('4. Check field types (array vs string) to ensure proper data handling');

  return results;
}

// Execute the inspection
inspectAirtableSchema()
  .then(() => {
    console.log('\n✅ Schema inspection completed!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Schema inspection failed:', error);
    process.exit(1);
  });