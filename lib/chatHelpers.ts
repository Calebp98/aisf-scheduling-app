// Helper function to create consistent conversation IDs
export function getConversationId(uid1: string, uid2: string): string {
  if (uid1 === 'global' || uid2 === 'global') {
    return 'global';
  }
  // Always sort UIDs to ensure consistent conversation IDs
  return [uid1, uid2].sort().join('_');
}

// Helper to determine if a conversation is a DM
export function isDirectMessage(conversationId: string): boolean {
  return conversationId !== 'global' && conversationId.includes('_');
}

// Helper to get the other user's ID from a conversation ID
export function getOtherUserId(conversationId: string, currentUserId: string): string {
  if (conversationId === 'global') return 'global';
  const [uid1, uid2] = conversationId.split('_');
  return uid1 === currentUserId ? uid2 : uid1;
}