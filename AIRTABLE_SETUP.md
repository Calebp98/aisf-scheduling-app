# Airtable Schema Setup Guide

Your Airtable base exists but needs the correct field structure. Here's what you need to add to each table:

## 1. Events Table
Add these fields to your Events table:
- **Name** (Single line text) - Primary field
- **Description** (Long text)
- **Website** (URL)
- **Start** (Date & time) - Include time
- **End** (Date & time) - Include time

For multiple events, also add:
- **Guests** (Link to Guests table)
- **Location names** (Link to Locations table)

## 2. Sessions Table
Add these fields:
- **Title** (Single line text) - Primary field
- **Description** (Long text)
- **Start time** (Date & time) - Include time
- **End time** (Date & time) - Include time
- **Hosts** (Link to Guests table) - Allow multiple
- **Host name** (Lookup from Guests.Name)
- **Host email** (Single line text)
- **Location** (Link to Locations table)
- **Location name** (Lookup from Locations.Name)
- **Capacity** (Number - Integer)
- **Num RSVPs** (Count from RSVPs table)

For multiple events, also add:
- **Event name** (Single line text)

## 3. Days Table
Add these fields:
- **Start** (Date & time) - Include time
- **End** (Date & time) - Include time
- **Start bookings** (Date & time) - Include time
- **End bookings** (Date & time) - Include time

For multiple events, also add:
- **Event name** (Single line text)
- **Event** (Link to Events table)

## 4. Locations Table
Add these fields:
- **Name** (Single line text) - Primary field
- **Image url** (URL)
- **Description** (Long text)
- **Capacity** (Number - Integer)
- **Color** (Single line text) - For hex colors like "#3B82F6"
- **Hidden** (Checkbox) - Default false
- **Bookable** (Checkbox) - Default true
- **Index** (Number - Integer) - For sorting order
- **Area description** (Long text) - Optional

## 5. Guests Table
Add these fields:
- **Name** (Single line text) - Primary field
- **Email** (Email)

For multiple events, also add:
- **Events** (Link to Events table) - Allow multiple

## 6. RSVPs Table
Add these fields:
- **Session** (Link to Sessions table)
- **Guest** (Link to Guests table)

## Quick Setup Steps:
1. Go to each table in your Airtable base
2. Click the "+" button to add new fields
3. Add the fields listed above with the correct field types
4. Delete the "Attachment Summary" field if it exists
5. Add some sample data to test

## Sample Data:
Once fields are set up, add this sample data to test:

**Events:**
- Name: "Test Conference"
- Description: "A test conference"
- Website: "https://example.com"
- Start: Today + 1 week, 9:00 AM
- End: Today + 1 week, 5:00 PM

**Locations:**
- Name: "Main Hall"
- Capacity: 100
- Color: "#3B82F6"
- Hidden: false
- Bookable: true
- Index: 1

**Days:**
- Start: Today + 1 week, 9:00 AM
- End: Today + 1 week, 5:00 PM
- Start bookings: Today + 1 week, 8:00 AM
- End bookings: Today + 1 week, 6:00 PM

**Sessions:**
- Title: "Opening Session"
- Description: "Welcome and introduction"
- Start time: Today + 1 week, 9:30 AM
- End time: Today + 1 week, 10:30 AM
- Location: Link to "Main Hall"
- Capacity: 50