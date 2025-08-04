import { base } from "./db";

export type MinimalEvent = {
  Name: string;
  Description?: string;
  Website?: string;
  Start: string;
  End: string;
};

export async function getMinimalEvents() {
  const events: MinimalEvent[] = [];
  try {
    await base("Events")
      .select({
        fields: ["Name", "Description", "Website", "Start", "End"],
        maxRecords: 10
      })
      .eachPage(function page(records: any, fetchNextPage: any) {
        records.forEach(function (record: any) {
          // Only add events with required fields
          if (record.fields.Name && record.fields.Start && record.fields.End) {
            events.push(record.fields);
          }
        });
        fetchNextPage();
      });
  } catch (error) {
    console.error('Error fetching events:', error);
  }
  return events;
}