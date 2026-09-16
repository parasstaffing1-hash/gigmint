"use client";

import * as React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import CharacterCount from "@tiptap/extension-character-count";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo2,
  Redo2,
  Link2,
  Unlink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
  maxLength?: number;
  className?: string;
  editable?: boolean;
}

interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}

function ToolbarButton({
  onClick,
  active,
  disabled,
  label,
  children,
}: ToolbarButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onClick}
          disabled={disabled}
          aria-label={label}
          className={cn(
            "inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors",
            "hover:bg-accent hover:text-foreground",
            "disabled:pointer-events-none disabled:opacity-40",
            active && "bg-primary text-primary-foreground"
          )}
        >
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = "Start writing…",
  minHeight = 200,
  maxLength = 20000,
  className,
  editable = true,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        link: false,
      }),
      Placeholder.configure({ placeholder }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      CharacterCount.configure({ limit: maxLength }),
    ],
    content,
    editable,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose-editor max-w-none px-4 py-3 min-h-[120px] focus:outline-none text-sm leading-relaxed",
        "aria-label": "Rich text editor",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Sync external content changes (e.g. form reset)
  React.useEffect(() => {
    if (!editor) return;
    if (content && editor.getHTML() !== content && editor.isEmpty) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return (
      <div
        className={cn(
          "rounded-xl border border-border bg-secondary/50",
          className
        )}
        style={{ minHeight }}
        aria-busy="true"
      />
    );
  }

  const setLink = () => {
    const previous = editor.getAttributes("link").href as string | undefined;
    if (previous) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    // Simple inline prompt-free flow: turn selection into a link to a URL
    const url = window.prompt("Paste a URL", "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div
        className={cn(
          "overflow-hidden rounded-xl border border-border bg-secondary/50 transition-colors focus-within:border-input",
          className
        )}
      >
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-secondary/50 px-2 py-1.5">
          <ToolbarButton
            label="Bold"
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive("bold")}
          >
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Italic"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive("italic")}
          >
            <Italic className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Strikethrough"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            active={editor.isActive("strike")}
          >
            <Strikethrough className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Code"
            onClick={() => editor.chain().focus().toggleCode().run()}
            active={editor.isActive("code")}
          >
            <Code className="h-4 w-4" />
          </ToolbarButton>

          <Separator orientation="vertical" className="mx-1 h-6 bg-border" />

          <ToolbarButton
            label="Heading 1"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            active={editor.isActive("heading", { level: 1 })}
          >
            <Heading1 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Heading 2"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive("heading", { level: 2 })}
          >
            <Heading2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Heading 3"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            active={editor.isActive("heading", { level: 3 })}
          >
            <Heading3 className="h-4 w-4" />
          </ToolbarButton>

          <Separator orientation="vertical" className="mx-1 h-6 bg-border" />

          <ToolbarButton
            label="Bullet list"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive("bulletList")}
          >
            <List className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Numbered list"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive("orderedList")}
          >
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Quote"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive("blockquote")}
          >
            <Quote className="h-4 w-4" />
          </ToolbarButton>

          <Separator orientation="vertical" className="mx-1 h-6 bg-border" />

          <ToolbarButton label="Insert link" onClick={setLink} active={editor.isActive("link")}>
            {editor.isActive("link") ? <Unlink className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
          </ToolbarButton>

          <div className="ml-auto flex items-center gap-0.5">
            <ToolbarButton
              label="Undo"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
            >
              <Undo2 className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              label="Redo"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
            >
              <Redo2 className="h-4 w-4" />
            </ToolbarButton>
          </div>
        </div>

        {/* Editor body */}
        <EditorContent editor={editor} style={{ minHeight }} />

        {/* Footer: character count */}
        <div className="flex items-center justify-between border-t border-border bg-secondary/50 px-4 py-1.5">
          <span className="text-xs text-muted-foreground">
            Supports headings, lists, quotes & links
          </span>
          <span className="text-xs text-muted-foreground tabular-nums">
            {editor.storage.characterCount.characters()}/{maxLength}
          </span>
        </div>
      </div>
    </TooltipProvider>
  );
}
