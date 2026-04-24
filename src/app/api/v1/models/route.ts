import { NextRequest, NextResponse } from "next/server";
import { APIResponse, ModelFilters } from "@/types/api";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filters: ModelFilters = {
      name: searchParams.get("name") || undefined,
      benchmark: searchParams.get("benchmark") || undefined,
      minScore: searchParams.get("minScore")
        ? parseFloat(searchParams.get("minScore")!)
        : undefined,
      maxScore: searchParams.get("maxScore")
        ? parseFloat(searchParams.get("maxScore")!)
        : undefined,
      sortBy: (searchParams.get("sortBy") as any) || "score",
      sortOrder: (searchParams.get("sortOrder") as any) || "desc",
    };

    // Mock data - replace with actual database query
    const models = [
      { id: "1", name: "GPT-4", score: 95.5, benchmark: "MMLU" },
      { id: "2", name: "Claude 3", score: 94.2, benchmark: "MMLU" },
      { id: "3", name: "Gemini Pro", score: 93.8, benchmark: "MMLU" },
    ];

    const response: APIResponse<typeof models> = {
      success: true,
      data: models,
      meta: {
        page: 1,
        limit: 10,
        total: models.length,
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
