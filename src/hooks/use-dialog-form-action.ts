import { useState, useTransition } from "react";

// Drives a dialog whose form submits a server action and should close itself
// once that action reports success. Deliberately avoids useActionState +
// a useEffect watching its returned state to trigger setOpen(false) —
// syncing one piece of state from another via an effect causes an extra
// render pass; closing the dialog directly inside the transition callback
// that already owns the state update does not.
export function useDialogFormAction<TState>(
  action: (prevState: TState | undefined, formData: FormData) => Promise<TState>,
  isSuccess: (state: TState) => boolean,
) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<TState | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  function formAction(formData: FormData) {
    startTransition(async () => {
      const result = await action(state, formData);
      setState(result);
      if (isSuccess(result)) {
        setOpen(false);
      }
    });
  }

  return { open, setOpen, state, formAction, isPending };
}
