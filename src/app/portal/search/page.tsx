'use client';

import { useState, useEffect } from 'react';
import { Search as SearchIcon, X, ChevronRight } from 'lucide-react';
import { SearchResult } from '@/lib/search';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<string[]>([]);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const typeParams = selectedType.length
          ? selectedType.map((t) => `type=${t}`).join('&')
          : '';
        const url = `/api/search?q=${encodeURIComponent(query)}&${typeParams}&limit=100`;
        const res = await fetch(url);
        const data = await res.json();
        setResults(data.results || []);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, selectedType]);

  const typeOptions = [
    { value: 'machine', label: 'Machines', icon: '⚙️' },
    { value: 'customer', label: 'Customers', icon: '🏢' },
    { value: 'quote', label: 'Quotes', icon: '📄' },
    { value: 'document', label: 'Datasheets', icon: '📋' },
  ];

  const resultsByType = results.reduce((acc, r) => {
    if (!acc[r.type]) acc[r.type] = [];
    acc[r.type].push(r);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Global Search</h1>
        <p className="text-gray-600">Search across all machines, customers, quotes, and documents</p>
      </div>

      <div className="relative mb-8">
        <SearchIcon className="absolute left-4 top-3.5 text-gray-400" size={20} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by customer, serial #, model, location..."
          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          autoFocus
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <div className="flex gap-2 mb-8 flex-wrap">
        {typeOptions.map((type) => (
          <button
            key={type.value}
            onClick={() =>
              setSelectedType((prev) =>
                prev.includes(type.value)
                  ? prev.filter((t) => t !== type.value)
                  : [...prev, type.value]
              )
            }
            className={`px-4 py-2 rounded-lg border transition-colors ${
              selectedType.includes(type.value)
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
            }`}
          >
            <span className="mr-2">{type.icon}</span>
            {type.label}
          </button>
        ))}
      </div>

      {query && (
        <div>
          {loading && <p className="text-gray-500">Searching...</p>}

          {!loading && results.length === 0 && query.length >= 2 && (
            <p className="text-gray-500">No results found for "{query}"</p>
          )}

          {!loading && results.length > 0 && (
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Found <strong>{results.length}</strong> results
              </p>

              {Object.entries(resultsByType).map(([type, typeResults]) => (
                <div key={type} className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3 capitalize">
                    {type}s ({typeResults.length})
                  </h2>
                  <div className="space-y-2">
                    {typeResults.slice(0, 10).map((result) => (
                      <div
                        key={result.id}
                        className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{result.title}</h3>
                            {result.subtitle && (
                              <p className="text-sm text-gray-600 mt-1">{result.subtitle}</p>
                            )}
                          </div>
                          <ChevronRight className="text-gray-400 flex-shrink-0 ml-2" size={20} />
                        </div>
                      </div>
                    ))}
                    {typeResults.length > 10 && (
                      <p className="text-sm text-gray-500 pt-2">
                        +{typeResults.length - 10} more results
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!query && (
        <div className="text-center py-12">
          <SearchIcon className="mx-auto mb-4 text-gray-400" size={48} />
          <p className="text-gray-500">Start typing to search...</p>
        </div>
      )}
    </div>
  );
}
