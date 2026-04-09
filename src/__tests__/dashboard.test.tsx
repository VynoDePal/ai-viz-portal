import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Table } from "@/components/ui/Table";

describe("Table Component", () => {
  it("renders table with data", () => {
    const data = [
      { name: "GPT-4", organization: "OpenAI", parameters: 1760000000000 },
      { name: "Claude", organization: "Anthropic", parameters: 400000000000 },
    ];

    const columns = [
      { key: "name" as const, header: "Name" },
      { key: "organization" as const, header: "Organization" },
      { key: "parameters" as const, header: "Parameters" },
    ];

    render(<Table data={data} columns={columns} />);

    expect(screen.getByText("GPT-4")).toBeInTheDocument();
    expect(screen.getByText("Claude")).toBeInTheDocument();
    expect(screen.getByText("OpenAI")).toBeInTheDocument();
  });

  it("renders empty message when no data", () => {
    const columns = [{ key: "name" as const, header: "Name" }];

    render(<Table data={[]} columns={columns} />);

    expect(screen.getByText("No data available")).toBeInTheDocument();
  });

  it("renders custom render function", () => {
    const data = [{ name: "GPT-4", score: 86.4 }];

    const columns = [
      {
        key: "name" as const,
        header: "Name",
        render: (value: string) => <span className="font-bold">{value}</span>,
      },
      {
        key: "score" as const,
        header: "Score",
        render: (value: number) => <span>{value.toFixed(1)}</span>,
      },
    ];

    render(<Table data={data} columns={columns} />);

    expect(screen.getByText("GPT-4")).toBeInTheDocument();
    expect(screen.getByText("86.4")).toBeInTheDocument();
  });
});
