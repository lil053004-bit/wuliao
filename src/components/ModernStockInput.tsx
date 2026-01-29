import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { SearchResult } from '../hooks/useStockSearch';

interface ModernStockInputProps {
  value: string;
  onChange: (value: string) => void;
  onStockSelect?: (code: string, name: string) => void;
  search: (query: string) => SearchResult[];
  isLoading?: boolean;
  loadStockData?: () => Promise<void>;
}

export default function ModernStockInput({ value, onChange, onStockSelect, search, isLoading = false, loadStockData }: ModernStockInputProps) {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasTriggeredLoad = useRef(false);

  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    if (value.trim().length > 0) {
      const results = search(value);
      setSearchResults(results);
      setShowDropdown(results.length > 0);
      setCurrentPage(0);
    } else {
      setSearchResults([]);
      setShowDropdown(false);
      setCurrentPage(0);
    }
  }, [value, search]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const totalPages = Math.ceil(searchResults.length / ITEMS_PER_PAGE);
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentResults = searchResults.slice(startIndex, endIndex);

  const handleStockClick = (stock: SearchResult) => {
    const displayValue = `${stock.code} ${stock.name}`;
    onChange(displayValue);
    setShowDropdown(false);

    if (onStockSelect) {
      onStockSelect(stock.code, stock.name);
    }
  };

  const handleInputFocus = () => {
    if (loadStockData && !hasTriggeredLoad.current) {
      hasTriggeredLoad.current = true;
      loadStockData();
    }
    if (searchResults.length > 0) {
      setShowDropdown(true);
    }
  };

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages - 1, prev + 1));
  };

  return (
    <div className="relative w-full animate-fadeIn z-[100]" style={{ animationDelay: '0.1s' }}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={handleInputFocus}
          placeholder="例：7203 / トヨタ自動車"
          className="w-full px-4 py-3 text-base text-gray-900 bg-[#F4F4F4] rounded-xl border-0 focus:ring-2 focus:ring-tech-blue-light focus:outline-none placeholder-gray-400 transition-all duration-200"
          style={{ height: '52px' }}
          disabled={isLoading}
        />
      </div>

      {showDropdown && currentResults.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-[99999] w-full mt-3 bg-white rounded-2xl shadow-2xl overflow-hidden animate-fadeIn border border-gray-200"
        >
          <div className="max-h-80 overflow-y-auto">
            {currentResults.map((stock, index) => (
              <button
                key={`${stock.code}-${index}`}
                onClick={() => handleStockClick(stock)}
                className="w-full px-5 py-2.5 text-left hover:bg-blue-50 transition-all duration-150 border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 whitespace-nowrap">{stock.code}</div>
                    <div className="text-sm text-gray-600 truncate" title={stock.name}>
                      {stock.name.length > 6 ? `${stock.name.slice(0, 6)}...` : stock.name}
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 bg-gray-100 px-3 py-1 rounded-full font-medium whitespace-nowrap">
                    {stock.market}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-t border-gray-200">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 0}
                className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                前へ
              </button>

              <div className="text-sm font-semibold text-gray-700">
                {currentPage + 1} / {totalPages}
              </div>

              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages - 1}
                className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                次へ
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {isLoading && (
        <div className="absolute left-0 right-0 top-full mt-2 text-center text-sm text-gray-300">
          読み込み中...
        </div>
      )}
    </div>
  );
}
