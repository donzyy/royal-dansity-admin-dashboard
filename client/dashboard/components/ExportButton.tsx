import { useState } from "react";
import { toast } from "react-hot-toast";

interface ExportButtonProps {
  endpoint: string;
  filename: string;
  label?: string;
  className?: string;
  params?: Record<string, any>;
}

export default function ExportButton({
  endpoint,
  filename,
  label = "Export CSV",
  className = "",
  params = {},
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);

      // Build query string from params
      const queryString = new URLSearchParams(params).toString();
      const url = `http://localhost:5001/api/${endpoint}${
        queryString ? `?${queryString}` : ""
      }`;

      // Fetch the CSV
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Export failed");
      }

      // Get the CSV blob
      const blob = await response.blob();

      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      toast.success("Export completed successfully!");
    } catch (error: any) {
      console.error("Export error:", error);
      toast.error("Failed to export data");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className={`flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {isExporting ? (
        <>
          <span className="animate-spin">⏳</span>
          <span>Exporting...</span>
        </>
      ) : (
        <>
          <span>📥</span>
          <span>{label}</span>
        </>
      )}
    </button>
  );
}


