export const groupPageContent = {
  tabs: {
    overview: 'Overview',
    members: 'Members',
    dinners: 'Dinners',
  },
  sections: {
    groupInfo: {
      title: 'Group Information',
      labels: {
        name: 'Name',
        city: 'City',
        cadence: 'Dinner Cadence',
        admin: 'Group Admin',
      },
    },
    members: {
      title: 'Members',
      description: 'View all members in this group.',
      button: 'View Member Details',
    },
    nextDinner: {
      title: 'Next Dinner',
      description: 'Your next secret dinner pairing.',
      status: {
        paired: 'You are paired with',
        unpaired: 'Waiting for pairing...',
      },
    },
  },
  messages: {
    error: 'Failed to load group. Please try again.',
    notFound: 'Group not found.',
    notMember: 'You are not a member of this group.',
  },
};
