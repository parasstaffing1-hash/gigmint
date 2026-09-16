"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import {
  Plus,
  Trash2,
  GripVertical,
  Upload,
  Loader2,
  Save,
  Eye,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { CATEGORIES, SKILLS, EXPERIENCE_LEVELS } from "@/config/constants";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import { FileUpload, type UploadedFile } from "@/components/ui/file-upload";

const projectSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters"),
  category: z.string().min(1, "Please select a category"),
  budget_min: z.number().min(100, "Minimum budget is $100"),
  budget_max: z.number().min(100, "Maximum budget is $100"),
  project_type: z.enum(["fixed", "hourly"]),
  experience_level: z.enum(["entry", "intermediate", "expert"]),
  skills: z.array(z.string()).min(1, "Add at least one skill"),
  deadline: z.string().optional(),
  location: z.string().optional(),
  description: z.string().min(50, "Description must be at least 50 characters"),
  sections: z.array(
    z.object({
      title: z.string().min(1, "Section title is required"),
      content: z.string().min(10, "Section content is required"),
    })
  ),
  visibility: z.enum(["public", "invite_only"]),
});

type ProjectForm = z.infer<typeof projectSchema>;

export default function NewProjectPage() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [skillInput, setSkillInput] = React.useState("");
  const [attachments, setAttachments] = React.useState<UploadedFile[]>([]);
  const router = useRouter();

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<ProjectForm>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      category: "",
      budget_min: 0,
      budget_max: 0,
      project_type: "fixed",
      experience_level: "intermediate",
      skills: [],
      sections: [
        { title: "Project Description", content: "" },
        { title: "Requirements", content: "" },
        { title: "Deliverables", content: "" },
      ],
      visibility: "public",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "sections",
  });

  const selectedSkills = watch("skills");

  function addSkill(skill: string) {
    if (skill && !selectedSkills.includes(skill)) {
      setValue("skills", [...selectedSkills, skill]);
      setSkillInput("");
    }
  }

  function removeSkill(skill: string) {
    setValue(
      "skills",
      selectedSkills.filter((s) => s !== skill)
    );
  }

  async function onSubmit(data: ProjectForm) {
    setIsSubmitting(true);
    try {
      // Replace with Supabase insert
      toast.success("Project created!", {
        description: "Your project is now live.",
      });
      router.push("/client/dashboard");
    } catch {
      toast.error("Failed to create project");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function saveDraft() {
    const data = getValues();
    // Save to Supabase as draft
    toast.success("Draft saved", {
      description: "Your project has been saved as a draft.",
    });
  }

  return (
    <div className="min-h-screen pt-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Create a Project</h1>
              <p className="mt-2 text-muted-foreground">
                Describe your project and find the perfect freelancer
              </p>
            </div>
            <Button variant="ghost" onClick={saveDraft}>
              <Save className="mr-2 h-4 w-4" />
              Save Draft
            </Button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Info */}
            <Card className="border-border bg-secondary/50">
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Project Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Build a SaaS Dashboard with Real-Time Analytics"
                    {...register("title")}
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive">{errors.title.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={watch("category")}
                    onValueChange={(v) => setValue("category", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-sm text-destructive">{errors.category.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <RichTextEditor
                    content={watch("description") || ""}
                    onChange={(html) => setValue("description", html)}
                    placeholder="Provide a detailed description of your project — use headings, lists and links…"
                    minHeight={220}
                    maxLength={20000}
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive">
                      {errors.description.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Budget & Type */}
            <Card className="border-border bg-secondary/50">
              <CardHeader>
                <CardTitle>Budget & Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Project Type</Label>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant={watch("project_type") === "fixed" ? "default" : "outline"}
                      onClick={() => setValue("project_type", "fixed")}
                    >
                      Fixed Price
                    </Button>
                    <Button
                      type="button"
                      variant={watch("project_type") === "hourly" ? "default" : "outline"}
                      onClick={() => setValue("project_type", "hourly")}
                    >
                      Hourly Rate
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="budget_min">Minimum Budget ($)</Label>
                    <Input
                      id="budget_min"
                      type="number"
                      placeholder="5000"
                      {...register("budget_min", { valueAsNumber: true })}
                    />
                    {errors.budget_min && (
                      <p className="text-sm text-destructive">
                        {errors.budget_min.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="budget_max">Maximum Budget ($)</Label>
                    <Input
                      id="budget_max"
                      type="number"
                      placeholder="10000"
                      {...register("budget_max", { valueAsNumber: true })}
                    />
                    {errors.budget_max && (
                      <p className="text-sm text-destructive">
                        {errors.budget_max.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Experience Level</Label>
                    <Select
                      value={watch("experience_level")}
                      onValueChange={(v) =>
                        setValue("experience_level", v as "entry" | "intermediate" | "expert")
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {EXPERIENCE_LEVELS.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deadline">Deadline</Label>
                    <Input
                      id="deadline"
                      type="date"
                      {...register("deadline")}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Skills */}
            <Card className="border-border bg-secondary/50">
              <CardHeader>
                <CardTitle>Required Skills</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {selectedSkills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="gap-1 pr-1">
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="ml-1 rounded-full hover:bg-accent p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Select
                    value=""
                    onValueChange={(v) => addSkill(v)}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Add a skill..." />
                    </SelectTrigger>
                    <SelectContent>
                      {SKILLS.filter((s) => !selectedSkills.includes(s)).map(
                        (skill) => (
                          <SelectItem key={skill} value={skill}>
                            {skill}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
                {errors.skills && (
                  <p className="text-sm text-destructive">{errors.skills.message}</p>
                )}
              </CardContent>
            </Card>

            {/* Project Sections */}
            <Card className="border-border bg-secondary/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Project Sections</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ title: "", content: "" })}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Section
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="space-y-3 p-4 rounded-xl border border-border bg-secondary/50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Section Title"
                          className="font-medium border-0 bg-transparent px-0 focus-visible:ring-0 w-auto"
                          {...register(`sections.${index}.title`)}
                        />
                      </div>
                      {index > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                    <Textarea
                      placeholder="Section content..."
                      className="min-h-[100px] border-0 bg-transparent focus-visible:ring-0 resize-none"
                      {...register(`sections.${index}.content`)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Attachments */}
            <Card className="border-border bg-secondary/50">
              <CardHeader>
                <CardTitle>Attachments</CardTitle>
              </CardHeader>
              <CardContent>
                <FileUpload
                  scope="projects"
                  value={attachments}
                  onChange={setAttachments}
                  maxFiles={6}
                  maxSizeMb={25}
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  Briefs, wireframes, brand assets — files are stored securely
                  and shared with freelancers who bid.
                </p>
              </CardContent>
            </Card>

            {/* Visibility */}
            <Card className="border-border bg-secondary/50">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <Label>Visibility</Label>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant={watch("visibility") === "public" ? "default" : "outline"}
                      onClick={() => setValue("visibility", "public")}
                    >
                      Public
                    </Button>
                    <Button
                      type="button"
                      variant={watch("visibility") === "invite_only" ? "default" : "outline"}
                      onClick={() => setValue("visibility", "invite_only")}
                    >
                      Invite Only
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Public projects are visible to all freelancers. Invite-only
                    projects are only visible to freelancers you invite.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex items-center justify-between">
              <Button type="button" variant="ghost" onClick={saveDraft}>
                <Save className="mr-2 h-4 w-4" />
                Save as Draft
              </Button>
              <Button type="submit" size="lg" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Eye className="mr-2 h-4 w-4" />
                )}
                Publish Project
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
