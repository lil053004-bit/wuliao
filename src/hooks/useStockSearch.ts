import { useState, useEffect, useMemo } from 'react';

interface StockData {
  description: string;
  exchange: string;
  name: string;
  type: string;
}

export interface SearchResult {
  code: string;
  name: string;
  market: string;
}

export function useStockSearch() {
  const [stockData, setStockData] = useState<StockData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadStockData = async () => {
    if (hasLoaded || isLoading) return;

    try {
      setIsLoading(true);
      const response = await fetch('/assets/stock.json');
      if (!response.ok) {
        throw new Error('Failed to load stock data');
      }
      const data = await response.json();
      setStockData(data);
      setError(null);
      setHasLoaded(true);
    } catch (err) {
      console.error('Error loading stock data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load stock data');
    } finally {
      setIsLoading(false);
    }
  };

  const search = useMemo(() => {
    return (query: string): SearchResult[] => {
      if (!query || query.trim().length === 0) {
        return [];
      }

      const searchTerm = query.trim().toLowerCase();
      const results: SearchResult[] = [];

      for (const stock of stockData) {
        const code = stock.name;
        const name = stock.description || '';
        const market = stock.exchange || '';

        const codeMatch = code.toLowerCase().includes(searchTerm);
        const nameMatch = name.toLowerCase().includes(searchTerm);

        if (codeMatch || nameMatch) {
          results.push({
            code,
            name,
            market
          });
        }

        if (results.length >= 100) {
          break;
        }
      }

      return results;
    };
  }, [stockData]);

  return {
    search,
    isLoading,
    error,
    totalStocks: stockData.length,
    loadStockData
  };
}
