export const manageGroupContent = {
  title: 'Manage Group',
  sections: {
    inviteLinks: {
      title: 'Invite Links',
      description: 'Generate shareable links to invite friends to join your group.',
      button: 'Generate New Link',
    },
    dinnerCadence: {
      title: 'Dinner Cadence',
      description: 'How often should members meet?',
    },
    members: {
      title: 'Members',
      description: 'View and manage group members.',
    },
    pairings: {
      title: 'Pair Members',
      description: 'Generate secret pairings for the next dinner.',
      button: 'Pair Members for Next Dinner',
    },
  },
  messages: {
    linkCopied: 'Invite link copied to clipboard!',
    linkError: 'Failed to generate link. Please try again.',
    pairingSuccess: 'Pairings created successfully!',
    pairingError: 'Failed to create pairings. Please ensure you have at least 2 members.',
    adminOnly: 'Only group admins can manage this group.',
  },
};
