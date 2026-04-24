import { NextRequest, NextResponse } from "next/server";
import { APIResponse } from "@/types/api";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const benchmark = searchParams.get("benchmark") || "MMLU";

    // Mock data - replace with actual database query
    const rankings = [
      { rank: 1, modelId: "1", modelName: "GPT-4", score: 95.5, benchmark },
      { rank: 2, modelId: "2", modelName: "Claude 3", score: 94.2, benchmark },
      { rank: 3, modelId: "3", modelName: "Gemini Pro", score: 93.8, benchmark },
    ];

    const response: APIResponse<typeof rankings> = {
      success: true,
      data: rankings,
      meta: {
        page: 1,
        limit: 10,
        total: rankings.length,
        totalPages: 1,
      },
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
