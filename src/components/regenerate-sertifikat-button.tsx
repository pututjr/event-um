"use client";

import { useState, useTransition } from "react";
import { RefreshCw } from "lucide-react";

import { generateSertifikatAction } from "@/lib/actions/sertifikat";
import { buttonVariants } from "@/components/ui/button";

export function RegenerateSertifikatButton({
  pendaftaranId,
  templateId,
}: {
  pendaftaranId: string;
  templateId: string;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          if (!window.confirm("Generate ulang sertifikat ini?")) return;
          setMessage(null);
          startTransition(async () => {
            const result = await generateSertifikatAction(pendaftaranId, templateId);
            setMessage(result.message);
          });
        }}
        className={buttonVariants({ variant: "secondary", size: "sm" })}
      >
        <RefreshCw className="h-3.5 w-3.5" />
        {isPending ? "Memproses..." : "Regenerate"}
      </button>
      {message && <p className="max-w-xs text-xs text-slate-500">{message}</p>}
    </div>
  );
}
