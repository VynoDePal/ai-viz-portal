import { NextRequest, NextResponse } from "next/server";
import { APIResponse, ModelComparisonRequest } from "@/types/api";

export async function POST(request: NextRequest) {
  try {
    const body: ModelComparisonRequest = await request.json();

    if (!body.modelIds || body.modelIds.length < 2) {
      const response: APIResponse<null> = {
        success: false,
        error: {
          code: "INVALID_REQUEST",
          message: "At least 2 model IDs are required for comparison",
        },
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Mock data - replace with actual database query
    const comparison = {
      models: [
        { id: body.modelIds[0], name: "GPT-4", score: 95.5 },
        { id: body.modelIds[1], name: "Claude 3", score: 94.2 },
      ],
      benchmark: body.benchmark || "MMLU",
      comparison: {
        difference: 1.3,
        winner: body.modelIds[0],
      },
    };

    const response: APIResponse<typeof comparison> = {
      success: true,
      data: comparison,
    };

    return NextResponse.json(response);
  } catch (error) {
    const response: APIResponse<null> = {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: error instanceof Error ? error.message : "An error occurred",
      },
    };
    return NextResponse.json(response, { status: 500 });
  }
}
