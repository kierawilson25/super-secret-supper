const TIME_LABELS: Record<string, string> = {
  breakfast: 'Breakfast (8–10am)',
  lunch: 'Lunch (12–2pm)',
  dinner: 'Dinner (6–9pm)',
  late_night: 'Late Night (9pm+)',
};

export const availabilityConfirmationContent = {
  title: 'Availability Saved',
  subtitle: "You're all set! We'll reach out once pairings are confirmed.",

  yourSection: {
    title: 'Your Availability',
  },

  noAvailability: 'No dates selected.',

  partnerSection: {
    title: (name: string) => `${name}'s Availability`,
    noSlots: "They haven't submitted availability yet.",
  },

  waitingState: {
    title: 'Waiting for Pairings',
    description: "Your availability has been saved. Once the admin creates pairings, you'll be able to see your dinner partner's schedule here.",
  },

  errorState: {
    title: 'Could Not Load Partner Availability',
    description: "There was a problem fetching your partner's schedule. Try refreshing the page.",
  },

  buttons: {
    returnToGroup: 'Back to Group',
    edit: 'Edit Availability',
  },

  timeLabel: (slot: string) => TIME_LABELS[slot] ?? slot,
};
