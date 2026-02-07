export type AvailabilityConfig = {
  // 0=Sun, 1=Mon, ... 6=Sat
  openDays: number[];
  startHour: number;      // 24h format, e.g. 9
  endHour: number;        // 24h format, e.g. 17 (5pm)
  slotMinutes: number;    // e.g. 60
  bufferMinutes: number;  // time between jobs
  maxDaysAhead: number;   // how far into future customers can book
};

export const AVAILABILITY: AvailabilityConfig = {
  openDays: [1,2,3,4,5,6],  // Mon–Sat (change anytime)
  startHour: 9,             // 9:00 AM
  endHour: 18,              // 6:00 PM
  slotMinutes: 60,          // 60-min slots
  bufferMinutes: 0,         // add buffer later if desired
  maxDaysAhead: 21,         // 3 weeks ahead
};
