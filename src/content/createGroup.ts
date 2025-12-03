export const createGroupContent = {
  title: 'Create your Group',
  subtitle: 'Start a new Super Secret Supper group with your friends.',
  labels: {
    groupName: 'Group Name',
    city: 'City',
    dinnerCadence: 'Dinner Cadence',
  },
  placeholders: {
    groupName: 'e.g., College Friends, Work Squad, Co Werkers',
    city: 'What city are you in?',
  },
  cadenceOptions: [
    { value: 'biweekly', label: 'Biweekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
  ],
  buttons: {
    create: 'Create Group',
    cancel: 'Cancel',
  },
  messages: {
    success: 'Group created! Invite your friends to join.',
    error: 'Failed to create group. Please try again.',
  },
};
