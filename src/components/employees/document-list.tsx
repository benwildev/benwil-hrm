"use client";

import { useState, useTransition } from "react";
import { FileIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteDocumentAction } from "@/server/actions/documents.actions";

type Doc = {
  id: string;
  documentType: string;
  documentName: string;
  fileUrl: string;
  notes: string | null;
  createdAt: Date;
};

export function DocumentList({ employeeId, documents }: { employeeId: string; documents: Doc[] }) {
  if (documents.length === 0) {
    return <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {documents.map((doc) => (
        <DocumentRow key={doc.id} employeeId={employeeId} doc={doc} />
      ))}
    </div>
  );
}

function DocumentRow({ employeeId, doc }: { employeeId: string; doc: Doc }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border p-3">
      <a
        href={doc.fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex min-w-0 flex-1 items-center gap-3 hover:underline"
      >
        <FileIcon className="size-4 shrink-0 text-muted-foreground" />
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-medium">{doc.documentName}</span>
          <span className="text-xs text-muted-foreground">
            {doc.documentType} · {new Date(doc.createdAt).toLocaleDateString()}
          </span>
        </div>
      </a>
      <div className="flex items-center gap-2">
        {error ? <span className="text-xs text-destructive">{error}</span> : null}
        <Button
          variant="ghost"
          size="icon-sm"
          disabled={isPending}
          onClick={() => {
            setError(null);
            startTransition(async () => {
              try {
                await deleteDocumentAction(employeeId, doc.id);
              } catch (e) {
                setError(e instanceof Error ? e.message : "Failed to delete.");
              }
            });
          }}
        >
          <Trash2Icon />
          <span className="sr-only">Delete {doc.documentName}</span>
        </Button>
      </div>
    </div>
  );
}
