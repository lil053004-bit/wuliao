export function adaptScrapedDataToOldFormat(scrapedData) {
  const { basic, current, range, historical } = scrapedData;

  const stockInfo = {
    code: basic.code,
    name: basic.name,
    market: basic.exchange,
    price: current.price.toLocaleString('ja-JP'),
    change: current.change >= 0 ? `+${current.change}` : current.change.toString(),
    changePercent: current.changePercent >= 0 ? `+${current.changePercent}%` : `${current.changePercent}%`,
    timestamp: current.updateTime,
    ptsPrice: undefined,
    ptsTime: undefined,
    industry: basic.sector,
    unit: '',
    per: '',
    pbr: '',
    dividend: '',
    creditRatio: '',
    marketCap: '',
    earningsDate: undefined,
  };

  const stockPrices = historical.map(item => ({
    date: item.date,
    open: item.open.toLocaleString('ja-JP'),
    high: item.high.toLocaleString('ja-JP'),
    low: item.low.toLocaleString('ja-JP'),
    close: item.close.toLocaleString('ja-JP'),
    change: item.change >= 0 ? `+${item.change}` : item.change.toString(),
    changePercent: item.changePercent >= 0 ? `+${item.changePercent}%` : `${item.changePercent}%`,
    volume: item.volume.toLocaleString('ja-JP'),
  }));

  return {
    info: stockInfo,
    prices: stockPrices,
  };
}

export function prepareDataForCache(scrapedData) {
  const adapted = adaptScrapedDataToOldFormat(scrapedData);

  const htmlContent = JSON.stringify({
    basic: scrapedData.basic,
    current: scrapedData.current,
    range: scrapedData.range,
    historical: scrapedData.historical,
  });

  return {
    htmlContent,
    stockInfo: adapted.info,
    stockPrices: adapted.prices,
  };
}
