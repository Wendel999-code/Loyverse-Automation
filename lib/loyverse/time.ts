export function getLast31DaysExcludingToday() {
  const now = new Date();

  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(now);

  const getPart = (type: string) =>
    Number(
      parts.find((part) => part.type === type)?.value,
    );

  const year = getPart("year");
  const month = getPart("month");
  const day = getPart("day");

  // Start of today in Manila
  const startOfToday = new Date(
    Date.UTC(
      year,
      month - 1,
      day,
      -8,
      0,
      0,
      0,
    ),
  );

  // 31 days before today, at 6:00 AM Manila
  // 6:00 AM Manila = 10:00 PM UTC previous day
  const startDate = new Date(
    Date.UTC(
      year,
      month - 1,
      day - 31,
      -2,
      0,
      0,
      0,
    ),
  );

  // Yesterday 11:59:59.999 PM Manila
  const endDate = new Date(
    startOfToday.getTime() - 1,
  );

  return {
    startDate,
    endDate,
  };
}