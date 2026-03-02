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
import { CryptoData, formatPrice, formatMarketCap } from "@/lib/coingecko";

export default function Home() {
  const [cryptos, setCryptos] = useState<CryptoData[]>([]);
  const [selected, setSelected] = useState<CryptoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/crypto");
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
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const sparklineData = selected?.sparkline_in_7d?.price
    ? selected.sparkline_in_7d.price
        .filter((_, i) => i % 6 === 0)
        .map((price, i) => ({ i, price }))
    : [];

  const isPositive = (selected?.price_change_percentage_24h ?? 0) >= 0;

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
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
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
                          {formatPrice(selected.current_price)}
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
                        {formatMarketCap(selected.market_cap)}
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
                        {formatMarketCap(selected.total_volume)}
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
                  <div style={{ height: "180px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={sparklineData}>
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
                              stopColor={isPositive ? "#4ade80" : "#f87171"}
                              stopOpacity={0.5}
                            />
                            <stop
                              offset="100%"
                              stopColor={isPositive ? "#4ade80" : "#f87171"}
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
                            value !== undefined ? formatPrice(value) : "-",
                            "Price",
                          ]}
                          labelFormatter={() => ""}
                        />
                        <Line
                          type="monotone"
                          dataKey="price"
                          stroke="url(#lineGradient)"
                          strokeWidth={2.5}
                          dot={false}
                          activeDot={{
                            r: 5,
                            fill: isPositive ? "#4ade80" : "#f87171",
                            stroke: "rgba(255,255,255,0.3)",
                            strokeWidth: 2,
                          }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
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
                    7-DAY PRICE HISTORY
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
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  color: "rgba(255,255,255,0.4)",
                  letterSpacing: "0.1em",
                }}
              >
                TOP 10
              </span>
              <span
                style={{
                  fontSize: "11px",
                  color: "rgba(255,255,255,0.4)",
                  letterSpacing: "0.05em",
                }}
              >
                BY MARKET CAP
              </span>
            </div>
            <div style={{ overflowY: "auto", maxHeight: "520px" }}>
              {cryptos.map((coin) => {
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
                        {formatPrice(coin.current_price)}
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
