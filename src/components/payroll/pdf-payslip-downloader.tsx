"use client";

import { useState } from "react";
import { DownloadIcon, CheckIcon, Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DownloadPayslipButtonProps {
  targetId: string;
  fileName: string;
}

export function DownloadPayslipButton({ targetId, fileName }: DownloadPayslipButtonProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const handleDownload = async () => {
    if (status === "loading") return;
    setStatus("loading");

    try {
      const element = document.getElementById(targetId);
      if (!element) {
        throw new Error("Payslip target element not found.");
      }

      // Dynamic import to optimize bundle size and prevent SSR issues
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);

      const canvas = await html2canvas(element, {
        scale: 2.5,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margin = 10; // 10mm margin
      const contentWidth = pdfWidth - margin * 2;
      const contentHeight = (canvas.height * contentWidth) / canvas.width;

      if (contentHeight <= pdfHeight - margin * 2) {
        pdf.addImage(imgData, "PNG", margin, margin, contentWidth, contentHeight);
      } else {
        let heightLeft = contentHeight;
        let position = margin;

        pdf.addImage(imgData, "PNG", margin, position, contentWidth, contentHeight);
        heightLeft -= pdfHeight - margin * 2;

        while (heightLeft > 0) {
          pdf.addPage();
          position = heightLeft - contentHeight + margin;
          pdf.addImage(imgData, "PNG", margin, position, contentWidth, contentHeight);
          heightLeft -= pdfHeight - margin * 2;
        }
      }

      pdf.save(fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`);
      setStatus("success");
      setTimeout(() => setStatus("idle"), 2500);
    } catch (error) {
      console.error("PDF generation error:", error);
      setStatus("idle");
      alert("Could not generate PDF payslip. Please use the Print option as fallback.");
    }
  };

  return (
    <Button
      variant="default"
      onClick={handleDownload}
      disabled={status === "loading"}
      className="gap-1.5 transition-all shadow-sm"
    >
      {status === "loading" ? (
        <>
          <Loader2Icon className="size-4 animate-spin" />
          <span>Generating PDF...</span>
        </>
      ) : status === "success" ? (
        <>
          <CheckIcon className="size-4 text-emerald-400" />
          <span>Downloaded!</span>
        </>
      ) : (
        <>
          <DownloadIcon className="size-4" />
          <span>Download PDF</span>
        </>
      )}
    </Button>
  );
}
