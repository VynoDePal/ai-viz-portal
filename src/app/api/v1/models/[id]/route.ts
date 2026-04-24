import { NextRequest, NextResponse } from "next/server";
import { APIResponse } from "@/types/api";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Mock data - replace with actual database query
    const model = { id, name: "GPT-4", score: 95.5, benchmark: "MMLU", description: "..." };

    if (!model) {
      const response: APIResponse<null> = {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Model not found",
        },
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: APIResponse<typeof model> = {
      success: true,
      data: model,
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
