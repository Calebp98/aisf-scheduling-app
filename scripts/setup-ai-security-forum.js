const Airtable = require('airtable');
require('dotenv').config({ path: '.env.local' });

Airtable.configure({
  endpointUrl: 'https://api.airtable.com',
  apiKey: process.env.AIRTABLE_API_KEY,
});

const base = Airtable.base(process.env.AIRTABLE_BASE_ID);

async function clearExistingData() {
  console.log('🧹 Clearing existing data...');
  
  const tables = ['RSVPs', 'Sessions', 'Days', 'Guests', 'Locations', 'Events'];
  
  for (const tableName of tables) {
    try {
      const records = await base(tableName).select().firstPage();
      if (records.length > 0) {
        const recordIds = records.map(record => record.id);
        // Delete in chunks of 10 (Airtable limit)
        for (let i = 0; i < recordIds.length; i += 10) {
          const chunk = recordIds.slice(i, i + 10);
          await base(tableName).destroy(chunk);
        }
        console.log(`✅ Cleared ${records.length} records from ${tableName}`);
      }
    } catch (error) {
      console.log(`⚠️  Could not clear ${tableName}:`, error.message);
    }
  }
}

async function setupAISecurityForum() {
  console.log('🚀 Setting up Vegas AI Security Forum \'25...\n');

  try {
    await clearExistingData();

    // 1. Create Event
    console.log('📅 Creating Event...');
    const eventRecords = await base('Events').create([
      {
        fields: {
          Name: 'Vegas AI Security Forum \'25',
          Description: 'A ~200 person event alongside DEF CON 33 bringing together researchers, engineers, and policymakers working to secure AI systems. Core themes: AI model weight security, cyber capability evaluations, hardware-enabled AI governance, AI supply chain security, attacks on AI systems, AI as an insider risk, adversarial ML, threat models.',
          Website: 'https://aisecurityforum.org',
          Start: '2025-08-07T16:00:00.000Z', // 9:00 AM PDT (UTC-7)
          End: '2025-08-08T05:00:00.000Z'   // 10:00 PM PDT
        }
      }
    ]);
    console.log(`✅ Created event: ${eventRecords[0].fields.Name}`);

    // 2. Create Locations
    console.log('🏢 Creating Locations...');
    const locationRecords = await base('Locations').create([
      {
        fields: {
          Name: 'Grand Ballroom 4-6',
          Description: 'Main presentation hall for keynotes and plenaries',
          'Image url': 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800',
          Capacity: 200,
          Color: '#3B82F6',
          Hidden: false,
          Bookable: true,
          Index: 1,
          'Area description': 'Palms Casino Resort, main ballroom'
        }
      },
      {
        fields: {
          Name: 'Harper A-B',
          Description: 'Workshop and breakout session room',
          'Image url': 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
          Capacity: 60,
          Color: '#10B981',
          Hidden: false,
          Bookable: true,
          Index: 2,
          'Area description': 'Palms Casino Resort, conference room A-B'
        }
      },
      {
        fields: {
          Name: 'Harper C-D',
          Description: 'Workshop and breakout session room',
          'Image url': 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
          Capacity: 60,
          Color: '#F59E0B',
          Hidden: false,
          Bookable: true,
          Index: 3,
          'Area description': 'Palms Casino Resort, conference room C-D'
        }
      },
      {
        fields: {
          Name: 'Madison A-C',
          Description: 'Presentation room for technical talks',
          'Image url': 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
          Capacity: 80,
          Color: '#8B5CF6',
          Hidden: false,
          Bookable: true,
          Index: 4,
          'Area description': 'Palms Casino Resort, conference room Madison'
        }
      },
      {
        fields: {
          Name: 'Grand Ballroom 1-3',
          Description: 'Dining and networking space',
          'Image url': 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800',
          Capacity: 200,
          Color: '#EF4444',
          Hidden: false,
          Bookable: true,
          Index: 5,
          'Area description': 'Palms Casino Resort, dining ballroom'
        }
      },
      {
        fields: {
          Name: 'Ballroom Foyer',
          Description: 'Registration and break area',
          'Image url': 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800',
          Capacity: 100,
          Color: '#6B7280',
          Hidden: false,
          Bookable: false,
          Index: 6,
          'Area description': 'Palms Casino Resort, ballroom entrance'
        }
      },
      {
        fields: {
          Name: 'Community Breakout Room',
          Description: 'Open space for community-led sessions and discussions',
          'Image url': 'https://images.unsplash.com/photo-1497366412874-3415097a27e7?w=800',
          Capacity: 30,
          Color: '#000000',
          Hidden: false,
          Bookable: true,
          Index: 7,
          'Area description': 'Palms Casino Resort, dedicated community space'
        }
      }
    ]);
    console.log(`✅ Created ${locationRecords.length} locations`);

    // Create location lookup for easier reference
    const locations = {};
    locationRecords.forEach(loc => {
      locations[loc.fields.Name] = loc.id;
    });

    // 3. Create Day
    console.log('📆 Creating Day...');
    const dayRecords = await base('Days').create([
      {
        fields: {
          Start: '2025-08-07T16:00:00.000Z', // 9:00 AM PDT
          End: '2025-08-08T05:00:00.000Z',   // 10:00 PM PDT
          'Start bookings': '2025-08-07T15:00:00.000Z', // 8:00 AM PDT
          'End bookings': '2025-08-08T06:00:00.000Z'    // 11:00 PM PDT
        }
      }
    ]);
    console.log(`✅ Created conference day`);

    // 4. Create Key Speakers as Guests
    console.log('👥 Creating Speakers...');
    const speakers = [
      { Name: 'Sella Nevo', Email: 'sella@rand.org' },
      { Name: 'Jason Clinton', Email: 'jason@anthropic.com' },
      { Name: 'Joshua Saxe', Email: 'joshua@meta.com' },
      { Name: 'Andrew Carney', Email: 'andrew@darpa.mil' },
      { Name: 'Vy Hong', Email: 'vy@inspect.ai' },
      { Name: 'Philippos Giavridis', Email: 'philippos@inspect.ai' },
      { Name: 'Mauricio Baker', Email: 'mauricio@rand.org' },
      { Name: 'Chris Thompson', Email: 'chris@remotethreat.com' },
      { Name: 'Camille Stewart Gloster', Email: 'camille@security.gov' },
      { Name: 'Robert Duhart, Jr', Email: 'robert@security.gov' },
      { Name: 'Jonathan Happel', Email: 'jonathan@security.com' },
      { Name: 'Will Pearce', Email: 'will@dreadnode.io' },
      { Name: 'Nick Landers', Email: 'nick@dreadnode.io' },
      { Name: 'Wim van der Schoot', Email: 'wim@anthropic.com' },
      { Name: 'Daisy Newbold-Harrop', Email: 'daisy@uksecurity.gov' },
      { Name: 'Buck Shlegeris', Email: 'buck@redwoodresearch.org' },
      { Name: 'Jacob Lagerros', Email: 'jacob@ulyssean.com' },
      { Name: 'Yogev Bar-On', Email: 'yogev@attestable.com' },
      { Name: 'Nora Ammann', Email: 'nora@aria.org.uk' },
      { Name: 'Nicole Nichols', Email: 'nicole@paloaltonetworks.com' },
      { Name: 'Mark Greaves', Email: 'mark@rand.org' },
      { Name: 'Yaron Singer', Email: 'yaron@cisco.com' },
      { Name: 'Alexis Carlier', Email: 'alexis@deepresponse.ai' }
    ];
    
    const guestRecords = [];
    for (let i = 0; i < speakers.length; i += 10) {
      const batch = speakers.slice(i, i + 10);
      const batchRecords = await base('Guests').create(batch.map(speaker => ({ fields: speaker })));
      guestRecords.push(...batchRecords);
      console.log(`✅ Created speakers ${i + 1}-${Math.min(i + 10, speakers.length)}`);
    }

    // 5. Create Sessions
    console.log('📋 Creating Sessions...');
    const sessions = [
      // Morning
      {
        Title: 'Registration & Breakfast',
        Description: 'Welcome breakfast and registration for all attendees',
        'Start time': '2025-08-07T16:00:00.000Z', // 9:00 AM PDT
        'End time': '2025-08-07T17:00:00.000Z',   // 10:00 AM PDT
        Location: [locations['Ballroom Foyer']],
        Capacity: 200,
        'Host email': 'caleb@airiskfund.com'
      },
      {
        Title: 'Opening Plenary',
        Description: 'Welcome and opening remarks from key stakeholders in AI security',
        'Start time': '2025-08-07T17:00:00.000Z', // 10:00 AM PDT
        'End time': '2025-08-07T19:00:00.000Z',   // 12:00 PM PDT
        Location: [locations['Grand Ballroom 4-6']],
        Capacity: 200,
        'Host email': 'sella@rand.org'
      },
      {
        Title: 'Lunch',
        Description: 'Networking lunch for all attendees',
        'Start time': '2025-08-07T19:00:00.000Z', // 12:00 PM PDT
        'End time': '2025-08-07T20:30:00.000Z',   // 1:30 PM PDT
        Location: [locations['Grand Ballroom 1-3']],
        Capacity: 200,
        'Host email': 'caleb@airiskfund.com'
      },
      // 1:30 PM Session Block
      {
        Title: 'Workshop: Building Agentic Evals with Inspect Cyber',
        Description: 'In this hands-on workshop, you\'ll explore Inspect AI\'s capabilities for streamlining agentic evaluation development and build your own eval to run locally with Docker.',
        'Start time': '2025-08-07T20:30:00.000Z', // 1:30 PM PDT
        'End time': '2025-08-07T21:30:00.000Z',   // 2:30 PM PDT
        Location: [locations['Harper C-D']],
        Capacity: 60,
        'Host email': 'vy@inspect.ai'
      },
      {
        Title: 'Workshop: Open Problems in AI Verification and Technical Transparency',
        Description: 'Verifying a compute cluster\'s workloads and results could advance multiple goals, including: preventing model exfiltration, detecting rogue deployments, and verifying international agreements on AI.',
        'Start time': '2025-08-07T20:30:00.000Z', // 1:30 PM PDT
        'End time': '2025-08-07T21:30:00.000Z',   // 2:30 PM PDT
        Location: [locations['Harper A-B']],
        Capacity: 60,
        'Host email': 'mauricio@rand.org'
      },
      {
        Title: 'AI\'s Acceleration Of Cyber & Electronic Warfare',
        Description: 'A primer on targeting model registries and MLOps in cyber/EW warfare, the growing importance of AI in findings and weaponizing vulnerabilities, and the use of AI in offensive cyber operations.',
        'Start time': '2025-08-07T20:30:00.000Z', // 1:30 PM PDT
        'End time': '2025-08-07T21:00:00.000Z',   // 2:00 PM PDT
        Location: [locations['Madison A-C']],
        Capacity: 80,
        'Host email': 'chris@remotethreat.com'
      },
      {
        Title: 'Threat Modeling in the Age of Autonomous Systems (Fireside Chat)',
        Description: 'From prompt exploits to agentic behaviour, how defenders must reshape assumptions, frameworks, and collaboration to meet AI-native threats head-on.',
        'Start time': '2025-08-07T20:30:00.000Z', // 1:30 PM PDT
        'End time': '2025-08-07T21:00:00.000Z',   // 2:00 PM PDT
        Location: [locations['Grand Ballroom 4-6']],
        Capacity: 200,
        'Host email': 'camille@security.gov'
      },
      // 2:00 PM Session Block
      {
        Title: 'Securing AI Infrastructure against Hardware Supply Chain Attacks',
        Description: 'Can supply chains be trusted? This talk highlights how integrity can quietly fail from design to decommission, and why that matters for AI security, compliance, and export controls.',
        'Start time': '2025-08-07T21:00:00.000Z', // 2:00 PM PDT
        'End time': '2025-08-07T21:30:00.000Z',   // 2:30 PM PDT
        Location: [locations['Madison A-C']],
        Capacity: 80,
        'Host email': 'jonathan@security.com'
      },
      {
        Title: 'Offensive AI: Welcome to the Party',
        Description: 'Initially called out in the Biden Executive Order, the capabilities of models to execute offensive security tasks has been hotly debated. This talk will discuss our findings across reversing, multi-step network attacks, bug bounty, threat intel, and more.',
        'Start time': '2025-08-07T21:00:00.000Z', // 2:00 PM PDT
        'End time': '2025-08-07T21:30:00.000Z',   // 2:30 PM PDT
        Location: [locations['Grand Ballroom 4-6']],
        Capacity: 200,
        'Host email': 'will@dreadnode.io'
      },
      // Break
      {
        Title: 'Break',
        Description: 'Coffee and networking break',
        'Start time': '2025-08-07T21:30:00.000Z', // 2:30 PM PDT
        'End time': '2025-08-07T22:00:00.000Z',   // 3:00 PM PDT
        Location: [locations['Ballroom Foyer']],
        Capacity: 200,
        'Host email': 'caleb@airiskfund.com'
      },
      // 3:00 PM Session Block
      {
        Title: 'Workshop: Dreadnode',
        Description: 'Hands-on workshop with Dreadnode security tools and techniques',
        'Start time': '2025-08-07T22:00:00.000Z', // 3:00 PM PDT
        'End time': '2025-08-07T23:00:00.000Z',   // 4:00 PM PDT
        Location: [locations['Harper A-B']],
        Capacity: 60,
        'Host email': 'nick@dreadnode.io'
      },
      {
        Title: 'TTX: Security & AI',
        Description: 'The impact of superhuman AI over the next decade may be enormous, exceeding that of the Industrial Revolution. In this Tabletop exercise, we will explore how Security measures may be critical for AI progress.',
        'Start time': '2025-08-07T22:00:00.000Z', // 3:00 PM PDT
        'End time': '2025-08-07T23:00:00.000Z',   // 4:00 PM PDT
        Location: [locations['Harper C-D']],
        Capacity: 60,
        'Host email': 'wim@anthropic.com'
      },
      {
        Title: 'Beyond CTFs: Evaluating AI Cyber capabilities in Real-World Environments',
        Description: 'This session introduces an innovative approach to assessing AI cyber capabilities through virtualised infrastructure rather than traditional CTF challenges.',
        'Start time': '2025-08-07T22:00:00.000Z', // 3:00 PM PDT
        'End time': '2025-08-07T22:30:00.000Z',   // 3:30 PM PDT
        Location: [locations['Madison A-C']],
        Capacity: 80,
        'Host email': 'philippos@inspect.ai'
      },
      {
        Title: 'Mitigating Insider Threat from AI: A Novel Computer Security Challenge',
        Description: 'AI developers will need to handle the possibility that their AI agents are conspiring against them. This problem has some fundamental structural differences from the most important security problems today.',
        'Start time': '2025-08-07T22:00:00.000Z', // 3:00 PM PDT
        'End time': '2025-08-07T22:30:00.000Z',   // 3:30 PM PDT
        Location: [locations['Grand Ballroom 4-6']],
        Capacity: 200,
        'Host email': 'buck@redwoodresearch.org'
      },
      {
        Title: 'Securing History\'s Greatest Infrastructure Buildout',
        Description: 'Analysis of the unprecedented AI infrastructure expansion and its security implications',
        'Start time': '2025-08-07T22:30:00.000Z', // 3:30 PM PDT
        'End time': '2025-08-07T23:00:00.000Z',   // 4:00 PM PDT
        Location: [locations['Grand Ballroom 4-6']],
        Capacity: 200,
        'Host email': 'jacob@ulyssean.com'
      },
      // 4:00 PM Break
      {
        Title: 'Break',
        Description: 'Afternoon coffee break',
        'Start time': '2025-08-07T23:00:00.000Z', // 4:00 PM PDT
        'End time': '2025-08-07T23:30:00.000Z',   // 4:30 PM PDT
        Location: [locations['Ballroom Foyer']],
        Capacity: 200,
        'Host email': 'caleb@airiskfund.com'
      },
      // 4:30 PM Session Block
      {
        Title: 'Using Zero-Knowledge Proofs for Weight Protection',
        Description: 'Recent breakthroughs in zero-knowledge proof systems pave the way for a new security paradigm, where the computation is cryptographically verified.',
        'Start time': '2025-08-07T23:30:00.000Z', // 4:30 PM PDT
        'End time': '2025-08-08T00:00:00.000Z',   // 5:00 PM PDT
        Location: [locations['Grand Ballroom 4-6']],
        Capacity: 200,
        'Host email': 'yogev@attestable.com'
      },
      {
        Title: 'Workshop: Hardware Enabled Governance',
        Description: 'Workshop on hardware-based approaches to AI governance and compliance',
        'Start time': '2025-08-07T23:30:00.000Z', // 4:30 PM PDT
        'End time': '2025-08-08T00:30:00.000Z',   // 5:30 PM PDT
        Location: [locations['Harper A-B']],
        Capacity: 60,
        'Host email': 'nora@aria.org.uk'
      },
      {
        Title: 'Workshop: Deep Dive on Threats from Using AI Agents for AI R&D',
        Description: 'Using AI agents for AI R&D poses a number of unique threats compared to other applications. Most importantly, these AIs have access to many affordances that developers are very wary about granting to unvetted human employees.',
        'Start time': '2025-08-07T23:30:00.000Z', // 4:30 PM PDT
        'End time': '2025-08-08T00:30:00.000Z',   // 5:30 PM PDT
        Location: [locations['Harper C-D']],
        Capacity: 60,
        'Host email': 'buck@redwoodresearch.org'
      },
      {
        Title: 'Fireside Chat: RAND Report on Securing Model Weights',
        Description: 'Discussion of the latest RAND research on model weight security',
        'Start time': '2025-08-08T00:00:00.000Z', // 5:00 PM PDT
        'End time': '2025-08-08T00:30:00.000Z',   // 5:30 PM PDT
        Location: [locations['Grand Ballroom 4-6']],
        Capacity: 200,
        'Host email': 'nicole@paloaltonetworks.com'
      },
      // 5:30 PM Break
      {
        Title: 'Break',
        Description: 'Evening break before closing sessions',
        'Start time': '2025-08-08T00:30:00.000Z', // 5:30 PM PDT
        'End time': '2025-08-08T01:00:00.000Z',   // 6:00 PM PDT
        Location: [locations['Ballroom Foyer']],
        Capacity: 200,
        'Host email': 'caleb@airiskfund.com'
      },
      // 6:00 PM Session Block
      {
        Title: 'Frontier Models for Cybersecurity',
        Description: 'In this talk we will give an overview of the latest developments in AI for cybersecurity. Over the past decade, there has been a transformation in the world of cybersecurity due to scale of data.',
        'Start time': '2025-08-08T01:00:00.000Z', // 6:00 PM PDT
        'End time': '2025-08-08T01:30:00.000Z',   // 6:30 PM PDT
        Location: [locations['Grand Ballroom 4-6']],
        Capacity: 200,
        'Host email': 'yaron@cisco.com'
      },
      {
        Title: 'Why AI is a critically important tool for AGI security',
        Description: 'AI could be a critically important tool for securing AGI model weights and algorithmic secrets, yet very few projects are using AI to tackle the most important AGI security challenges.',
        'Start time': '2025-08-08T01:00:00.000Z', // 6:00 PM PDT
        'End time': '2025-08-08T01:30:00.000Z',   // 6:30 PM PDT
        Location: [locations['Madison A-C']],
        Capacity: 80,
        'Host email': 'alexis@deepresponse.ai'
      },
      // Closing
      {
        Title: 'Closing Plenary',
        Description: 'Closing remarks and next steps for the AI security community',
        'Start time': '2025-08-08T01:30:00.000Z', // 6:30 PM PDT
        'End time': '2025-08-08T02:15:00.000Z',   // 7:15 PM PDT
        Location: [locations['Grand Ballroom 4-6']],
        Capacity: 200,
        'Host email': 'alexis@deepresponse.ai'
      },
      // Dinner
      {
        Title: 'Buffet Dinner, Drinks, and Networking (Co-sponsored by CoSAI)',
        Description: 'End the day with dinner, drinks, and networking opportunities',
        'Start time': '2025-08-08T02:15:00.000Z', // 7:15 PM PDT
        'End time': '2025-08-08T05:00:00.000Z',   // 10:00 PM PDT
        Location: [locations['Grand Ballroom 1-3']],
        Capacity: 200,
        'Host email': 'caleb@airiskfund.com'
      }
    ];

    // Create sessions in batches
    const sessionRecords = [];
    for (let i = 0; i < sessions.length; i += 10) {
      const batch = sessions.slice(i, i + 10);
      const batchRecords = await base('Sessions').create(batch.map(session => ({ fields: session })));
      sessionRecords.push(...batchRecords);
      console.log(`✅ Created sessions ${i + 1}-${Math.min(i + 10, sessions.length)}`);
    }

    console.log(`\n🎉 Vegas AI Security Forum '25 setup complete!`);
    console.log(`\n📊 Summary:`);
    console.log(`• 1 event: ${eventRecords[0].fields.Name}`);
    console.log(`• ${locationRecords.length} locations at Palms Casino Resort`);
    console.log(`• 1 conference day: August 7, 2025`);
    console.log(`• ${guestRecords.length} speakers and key participants`);
    console.log(`• ${sessionRecords.length} sessions and activities`);
    console.log(`\n🌐 Visit your app to see the complete schedule!`);

  } catch (error) {
    console.error('❌ Error setting up forum:', error.message);
    if (error.statusCode === 422) {
      console.log('💡 This might be because some fields don\'t exist in your tables yet.');
      console.log('💡 Please make sure all required fields are created in Airtable first.');
    }
  }
}

setupAISecurityForum();