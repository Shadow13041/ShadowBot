export function getAdminParticipants(metadata) {
  return (metadata?.participants || []).filter(participant =>
    participant &&
    (
      participant.admin === 'admin' ||
      participant.admin === 'superadmin' ||
      participant.isAdmin === true ||
      participant.isSuperAdmin === true
    ) &&
    typeof (participant.id || participant.jid || participant.phoneNumber) === 'string'
  );
}

export function buildTagAllPayload(participants, intro = '') {
  const valid = (participants || []).filter(participant =>
    typeof (participant?.id || participant?.jid || participant?.phoneNumber) === 'string'
  );
  const mentions = valid.map(participant =>
    participant.id || participant.jid || participant.phoneNumber
  );
  const tags = mentions.map(jid => '@' + jid.split('@')[0]);

  return {
    text: (intro.trim() ? intro.trim() + '\n\n' : '') + tags.join(' '),
    mentions
  };
}
