import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ConnectionStatus } from "@/components/ui/ConnectionStatus";

describe("ConnectionStatus", () => {
  it("shows connected status when isConnected is true", () => {
    render(<ConnectionStatus isConnected={true} />);
    expect(screen.getByText("Connected")).toBeInTheDocument();
  });

  it("shows connecting status when isConnected is false and no error", () => {
    render(<ConnectionStatus isConnected={false} />);
    expect(screen.getByText("Connecting...")).toBeInTheDocument();
  });

  it("shows error status when error is provided", () => {
    const error = new Error("Connection failed");
    render(<ConnectionStatus isConnected={false} error={error} />);
    expect(screen.getByText("Connection Error")).toBeInTheDocument();
  });

  it("shows reconnect button when error and onReconnect are provided", () => {
    const error = new Error("Connection failed");
    const onReconnect = vi.fn();
    render(<ConnectionStatus isConnected={false} error={error} onReconnect={onReconnect} />);
    const reconnectButton = screen.getByText("Reconnect");
    expect(reconnectButton).toBeInTheDocument();
    reconnectButton.click();
    expect(onReconnect).toHaveBeenCalled();
  });
});
