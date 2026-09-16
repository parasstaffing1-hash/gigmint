"use client";

import * as React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  Loader2,
  Send,
  CalendarClock,
  Wallet,
  FileText,
  Paperclip,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FileUpload, type UploadedFile } from "@/components/ui/file-upload";
import { cn, formatCurrency } from "@/lib/utils";

const bidSchema = z
  .object({
    price: z.number().min(1, "Enter your bid amount"),
    timeline_days: z
      .number()
      .int("Whole days only")
      .min(1, "Enter a timeline in days"),
    cover_letter: z
      .string()
      .min(50, "Tell the client why you're the right fit (min 50 characters)")
      .max(5000, "Keep it under 5,000 characters"),
    milestones: z.array(
      z.object({
        title: z.string().min(1, "Title required"),
        amount: z.number().min(1, "Amount required"),
        days: z.number().int().min(1, "Days required"),
      })
    ),
  })
  .refine(
    (data) =>
      data.milestones.length === 0 ||
      Math.abs(
        data.milestones.reduce((sum, m) => sum + m.amount, 0) - data.price
      ) < 0.01,
    {
      message: "Milestone amounts must add up to your bid price",
      path: ["milestones"],
    }
  );

type BidForm = z.infer<typeof bidSchema>;

interface SubmitBidDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectTitle: string;
  projectBudget?: { min: number; max: number };
}

export function SubmitBidDialog({
  open,
  onOpenChange,
  projectTitle,
  projectBudget,
}: SubmitBidDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [attachments, setAttachments] = React.useState<UploadedFile[]>([]);

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<BidForm>({
    resolver: zodResolver(bidSchema),
    defaultValues: {
      price: 0,
      timeline_days: 14,
      cover_letter: "",
      milestones: [],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "milestones" });

  const price = watch("price");
  const milestones = watch("milestones");
  const milestoneTotal = milestones.reduce((sum, m) => sum + (Number(m.amount) || 0), 0);
  const milestoneBalance = (Number(price) || 0) - milestoneTotal;

  const inBudgetRange =
    projectBudget &&
    (Number(price) || 0) >= projectBudget.min &&
    (Number(price) || 0) <= projectBudget.max;

  async function onSubmit(data: BidForm) {
    setIsSubmitting(true);
    try {
      // TODO: Replace with Supabase insert (`bids` table) + R2 attachment upload
      await new Promise((r) => setTimeout(r, 900));
      toast.success("Bid submitted!", {
        description: "The client has been notified of your proposal.",
      });
      reset();
      setAttachments([]);
      onOpenChange(false);
    } catch {
      toast.error("Failed to submit bid. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      reset();
      setAttachments([]);
    }
    onOpenChange(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-border bg-background  sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Send className="h-5 w-5 text-[#2383e2]" />
            Submit a Bid
          </DialogTitle>
          <DialogDescription className="line-clamp-1">
            {projectTitle}
          </DialogDescription>
          {projectBudget && (
            <div className="pt-1 text-xs text-muted-foreground">
              Client budget: {formatCurrency(projectBudget.min)} –{" "}
              {formatCurrency(projectBudget.max)}
            </div>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Price & Timeline */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="bid-price">
                <Wallet className="mr-1.5 inline h-3.5 w-3.5" />
                Your bid (USD)
              </Label>
              <Input
                id="bid-price"
                type="number"
                min={1}
                step="1"
                placeholder="2400"
                {...register("price", { valueAsNumber: true })}
              />
              {errors.price && (
                <p className="text-xs text-destructive">{errors.price.message}</p>
              )}
              {price > 0 && projectBudget && (
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-xs",
                    inBudgetRange
                      ? "bg-[#edf3ec] text-[#0f7b6c]"
                      : "bg-[#fbf3db] text-[#a87900]"
                  )}
                >
                  {inBudgetRange ? "Within client budget" : "Outside client budget"}
                </Badge>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="bid-timeline">
                <CalendarClock className="mr-1.5 inline h-3.5 w-3.5" />
                Timeline (days)
              </Label>
              <Input
                id="bid-timeline"
                type="number"
                min={1}
                step="1"
                {...register("timeline_days", { valueAsNumber: true })}
              />
              {errors.timeline_days && (
                <p className="text-xs text-destructive">
                  {errors.timeline_days.message}
                </p>
              )}
            </div>
          </div>

          <Separator className="bg-border" />

          {/* Milestones */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>
                <FileText className="mr-1.5 inline h-3.5 w-3.5" />
                Milestones{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  (optional — amounts must sum to your bid)
                </span>
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ title: "", amount: 0, days: 7 })}
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Add milestone
              </Button>
            </div>

            <div className="space-y-2">
              <AnimatePresence initial={false}>
                {fields.map((field, index) => (
                  <motion.div
                    key={field.id}
                    layout
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.18 }}
                    className="grid grid-cols-[1fr_110px_80px_36px] items-center gap-2"
                  >
                    <Input
                      placeholder="Milestone title"
                      aria-label={`Milestone ${index + 1} title`}
                      {...register(`milestones.${index}.title`)}
                    />
                    <Input
                      type="number"
                      min={1}
                      placeholder="$"
                      aria-label={`Milestone ${index + 1} amount`}
                      {...register(`milestones.${index}.amount`, {
                        valueAsNumber: true,
                      })}
                    />
                    <Input
                      type="number"
                      min={1}
                      placeholder="Days"
                      aria-label={`Milestone ${index + 1} duration`}
                      {...register(`milestones.${index}.days`, {
                        valueAsNumber: true,
                      })}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-muted-foreground hover:text-destructive"
                      onClick={() => remove(index)}
                      aria-label={`Remove milestone ${index + 1}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {typeof errors.milestones?.message === "string" && (
              <p className="text-xs text-destructive">
                {errors.milestones.message}
              </p>
            )}
            {milestones.length > 0 && (
              <p
                className={cn(
                  "text-xs tabular-nums",
                  Math.abs(milestoneBalance) < 0.01
                    ? "text-[#0f7b6c]"
                    : "text-amber-400"
                )}
              >
                Milestones total {formatCurrency(milestoneTotal)} ·{" "}
                {Math.abs(milestoneBalance) < 0.01
                  ? "matches your bid"
                  : `${formatCurrency(Math.abs(milestoneBalance))} ${
                      milestoneBalance > 0 ? "unallocated" : "over"
                    }`}
              </p>
            )}
          </div>

          <Separator className="bg-border" />

          {/* Cover letter */}
          <div className="space-y-2">
            <Label htmlFor="cover-letter">Cover letter</Label>
            <textarea
              id="cover-letter"
              rows={6}
              placeholder="Explain your approach: which side you'd advertise first, what each ad says, what you'd spend and why…"
              className="w-full rounded-xl border border-input bg-background/60 px-3.5 py-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              {...register("cover_letter")}
            />
            {errors.cover_letter && (
              <p className="text-xs text-destructive">
                {errors.cover_letter.message}
              </p>
            )}
          </div>

          {/* Attachments */}
          <div className="space-y-2">
            <Label>
              <Paperclip className="mr-1.5 inline h-3.5 w-3.5" />
              Attachments{" "}
              <span className="text-xs font-normal text-muted-foreground">
                (portfolio, past ad results, resume — optional)
              </span>
            </Label>
            <FileUpload
              scope="bids"
            value={attachments}
              onChange={setAttachments}
              maxFiles={4}
              maxSizeMb={25}
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="gold" size="lg" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Submit bid
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
