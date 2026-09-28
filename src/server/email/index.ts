import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";
import { PERMISSIONS } from "@/lib/permissions";
import { getCompany } from "@/server/dal/company";

interface EmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

function getAppBaseUrl(): string {
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL;
  if (process.env.APP_URL) return process.env.APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

function getTransporter() {
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    return nodemailer.createTransport({
      host: "smtp.resend.com",
      port: 465,
      secure: true,
      auth: {
        user: "resend",
        pass: resendKey,
      },
    });
  }

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }

  return null;
}

export async function sendEmail(payload: EmailPayload): Promise<{ success: boolean; mocked?: boolean }> {
  const from = process.env.SMTP_FROM || '"Benwil HRM" <notifications@benwil.com>';
  const transporter = getTransporter();

  if (!transporter) {
    const recipients = Array.isArray(payload.to) ? payload.to.join(", ") : payload.to;
    console.log("------------------------------------------------------------");
    console.log("✉️  [BENWIL HRM EMAIL SERVICE - DEV PREVIEW]");
    console.log(`To:      ${recipients}`);
    console.log(`Subject: ${payload.subject}`);
    console.log(`From:    ${from}`);
    console.log("------------------------------------------------------------");
    console.log(payload.text || payload.html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 300) + "...");
    console.log("------------------------------------------------------------");
    console.log("💡 Tip: Add SMTP_HOST/USER/PASS or RESEND_API_KEY in .env for live delivery.");
    console.log("------------------------------------------------------------");
    return { success: true, mocked: true };
  }

  try {
    await transporter.sendMail({
      from,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    });
    return { success: true };
  } catch (error) {
    console.error("❌ [BENWIL HRM EMAIL SERVICE ERROR]:", error);
    return { success: false };
  }
}

// --------------------------------------------------------------------------
// HTML Email Templates with High-End SaaS Styling
// --------------------------------------------------------------------------

function renderEmailLayout({
  companyName,
  title,
  preheader,
  contentHtml,
  actionButton,
}: {
  companyName: string;
  title: string;
  preheader?: string;
  contentHtml: string;
  actionButton?: { text: string; url: string };
}) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1e293b;">
  ${preheader ? `<div style="display:none;font-size:1px;color:#f8fafc;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${preheader}</div>` : ""}
  
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8fafc; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 580px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          
          <!-- Header Banner -->
          <tr>
            <td style="padding: 24px 32px; background: #0f172a; border-bottom: 1px solid #1e293b;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td>
                    <div style="font-size: 18px; font-weight: 700; color: #ffffff; letter-spacing: -0.02em;">
                      ${companyName}
                    </div>
                    <div style="font-size: 12px; color: #94a3b8; margin-top: 2px;">
                      HR Management & Payroll System
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Body -->
          <tr>
            <td style="padding: 32px;">
              <h1 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #0f172a; line-height: 1.3;">
                ${title}
              </h1>

              ${contentHtml}

              ${
                actionButton
                  ? `
              <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid #f1f5f9; text-align: left;">
                <a href="${actionButton.url}" style="display: inline-block; background-color: #0f172a; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">
                  ${actionButton.text} &rarr;
                </a>
              </div>
              `
                  : ""
              }
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #f8fafc; border-top: 1px solid #f1f5f9; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #64748b; line-height: 1.5;">
                This automated notification was generated by <strong>${companyName} HRM</strong>.<br />
                Please do not reply directly to this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// --------------------------------------------------------------------------
// 1. Leave Request Notification (to Manager / HR Approvers)
// --------------------------------------------------------------------------

export async function notifyLeaveRequested(leaveRequestId: string) {
  try {
    const [request, company] = await Promise.all([
      prisma.leaveRequest.findUnique({
        where: { id: leaveRequestId },
        include: {
          leaveType: true,
          employee: {
            include: {
              reportingManager: {
                include: { user: true },
              },
              department: true,
            },
          },
        },
      }),
      getCompany(),
    ]);

    if (!request) return;

    const emp = request.employee;
    const empName = emp.fullName;
    const leaveTypeName = request.leaveType.name;
    const daysLabel = request.isHalfDay
      ? `Half Day (0.5 day - ${request.halfDaySession === "FIRST_HALF" ? "First Half / Morning" : "Second Half / Afternoon"})`
      : `${request.totalDays.toString()} day(s)`;
    const dateRange = request.startDate.toISOString().slice(0, 10) === request.endDate.toISOString().slice(0, 10)
      ? request.startDate.toISOString().slice(0, 10)
      : `${request.startDate.toISOString().slice(0, 10)} to ${request.endDate.toISOString().slice(0, 10)}`;

    // Collect recipient emails (manager first, then admins with LEAVE_APPROVE)
    const recipientEmails = new Set<string>();
    if (emp.reportingManager) {
      if (emp.reportingManager.workEmail) recipientEmails.add(emp.reportingManager.workEmail);
      if (emp.reportingManager.personalEmail) recipientEmails.add(emp.reportingManager.personalEmail);
      if (emp.reportingManager.user?.email) recipientEmails.add(emp.reportingManager.user.email);
    }

    // Also get users with LEAVE_APPROVE permission
    const approvers = await prisma.user.findMany({
      where: {
        role: {
          permissions: {
            some: { permission: { key: PERMISSIONS.LEAVE_APPROVE } },
          },
        },
        status: "ACTIVE",
      },
      select: { email: true },
    });
    for (const a of approvers) {
      if (a.email) recipientEmails.add(a.email);
    }

    if (recipientEmails.size === 0 && company.email) {
      recipientEmails.add(company.email);
    }

    if (recipientEmails.size === 0) {
      console.log(`[EMAIL] No manager or approver email found for leave request ${leaveRequestId}.`);
      return;
    }

    const appUrl = getAppBaseUrl();
    const contentHtml = `
      <p style="font-size: 15px; line-height: 1.5; color: #334155; margin-bottom: 20px;">
        <strong>${empName}</strong> (${emp.employeeCode}) has submitted a new leave application awaiting your review:
      </p>

      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse; background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 20px;">
        <tr>
          <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #64748b; width: 35%;">Leave Type</td>
          <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; font-weight: 600; color: #0f172a;">${leaveTypeName}</td>
        </tr>
        <tr>
          <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #64748b;">Duration</td>
          <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; font-weight: 600; color: #0f172a;">${daysLabel}</td>
        </tr>
        <tr>
          <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #64748b;">Dates</td>
          <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; font-weight: 600; color: #0f172a;">${dateRange}</td>
        </tr>
        ${
          request.reason
            ? `
        <tr>
          <td style="padding: 12px 16px; font-size: 13px; color: #64748b;">Reason</td>
          <td style="padding: 12px 16px; font-size: 13px; color: #0f172a;">${request.reason}</td>
        </tr>
        `
            : ""
        }
      </table>
    `;

    const html = renderEmailLayout({
      companyName: company.name,
      title: "New Leave Application",
      preheader: `${empName} applied for ${leaveTypeName} (${daysLabel})`,
      contentHtml,
      actionButton: {
        text: "Review Application in Dashboard",
        url: `${appUrl}/leave`,
      },
    });

    await sendEmail({
      to: Array.from(recipientEmails),
      subject: `[Leave Request] ${empName} - ${leaveTypeName} (${daysLabel})`,
      html,
    });
  } catch (error) {
    console.error("Failed to execute notifyLeaveRequested:", error);
  }
}

// --------------------------------------------------------------------------
// 2. Leave Decision Notification (to Employee)
// --------------------------------------------------------------------------

export async function notifyLeaveDecision(leaveRequestId: string) {
  try {
    const [request, company] = await Promise.all([
      prisma.leaveRequest.findUnique({
        where: { id: leaveRequestId },
        include: {
          leaveType: true,
          employee: {
            include: { user: true },
          },
          reviewedBy: true,
        },
      }),
      getCompany(),
    ]);

    if (!request) return;

    const emp = request.employee;
    const recipientEmail = emp.workEmail || emp.personalEmail || emp.user?.email;
    if (!recipientEmail) {
      console.log(`[EMAIL] Employee ${emp.fullName} has no email configured for leave decision.`);
      return;
    }

    const isApproved = request.status === "APPROVED";
    const statusColor = isApproved ? "#10b981" : "#ef4444";
    const statusBg = isApproved ? "#ecfdf5" : "#fef2f2";
    const statusBorder = isApproved ? "#a7f3d0" : "#fecaca";
    const statusText = isApproved ? "Approved" : "Rejected";

    const daysLabel = request.isHalfDay
      ? `Half Day (0.5 day - ${request.halfDaySession === "FIRST_HALF" ? "First Half" : "Second Half"})`
      : `${request.totalDays.toString()} day(s)`;

    const dateRange = request.startDate.toISOString().slice(0, 10) === request.endDate.toISOString().slice(0, 10)
      ? request.startDate.toISOString().slice(0, 10)
      : `${request.startDate.toISOString().slice(0, 10)} to ${request.endDate.toISOString().slice(0, 10)}`;

    const appUrl = getAppBaseUrl();

    const contentHtml = `
      <p style="font-size: 15px; line-height: 1.5; color: #334155; margin-bottom: 20px;">
        Hello <strong>${emp.fullName}</strong>, your leave application has been reviewed:
      </p>

      <div style="background-color: ${statusBg}; border: 1px solid ${statusBorder}; border-radius: 8px; padding: 16px; margin-bottom: 24px; text-align: center;">
        <span style="display: inline-block; font-size: 16px; font-weight: 700; color: ${statusColor}; text-transform: uppercase; letter-spacing: 0.05em;">
          ● Request ${statusText}
        </span>
      </div>

      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse; background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 20px;">
        <tr>
          <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #64748b; width: 35%;">Leave Type</td>
          <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; font-weight: 600; color: #0f172a;">${request.leaveType.name}</td>
        </tr>
        <tr>
          <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #64748b;">Dates</td>
          <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; font-weight: 600; color: #0f172a;">${dateRange}</td>
        </tr>
        <tr>
          <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #64748b;">Duration</td>
          <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; font-weight: 600; color: #0f172a;">${daysLabel}</td>
        </tr>
        ${
          request.reviewNote
            ? `
        <tr>
          <td style="padding: 12px 16px; font-size: 13px; color: #64748b;">Reviewer Note</td>
          <td style="padding: 12px 16px; font-size: 13px; font-weight: 500; color: #0f172a;">${request.reviewNote}</td>
        </tr>
        `
            : ""
        }
      </table>
    `;

    const html = renderEmailLayout({
      companyName: company.name,
      title: `Leave Application ${statusText}`,
      preheader: `Your ${request.leaveType.name} request for ${dateRange} has been ${statusText.toLowerCase()}.`,
      contentHtml,
      actionButton: {
        text: "View Leave History",
        url: `${appUrl}/leave`,
      },
    });

    await sendEmail({
      to: recipientEmail,
      subject: `[Leave ${statusText}] ${request.leaveType.name} (${dateRange})`,
      html,
    });
  } catch (error) {
    console.error("Failed to execute notifyLeaveDecision:", error);
  }
}

// --------------------------------------------------------------------------
// 3. Payslip Release Notification (Single or Bulk)
// --------------------------------------------------------------------------

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export async function notifyPayslipReleased(payrollRecordId: string) {
  try {
    const [record, company] = await Promise.all([
      prisma.payrollRecord.findUnique({
        where: { id: payrollRecordId },
        include: {
          payrollPeriod: true,
          employee: {
            include: { user: true },
          },
        },
      }),
      getCompany(),
    ]);

    if (!record) return;

    const emp = record.employee;
    const recipientEmail = emp.workEmail || emp.personalEmail || emp.user?.email;
    if (!recipientEmail) {
      console.log(`[EMAIL] Employee ${emp.fullName} has no email configured for payslip alert.`);
      return;
    }

    const monthName = MONTH_NAMES[record.payrollPeriod.month - 1];
    const year = record.payrollPeriod.year;
    const appUrl = getAppBaseUrl();

    const contentHtml = `
      <p style="font-size: 15px; line-height: 1.5; color: #334155; margin-bottom: 20px;">
        Hello <strong>${emp.fullName}</strong>, your salary statement for <strong>${monthName} ${year}</strong> is now available for viewing and 1-click PDF download:
      </p>

      <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border-radius: 10px; padding: 20px; color: #ffffff; margin-bottom: 24px;">
        <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: #94a3b8;">
          Net Payable Amount
        </div>
        <div style="font-size: 28px; font-weight: 700; color: #ffffff; margin-top: 6px;">
          ${record.netSalary.toString()}
        </div>
        <div style="font-size: 12px; color: #38bdf8; margin-top: 4px;">
          Status: ${record.paymentStatus}
        </div>
      </div>

      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse; background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 20px;">
        <tr>
          <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #64748b; width: 40%;">Gross Earnings</td>
          <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; font-weight: 600; color: #0f172a;">${record.totalEarnings.toString()}</td>
        </tr>
        <tr>
          <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #64748b;">Total Deductions</td>
          <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; font-weight: 600; color: #ef4444;">-${record.totalDeductions.toString()}</td>
        </tr>
        <tr>
          <td style="padding: 12px 16px; font-size: 13px; color: #64748b;">Period</td>
          <td style="padding: 12px 16px; font-size: 13px; font-weight: 600; color: #0f172a;">${monthName} ${year}</td>
        </tr>
      </table>
    `;

    const html = renderEmailLayout({
      companyName: company.name,
      title: `Payslip Available: ${monthName} ${year}`,
      preheader: `Your payslip for ${monthName} ${year} is ready. Net pay: ${record.netSalary.toString()}`,
      contentHtml,
      actionButton: {
        text: "View & Download Payslip PDF",
        url: `${appUrl}/payroll/${record.payrollPeriodId}/${record.id}`,
      },
    });

    await sendEmail({
      to: recipientEmail,
      subject: `[Payslip Ready] ${monthName} ${year} Salary Statement`,
      html,
    });
  } catch (error) {
    console.error("Failed to execute notifyPayslipReleased:", error);
  }
}

export async function notifyBulkPayslipsReleased(payrollPeriodId: string) {
  try {
    const records = await prisma.payrollRecord.findMany({
      where: { payrollPeriodId },
      select: { id: true },
    });

    for (const rec of records) {
      await notifyPayslipReleased(rec.id);
    }
  } catch (error) {
    console.error("Failed to execute notifyBulkPayslipsReleased:", error);
  }
}
