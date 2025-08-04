import { base } from "./db";
import { CONSTS } from "@/utils/constants";

export type Session = {
  ID: string;
  Title: string;
  Description?: string;
  "Start time": string;
  "End time": string;
  Hosts?: string[];
  "Host name"?: string[];
  "Host email"?: string;
  Location?: string[];
  "Location name"?: string[];
  Capacity?: number;
  "Num RSVPs"?: number;
};
export async function getSessions() {
  const sessions: Session[] = [];
  await base("Sessions")
    .select({
      fields: [
        "Title",
        "Description",
        "Start time",
        "End time",
        "Hosts",
        "Host name",
        "Host email",
        "Location",
        "Location name",
        "Capacity",
      ],
      filterByFormula: `AND({Start time}, {End time})`,
    })
    .eachPage(function page(records: any, fetchNextPage: any) {
      records.forEach(function (record: any) {
        sessions.push({ ...record.fields, ID: record.id });
      });
      fetchNextPage();
    });
  return sessions;
}

export async function getSessionsByEvent(eventName: string) {
  const sessions: Session[] = [];
  const isScheduledFilter = "AND({Start time}, {End time})";
  const filterFormula = CONSTS.MULTIPLE_EVENTS
    ? `AND({Event name} = "${eventName}", ${isScheduledFilter})`
    : isScheduledFilter;
  await base("Sessions")
    .select({
      fields: [
        "Title",
        "Description",
        "Start time",
        "End time",
        "Hosts",
        "Host name",
        "Host email",
        "Location",
        "Location name",
        "Capacity",
      ],
      filterByFormula: filterFormula,
    })
    .eachPage(function page(records: any, fetchNextPage: any) {
      records.forEach(function (record: any) {
        sessions.push({ ...record.fields, ID: record.id });
      });
      fetchNextPage();
    });
  return sessions;
}
