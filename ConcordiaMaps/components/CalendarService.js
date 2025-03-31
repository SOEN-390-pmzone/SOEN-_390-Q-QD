import * as Calendar from "expo-calendar";

/**
 * Fetches the next upcoming calendar event with allowed prefixes.
 * Throws an error if calendar permission is denied.
 */
export async function getNextEvent() {
  // Request calendar permissions.
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  if (status !== "granted") {
    throw new Error("Permission to access calendar denied.");
  }

  const calendars = await Calendar.getCalendarsAsync(
    Calendar.EntityTypes.EVENT,
  );
  if (calendars.length === 0) {
    return null;
  }

  const now = new Date();
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  // Get events for the rest of the day.
  const events = await Calendar.getEventsAsync(
    calendars.map((cal) => cal.id),
    now,
    endOfDay,
  );

  // Filter for upcoming events.
  const upcomingEvents = events.filter(
    (event) => new Date(event.startDate) > now,
  );

  // Sort events by start time.
  const sortedEvents = upcomingEvents.toSorted
    ? upcomingEvents.toSorted(
        (a, b) => new Date(a.startDate) - new Date(b.startDate),
      )
    : [...upcomingEvents].sort(
        (a, b) => new Date(a.startDate) - new Date(b.startDate),
      );

  // Filter events to include only those with titles starting with allowed prefixes.
  const allowedPrefixes = ["SOEN", "COMP", "ENGR"];
  const filteredEvents = sortedEvents.filter((event) => {
    const title = event.title || "";
    return allowedPrefixes.some((prefix) => title.startsWith(prefix));
  });

  return filteredEvents.length > 0 ? filteredEvents[0] : null;
}
