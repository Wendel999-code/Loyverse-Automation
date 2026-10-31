"use server";


import {
  calculateDailySales,
  calculateSummary,
} from "@/lib/loyverse/analytics";
import { getLoyverseCategories, getLoyverseItems, getLoyverseReceipts } from "@/lib/loyverse/api";
import { SyncLoyverseResponse } from "./types";


interface SyncRequest {
  branchName?: string;
  branchCode?: string;
  token?: string;
}

export async function syncLoyverse(
  request: SyncRequest,
): Promise<SyncLoyverseResponse> {
  try {
    const branchName =
      request.branchName?.trim();

    const branchCode =
      request.branchCode?.trim();

    const token =
      request.token?.trim();

    if (!branchName) {
      return {
        success: false,
        status: 400,
        message: "Branch name is required.",
      };
    }

    if (!branchCode) {
      return {
        success: false,
        status: 400,
        message: "Branch code is required.",
      };
    }

    if (!token) {
      return {
        success: false,
        status: 400,
        message: "Loyverse token is required.",
      };
    }

    const items =
      await getLoyverseItems(token);

    const categories =
      await getLoyverseCategories(token);

    const receipts =
      await getLoyverseReceipts(token);

    const dailySales =
      calculateDailySales(receipts);

    const receiptSummary =
      calculateSummary(receipts);

    return {
      success: true,

      branch: {
        name: branchName,
        code: branchCode,
      },

      summary: {
        totalItems: items.length,
        totalCategories: categories.length,
        totalReceipts:
          receiptSummary.totalReceipts,
        totalSales:
          receiptSummary.totalSales,
        totalRefunds:
          receiptSummary.totalRefunds,
        netSales:
          receiptSummary.netSales,
      },

      dailySales,
      items,
      categories,
      receipts,

      syncedAt: new Date().toISOString(),
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Loyverse synchronization failed.";

    console.error(
      "Loyverse sync error:",
      message,
    );

    return {
      success: false,
      status: 500,
      message,
    };
  }
}