import { NextRequest, NextResponse } from "next/server";
import { APIResponse } from "@/types/api";

export async function GET(request: NextRequest) {
  try {
    // Mock data - replace with actual database query
    const benchmarks = [
      { id: "1", name: "MMLU", description: "Massive Multitask Language Understanding" },
      { id: "2", name: "HumanEval", description: "Python programming problems" },
      { id: "3", name: "GSM8K", description: "Grade school math problems" },
    ];

    const response: APIResponse<typeof benchmarks> = {
      success: true,
      data: benchmarks,
      meta: {
        page: 1,
        limit: 10,
        total: benchmarks.length,
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
