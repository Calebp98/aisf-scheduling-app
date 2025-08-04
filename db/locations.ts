import { base } from "./db";

export type Location = {
  Name: string;
  "Image url": string;
  Description: string;
  Capacity: number;
  ID: string;
  Color: string;
  Hidden: boolean;
  Bookable: boolean;
  "Community Sessions"?: boolean;
  Index: number;
  "Area description"?: string;
};
export async function getLocations() {
  const locations: Location[] = [];
  await base("Locations")
    .select({
      fields: [
        "Name",
        "Image url",
        "Description",
        "Capacity",
        "Color",
        "Hidden",
        "Bookable",
        "Community Sessions",
        "Index",
        "Area description",
      ],
      filterByFormula: `{Hidden} = FALSE()`,
      sort: [{ field: "Index", direction: "asc" }],
    })
    .eachPage(function page(records: any, fetchNextPage: any) {
      records.forEach(function (record: any) {
        locations.push({ ...record.fields, ID: record.id });
      });
      fetchNextPage();
    });
  return locations;
}

export async function getBookableLocations() {
  const locations: Location[] = [];
  await base("Locations")
    .select({
      fields: ["Name", "Capacity", "Color", "Hidden", "Bookable", "Community Sessions"],
      filterByFormula: `AND({Hidden} = FALSE(), {Bookable} = TRUE())`,
      sort: [{ field: "Index", direction: "asc" }],
    })
    .eachPage(function page(records: any, fetchNextPage: any) {
      records.forEach(function (record: any) {
        locations.push({ ...record.fields, ID: record.id });
      });
      fetchNextPage();
    });
  return locations;
}

export async function getCommunitySessionLocations() {
  const locations: Location[] = [];
  await base("Locations")
    .select({
      fields: ["Name", "Capacity", "Color", "Hidden", "Bookable", "Community Sessions"],
      filterByFormula: `AND({Hidden} = FALSE(), {Community Sessions} = TRUE())`,
      sort: [{ field: "Index", direction: "asc" }],
    })
    .eachPage(function page(records: any, fetchNextPage: any) {
      records.forEach(function (record: any) {
        locations.push({ ...record.fields, ID: record.id });
      });
      fetchNextPage();
    });
  return locations;
}
