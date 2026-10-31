
import { syncLoyverse } from "@/lib/loyverse/action";
import { NextResponse } from "next/server";


export async function POST(
  request: Request,
) {
  try {
    const body = await request.json();

    const result =
      await syncLoyverse(body);

    return NextResponse.json(
      result,
      {
        status:
          result.success
            ? 200
            : result.status ?? 500,
      },
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to process synchronization request.",
      },
      {
        status: 500,
      },
    );
  }
}