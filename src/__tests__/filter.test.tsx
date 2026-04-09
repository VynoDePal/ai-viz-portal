import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Filter } from "@/components/ui/Filter";

describe("Filter Component", () => {
  it("renders filter with options", () => {
    const options = [
      { value: "org1", label: "OpenAI" },
      { value: "org2", label: "Anthropic" },
    ];

    render(
      <Filter
        label="Organization"
        options={options}
        selectedValue={null}
        onFilterChange={vi.fn()}
      />
    );

    expect(screen.getByText("Organization:")).toBeInTheDocument();
    expect(screen.getByText("All")).toBeInTheDocument();
    expect(screen.getByText("OpenAI")).toBeInTheDocument();
    expect(screen.getByText("Anthropic")).toBeInTheDocument();
  });

  it("calls onFilterChange when selecting option", async () => {
    const onFilterChange = vi.fn();
    const user = userEvent.setup();

    const options = [
      { value: "org1", label: "OpenAI" },
      { value: "org2", label: "Anthropic" },
    ];

    render(
      <Filter
        label="Organization"
        options={options}
        selectedValue={null}
        onFilterChange={onFilterChange}
      />
    );

    const select = screen.getByRole("combobox");
    await user.selectOptions(select, "org1");

    expect(onFilterChange).toHaveBeenCalledWith("org1");
  });

  it("shows clear button when value is selected", () => {
    const onFilterChange = vi.fn();

    const options = [
      { value: "org1", label: "OpenAI" },
    ];

    render(
      <Filter
        label="Organization"
        options={options}
        selectedValue="org1"
        onFilterChange={onFilterChange}
      />
    );

    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("calls onFilterChange with null when clearing filter", async () => {
    const onFilterChange = vi.fn();
    const user = userEvent.setup();

    const options = [
      { value: "org1", label: "OpenAI" },
    ];

    render(
      <Filter
        label="Organization"
        options={options}
        selectedValue="org1"
        onFilterChange={onFilterChange}
      />
    );

    const clearButton = screen.getByRole("button");
    await user.click(clearButton);

    expect(onFilterChange).toHaveBeenCalledWith(null);
  });
});
