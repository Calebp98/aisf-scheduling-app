const Airtable = require('airtable');
require('dotenv').config({ path: '.env.local' });

Airtable.configure({
  endpointUrl: 'https://api.airtable.com',
  apiKey: process.env.AIRTABLE_API_KEY,
});

const base = Airtable.base(process.env.AIRTABLE_BASE_ID);

async function populateAirtable() {
  console.log('🚀 Populating Airtable with sample data...\n');

  try {
    // 1. Clear existing data first (optional)
    console.log('📅 Adding Events...');
    const eventRecords = await base('Events').create([
      {
        fields: {
          Name: 'AI Safety Conference 2024',
          Description: 'A comprehensive conference on AI safety research, featuring leading experts and groundbreaking presentations.',
          Website: 'https://aisafety2024.example.com',
          Start: '2024-12-15T09:00:00.000Z',
          End: '2024-12-17T18:00:00.000Z'
        }
      },
      {
        fields: {
          Name: 'Workshop Day',
          Description: 'Hands-on workshops for practical AI safety implementation.',
          Website: 'https://aisafety2024.example.com/workshops',
          Start: '2024-12-18T10:00:00.000Z',
          End: '2024-12-18T16:00:00.000Z'
        }
      }
    ]);
    console.log(`✅ Created ${eventRecords.length} events`);

    // 2. Add Locations
    console.log('🏢 Adding Locations...');
    const locationRecords = await base('Locations').create([
      {
        fields: {
          Name: 'Main Auditorium',
          Description: 'Large auditorium for keynotes and major presentations',
          'Image url': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
          Capacity: 300,
          Color: '#3B82F6',
          Hidden: false,
          Bookable: true,
          Index: 1,
          'Area description': 'Ground floor, accessible entrance'
        }
      },
      {
        fields: {
          Name: 'Workshop Room A',
          Description: 'Interactive workshop space with breakout areas',
          'Image url': 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
          Capacity: 50,
          Color: '#10B981',
          Hidden: false,
          Bookable: true,
          Index: 2,
          'Area description': 'Second floor, room 201'
        }
      },
      {
        fields: {
          Name: 'Networking Lounge',
          Description: 'Casual space for networking and coffee breaks',
          'Image url': 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800',
          Capacity: 80,
          Color: '#F59E0B',
          Hidden: false,
          Bookable: true,
          Index: 3,
          'Area description': 'First floor, near the entrance'
        }
      }
    ]);
    console.log(`✅ Created ${locationRecords.length} locations`);

    // 3. Add Days
    console.log('📆 Adding Days...');
    const dayRecords = await base('Days').create([
      {
        fields: {
          Start: '2024-12-15T09:00:00.000Z',
          End: '2024-12-15T18:00:00.000Z',
          'Start bookings': '2024-12-15T08:00:00.000Z',
          'End bookings': '2024-12-15T19:00:00.000Z'
        }
      },
      {
        fields: {
          Start: '2024-12-16T09:00:00.000Z',
          End: '2024-12-16T18:00:00.000Z',
          'Start bookings': '2024-12-16T08:00:00.000Z',
          'End bookings': '2024-12-16T19:00:00.000Z'
        }
      },
      {
        fields: {
          Start: '2024-12-17T09:00:00.000Z',
          End: '2024-12-17T17:00:00.000Z',
          'Start bookings': '2024-12-17T08:00:00.000Z',
          'End bookings': '2024-12-17T18:00:00.000Z'
        }
      }
    ]);
    console.log(`✅ Created ${dayRecords.length} days`);

    // 4. Add Guests
    console.log('👥 Adding Guests...');
    const guestRecords = await base('Guests').create([
      {
        fields: {
          Name: 'Dr. Sarah Chen',
          Email: 'sarah.chen@example.com'
        }
      },
      {
        fields: {
          Name: 'Prof. Michael Roberts',
          Email: 'michael.roberts@example.com'
        }
      },
      {
        fields: {
          Name: 'Alex Johnson',
          Email: 'alex.johnson@example.com'
        }
      },
      {
        fields: {
          Name: 'Dr. Emily Zhang',
          Email: 'emily.zhang@example.com'
        }
      }
    ]);
    console.log(`✅ Created ${guestRecords.length} guests`);

    // 5. Add Sessions
    console.log('📋 Adding Sessions...');
    const sessionRecords = await base('Sessions').create([
      {
        fields: {
          Title: 'Opening Keynote: The Future of AI Safety',
          Description: 'A comprehensive overview of current challenges and future directions in AI safety research.',
          'Start time': '2024-12-15T09:30:00.000Z',
          'End time': '2024-12-15T10:30:00.000Z',
          Location: [locationRecords[0].id], // Main Auditorium
          Capacity: 300,
          'Host email': 'sarah.chen@example.com'
        }
      },
      {
        fields: {
          Title: 'Workshop: Alignment Techniques',
          Description: 'Hands-on workshop covering practical alignment techniques for large language models.',
          'Start time': '2024-12-15T11:00:00.000Z',
          'End time': '2024-12-15T12:30:00.000Z',
          Location: [locationRecords[1].id], // Workshop Room A
          Capacity: 50,
          'Host email': 'michael.roberts@example.com'
        }
      },
      {
        fields: {
          Title: 'Panel: Industry Perspectives on AI Safety',
          Description: 'Leading industry experts discuss real-world AI safety implementations.',
          'Start time': '2024-12-15T14:00:00.000Z',
          'End time': '2024-12-15T15:30:00.000Z',
          Location: [locationRecords[0].id], // Main Auditorium
          Capacity: 300,
          'Host email': 'alex.johnson@example.com'
        }
      },
      {
        fields: {
          Title: 'Networking Break',
          Description: 'Coffee and networking opportunity with fellow attendees.',
          'Start time': '2024-12-15T15:30:00.000Z',
          'End time': '2024-12-15T16:00:00.000Z',
          Location: [locationRecords[2].id], // Networking Lounge
          Capacity: 80,
          'Host email': 'emily.zhang@example.com'
        }
      },
      {
        fields: {
          Title: 'Research Presentations',
          Description: 'Latest research findings from leading AI safety laboratories.',
          'Start time': '2024-12-16T10:00:00.000Z',
          'End time': '2024-12-16T11:30:00.000Z',
          Location: [locationRecords[0].id], // Main Auditorium
          Capacity: 300,
          'Host email': 'sarah.chen@example.com'
        }
      }
    ]);
    console.log(`✅ Created ${sessionRecords.length} sessions`);

    // 6. Add some sample RSVPs
    console.log('✋ Adding Sample RSVPs...');
    const rsvpRecords = await base('RSVPs').create([
      {
        fields: {
          Session: [sessionRecords[0].id],
          Guest: [guestRecords[1].id]
        }
      },
      {
        fields: {
          Session: [sessionRecords[0].id],
          Guest: [guestRecords[2].id]
        }
      },
      {
        fields: {
          Session: [sessionRecords[1].id],
          Guest: [guestRecords[0].id]
        }
      }
    ]);
    console.log(`✅ Created ${rsvpRecords.length} RSVPs`);

    console.log('\n🎉 Sample data successfully populated!');
    console.log('\n📊 Summary:');
    console.log(`• ${eventRecords.length} events`);
    console.log(`• ${locationRecords.length} locations`);
    console.log(`• ${dayRecords.length} days`);
    console.log(`• ${guestRecords.length} guests`);
    console.log(`• ${sessionRecords.length} sessions`);
    console.log(`• ${rsvpRecords.length} RSVPs`);

  } catch (error) {
    console.error('❌ Error populating data:', error.message);
    if (error.statusCode === 422) {
      console.log('💡 This might be because some fields don\'t exist in your tables yet.');
      console.log('💡 Please make sure all required fields are created in Airtable first.');
    }
  }
}

populateAirtable();