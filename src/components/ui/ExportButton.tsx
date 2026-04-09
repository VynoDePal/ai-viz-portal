"use client";

interface ExportButtonProps {
  table: string;
  format?: "csv" | "json";
  label?: string;
}

export function ExportButton({ table, format = "csv", label }: ExportButtonProps) {
  const handleExport = async () => {
    const projectId = "zhofaxmmywbjbofetfla";
    const url = `https://${projectId}.supabase.co/functions/v1/export-data?table=${table}&format=${format}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Export failed");
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `${table}_export.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Export error:", error);
      alert(`Export failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  return (
    <button
      onClick={handleExport}
      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
    >
      {label || `Export ${format.toUpperCase()}`}
    </button>
  );
}
