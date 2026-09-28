import { NextResponse } from "next/server";
import { getPayrollPeriod } from "@/server/dal/payroll";
import { toCsv } from "@/lib/csv";
import { UnauthenticatedError, ForbiddenError } from "@/server/dal/session";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ periodId: string }> },
) {
  const { periodId } = await params;

  try {
    const period = await getPayrollPeriod(periodId);
    
    // Fetch employee full payment profile
    const records = await prisma.payrollRecord.findMany({
      where: { payrollPeriodId: periodId },
      include: {
        employee: {
          select: {
            employeeCode: true,
            fullName: true,
            paymentMethod: true,
            bankName: true,
            bankAccountName: true,
            bankAccountNumber: true,
            bankRoutingNumber: true,
            mobileBankingProvider: true,
            mobileBankingNumber: true,
          },
        },
      },
      orderBy: { employee: { fullName: "asc" } },
    });

    const rows = records.map((r) => ({
      employeeCode: r.employee.employeeCode,
      employeeName: r.employee.fullName,
      netSalary: Number(r.netSalary).toFixed(2),
      paymentMethod: r.paymentMethod || r.employee.paymentMethod || "BANK_TRANSFER",
      bankName: r.employee.bankName || "",
      accountName: r.employee.bankAccountName || r.employee.fullName,
      accountNumber: r.employee.bankAccountNumber || "",
      routingNumber: r.employee.bankRoutingNumber || "",
      mobileWallet: r.employee.mobileBankingNumber
        ? `${r.employee.mobileBankingProvider || "Wallet"}: ${r.employee.mobileBankingNumber}`
        : "",
      status: r.paymentStatus,
      paymentReference: r.paymentReference || "",
      paidAt: r.paidAt ? new Date(r.paidAt).toISOString().slice(0, 10) : "",
    }));

    const csv = toCsv(rows, [
      { key: "employeeCode", header: "Employee Code" },
      { key: "employeeName", header: "Employee Name" },
      { key: "netSalary", header: "Net Salary Payable" },
      { key: "paymentMethod", header: "Payment Method" },
      { key: "bankName", header: "Bank Name" },
      { key: "accountName", header: "Account Holder Name" },
      { key: "accountNumber", header: "Account Number / IBAN" },
      { key: "routingNumber", header: "Routing / Branch Code" },
      { key: "mobileWallet", header: "Mobile Wallet" },
      { key: "status", header: "Disbursement Status" },
      { key: "paymentReference", header: "Payment Ref" },
      { key: "paidAt", header: "Paid Date" },
    ]);

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="Bank_Disbursement_${period.year}_${String(period.month).padStart(2, "0")}.csv"`,
      },
    });
  } catch (error) {
    if (error instanceof UnauthenticatedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Export failed" },
      { status: 500 },
    );
  }
}
