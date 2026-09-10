import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { NewSalaryComponentDialog } from "@/components/settings/new-salary-component-dialog";
import { SalaryComponentActiveToggle } from "@/components/settings/salary-component-active-toggle";
import { listSalaryComponents } from "@/server/dal/salary-components";

export default async function SalaryComponentsPage() {
  const components = await listSalaryComponents();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Salary components</h1>
          <p className="text-sm text-muted-foreground">
            Allowances and deductions that can be assigned to employees.
          </p>
        </div>
        <NewSalaryComponentDialog />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Calculation</TableHead>
            <TableHead>Default</TableHead>
            <TableHead>Active</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {components.map((c) => (
            <TableRow key={c.id}>
              <TableCell className="font-medium">{c.name}</TableCell>
              <TableCell>
                <Badge variant={c.componentType === "EARNING" ? "default" : "destructive"}>
                  {c.componentType}
                </Badge>
              </TableCell>
              <TableCell>{c.calculationType === "PERCENTAGE" ? "% of basic" : "Fixed"}</TableCell>
              <TableCell>
                {c.defaultAmount.toString()}
                {c.calculationType === "PERCENTAGE" ? "%" : ""}
              </TableCell>
              <TableCell>
                <SalaryComponentActiveToggle id={c.id} isActive={c.isActive} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
