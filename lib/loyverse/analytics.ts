import {
  DailySales,
  LoyverseReceipt,
} from "./types";

const BUSINESS_TIME_ZONE =
  process.env.BUSINESS_TIME_ZONE ||
  "Asia/Manila";

function getDateKey(date: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: BUSINESS_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date));
}

function getDisplayDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: BUSINESS_TIME_ZONE,
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}

export function calculateDailySales(
  receipts: LoyverseReceipt[],
): DailySales[] {
  const days = new Map<string, DailySales>();

  for (const receipt of receipts) {
    // Do not include cancelled transactions.
    if (receipt.cancelled_at) {
      continue;
    }

    const date = getDateKey(
      receipt.receipt_date || receipt.created_at,
    );

    if (!days.has(date)) {
      days.set(date, {
        date,
        displayDate: getDisplayDate(date),
        sales: 0,
        refunds: 0,
        netSales: 0,
        transactions: 0,
        saleTransactions: 0,
        refundTransactions: 0,
      });
    }

    const day = days.get(date)!;

    const amount = Math.abs(
      Number(receipt.total_money) || 0,
    );

    day.transactions += 1;

    if (receipt.receipt_type === "REFUND") {
      day.refunds += amount;
      day.refundTransactions += 1;
    } else {
      day.sales += amount;
      day.saleTransactions += 1;
    }

    day.netSales = day.sales - day.refunds;
  }

  return Array.from(days.values())
    .map((day) => ({
      ...day,
      sales: roundMoney(day.sales),
      refunds: roundMoney(day.refunds),
      netSales: roundMoney(day.netSales),
    }))
    .sort(
      (a, b) =>
        new Date(a.date).getTime() -
        new Date(b.date).getTime(),
    );
}

export function calculateSummary(
  receipts: LoyverseReceipt[],
) {
  let totalSales = 0;
  let totalRefunds = 0;

  const activeReceipts = receipts.filter(
    (receipt) => !receipt.cancelled_at,
  );

  for (const receipt of activeReceipts) {
    const amount = Math.abs(
      Number(receipt.total_money) || 0,
    );

    if (receipt.receipt_type === "REFUND") {
      totalRefunds += amount;
    } else {
      totalSales += amount;
    }
  }

  return {
    totalSales: roundMoney(totalSales),
    totalRefunds: roundMoney(totalRefunds),
    netSales: roundMoney(
      totalSales - totalRefunds,
    ),
    totalReceipts: activeReceipts.length,
  };
}

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}