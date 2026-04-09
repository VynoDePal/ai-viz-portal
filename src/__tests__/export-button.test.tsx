import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ExportButton } from "@/components/ui/ExportButton";

describe("ExportButton", () => {
  it("renders with default label", () => {
    render(<ExportButton table="models" />);
    expect(screen.getByText("Export CSV")).toBeInTheDocument();
  });

  it("renders with custom label", () => {
    render(<ExportButton table="models" label="Download CSV" />);
    expect(screen.getByText("Download CSV")).toBeInTheDocument();
  });

  it("calls export function on click", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      blob: vi.fn().mockResolvedValue(new Blob(["test"], { type: "text/csv" })),
    });
    global.fetch = mockFetch;

    render(<ExportButton table="models" />);
    const button = screen.getByText("Export CSV");
    button.click();

    expect(mockFetch).toHaveBeenCalledWith(
      "https://zhofaxmmywbjbofetfla.supabase.co/functions/v1/export-data?table=models&format=csv",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  });
});
