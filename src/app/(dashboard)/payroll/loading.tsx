import { Skeleton } from "@/components/ui/skeleton";

export default function PayrollLoading() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-9 w-40 rounded-xl" />
      </div>
      <Skeleton className="h-[32rem] rounded-xl" />
    </div>
  );
}
