"use client";

import { useState, useEffect, useCallback } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  buildSparklineHistory,
  CURRENCY_CONFIG,
  CryptoData,
  formatPrice,
  formatMarketCap,
  formatTimeframeLabel,
  type CryptoHistoryPoint,
  type CryptoTimeframe,
  type SupportedCurrency,
} from "@/lib/coingecko";
import {
  filterCryptocurrencies,
  type CryptoTrendFilter,
} from "@/lib/crypto-filters";

const TIMEFRAMES: CryptoTimeframe[] = ["1D", "7D", "30D", "1Y"];
const CURRENCIES: SupportedCurrency[] = ["usd", "eur", "gbp"];

export default function Home() {
  const [cryptos, setCryptos] = useState<CryptoData[]>([]);
  const [selected, setSelected] = useState<CryptoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [trendFilter, setTrendFilter] = useState<CryptoTrendFilter>("all");
  const [timeframe, setTimeframe] = useState<CryptoTimeframe>("7D");
  const [currency, setCurrency] = useState<SupportedCurrency>("usd");
  const [chartHistory, setChartHistory] = useState<CryptoHistoryPoint[]>([]);
  const [chartLoading, setChartLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/crypto?currency=${currency}`);
      const json = await res.json();
      const data: CryptoData[] =
        typeof json.data === "string" ? JSON.parse(json.data) : json.data;
      setCryptos(data);
      setSelected((prev) =>
        prev ? data.find((c) => c.id === prev.id) || data[0] : data[0],
      );
      setLastUpdate(new Date());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [currency]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const filteredCryptos = filterCryptocurrencies(
    cryptos,
    searchQuery,
    trendFilter,
  );

  useEffect(() => {
    if (filteredCryptos.length === 0) {
      return;
    }

    const selectedStillVisible = filteredCryptos.some(
      (coin) => coin.id === selected?.id,
    );

    if (!selectedStillVisible) {
      setSelected(filteredCryptos[0]);
    }
  }, [filteredCryptos, selected]);

  const fetchChartHistory = useCallback(async () => {
    if (!selected) {
      setChartHistory([]);
      return;
    }

    if (timeframe === "7D" && selected.sparkline_in_7d?.price?.length) {
      setChartHistory(buildSparklineHistory(selected.sparkline_in_7d.price, "7D"));
      return;
    }

    setChartLoading(true);
    try {
      const res = await fetch(
        `/api/crypto/history?coin=${selected.id}&timeframe=${timeframe}&currency=${currency}`,
      );
      const json = await res.json();
      const data: CryptoHistoryPoint[] =
        typeof json.data === "string" ? JSON.parse(json.data) : json.data;
      setChartHistory(data);
    } catch (e) {
      console.error(e);
      setChartHistory([]);
    } finally {
      setChartLoading(false);
    }
  }, [currency, selected, timeframe]);

  useEffect(() => {
    fetchChartHistory();
  }, [fetchChartHistory]);

  const chartData = chartHistory
    .filter((_, index) => {
      if (timeframe === "1D") return index % 2 === 0;
      if (timeframe === "1Y") return index % 8 === 0;
      return index % 4 === 0;
    })
    .map((point, index) => ({
      i: index,
      timestamp: point.timestamp,
      price: point.price,
      label: formatTimeframeLabel(point.timestamp, timeframe),
    }));

  const isPositive = (selected?.price_change_percentage_24h ?? 0) >= 0;
  const chartIsPositive =
    chartData.length < 2 ||
    chartData[chartData.length - 1].price >= chartData[0].price;
  const currencyLabel = CURRENCY_CONFIG[currency].label;

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #0f0c29 0%, #1a1a4e 40%, #24243e 100%)",
        fontFamily: "'Inter', sans-serif",
        color: "#fff",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        /* Animated background orbs */
        .orb {
          position: fixed;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.15;
          pointer-events: none;
          animation: float 8s ease-in-out infinite;
        }
        .orb-1 { width: 500px; height: 500px; background: #7c3aed; top: -100px; left: -100px; animation-delay: 0s; }
        .orb-2 { width: 400px; height: 400px; background: #2563eb; bottom: -80px; right: -80px; animation-delay: 3s; }
        .orb-3 { width: 300px; height: 300px; background: #06b6d4; top: 40%; left: 40%; animation-delay: 5s; }

        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(20px, -20px) scale(1.05); }
          66% { transform: translate(-15px, 15px) scale(0.95); }
        }

        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes slideIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .glass {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .glass-strong {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(30px);
          -webkit-backdrop-filter: blur(30px);
          border: 1px solid rgba(255, 255, 255, 0.15);
        }

        .crypto-row {
          transition: all 0.2s ease;
          cursor: pointer;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .crypto-row:hover {
          background: rgba(255,255,255,0.08) !important;
        }

        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 2px; }

        .stat-card {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 16px 20px;
          flex: 1;
        }

        .filter-button {
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04);
          color: rgba(255,255,255,0.7);
          border-radius: 999px;
          padding: 8px 12px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.04em;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .filter-button:hover {
          background: rgba(255,255,255,0.1);
          color: #fff;
        }
        .filter-button.active {
          background: rgba(167,139,250,0.16);
          color: #c4b5fd;
          border-color: rgba(167,139,250,0.35);
          box-shadow: 0 0 20px rgba(167,139,250,0.12);
        }

        .timeframe-button {
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.03);
          color: rgba(255,255,255,0.58);
          border-radius: 999px;
          padding: 7px 11px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .timeframe-button.active {
          background: rgba(96,165,250,0.18);
          color: #bfdbfe;
          border-color: rgba(96,165,250,0.35);
        }

        .currency-button {
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.04);
          color: rgba(255,255,255,0.72);
          border-radius: 999px;
          padding: 8px 12px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .currency-button.active {
          background: rgba(74,222,128,0.16);
          color: #bbf7d0;
          border-color: rgba(74,222,128,0.35);
        }

        @media (max-width: 960px) {
          .dashboard-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      {/* Background orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      {/* Header */}
      <div
        className="glass"
        style={{
          padding: "16px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              background: "linear-gradient(135deg, #7c3aed, #2563eb)",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
            }}
          >
            🌙
          </div>
          <div>
            <h1
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "20px",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                background: "linear-gradient(135deg, #a78bfa, #60a5fa)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Lunara
            </h1>
          </div>
          <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px" }}>
            / crypto dashboard
          </span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap",
            justifyContent: "flex-end",
          }}
        >
          <div
            style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}
          >
            {CURRENCIES.map((value) => (
              <button
                key={value}
                type="button"
                className={`currency-button ${currency === value ? "active" : ""}`}
                onClick={() => setCurrency(value)}
              >
                {CURRENCY_CONFIG[value].label}
              </button>
            ))}
          </div>
          {lastUpdate && (
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px" }}>
              updated {lastUpdate.toLocaleTimeString()}
            </span>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#4ade80",
                animation: "pulse 2s infinite",
              }}
            />
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px" }}>
              live
            </span>
          </div>
        </div>
      </div>

      {loading ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "70vh",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "2px solid rgba(255,255,255,0.1)",
              borderTopColor: "#a78bfa",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>
            fetching crypto data...
          </span>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : (
        <div
          className="dashboard-grid"
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            padding: "32px 24px",
            display: "grid",
            gridTemplateColumns: "1fr 320px",
            gap: "20px",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Left panel */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            {selected && (
              <>
                {/* Coin header */}
                <div
                  className="glass-strong"
                  style={{
                    borderRadius: "20px",
                    padding: "24px",
                    animation: "slideIn 0.3s ease",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                      marginBottom: "24px",
                    }}
                  >
                    <img
                      src={selected.image}
                      alt={selected.name}
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "50%",
                        boxShadow: "0 0 20px rgba(167,139,250,0.3)",
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "'Space Grotesk', sans-serif",
                            fontSize: "24px",
                            fontWeight: 700,
                          }}
                        >
                          {selected.name}
                        </span>
                        <span
                          style={{
                            background: "rgba(255,255,255,0.1)",
                            color: "rgba(255,255,255,0.5)",
                            borderRadius: "6px",
                            fontSize: "11px",
                            padding: "3px 8px",
                            textTransform: "uppercase",
                            fontWeight: 600,
                          }}
                        >
                          {selected.symbol}
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          marginTop: "6px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "28px",
                            fontWeight: 700,
                            letterSpacing: "-0.02em",
                          }}
                        >
                          {formatPrice(selected.current_price, currency)}
                        </span>
                        <span
                          style={{
                            background: isPositive
                              ? "rgba(74,222,128,0.15)"
                              : "rgba(248,113,113,0.15)",
                            color: isPositive ? "#4ade80" : "#f87171",
                            border: `1px solid ${isPositive ? "rgba(74,222,128,0.3)" : "rgba(248,113,113,0.3)"}`,
                            borderRadius: "8px",
                            fontSize: "13px",
                            padding: "4px 10px",
                            fontWeight: 600,
                          }}
                        >
                          {isPositive ? "▲" : "▼"}{" "}
                          {Math.abs(
                            selected.price_change_percentage_24h,
                          ).toFixed(2)}
                          %
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div
                    style={{
                      display: "flex",
                      gap: "12px",
                      marginBottom: "24px",
                    }}
                  >
                    <div className="stat-card">
                      <div
                        style={{
                          color: "rgba(255,255,255,0.4)",
                          fontSize: "10px",
                          letterSpacing: "0.1em",
                          marginBottom: "6px",
                        }}
                      >
                        MARKET CAP
                      </div>
                      <div style={{ fontSize: "15px", fontWeight: 600 }}>
                        {formatMarketCap(selected.market_cap, currency)}
                      </div>
                    </div>
                    <div className="stat-card">
                      <div
                        style={{
                          color: "rgba(255,255,255,0.4)",
                          fontSize: "10px",
                          letterSpacing: "0.1em",
                          marginBottom: "6px",
                        }}
                      >
                        24H VOLUME
                      </div>
                      <div style={{ fontSize: "15px", fontWeight: 600 }}>
                        {formatMarketCap(selected.total_volume, currency)}
                      </div>
                    </div>
                    <div className="stat-card">
                      <div
                        style={{
                          color: "rgba(255,255,255,0.4)",
                          fontSize: "10px",
                          letterSpacing: "0.1em",
                          marginBottom: "6px",
                        }}
                      >
                        24H CHANGE
                      </div>
                      <div
                        style={{
                          fontSize: "15px",
                          fontWeight: 600,
                          color: isPositive ? "#4ade80" : "#f87171",
                        }}
                      >
                        {isPositive ? "+" : ""}
                        {selected.price_change_percentage_24h.toFixed(2)}%
                      </div>
                    </div>
                  </div>

                  {/* Chart */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "12px",
                      marginBottom: "16px",
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "11px",
                        letterSpacing: "0.1em",
                        color: "rgba(255,255,255,0.38)",
                      }}
                    >
                      MULTIPLE TIMEFRAMES
                    </span>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      {TIMEFRAMES.map((value) => (
                        <button
                          key={value}
                          type="button"
                          className={`timeframe-button ${timeframe === value ? "active" : ""}`}
                          onClick={() => setTimeframe(value)}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{ height: "180px" }}>
                    {chartLoading ? (
                      <div
                        style={{
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "rgba(255,255,255,0.45)",
                          fontSize: "12px",
                          letterSpacing: "0.08em",
                        }}
                      >
                        LOADING {timeframe} HISTORY...
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <defs>
                            <linearGradient
                              id="lineGradient"
                              x1="0"
                              y1="0"
                              x2="1"
                              y2="0"
                            >
                              <stop
                                offset="0%"
                                stopColor={
                                  chartIsPositive ? "#4ade80" : "#f87171"
                                }
                                stopOpacity={0.5}
                              />
                              <stop
                                offset="100%"
                                stopColor={
                                  chartIsPositive ? "#4ade80" : "#f87171"
                                }
                                stopOpacity={1}
                              />
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="i" hide />
                          <YAxis domain={["auto", "auto"]} hide />
                          <Tooltip
                            contentStyle={{
                              background: "rgba(15,12,41,0.9)",
                              border: "1px solid rgba(255,255,255,0.1)",
                              borderRadius: "10px",
                              fontSize: "12px",
                              fontFamily: "'Inter', sans-serif",
                              color: "#fff",
                            }}
                            formatter={(value: number | undefined) => [
                              value !== undefined
                                ? formatPrice(value, currency)
                                : "-",
                              "Price",
                            ]}
                            labelFormatter={(_, payload) =>
                              payload?.[0]?.payload?.label ?? ""
                            }
                          />
                          <Line
                            type="monotone"
                            dataKey="price"
                            stroke="url(#lineGradient)"
                            strokeWidth={2.5}
                            dot={false}
                            activeDot={{
                              r: 5,
                              fill: chartIsPositive ? "#4ade80" : "#f87171",
                              stroke: "rgba(255,255,255,0.3)",
                              strokeWidth: 2,
                            }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                  <div
                    style={{
                      textAlign: "center",
                      color: "rgba(255,255,255,0.25)",
                      fontSize: "10px",
                      marginTop: "8px",
                      letterSpacing: "0.08em",
                    }}
                  >
                    {timeframe} PRICE HISTORY / {currencyLabel}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right panel — coin list */}
          <div
            className="glass-strong"
            style={{
              borderRadius: "20px",
              overflow: "hidden",
              height: "fit-content",
            }}
          >
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: "11px",
                    color: "rgba(255,255,255,0.4)",
                    letterSpacing: "0.1em",
                  }}
                >
                  MARKET OVERVIEW
                </span>
                <div
                  style={{
                    fontSize: "11px",
                    color: "rgba(255,255,255,0.35)",
                    letterSpacing: "0.05em",
                    marginTop: "4px",
                  }}
                >
                  {filteredCryptos.length} of {cryptos.length} visible
                </div>
              </div>
              <span
                style={{
                  fontSize: "11px",
                  color: "rgba(255,255,255,0.4)",
                  letterSpacing: "0.05em",
                }}
              >
                SEARCH + FILTER / {currencyLabel}
              </span>
            </div>
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by name or symbol"
                aria-label="Search cryptocurrencies"
                style={{
                  width: "100%",
                  borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.05)",
                  color: "#fff",
                  padding: "12px 14px",
                  outline: "none",
                  fontSize: "13px",
                }}
              />
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {[
                  ["all", "All"],
                  ["gainers", "Gainers"],
                  ["losers", "Losers"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    className={`filter-button ${trendFilter === value ? "active" : ""}`}
                    onClick={() => setTrendFilter(value as CryptoTrendFilter)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ overflowY: "auto", maxHeight: "520px" }}>
              {filteredCryptos.length === 0 && (
                <div
                  style={{
                    padding: "28px 20px",
                    color: "rgba(255,255,255,0.45)",
                    fontSize: "13px",
                    textAlign: "center",
                  }}
                >
                  No cryptocurrencies match the current search and filter.
                </div>
              )}
              {filteredCryptos.map((coin) => {
                const positive = coin.price_change_percentage_24h >= 0;
                const isActive = selected?.id === coin.id;
                return (
                  <div
                    key={coin.id}
                    className="crypto-row"
                    onClick={() => setSelected(coin)}
                    style={{
                      padding: "14px 20px",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      background: isActive
                        ? "rgba(167,139,250,0.1)"
                        : "transparent",
                      borderLeft: isActive
                        ? "2px solid #a78bfa"
                        : "2px solid transparent",
                    }}
                  >
                    <img
                      src={coin.image}
                      alt={coin.name}
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: "13px",
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {coin.name}
                      </div>
                      <div
                        style={{
                          fontSize: "10px",
                          color: "rgba(255,255,255,0.35)",
                          textTransform: "uppercase",
                          marginTop: "2px",
                        }}
                      >
                        {coin.symbol}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "13px", fontWeight: 600 }}>
                        {formatPrice(coin.current_price, currency)}
                      </div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: positive ? "#4ade80" : "#f87171",
                          fontWeight: 600,
                          marginTop: "2px",
                        }}
                      >
                        {positive ? "▲" : "▼"}{" "}
                        {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
