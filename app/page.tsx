"use client";

import {
  FormEvent,
  useState,
} from "react";

import { motion } from "framer-motion";

import {
  Boxes,
  ChartNoAxesCombined,
  Coffee,
  FolderOpen,
  KeyRound,
  LoaderCircle,
  MapPin,
  ReceiptText,
  RefreshCw,
  RotateCcw,
  Search,
  Store,
  TrendingUp,
} from "lucide-react";


import {
  BranchDashboardResponse,
  LoyverseItem,
} from "@/lib/loyverse/types";
import DashboardChart from "./components/dashboard-chart";
import { toast } from "sonner";

const money = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  maximumFractionDigits: 2,
});

export default function Page() {
  const [branchName, setBranchName] =
    useState("");

  const [branchCode, setBranchCode] =
    useState("");

  const [token, setToken] =
    useState("");

  const [data, setData] =
    useState<BranchDashboardResponse | null>(
      null,
    );

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [itemSearch, setItemSearch] =
    useState("");


const handleSyncSubmit = async (
  e: React.FormEvent<HTMLFormElement>,
) => {
  e.preventDefault();

  setLoading(true);
  setError("");

  try {
    const response = await fetch(
      "/api/loyverse/sync",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          branchName,
          branchCode,
          token,
        }),
      },
    );

    const result =
      await response.json();

    if (!response.ok) {
      throw new Error(
        result.message ||
          "Loyverse synchronization failed.",
      );
    }

    setData(result);

    toast.success(
      "Loyverse data synchronized successfully.",
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Something went wrong.";

    setError(message);

    toast.error(message);
  } finally {
    setLoading(false);
  }
};

  const filteredItems =
    data?.items.filter((item) =>
      item.item_name
        .toLowerCase()
        .includes(itemSearch.toLowerCase()),
    ) ?? [];

  return (
    <main className="min-h-screen bg-[#f8f6f2] text-stone-900">
      <header className="border-b border-stone-200 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-amber-900 text-white shadow-sm">
              <Coffee size={21} />
            </div>

            <div>
              <h1 className="font-semibold tracking-tight">
                Bigger Brew
              </h1>

              <p className="text-xs text-stone-500">
                Loyverse Automation
              </p>
            </div>
          </div>

          {data && (
            <div className="hidden items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm text-stone-600 md:flex">
              <span className="size-2 rounded-full bg-emerald-500" />

              {data.branch.name}

              <span className="text-stone-300">
                /
              </span>

              {data.branch.code}
            </div>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        {!data ? (
          <InitialSetup
            branchName={branchName}
            setBranchName={setBranchName}
            branchCode={branchCode}
            setBranchCode={setBranchCode}
            token={token}
            setToken={setToken}
            loading={loading}
            error={error}
            onSubmit={handleSyncSubmit}
          />
        ) : (
          <motion.div
            initial={{
              opacity: 0,
              y: 12,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="space-y-7"
          >
            <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="mb-1 text-sm font-medium text-amber-800">
                  Sales overview
                </p>

                <h2 className="text-3xl font-semibold tracking-tight">
                  {data.branch.name}
                </h2>

                <p className="mt-2 text-sm text-stone-500">
                  Branch code{" "}
                  <span className="font-medium text-stone-700">
                    {data.branch.code}
                  </span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setData(null);
                  setToken("");
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium shadow-sm transition hover:bg-stone-50"
              >
                <RefreshCw size={16} />

                Change branch
              </button>
            </section>

            <SummaryCards data={data} />

            <section className="rounded-[28px] border border-stone-200 bg-white p-5 shadow-sm md:p-7">
              <div className="mb-7 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">
                    Daily net sales
                  </h3>

                  <p className="mt-1 text-sm text-stone-500">
                   This Month
                  </p>
                </div>

                <div className="rounded-xl bg-amber-50 p-2.5 text-amber-800">
                  <ChartNoAxesCombined
                    size={20}
                  />
                </div>
              </div>

              <DashboardChart
                data={data.dailySales}
              />
            </section>

            <div className="grid gap-7 xl:grid-cols-[1.5fr_1fr]">
              <ItemsTable
                items={filteredItems}
                search={itemSearch}
                setSearch={setItemSearch}
                categories={
                  data.categories
                }
              />

              <DailySalesTable
                data={data}
              />
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}

interface SetupProps {
  branchName: string;
  setBranchName: (
    value: string,
  ) => void;

  branchCode: string;
  setBranchCode: (
    value: string,
  ) => void;

  token: string;
  setToken: (
    value: string,
  ) => void;

  loading: boolean;
  error: string;

  onSubmit: (
    event: FormEvent<HTMLFormElement>,
  ) => void;
}

function InitialSetup({
  branchName,
  setBranchName,
  branchCode,
  setBranchCode,
  token,
  setToken,
  loading,
  error,
  onSubmit,
}: SetupProps) {
  return (
    <div className="grid min-h-[75vh] items-center gap-12 lg:grid-cols-2">
      <motion.section
        initial={{
          opacity: 0,
          x: -20,
        }}
        animate={{
          opacity: 1,
          x: 0,
        }}
      >
       

        <h2 className="max-w-xl text-4xl font-semibold leading-[1.1] tracking-[-0.04em] md:text-6xl">
          Your coffee shop data,
          <span className="text-amber-800">
            {" "}
            automatically organized.
          </span>
        </h2>

        <p className="mt-6 max-w-lg leading-7 text-stone-500">
          Connect a Loyverse branch and
          automatically retrieve your
          products, categories and sales
          transactions in one dashboard.
        </p>

        <div className="mt-9 grid max-w-lg grid-cols-3 gap-3">
          <Feature
            icon={<Boxes size={18} />}
            label="Products"
          />

          <Feature
            icon={
              <FolderOpen size={18} />
            }
            label="Categories"
          />

          <Feature
            icon={
              <TrendingUp size={18} />
            }
            label="Sales"
          />
        </div>
      </motion.section>

      <motion.section
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          delay: 0.1,
        }}
        className="mx-auto w-full max-w-lg rounded-[32px] border border-stone-200 bg-white p-6 shadow-xl shadow-stone-200/50 md:p-8"
      >
        <div className="mb-7">
          <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-stone-900 text-white">
            <Store size={21} />
          </div>

          <h3 className="text-xl font-semibold">
            Connect branch
          </h3>

          <p className="mt-1 text-sm leading-6 text-stone-500">
            Enter the branch information
            and its Loyverse access token.
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="space-y-5"
        >
          <Input
            label="Branch name"
            placeholder="Bigger Brew - Gahak"
            value={branchName}
            onChange={setBranchName}
            icon={<Store size={17} />}
          />

          <Input
            label="Branch code"
            placeholder="BB-001"
            value={branchCode}
            onChange={setBranchCode}
            icon={<MapPin size={17} />}
          />

          <Input
            label="Loyverse access token"
            placeholder="Enter access token"
            value={token}
            onChange={setToken}
            type="password"
            icon={<KeyRound size={17} />}
          />

          <div className="rounded-xl bg-stone-50 p-3 text-xs leading-5 text-stone-500">
            The token is used only to
            request your Loyverse data. It
            is not returned by the
            dashboard API.
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-900 px-5 py-3.5 text-sm font-medium text-white transition hover:bg-amber-950 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <LoaderCircle
                  className="animate-spin"
                  size={18}
                />
                Synchronizing...
              </>
            ) : (
              <>
                <RefreshCw size={17} />
                Connect & synchronize
              </>
            )}
          </button>
        </form>
      </motion.section>
    </div>
  );
}

function Feature({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="mb-3 text-amber-800">
        {icon}
      </div>

      <p className="text-sm font-medium">
        {label}
      </p>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  icon,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (
    value: string,
  ) => void;
  placeholder: string;
  icon: React.ReactNode;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium">
        {label}
      </span>

      <div className="flex items-center gap-3 rounded-xl border border-stone-200 px-4 transition focus-within:border-amber-700 focus-within:ring-4 focus-within:ring-amber-100">
        <span className="text-stone-400">
          {icon}
        </span>

        <input
          required
          type={type}
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          placeholder={placeholder}
          autoComplete={
            type === "password"
              ? "off"
              : "on"
          }
          className="w-full bg-transparent py-3.5 text-sm outline-none placeholder:text-stone-400"
        />
      </div>
    </label>
  );
}

function SummaryCards({
  data,
}: {
  data: BranchDashboardResponse;
}) {
  const cards = [
    {
      label: "Net sales",
      value: money.format(
        data.summary.netSales,
      ),
      icon: (
        <TrendingUp size={20} />
      ),
    },

    {
      label: "Products",
      value:
        data.summary.totalItems.toLocaleString(),
      icon: <Boxes size={20} />,
    },

    {
      label: "Categories",
      value:
        data.summary.totalCategories.toLocaleString(),
      icon: (
        <FolderOpen size={20} />
      ),
    },

    {
      label: "Transactions",
      value:
        data.summary.totalReceipts.toLocaleString(),
      icon: (
        <ReceiptText size={20} />
      ),
    },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, index) => (
        <motion.article
          key={card.label}
          initial={{
            opacity: 0,
            y: 10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: index * 0.05,
          }}
          className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
        >
          <div className="mb-5 flex items-center justify-between">
            <p className="text-sm text-stone-500">
              {card.label}
            </p>

            <div className="rounded-xl bg-amber-50 p-2.5 text-amber-800">
              {card.icon}
            </div>
          </div>

          <p className="text-2xl font-semibold tracking-tight">
            {card.value}
          </p>
        </motion.article>
      ))}
    </section>
  );
}

function ItemsTable({
  items,
  search,
  setSearch,
  categories,
}: {
  items: LoyverseItem[];
  search: string;
  setSearch: (
    value: string,
  ) => void;
  categories:
    BranchDashboardResponse["categories"];
}) {
  const categoryMap = new Map(
    categories.map((category) => [
      category.id,
      category.name,
    ]),
  );

  return (
    <section className="overflow-hidden rounded-[28px] border border-stone-200 bg-white shadow-sm">
      <div className="border-b border-stone-100 p-5 md:p-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h3 className="font-semibold">
              Products
            </h3>

            <p className="mt-1 text-sm text-stone-500">
              {items.length} matching
              products
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-stone-200 px-3">
            <Search
              size={16}
              className="text-stone-400"
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="Search products..."
              className="w-48 bg-transparent py-2.5 text-sm outline-none"
            />
          </div>
        </div>
      </div>

      <div className="max-h-[440px] overflow-auto">
        <table className="w-full min-w-[600px] text-left">
          <thead className="sticky top-0 bg-stone-50 text-xs uppercase tracking-wider text-stone-500">
            <tr>
              <th className="px-6 py-4 font-medium">
                Product
              </th>

              <th className="px-6 py-4 font-medium">
                Category
              </th>

              <th className="px-6 py-4 font-medium">
                SKU
              </th>

              <th className="px-6 py-4 text-right font-medium">
                Price
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-stone-100">
            {items
              .slice(0, 100)
              .map((item) => {
                const variant =
                  item.variants?.[0];

                return (
                  <tr
                    key={item.id}
                    className="text-sm transition hover:bg-stone-50"
                  >
                    <td className="px-6 py-4 font-medium">
                      {item.item_name}
                    </td>

                    <td className="px-6 py-4 text-stone-500">
                      {item.category_id
                        ? categoryMap.get(
                            item.category_id,
                          ) ||
                          "Unknown"
                        : "Uncategorized"}
                    </td>

                    <td className="px-6 py-4 text-stone-500">
                      {variant?.sku || "—"}
                    </td>

                    <td className="px-6 py-4 text-right font-medium">
                      {variant
                        ?.default_price !=
                      null
                        ? money.format(
                            variant.default_price,
                          )
                        : "—"}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function DailySalesTable({
  data,
}: {
  data: BranchDashboardResponse;
}) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-stone-200 bg-white shadow-sm">
      <div className="border-b border-stone-100 p-6">
        <h3 className="font-semibold">
          Daily performance
        </h3>

        <p className="mt-1 text-sm text-stone-500">
          Most recent business days
        </p>
      </div>

      <div className="divide-y divide-stone-100">
        {[...data.dailySales]
          .reverse()
          .slice(0, 10)
          .map((day) => (
            <div
              key={day.date}
              className="flex items-center justify-between px-6 py-4"
            >
              <div>
                <p className="text-sm font-medium">
                  {day.displayDate}
                </p>

                <p className="mt-1 text-xs text-stone-500">
                  {
                    day.saleTransactions
                  }{" "}
                  sales
                  {day.refundTransactions >
                    0 &&
                    ` · ${day.refundTransactions} refunds`}
                </p>
              </div>

              <div className="text-right">
                <p className="font-semibold">
                  {money.format(
                    day.netSales,
                  )}
                </p>

                {day.refunds > 0 && (
                  <p className="mt-1 text-xs text-red-500">
                    -
                    {money.format(
                      day.refunds,
                    )}
                  </p>
                )}
              </div>
            </div>
          ))}
      </div>
    </section>
  );
}