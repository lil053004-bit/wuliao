export interface StockInfo {
  code: string;
  name: string;
  market: string;
  price: string;
  change: string;
  changePercent: string;
  timestamp: string;
  ptsPrice?: string;
  ptsTime?: string;
  industry: string;
  unit: string;
  per: string;
  pbr: string;
  dividend: string;
  creditRatio: string;
  marketCap: string;
  earningsDate?: string;
}

export interface StockPrice {
  date: string;
  open: string;
  high: string;
  low: string;
  close: string;
  change: string;
  changePercent: string;
  volume: string;
}

export interface StockData {
  info: StockInfo;
  prices: StockPrice[];
}
