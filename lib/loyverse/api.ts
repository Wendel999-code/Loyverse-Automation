
import {  getLast31DaysExcludingToday } from "./time";
import {
  CategoriesResponse,
  ItemsResponse,
  LoyverseCategory,
  LoyverseItem,
  LoyverseReceipt,
  ReceiptsResponse,
} from "./types";

const LOYVERSE_API_URL = "https://api.loyverse.com/v1.0";

async function loyverseFetch<T>(
  token: string,
  endpoint: string,
): Promise<T> {
  if (!token?.trim()) {
    throw new Error("Loyverse access token is required.");
  }

  const response = await fetch(
    `${LOYVERSE_API_URL}${endpoint}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
    },
  );

  let data: unknown;

  try {
    data = await response.json();
  } catch {
    throw new Error(
      `Loyverse returned an invalid response (${response.status}).`,
    );
  }

 if (!response.ok) {
  const message =
    typeof data === "object" &&
    data !== null &&
    "message" in data &&
    typeof data.message === "string"
      ? data.message
      : `Loyverse request failed with status ${response.status}.`;

  switch (response.status) {
    case 401:
      throw new Error(
        `${endpoint}: Invalid or expired Loyverse access token.`,
      );

    case 402:
      throw new Error(
        `${endpoint}: Loyverse returned 402 PAYMENT_REQUIRED. ${message}`,
      );

    case 403:
      throw new Error(
        `${endpoint}: The token does not have permission to access this resource.`,
      );

    case 429:
      throw new Error(
        `${endpoint}: Loyverse API rate limit reached. Please try again shortly.`,
      );

    default:
      throw new Error(
        `${endpoint}: ${message}`,
      );
  }
}

  return data as T;
}

/**
 * Retrieve every item through cursor pagination.
 */
export async function getLoyverseItems(
  token: string,
): Promise<LoyverseItem[]> {
  const items: LoyverseItem[] = [];

  let cursor: string | undefined;
  const seenCursors = new Set<string>();

  do {
    const params = new URLSearchParams({
      limit: "250",
    });

    if (cursor) {
      params.set("cursor", cursor);
    }

    const data = await loyverseFetch<ItemsResponse>(
      token,
      `/items?${params.toString()}`,
    );

    items.push(...(data.items ?? []));

    const nextCursor = data.cursor ?? undefined;

    if (!nextCursor) {
      cursor = undefined;
      break;
    }

    if (seenCursors.has(nextCursor)) {
      throw new Error(
        "Duplicate pagination cursor received from Loyverse.",
      );
    }

    seenCursors.add(nextCursor);
    cursor = nextCursor;
  } while (cursor);

  return items.filter((item) => !item.deleted_at);
}

/**
 * Categories currently do not require the cursor loop
 * used by items and receipts.
 */
export async function getLoyverseCategories(
  token: string,
): Promise<LoyverseCategory[]> {
  const data = await loyverseFetch<CategoriesResponse>(
    token,
    "/categories",
  );

  return (data.categories ?? []).filter(
    (category) => !category.deleted_at,
  );
}

/**
 * Retrieve all available receipts using cursor pagination.
 */
export async function getLoyverseReceipts(
  token: string,
): Promise<LoyverseReceipt[]> {
  const receipts: LoyverseReceipt[] = [];

  let cursor: string | undefined;
  const seenCursors = new Set<string>();

  const {
  startDate,
  endDate,
} = getLast31DaysExcludingToday();

  do {
    const params = new URLSearchParams({
      limit: "250",
      created_at_min: startDate.toISOString(),
      created_at_max: endDate.toISOString(),
    });

    if (cursor) {
      params.set("cursor", cursor);
    }

    const data =
      await loyverseFetch<ReceiptsResponse>(
        token,
        `/receipts?${params.toString()}`,
      );

    receipts.push(
      ...(data.receipts ?? []),
    );

    const nextCursor =
      data.cursor ?? undefined;

    if (!nextCursor) {
      break;
    }

    if (seenCursors.has(nextCursor)) {
      throw new Error(
        "Duplicate pagination cursor received from Loyverse.",
      );
    }

    seenCursors.add(nextCursor);
    cursor = nextCursor;
  } while (cursor);

  return receipts;
}