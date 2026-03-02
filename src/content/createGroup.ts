export const createGroupContent = {
  title: 'Create a Circle',
  subtitle: 'Set the vibe for your secret dining crew.',
  labels: {
    groupName: 'Circle Name',
    city: 'City',
    dinnerCadence: 'Dinner Cadence',
    vibeCheck: 'Vibe Check',
    hashtags: 'Hashtags',
  },
  placeholders: {
    groupName: 'e.g. Ramen Heads, The Usual Suspects',
    city: 'What city are you in?',
    vibeCheck: 'e.g. Late night adventurers who never say no to ramen',
  },
  cadenceOptions: [
    { value: 'biweekly', label: 'Biweekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
  ],
  hashtagOptions: [
    '#latenight plates',
    '#cozy vibes',
    '#weeknight bites',
    '#weekend warriors',
    '#foodie deep cuts',
    '#low key hangs',
    '#fine dining curious',
    '#hole in the wall',
  ],
  buttons: {
    create: 'Start the Circle',
    cancel: 'Never mind',
  },
  messages: {
    success: 'Circle created! Invite your friends to join.',
    error: 'Failed to create circle. Please try again.',
  },
};
