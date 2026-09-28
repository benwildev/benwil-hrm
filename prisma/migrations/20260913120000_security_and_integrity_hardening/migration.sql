-- Biometric device shared secret: optional, opaque key a device (or an
-- on-prem relay in front of it) must present via a `key`/`apikey` query
-- param on every push to /api/iclock/*, on top of its serial number.
ALTER TABLE "biometric_devices" ADD COLUMN "api_key" TEXT;
CREATE UNIQUE INDEX "biometric_devices_api_key_key" ON "biometric_devices"("api_key");

-- Supports the dashboard's "recent check-ins" activity feed, which orders
-- by check_in and previously had no covering index.
CREATE INDEX "attendance_records_check_in_idx" ON "attendance_records"("check_in");

-- Data-integrity guardrails: money fields can never go negative, and a
-- salary/component's effective date range can never be inverted. These
-- mirror validation the application already performs, added here as a
-- database-level backstop.
ALTER TABLE "employee_salaries"
  ADD CONSTRAINT "employee_salaries_basic_salary_check" CHECK ("basic_salary" >= 0),
  ADD CONSTRAINT "employee_salaries_date_range_check" CHECK ("effective_to" IS NULL OR "effective_to" >= "effective_from");

ALTER TABLE "employee_salary_components"
  ADD CONSTRAINT "employee_salary_components_amount_check" CHECK ("amount" >= 0),
  ADD CONSTRAINT "employee_salary_components_date_range_check" CHECK ("effective_to" IS NULL OR "effective_to" >= "effective_from");

ALTER TABLE "salary_components"
  ADD CONSTRAINT "salary_components_default_amount_check" CHECK ("default_amount" >= 0);

ALTER TABLE "payroll_records"
  ADD CONSTRAINT "payroll_records_basic_salary_check" CHECK ("basic_salary" >= 0),
  ADD CONSTRAINT "payroll_records_total_earnings_check" CHECK ("total_earnings" >= 0),
  ADD CONSTRAINT "payroll_records_total_deductions_check" CHECK ("total_deductions" >= 0),
  ADD CONSTRAINT "payroll_records_overtime_amount_check" CHECK ("overtime_amount" >= 0),
  ADD CONSTRAINT "payroll_records_bonus_amount_check" CHECK ("bonus_amount" >= 0),
  ADD CONSTRAINT "payroll_records_net_salary_check" CHECK ("net_salary" >= 0);

ALTER TABLE "payroll_items"
  ADD CONSTRAINT "payroll_items_amount_check" CHECK ("amount" >= 0);
