"use client";

import { useRef, useState } from "react";

interface SignedUrlResponse {
  data: { uploadUrl: string; storageKey: string };
  error: null | string;
}

export function MediaUploader({ userId }: { userId: string }): JSX.Element {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function handleFiles(files: FileList | null): Promise<void> {
    if (!files || files.length === 0) return;

    setUploading(true);
    setStatus(null);

    for (const file of Array.from(files)) {
      try {
        const mediaType = file.type.startsWith("video/") ? "VIDEO" : "IMAGE";

        // 1. Get signed URL from API
        const signedRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/api/v1/storage/signed-url`,
          {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              userId,
              fileName: file.name,
              mimeType: file.type,
              mediaType
            })
          }
        );

        if (!signedRes.ok) {
          setStatus("Error al obtener la URL de subida.");
          continue;
        }

        const { data } = (await signedRes.json()) as SignedUrlResponse;

        // 2. Upload directly to S3
        const uploadRes = await fetch(data.uploadUrl, {
          method: "PUT",
          headers: { "content-type": file.type },
          body: file
        });

        if (!uploadRes.ok) {
          setStatus("Error al subir el archivo.");
          continue;
        }

        setStatus("Foto subida. Pendiente de moderación.");
      } catch {
        setStatus("Error inesperado al subir.");
      }
    }

    setUploading(false);

    // Reload to show new assets
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  }

  return (
    <div
      className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-white/20 bg-white/3 px-6 py-10 text-center transition hover:border-brand-accent/40 hover:bg-white/5"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        void handleFiles(e.dataTransfer.files);
      }}
    >
      <svg className="text-white/30" fill="none" height={36} stroke="currentColor" strokeWidth={1.2} viewBox="0 0 24 24" width={36}>
        <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      <div>
        <p className="text-sm font-medium text-white">Arrastra fotos aquí</p>
        <p className="mt-0.5 text-xs text-white/40">o haz clic para seleccionar</p>
      </div>

      <input
        accept="image/*,video/*"
        className="hidden"
        multiple
        onChange={(e) => void handleFiles(e.target.files)}
        ref={inputRef}
        type="file"
      />

      <button
        className="rounded-xl bg-brand-accent px-5 py-2 text-sm font-semibold text-black transition hover:opacity-90 disabled:opacity-50"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        type="button"
      >
        {uploading ? "Subiendo..." : "Seleccionar fotos"}
      </button>

      {status ? <p className="text-xs text-white/50">{status}</p> : null}
    </div>
  );
}
