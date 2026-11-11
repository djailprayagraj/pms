export const openHistoryInNewTab = (utNumber) => {
  const url = `/prisonerHistory/${utNumber}`;
  window.open(url, '_blank', 'noopener,noreferrer');
};