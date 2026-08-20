import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  FaArrowLeft,
  FaCopy,
  FaDownload,
  FaCheck,
  FaTrash,
  FaBold,
  FaItalic,
  FaCode,
  FaHeading,
  FaListUl,
  FaListOl,
  FaLink,
  FaImage,
  FaLightbulb,
  FaEye,
  FaEdit,
  FaColumns,
} from "react-icons/fa";
import Cursor from "../../components/Cursor/Cursor";
import NavBar from "../../components/NavBar/NavBar";
import MarkdownRenderer from "../../components/MarkdownRenderer/MarkdownRenderer";
import { estimateReadingTime, type NoteCategory } from "../../data/notes";
import { getAssetUrl } from "../../utils/assets";
import "./Studio.css";

const DEFAULT_SAMPLE_CONTENT = `## Introduction

Write your note content here using standard Markdown. You can include code snippets, callouts, lists, and images.

> [!NOTE]
> This live preview updates as you type and matches the exact portfolio styling!

---

## Code Example

Here is an example C snippet with syntax highlighting:

\`\`\`c
#include <stdio.h>

void main() {
    printf("Hello from Chris Notes!\\n");
}
\`\`\`

> [!TIP]
> Use the toolbar buttons above to quickly insert headers, code blocks, and callout boxes.
`;

export default function Studio() {
  const [title, setTitle] = useState("Exploring Advanced Robotics with ESP32");
  const [slug, setSlug] = useState("exploring-advanced-robotics-esp32");
  const [category, setCategory] = useState<NoteCategory>("Robotics");
  const [tagsInput, setTagsInput] = useState("ESP32, Robotics, C++, Wireless");
  const [coverImage, setCoverImage] = useState("/projects/humanoid-robot.png");
  const [excerpt, setExcerpt] = useState(
    "How to orchestrate low-latency motor control and wireless telemetry using FreeRTOS on ESP32."
  );
  const [content, setContent] = useState(DEFAULT_SAMPLE_CONTENT);

  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"split" | "editor" | "preview">("split");
  const [autoSaved, setAutoSaved] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-generate slug when title changes
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    const autoSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    setSlug(autoSlug);
  };

  // Auto-save draft in localStorage
  useEffect(() => {
    const draft = {
      title,
      slug,
      category,
      tagsInput,
      coverImage,
      excerpt,
      content,
    };
    localStorage.setItem("chris_notes_studio_draft", JSON.stringify(draft));
    setAutoSaved(true);
    const timer = setTimeout(() => setAutoSaved(false), 1500);
    return () => clearTimeout(timer);
  }, [title, slug, category, tagsInput, coverImage, excerpt, content]);

  // Load saved draft on mount if available
  useEffect(() => {
    const saved = localStorage.getItem("chris_notes_studio_draft");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.title) setTitle(parsed.title);
        if (parsed.slug) setSlug(parsed.slug);
        if (parsed.category) setCategory(parsed.category);
        if (parsed.tagsInput) setTagsInput(parsed.tagsInput);
        if (parsed.coverImage) setCoverImage(parsed.coverImage);
        if (parsed.excerpt) setExcerpt(parsed.excerpt);
        if (parsed.content) setContent(parsed.content);
      } catch (err) {
        console.error("Failed to parse saved draft", err);
      }
    }
  }, []);

  const tags = tagsInput
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const readingTime = estimateReadingTime(content);
  const dateStr = new Date().toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

  // Toolbar insertion helpers
  const insertText = (prefix: string, suffix: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const previous = textarea.value;
    const selected = previous.substring(start, end);

    const replacement = `${prefix}${selected || "text"}${suffix}`;
    const newContent =
      previous.substring(0, start) + replacement + previous.substring(end);

    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + (selected.length || 4)
      );
    }, 10);
  };

  const handleCopyTS = () => {
    const obj = `  {
    slug: "${slug}",
    title: "${title.replace(/"/g, '\\"')}",
    excerpt: "${excerpt.replace(/"/g, '\\"')}",
    date: "${dateStr}",
    readingTime: "${readingTime}",
    category: "${category}",
    tags: ${JSON.stringify(tags)},
    coverImage: "${coverImage}",
    featured: false,
    content: \`${content.replace(/`/g, "\\`").replace(/\${/g, "\\${")}\`,
  },`;

    navigator.clipboard.writeText(obj);
    setCopiedType("ts");
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleCopyMD = () => {
    const frontmatter = `---
title: "${title}"
slug: "${slug}"
category: "${category}"
tags: [${tags.map((t) => `"${t}"`).join(", ")}]
date: "${dateStr}"
readingTime: "${readingTime}"
excerpt: "${excerpt}"
---

${content}`;

    navigator.clipboard.writeText(frontmatter);
    setCopiedType("md");
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleDownloadMD = () => {
    const frontmatter = `---
title: "${title}"
slug: "${slug}"
category: "${category}"
tags: [${tags.map((t) => `"${t}"`).join(", ")}]
date: "${dateStr}"
readingTime: "${readingTime}"
excerpt: "${excerpt}"
---

${content}`;

    const blob = new Blob([frontmatter], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slug || "note"}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    if (window.confirm("Are you sure you want to clear this note draft?")) {
      setTitle("");
      setSlug("");
      setExcerpt("");
      setContent("");
      setTagsInput("");
    }
  };

  return (
    <>
      <Cursor />
      <NavBar />

      <main className="studio-page">
        <div className="studio-container">
          {/* TOP BAR */}
          <header className="studio-topbar">
            <div className="studio-topbar-left">
              <Link to="/#notes" className="studio-back">
                <FaArrowLeft />
                <span>Back</span>
              </Link>
              <div className="studio-badge">
                <span className="studio-dot"></span>
                <span>Note Studio</span>
              </div>
              {autoSaved && <span className="autosave-tag">Draft Saved</span>}
            </div>

            {/* VIEW MODE TOGGLE */}
            <div className="view-mode-toggles">
              <button
                onClick={() => setViewMode("editor")}
                className={`toggle-btn ${viewMode === "editor" ? "active" : ""}`}
                title="Editor only"
              >
                <FaEdit /> <span>Edit</span>
              </button>
              <button
                onClick={() => setViewMode("split")}
                className={`toggle-btn ${viewMode === "split" ? "active" : ""}`}
                title="Split View"
              >
                <FaColumns /> <span>Split</span>
              </button>
              <button
                onClick={() => setViewMode("preview")}
                className={`toggle-btn ${viewMode === "preview" ? "active" : ""}`}
                title="Live Preview only"
              >
                <FaEye /> <span>Preview</span>
              </button>
            </div>

            {/* ACTION EXPORT BUTTONS */}
            <div className="studio-actions">
              <button onClick={handleCopyTS} className="action-btn primary-action">
                {copiedType === "ts" ? <FaCheck /> : <FaCopy />}
                <span>{copiedType === "ts" ? "Copied TS!" : "Copy TS Object"}</span>
              </button>

              <button onClick={handleCopyMD} className="action-btn">
                {copiedType === "md" ? <FaCheck /> : <FaCopy />}
                <span>{copiedType === "md" ? "Copied MD!" : "Copy Markdown"}</span>
              </button>

              <button onClick={handleDownloadMD} className="action-btn">
                <FaDownload />
                <span>Download .md</span>
              </button>

              <button onClick={handleClear} className="action-btn danger-action" title="Clear draft">
                <FaTrash />
              </button>
            </div>
          </header>

          {/* MAIN WORKSPACE */}
          <div className={`studio-workspace view-${viewMode}`}>
            {/* LEFT PANEL: EDITOR */}
            {(viewMode === "editor" || viewMode === "split") && (
              <section className="studio-editor-panel">
                {/* METADATA FORM */}
                <div className="metadata-form">
                  <div className="form-group">
                    <label>Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={handleTitleChange}
                      placeholder="e.g. Setting up STM32 CAN Bus..."
                      className="studio-input title-input"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Slug URL</label>
                      <input
                        type="text"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        placeholder="stm32-can-bus"
                        className="studio-input"
                      />
                    </div>

                    <div className="form-group">
                      <label>Category</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as NoteCategory)}
                        className="studio-select"
                      >
                        <option value="Firmware & Embedded">Firmware & Embedded</option>
                        <option value="AI & Workflows">AI & Workflows</option>
                        <option value="Robotics">Robotics</option>
                        <option value="Software Engineering">Software Engineering</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Tags (comma separated)</label>
                      <input
                        type="text"
                        value={tagsInput}
                        onChange={(e) => setTagsInput(e.target.value)}
                        placeholder="STM32, CAN, C"
                        className="studio-input"
                      />
                    </div>

                    <div className="form-group">
                      <label>Cover Image URL (optional)</label>
                      <input
                        type="text"
                        value={coverImage}
                        onChange={(e) => setCoverImage(e.target.value)}
                        placeholder="/projects/humanoid-robot.png"
                        className="studio-input"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Excerpt / Summary</label>
                    <textarea
                      value={excerpt}
                      onChange={(e) => setExcerpt(e.target.value)}
                      placeholder="A short 1-2 sentence description of the note..."
                      rows={2}
                      className="studio-textarea excerpt-input"
                    />
                  </div>
                </div>

                {/* MARKDOWN TOOLBAR */}
                <div className="markdown-toolbar">
                  <button onClick={() => insertText("## ", "")} title="Heading 2">
                    <FaHeading /> <span>H2</span>
                  </button>
                  <button onClick={() => insertText("### ", "")} title="Heading 3">
                    <FaHeading /> <span>H3</span>
                  </button>
                  <button onClick={() => insertText("**", "**")} title="Bold">
                    <FaBold />
                  </button>
                  <button onClick={() => insertText("*", "*")} title="Italic">
                    <FaItalic />
                  </button>
                  <button onClick={() => insertText("`", "`")} title="Inline Code">
                    <FaCode />
                  </button>
                  <button
                    onClick={() => insertText("```c\n", "\n```")}
                    title="C Code Block"
                  >
                    <span>C</span>
                  </button>
                  <button
                    onClick={() => insertText("```typescript\n", "\n```")}
                    title="TypeScript Code Block"
                  >
                    <span>TS</span>
                  </button>
                  <button
                    onClick={() => insertText("> [!NOTE]\n> ", "")}
                    title="Callout Note"
                  >
                    <FaLightbulb /> <span>Note</span>
                  </button>
                  <button
                    onClick={() => insertText("> [!TIP]\n> ", "")}
                    title="Callout Tip"
                  >
                    <FaLightbulb /> <span>Tip</span>
                  </button>
                  <button onClick={() => insertText("- ", "")} title="Bullet List">
                    <FaListUl />
                  </button>
                  <button onClick={() => insertText("1. ", "")} title="Numbered List">
                    <FaListOl />
                  </button>
                  <button onClick={() => insertText("[", "](https://)")} title="Link">
                    <FaLink />
                  </button>
                  <button onClick={() => insertText("![Alt](", ")")} title="Image">
                    <FaImage />
                  </button>
                  <button onClick={() => insertText("\n---\n\n", "")} title="Divider">
                    <span>—</span>
                  </button>
                </div>

                {/* CONTENT EDITOR */}
                <div className="editor-textarea-wrapper">
                  <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your technical note in markdown..."
                    className="studio-content-textarea"
                    rows={20}
                  />
                </div>
              </section>
            )}

            {/* RIGHT PANEL: LIVE PREVIEW */}
            {(viewMode === "preview" || viewMode === "split") && (
              <section className="studio-preview-panel">
                <div className="preview-header-bar">
                  <span className="preview-label">Live Reader Preview</span>
                  <span className="reading-time-pill">{readingTime}</span>
                </div>

                <div className="preview-scroll-container">
                  <div className="note-article-header">
                    <div className="note-meta-badges">
                      <span className="badge category-badge">{category}</span>
                      <span className="badge time-badge">{readingTime}</span>
                      <span className="badge date-badge">{dateStr}</span>
                    </div>

                    <h1 className="note-article-title">{title || "Untitled Note"}</h1>
                    {excerpt && <p className="note-article-excerpt">{excerpt}</p>}

                    {tags.length > 0 && (
                      <div className="note-article-tags">
                        {tags.map((t) => (
                          <span key={t} className="tag-pill">
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {coverImage && (
                    <div className="note-hero-wrapper">
                      <img
                        src={getAssetUrl(coverImage)}
                        alt={title}
                        className="note-hero-img"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    </div>
                  )}

                  <div className="note-article-body">
                    <MarkdownRenderer content={content} />
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
