const fetch = require('node-fetch');

async function testMeetingCreation() {
  console.log('🧪 Testing meeting creation API...');
  
  const testData = {
    action: "create-request",
    requesterUID: "test-requester-123",
    requesteeUID: "test-requestee-456", 
    startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
    title: "Test Meeting via API",
    notes: "Testing the API endpoint"
  };
  
  try {
    console.log('📤 Sending request:', testData);
    
    const response = await fetch('http://localhost:3000/api/meetings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    console.log('📊 Response status:', response.status);
    
    const data = await response.json();
    console.log('📥 Response data:', data);
    
    if (data.success) {
      console.log('✅ Meeting creation successful!');
      console.log('🆔 Meeting ID:', data.meetingId);
    } else {
      console.log('❌ Meeting creation failed:', data.error);
    }
    
  } catch (error) {
    console.error('💥 API call failed:', error.message);
  }
}

testMeetingCreation();