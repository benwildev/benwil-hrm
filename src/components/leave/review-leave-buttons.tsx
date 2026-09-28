"use client";

import { useState, useTransition } from "react";
import { CheckIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { approveLeaveRequestAction, rejectLeaveRequestAction } from "@/server/actions/leave-requests.actions";

export function ReviewLeaveButtons({ requestId }: { requestId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [rejectOpen, setRejectOpen] = useState(false);

  return (
    <div className="flex items-center gap-2">
      {error ? <span className="text-xs text-destructive">{error}</span> : null}
      <Button
        size="sm"
        disabled={isPending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            try {
              await approveLeaveRequestAction(requestId);
            } catch (e) {
              setError(e instanceof Error ? e.message : "Failed to approve.");
            }
          });
        }}
      >
        <CheckIcon />
        Approve
      </Button>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogTrigger render={<Button size="sm" variant="destructive" />}>
          <XIcon />
          Reject
        </DialogTrigger>
        <DialogContent>
          <form
            action={(formData) => {
              const note = formData.get("reviewNote");
              startTransition(async () => {
                setError(null);
                try {
                  await rejectLeaveRequestAction(
                    requestId,
                    typeof note === "string" && note.trim() ? note.trim() : undefined,
                  );
                  setRejectOpen(false);
                } catch (e) {
                  setError(e instanceof Error ? e.message : "Failed to reject.");
                }
              });
            }}
            className="flex flex-col gap-4"
          >
            <DialogHeader>
              <DialogTitle>Reject leave request</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-2">
              <Label htmlFor="reviewNote">Reason</Label>
              <Input id="reviewNote" name="reviewNote" placeholder="Optional" />
            </div>
            <DialogFooter>
              <Button type="submit" variant="destructive" disabled={isPending}>
                {isPending ? "Rejecting..." : "Reject"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
