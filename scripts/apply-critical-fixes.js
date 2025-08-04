#!/usr/bin/env node

/**
 * Critical Schema Fixes
 * 
 * This script applies immediate fixes for the most critical schema mismatches
 * that are preventing the app from working.
 */

const fs = require('fs');
const path = require('path');

function applyFix(filePath, searchText, replaceText, description) {
  console.log(`🔧 ${description}`);
  console.log(`   File: ${filePath}`);
  
  try {
    const fullPath = path.resolve(filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`   ❌ File not found: ${fullPath}`);
      return false;
    }
    
    const content = fs.readFileSync(fullPath, 'utf8');
    
    if (!content.includes(searchText)) {
      console.log(`   ⚠️  Search text not found - may already be fixed`);
      return false;
    }
    
    const newContent = content.replace(searchText, replaceText);
    fs.writeFileSync(fullPath, newContent, 'utf8');
    
    console.log(`   ✅ Applied successfully`);
    return true;
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return false;
  }
}

function applyCriticalFixes() {
  console.log('🚨 APPLYING CRITICAL SCHEMA FIXES');
  console.log('=' .repeat(60));
  console.log('These fixes address the most critical issues preventing the app from running.\n');
  
  let fixCount = 0;
  
  // Fix 1: Remove the problematic "Attendee scheduled" field
  console.log('1. Removing "Attendee scheduled" field from session creation');
  const fix1Success = applyFix(
    'app/api/add-session/route.ts',
    '    "Attendee scheduled": true,',
    '    // "Attendee scheduled": true, // REMOVED: Field doesn\'t exist in Airtable',
    'Commenting out non-existent "Attendee scheduled" field'
  );
  if (fix1Success) fixCount++;
  
  console.log('');
  
  // Fix 2: Update SessionInsert type to remove the problematic field
  console.log('2. Updating SessionInsert type definition');
  const fix2Success = applyFix(
    'app/api/add-session/route.ts',
    '  "Attendee scheduled": boolean;',
    '  // "Attendee scheduled": boolean; // REMOVED: Field doesn\'t exist in Airtable',
    'Commenting out "Attendee scheduled" from type definition'
  );
  if (fix2Success) fixCount++;
  
  console.log('');
  
  // Fix 3: Update Sessions type to match actual schema
  console.log('3. Checking Sessions type definition');
  const sessionsTypePath = 'db/sessions.ts';
  try {
    const sessionsContent = fs.readFileSync(sessionsTypePath, 'utf8');
    console.log(`   📋 Current Sessions type in ${sessionsTypePath}:`);
    
    // Extract the Session type definition
    const typeMatch = sessionsContent.match(/export type Session = \{([\s\S]*?)\};/);
    if (typeMatch) {
      console.log('   ' + typeMatch[0].split('\n').join('\n   '));
      console.log('   💡 You may need to manually update this type to match actual Airtable fields');
    }
  } catch (error) {
    console.log(`   ⚠️  Could not read ${sessionsTypePath}: ${error.message}`);
  }
  
  console.log('');
  
  // Summary
  console.log('📊 SUMMARY');
  console.log('=' .repeat(30));
  console.log(`✅ Applied ${fixCount} critical fixes`);
  
  if (fixCount > 0) {
    console.log('\n🎉 Critical fixes applied! You should now be able to:');
    console.log('   • Start the development server without "Attendee scheduled" errors');
    console.log('   • Create sessions (though some fields may not work as expected)');
    console.log('');
    console.log('🔄 Next steps:');
    console.log('   1. Test the app: npm run dev');
    console.log('   2. Check the schema analysis report for remaining issues');
    console.log('   3. Update other field mappings as needed');
  } else {
    console.log('\n⚠️  No fixes were applied. This could mean:');
    console.log('   1. The files have already been fixed');
    console.log('   2. The file paths have changed');
    console.log('   3. The problematic code has been moved elsewhere');
  }
  
  console.log('\n📋 For a complete analysis, see: scripts/schema-analysis-report.md');
}

// Execute the fixes
applyCriticalFixes();