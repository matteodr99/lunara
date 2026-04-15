import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Home from "@/app/page";

jest.mock("recharts", () => {
  const createNullComponent = (displayName: string) => {
    const Component = () => null;

    Component.displayName = displayName;
    return Component;
  };

  return {
    ResponsiveContainer: createNullComponent("ResponsiveContainer"),
    LineChart: createNullComponent("LineChart"),
    Line: createNullComponent("Line"),
    XAxis: createNullComponent("XAxis"),
    YAxis: createNullComponent("YAxis"),
    Tooltip: createNullComponent("Tooltip"),
  };
});

type FetchResponse = {
  data: unknown;
};

const baseCryptos = [
  {
    id: "bitcoin",
    symbol: "btc",
    name: "Bitcoin",
    current_price: 65000,
    price_change_percentage_24h: 3.2,
    market_cap: 1_200_000_000_000,
    total_volume: 45_000_000_000,
    image: "/btc.png",
    sparkline_in_7d: { price: [62000, 63000, 64000, 65000] },
  },
  {
    id: "ethereum",
    symbol: "eth",
    name: "Ethereum",
    current_price: 3200,
    price_change_percentage_24h: -2.4,
    market_cap: 380_000_000_000,
    total_volume: 18_000_000_000,
    image: "/eth.png",
    sparkline_in_7d: { price: [3300, 3280, 3240, 3200] },
  },
  {
    id: "solana",
    symbol: "sol",
    name: "Solana",
    current_price: 150,
    price_change_percentage_24h: 0.8,
    market_cap: 70_000_000_000,
    total_volume: 5_000_000_000,
    image: "/sol.png",
    sparkline_in_7d: { price: [145, 147, 149, 150] },
  },
];

const eurCryptos = [
  {
    ...baseCryptos[0],
    current_price: 60000,
    market_cap: 1_100_000_000_000,
    total_volume: 41_000_000_000,
  },
  {
    ...baseCryptos[1],
    current_price: 2950,
    market_cap: 350_000_000_000,
    total_volume: 16_000_000_000,
  },
  {
    ...baseCryptos[2],
    current_price: 140,
    market_cap: 65_000_000_000,
    total_volume: 4_500_000_000,
  },
];

const historyResponse = [
  { timestamp: 1, price: 64000 },
  { timestamp: 2, price: 64200 },
  { timestamp: 3, price: 64600 },
  { timestamp: 4, price: 65000 },
];

describe("Home integration", () => {
  beforeEach(() => {
    global.fetch = jest.fn((input: string | URL | Request) => {
      const url = String(input);

      let payload: FetchResponse | undefined;

      if (url === "/api/crypto?currency=usd") {
        payload = { data: baseCryptos };
      } else if (url === "/api/crypto?currency=eur") {
        payload = { data: eurCryptos };
      } else if (
        url === "/api/crypto/history?coin=bitcoin&timeframe=1D&currency=eur"
      ) {
        payload = { data: historyResponse };
      }

      if (!payload) {
        throw new Error(`Unexpected fetch: ${url}`);
      }

      return Promise.resolve({
        ok: true,
        json: async () => payload,
      } as Response);
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("loads the dashboard and supports search plus loser filtering", async () => {
    const user = userEvent.setup();

    render(<Home />);

    expect(
      await screen.findByRole("heading", { name: "Lunara" }),
    ).toBeInTheDocument();
    expect((await screen.findAllByText("Bitcoin")).length).toBeGreaterThan(0);
    expect(screen.getAllByText("Ethereum").length).toBeGreaterThan(0);
    expect(screen.getByText("3 of 3 visible")).toBeInTheDocument();

    await user.type(
      screen.getByRole("searchbox", { name: "Search cryptocurrencies" }),
      "eth",
    );

    await waitFor(() => {
      expect(screen.getByText("1 of 3 visible")).toBeInTheDocument();
    });
    expect(screen.getAllByText("Ethereum").length).toBeGreaterThan(0);
    expect(screen.queryByText("Solana")).not.toBeInTheDocument();

    await user.clear(
      screen.getByRole("searchbox", { name: "Search cryptocurrencies" }),
    );
    await user.click(screen.getByRole("button", { name: "Losers" }));

    await waitFor(() => {
      expect(screen.getByText("1 of 3 visible")).toBeInTheDocument();
    });
    expect(screen.getAllByText("Ethereum").length).toBeGreaterThan(0);
    expect(screen.queryByText("Bitcoin")).not.toBeInTheDocument();
  });

  it("refetches prices when switching currency and updates the labels", async () => {
    const user = userEvent.setup();

    render(<Home />);

    expect((await screen.findAllByText("$65,000.00")).length).toBeGreaterThan(0);

    await user.click(screen.getByRole("button", { name: "EUR" }));

    expect((await screen.findAllByText(/€60,000\.00/i)).length).toBeGreaterThan(
      0,
    );
    expect(screen.getByText("SEARCH + FILTER / EUR")).toBeInTheDocument();
    expect(global.fetch).toHaveBeenCalledWith("/api/crypto?currency=eur");
  });

  it("fetches chart history with the selected timeframe and currency", async () => {
    const user = userEvent.setup();

    render(<Home />);

    await screen.findAllByText("$65,000.00");

    await user.click(screen.getByRole("button", { name: "EUR" }));
    await screen.findAllByText(/€60,000\.00/i);

    await user.click(screen.getByRole("button", { name: "1D" }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/crypto/history?coin=bitcoin&timeframe=1D&currency=eur",
      );
    });
    expect(await screen.findByText("1D PRICE HISTORY / EUR")).toBeInTheDocument();
  });
});
