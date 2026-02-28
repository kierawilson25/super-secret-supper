export const availabilityContent = {
  title: 'Availability',
  subtitle: "Tell us when you're free for the next dinner",

  calendar: {
    title: 'Select Available Dates',
    description: 'Tap dates when you could do dinner over the next 30 days.',
    days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  },

  timeSlots: {
    title: 'Time Preferences',
    description: 'Which times work for you on each day?',
    options: [
      { value: 'breakfast', label: 'Breakfast', time: '8–10am' },
      { value: 'lunch', label: 'Lunch', time: '12–2pm' },
      { value: 'dinner', label: 'Dinner', time: '6–9pm' },
      { value: 'late_night', label: 'Late Night', time: '9pm+' },
    ] as const,
  },

  adminSection: {
    title: 'Member Availability',
    submitted: 'Submitted',
    notSubmitted: 'Not submitted',
    summaryOf: (submitted: number, total: number) =>
      `${submitted} of ${total} members have submitted`,
  },

  messages: {
    saved: 'Availability saved!',
    saveError: 'Failed to save. Please try again.',
  },

  buttons: {
    save: 'Save Availability',
    saving: 'Saving...',
  },
};
