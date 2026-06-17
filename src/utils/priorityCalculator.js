const weights = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

export function calculatePriorityScore(notification) {
  const type = notification.notification_type || notification.type || 'Event';
  const typeWeight = weights[type] || 1;
  const timestamp = notification.timestamp || notification.created_at || notification.date;
  const timeValue = timestamp ? new Date(timestamp).getTime() : Date.now();
  const recencyScore = Math.max(0, Math.floor((Date.now() - timeValue) / 1000 / 60));
  return typeWeight * 1000 - recencyScore;
}
