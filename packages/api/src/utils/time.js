function getLocalHour(timezone) {
  const formatter = new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    hour12: false,
    timeZone: timezone
  });

  return Number(formatter.format(new Date()));
}

function getTransferLimitByTime(timezone) {
  const hour = getLocalHour(timezone);

  if (hour >= 20 || hour < 6) {
    return {
      period: 'night',
      limit: 1000
    };
  }

  return {
    period: 'day',
    limit: 10000
  };
}

module.exports = {
  getLocalHour,
  getTransferLimitByTime
};
