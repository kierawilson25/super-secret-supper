export const joinGroupContent = {
  title: 'Join a Group',
  subtitle: 'Enter an invite code to join an existing group',
  labels: {
    inviteCode: 'Invite Code',
  },
  placeholders: {
    inviteCode: 'Enter your 24-character code',
  },
  buttons: {
    validate: 'Check Code',
    join: 'Join Group',
    cancel: 'Cancel',
  },
  messages: {
    validating: 'Checking invite code...',
    joining: 'Joining group...',
    success: 'Successfully joined!',
    invalidFormat: 'Code must be exactly 24 characters',
    invalidCode: "This invite code is invalid or doesn't exist",
    expired: 'This invite code has expired',
    maxUsesReached: 'This invite code has reached its maximum number of uses',
    alreadyMember: "You're already a member of this group",
    error: 'An error occurred. Please try again.',
  },
  instructions: 'Ask your group admin for an invite code, then enter it below to preview and join the group.',
};
