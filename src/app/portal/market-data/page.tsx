'use client';
"use client";

import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import "@/styles/pharmaceutical.css";

interface MarketData {
  timestamp: string;
  metals?: {
    gold?: number;
    silver?: number;
  };
  oil?: {
    wti?: number;
    change?: number;
    changePercent?: number;
  };
  crypto?: {
    bitcoin?: { price?: number; change24h?: number };
    ethereum?: { price?: number; change24h?: number };
  };
  currencies?: {
    [key: string]: number;
  };
  pharmaStocks?: Array<{
    symbol: string;
    name?: string;
    price?: number;
    change?: number;
    changePercent?: number;
  }>;
  sources?: Record<string, string>;
}

export default function MarketDataPage() {
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>("");
  const [error, setError] = useState<string>("");

  const fetchMarketData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/market-data");
      const data = await response.json();
      setMarketData(data);
      setLastUpdate(new Date().toLocaleTimeString());
      setError("");
    } catch (err) {
      setError("Failed to fetch market data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
    // Refresh every minute
    const interval = setInterval(fetchMarketData, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
      {/* Header */}
      <header style={{
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E8E8E8',
        padding: '24px 32px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1A1A1A', margin: 0 }}>Market Data</h1>
            <p style={{ fontSize: '13px', color: '#999999', margin: '4px 0 0 0' }}>Commodities, Currencies & Pharma Stocks</p>
          </div>
          <button
            onClick={fetchMarketData}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              backgroundColor: '#1E5BA8',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '2px',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '13px',
              opacity: loading ? 0.6 : 1
            }}
          >
            <RefreshCw size={16} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            {loading ? 'Updating...' : 'Refresh'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px' }}>
        {error && (
          <div style={{
            backgroundColor: '#FEE2E2',
            border: '1px solid #FECACA',
            borderRadius: '4px',
            padding: '16px',
            marginBottom: '24px',
            color: '#DC2626',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        {marketData && (
          <>
            {/* Last Update */}
            <div style={{ textAlign: 'right', marginBottom: '24px', fontSize: '12px', color: '#999999' }}>
              Last updated: {lastUpdate}
            </div>

            {/* Metals Section */}
            {marketData.metals && !('error' in marketData.metals) && (
              <div style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1A1A1A', marginBottom: '16px' }}>Precious Metals</h2>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '16px'
                }}>
                  {marketData.metals.gold && (
                    <div style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E8E8E8',
                      borderRadius: '4px',
                      padding: '20px'
                    }}>
                      <div style={{ fontSize: '12px', color: '#999999', marginBottom: '8px', fontWeight: 500 }}>Gold (USD/oz)</div>
                      <div style={{ fontSize: '24px', fontWeight: 700, color: '#D4AF37' }}>${marketData.metals.gold.toFixed(2)}</div>
                    </div>
                  )}
                  {marketData.metals.silver && (
                    <div style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E8E8E8',
                      borderRadius: '4px',
                      padding: '20px'
                    }}>
                      <div style={{ fontSize: '12px', color: '#999999', marginBottom: '8px', fontWeight: 500 }}>Silver (USD/oz)</div>
                      <div style={{ fontSize: '24px', fontWeight: 700, color: '#C0C0C0' }}>${marketData.metals.silver.toFixed(2)}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Oil Section */}
            {marketData.oil && !('error' in marketData.oil) && (
              <div style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1A1A1A', marginBottom: '16px' }}>Energy</h2>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '16px'
                }}>
                  <div style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E8E8E8',
                    borderRadius: '4px',
                    padding: '20px'
                  }}>
                    <div style={{ fontSize: '12px', color: '#999999', marginBottom: '8px', fontWeight: 500 }}>WTI Crude Oil</div>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: '#1A1A1A', marginBottom: '8px' }}>
                      ${typeof marketData.oil.wti === 'number' ? marketData.oil.wti.toFixed(2) : 'N/A'}
                    </div>
                    {typeof marketData.oil.changePercent === 'number' && (
                      <div style={{
                        fontSize: '12px',
                        color: marketData.oil.changePercent >= 0 ? '#10B981' : '#EF4444',
                        fontWeight: 500
                      }}>
                        {marketData.oil.changePercent >= 0 ? '+' : ''}{marketData.oil.changePercent.toFixed(2)}%
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Crypto Section */}
            {marketData.crypto && (
              <div style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1A1A1A', marginBottom: '16px' }}>Cryptocurrencies</h2>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '16px'
                }}>
                  {marketData.crypto.bitcoin?.price && (
                    <div style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E8E8E8',
                      borderRadius: '4px',
                      padding: '20px'
                    }}>
                      <div style={{ fontSize: '12px', color: '#999999', marginBottom: '8px', fontWeight: 500 }}>Bitcoin</div>
                      <div style={{ fontSize: '20px', fontWeight: 700, color: '#1A1A1A', marginBottom: '8px' }}>
                        ${marketData.crypto.bitcoin.price.toFixed(0)}
                      </div>
                      {typeof marketData.crypto.bitcoin.change24h === 'number' && (
                        <div style={{
                          fontSize: '12px',
                          color: marketData.crypto.bitcoin.change24h >= 0 ? '#10B981' : '#EF4444'
                        }}>
                          {marketData.crypto.bitcoin.change24h >= 0 ? '+' : ''}{marketData.crypto.bitcoin.change24h.toFixed(2)}%
                        </div>
                      )}
                    </div>
                  )}
                  {marketData.crypto.ethereum?.price && (
                    <div style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E8E8E8',
                      borderRadius: '4px',
                      padding: '20px'
                    }}>
                      <div style={{ fontSize: '12px', color: '#999999', marginBottom: '8px', fontWeight: 500 }}>Ethereum</div>
                      <div style={{ fontSize: '20px', fontWeight: 700, color: '#1A1A1A', marginBottom: '8px' }}>
                        ${marketData.crypto.ethereum.price.toFixed(0)}
                      </div>
                      {typeof marketData.crypto.ethereum.change24h === 'number' && (
                        <div style={{
                          fontSize: '12px',
                          color: marketData.crypto.ethereum.change24h >= 0 ? '#10B981' : '#EF4444'
                        }}>
                          {marketData.crypto.ethereum.change24h >= 0 ? '+' : ''}{marketData.crypto.ethereum.change24h.toFixed(2)}%
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Currency Exchange Rates */}
            {marketData.currencies && Object.keys(marketData.currencies).length > 0 && (
              <div style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1A1A1A', marginBottom: '16px' }}>Currency Rates (vs USD)</h2>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '16px'
                }}>
                  {Object.entries(marketData.currencies).map(([currency, rate]) => (
                    <div
                      key={currency}
                      style={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E8E8E8',
                        borderRadius: '4px',
                        padding: '20px'
                      }}
                    >
                      <div style={{ fontSize: '12px', color: '#999999', marginBottom: '8px', fontWeight: 500 }}>USD to {currency}</div>
                      <div style={{ fontSize: '18px', fontWeight: 700, color: '#1A1A1A' }}>
                        {typeof rate === 'number' ? rate.toFixed(2) : 'N/A'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pharma Stocks */}
            {marketData.pharmaStocks && marketData.pharmaStocks.filter(s => s.price).length > 0 && (
              <div style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1A1A1A', marginBottom: '16px' }}>Pharmaceutical Stocks</h2>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '16px'
                }}>
                  {marketData.pharmaStocks.filter(s => s.price).map((stock) => (
                    <div
                      key={stock.symbol}
                      style={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E8E8E8',
                        borderRadius: '4px',
                        padding: '20px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: '#1A1A1A' }}>{stock.symbol}</div>
                          <div style={{ fontSize: '12px', color: '#999999' }}>{stock.name || 'N/A'}</div>
                        </div>
                        {typeof stock.changePercent === 'number' && stock.changePercent >= 0 ? (
                          <TrendingUp size={16} color="#10B981" />
                        ) : (
                          <TrendingDown size={16} color="#EF4444" />
                        )}
                      </div>
                      <div style={{ fontSize: '20px', fontWeight: 700, color: '#1A1A1A', marginBottom: '8px' }}>
                        ${typeof stock.price === 'number' ? stock.price.toFixed(2) : 'N/A'}
                      </div>
                      {typeof stock.changePercent === 'number' && (
                        <div style={{
                          fontSize: '12px',
                          color: stock.changePercent >= 0 ? '#10B981' : '#EF4444',
                          fontWeight: 500
                        }}>
                          {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ fontSize: '12px', color: '#999999', marginTop: '32px', paddingTop: '16px', borderTop: '1px solid #E8E8E8' }}>
              <p>Data sources: CoinGecko, ExchangeRate-API, Alpha Vantage. Updates every minute.</p>
            </div>
          </>
        )}

        {loading && !marketData && (
          <div style={{ textAlign: 'center', padding: '64px 0', color: '#999999' }}>
            Loading market data...
          </div>
        )}
      </main>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
