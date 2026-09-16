"use client";

import * as React from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import {
  UploadCloud,
  File as FileIcon,
  Image as ImageIcon,
  FileText,
  Video,
  X,
  CircleCheck,
  TriangleAlert,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface UploadedFile {
  key: string;
  url: string;
  name: string;
  size: number;
  contentType: string;
}

type UploadState = "uploading" | "done" | "error";

interface Item {
  id: string;
  file: File;
  state: UploadState;
  progress: number;
  error?: string;
  result?: UploadedFile;
}

function fileIcon(type: string) {
  if (type.startsWith("image/")) return ImageIcon;
  if (type.startsWith("video/")) return Video;
  if (type === "application/pdf") return FileText;
  return FileIcon;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function FileUpload({
  scope,
  value = [],
  onChange,
  maxFiles = 5,
  maxSizeMb = 25,
  accept,
  className,
}: {
  scope: "projects" | "bids" | "messages" | "avatars" | "portfolios";
  value?: UploadedFile[];
  onChange?: (files: UploadedFile[]) => void;
  maxFiles?: number;
  maxSizeMb?: number;
  accept?: Record<string, string[]>;
  className?: string;
}) {
  const [items, setItems] = React.useState<Item[]>([]);

  const upload = React.useCallback(
    async (item: Item) => {
      const set = (patch: Partial<Item>) =>
        setItems((prev) => prev.map((it) => (it.id === item.id ? { ...it, ...patch } : it)));

      set({ state: "uploading", progress: 30 });
      try {
        const form = new FormData();
        form.append("file", item.file);
        form.append("scope", scope);
        // XHR (not fetch) so we get progress events
        const result = await new Promise<UploadedFile>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("POST", "/api/files/upload");
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) set({ progress: Math.round((e.loaded / e.total) * 90) + 5 });
          };
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(JSON.parse(xhr.responseText));
            } else {
              try {
                reject(new Error(JSON.parse(xhr.responseText).error ?? "Upload failed"));
              } catch {
                reject(new Error(`Upload failed (${xhr.status})`));
              }
            }
          };
          xhr.onerror = () => reject(new Error("Network error"));
          xhr.send(form);
        });
        set({ state: "done", progress: 100, result });
        onChange?.([...(value ?? []), result]);
      } catch (err) {
        set({ state: "error", error: err instanceof Error ? err.message : "Upload failed" });
      }
    },
    [scope, value, onChange]
  );

  const onDrop = React.useCallback(
    (accepted: File[]) => {
      setItems((prev) => {
        const room = maxFiles - prev.filter((i) => i.state !== "error").length;
        const next = accepted.slice(0, Math.max(0, room)).map((file, i) => ({
          id: `${Date.now()}-${i}-${file.name}`,
          file,
          state: "uploading" as const,
          progress: 0,
        }));
        next.forEach(upload);
        return [...prev, ...next];
      });
    },
    [maxFiles, upload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles,
    maxSize: maxSizeMb * 1024 * 1024,
    multiple: maxFiles > 1,
    accept,
  });

  const remove = (id: string) => {
    setItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item?.result) {
        onChange?.((value ?? []).filter((v) => v.key !== item.result!.key));
      }
      return prev.filter((i) => i.id !== id);
    });
  };

  const activeCount = items.filter((i) => i.state !== "error").length;

  return (
    <div className={className}>
      <div
        {...getRootProps()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-md border border-dashed px-6 py-8 text-center transition-colors",
          isDragActive
            ? "border-[#2383e2] bg-[#e7f3f8]"
            : "border-[rgba(55,53,47,0.18)] hover:bg-[rgba(55,53,47,0.03)]"
        )}
        role="button"
        aria-label={`Upload files, up to ${maxFiles}`}
      >
        <input {...getInputProps()} />
        <UploadCloud className="h-6 w-6 text-[rgba(55,53,47,0.4)]" />
        <p className="text-sm font-medium text-[rgb(55,53,47)]">
          {isDragActive ? "Drop to upload" : "Drag & drop or click to upload"}
        </p>
        <p className="text-xs text-[rgba(55,53,47,0.5)]">
          Images, PDF, video, zip · up to {maxSizeMb}MB · {maxFiles - activeCount} slot
          {maxFiles - activeCount === 1 ? "" : "s"} left
        </p>
      </div>

      <AnimatePresence>
        {items.length > 0 && (
          <motion.ul initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 space-y-2">
            {items.map((item) => {
              const Icon = fileIcon(item.file.type);
              const isImage = item.file.type.startsWith("image/");
              return (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-3 rounded-md border p-2.5"
                  style={{ borderColor: "var(--notion-border)" }}
                >
                  {isImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={URL.createObjectURL(item.file)}
                      alt=""
                      className="h-9 w-9 shrink-0 rounded object-cover"
                    />
                  ) : (
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded"
                      style={{ background: "var(--notion-gray-bg)" }}
                    >
                      <Icon className="h-4 w-4 text-[rgba(55,53,47,0.6)]" />
                    </span>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-[13px] font-medium text-[rgb(55,53,47)]">
                        {item.file.name}
                      </span>
                      {item.state === "done" && (
                        <CircleCheck className="h-3.5 w-3.5 shrink-0 text-[#0f7b6c]" />
                      )}
                      {item.state === "error" && (
                        <TriangleAlert className="h-3.5 w-3.5 shrink-0 text-[#e03e3e]" />
                      )}
                      {item.state === "uploading" && (
                        <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-[rgba(55,53,47,0.4)]" />
                      )}
                    </div>
                    <div className="text-xs text-[rgba(55,53,47,0.5)]">
                      {item.state === "error"
                        ? item.error
                        : item.state === "done"
                          ? `${formatSize(item.file.size)} · uploaded`
                          : `${formatSize(item.file.size)} · uploading… ${item.progress}%`}
                    </div>
                    {item.state === "uploading" && (
                      <div
                        className="mt-1.5 h-1 overflow-hidden rounded-full"
                        style={{ background: "var(--notion-gray-bg)" }}
                      >
                        <div
                          className="h-full rounded-full bg-[#2383e2] transition-[width] duration-200"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => remove(item.id)}
                    className="rounded p-1 text-[rgba(55,53,47,0.4)] transition-colors hover:bg-[rgba(55,53,47,0.06)] hover:text-[rgb(55,53,47)]"
                    aria-label={`Remove ${item.file.name}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </motion.li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
