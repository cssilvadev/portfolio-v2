import React, { useState } from "react";
import { FaCopy, FaCheck, FaInfoCircle, FaLightbulb, FaExclamationTriangle, FaFire } from "react-icons/fa";
import "./MarkdownRenderer.css";

interface MarkdownRendererProps {
  content: string;
}

// Tokenize code for basic syntax highlighting
function highlightCode(code: string, lang: string): React.ReactNode[] {
  const lines = code.split("\n");

  const keywords = new Set([
    "const", "let", "var", "function", "return", "if", "else", "for", "while",
    "switch", "case", "break", "default", "import", "export", "from", "class",
    "interface", "type", "extends", "implements", "public", "private", "protected",
    "readonly", "static", "async", "await", "void", "int", "float", "double", "char",
    "uint8_t", "uint16_t", "uint32_t", "int8_t", "int16_t", "int32_t", "struct", "typedef",
    "extern", "new", "this", "super", "null", "undefined", "true", "false", "sizeof",
    "bool", "string", "namespace", "using", "override", "virtual"
  ]);

  const types = new Set([
    "CAN_HandleTypeDef", "CAN_FilterTypeDef", "CAN_RxHeaderTypeDef", "CAN_TxHeaderTypeDef",
    "HAL_StatusTypeDef", "LegAngles_t", "React", "Note", "Project", "Error_Handler",
    "Math", "Array", "Set", "Map", "Promise", "String", "Number", "Boolean"
  ]);

  return lines.map((line, lineIdx) => {
    // Check for full line comments
    if (line.trim().startsWith("//") || line.trim().startsWith("#") && lang !== "markdown") {
      return (
        <div key={lineIdx} className="code-line">
          <span className="code-comment">{line}</span>
        </div>
      );
    }

    // Tokenize line by regex
    const tokens = line.split(/([a-zA-Z_][a-zA-Z0-9_]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`[^\`]*`|\/\/.*|\b\d+\b|[-+/*=<>!&|?:;,.()\[\]{}]+|\s+)/g).filter(Boolean);

    return (
      <div key={lineIdx} className="code-line">
        {tokens.map((token, tokenIdx) => {
          if (token.startsWith("//")) {
            return <span key={tokenIdx} className="code-comment">{token}</span>;
          }
          if ((token.startsWith('"') && token.endsWith('"')) || (token.startsWith("'") && token.endsWith("'")) || (token.startsWith("`") && token.endsWith("`"))) {
            return <span key={tokenIdx} className="code-string">{token}</span>;
          }
          if (keywords.has(token)) {
            return <span key={tokenIdx} className="code-keyword">{token}</span>;
          }
          if (types.has(token) || /^[A-Z][a-zA-Z0-9_]*$/.test(token)) {
            return <span key={tokenIdx} className="code-type">{token}</span>;
          }
          if (/^\d+$/.test(token) || /^0x[0-9a-fA-F]+$/.test(token)) {
            return <span key={tokenIdx} className="code-number">{token}</span>;
          }
          if (/^[a-zA-Z_][a-zA-Z0-9_]*\(?$/.test(token) && token.endsWith("(")) {
            return <span key={tokenIdx} className="code-function">{token}</span>;
          }
          return <span key={tokenIdx}>{token}</span>;
        })}
      </div>
    );
  });
}

function CodeBlock({ code, lang }: { code: string; lang: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="code-block-wrapper">
      <div className="code-block-header">
        <span className="code-lang-tag">{lang || "code"}</span>
        <button
          onClick={handleCopy}
          className={`copy-code-btn ${copied ? "copied" : ""}`}
          title="Copy code"
        >
          {copied ? (
            <>
              <FaCheck className="copy-icon" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <FaCopy className="copy-icon" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="code-block-pre">
        <code>{highlightCode(code, lang)}</code>
      </pre>
    </div>
  );
}

// Inline Markdown formatting parser
function renderInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Inline code `code`
    const codeMatch = remaining.match(/^`([^`]+)`/);
    if (codeMatch) {
      parts.push(
        <code key={key++} className="inline-code">
          {codeMatch[1]}
        </code>
      );
      remaining = remaining.slice(codeMatch[0].length);
      continue;
    }

    // Bold **text**
    const boldMatch = remaining.match(/^\*\*([^*]+)\*\*/);
    if (boldMatch) {
      parts.push(<strong key={key++}>{renderInline(boldMatch[1])}</strong>);
      remaining = remaining.slice(boldMatch[0].length);
      continue;
    }

    // Italic *text*
    const italicMatch = remaining.match(/^\*([^*]+)\*/);
    if (italicMatch) {
      parts.push(<em key={key++}>{renderInline(italicMatch[1])}</em>);
      remaining = remaining.slice(italicMatch[0].length);
      continue;
    }

    // Links [text](url)
    const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/);
    if (linkMatch) {
      parts.push(
        <a
          key={key++}
          href={linkMatch[2]}
          target={linkMatch[2].startsWith("http") ? "_blank" : undefined}
          rel={linkMatch[2].startsWith("http") ? "noopener noreferrer" : undefined}
          className="md-link"
        >
          {linkMatch[1]}
        </a>
      );
      remaining = remaining.slice(linkMatch[0].length);
      continue;
    }

    // Regular character accumulation
    const nextSpecial = remaining.search(/[`*\[]/);
    if (nextSpecial === -1) {
      parts.push(remaining);
      break;
    } else if (nextSpecial === 0) {
      parts.push(remaining[0]);
      remaining = remaining.slice(1);
    } else {
      parts.push(remaining.slice(0, nextSpecial));
      remaining = remaining.slice(nextSpecial);
    }
  }

  return parts;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;
  let elementKey = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Fenced Code block ```lang
    if (line.trim().startsWith("```")) {
      const lang = line.trim().slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push(
        <CodeBlock key={elementKey++} code={codeLines.join("\n")} lang={lang} />
      );
      i++;
      continue;
    }

    // Admonition / Callout: > [!NOTE], > [!TIP], > [!WARNING], > [!IMPORTANT]
    if (line.trim().startsWith("> [!")) {
      const calloutTypeMatch = line.trim().match(/^>\s*\[!(NOTE|TIP|WARNING|IMPORTANT|CAUTION)\]/i);
      const calloutType = calloutTypeMatch ? calloutTypeMatch[1].toUpperCase() : "NOTE";
      const calloutLines: string[] = [];
      i++;

      while (i < lines.length && (lines[i].trim().startsWith(">") || (lines[i].trim() !== "" && !lines[i].trim().startsWith("#")))) {
        const cleaned = lines[i].replace(/^>\s?/, "");
        calloutLines.push(cleaned);
        i++;
        if (i < lines.length && lines[i].trim() === "" && (i + 1 >= lines.length || !lines[i + 1].trim().startsWith(">"))) {
          break;
        }
      }

      let icon = <FaInfoCircle className="callout-icon" />;
      let title = "Note";
      if (calloutType === "TIP") {
        icon = <FaLightbulb className="callout-icon" />;
        title = "Pro Tip";
      } else if (calloutType === "WARNING" || calloutType === "CAUTION") {
        icon = <FaExclamationTriangle className="callout-icon" />;
        title = "Warning";
      } else if (calloutType === "IMPORTANT") {
        icon = <FaFire className="callout-icon" />;
        title = "Important";
      }

      elements.push(
        <div key={elementKey++} className={`md-callout callout-${calloutType.toLowerCase()}`}>
          <div className="callout-header">
            {icon}
            <span className="callout-title">{title}</span>
          </div>
          <div className="callout-content">
            {calloutLines.map((cLine, cIdx) => (
              <p key={cIdx}>{renderInline(cLine)}</p>
            ))}
          </div>
        </div>
      );
      continue;
    }

    // Standard Blockquote >
    if (line.trim().startsWith(">")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        quoteLines.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      elements.push(
        <blockquote key={elementKey++} className="md-blockquote">
          {quoteLines.map((qLine, qIdx) => (
            <p key={qIdx}>{renderInline(qLine)}</p>
          ))}
        </blockquote>
      );
      continue;
    }

    // Headings
    if (line.startsWith("# ")) {
      elements.push(<h1 key={elementKey++} className="md-h1">{renderInline(line.slice(2))}</h1>);
      i++;
      continue;
    }
    if (line.startsWith("## ")) {
      const headingText = line.slice(3);
      const slug = headingText.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      elements.push(
        <h2 key={elementKey++} id={slug} className="md-h2">
          {renderInline(headingText)}
        </h2>
      );
      i++;
      continue;
    }
    if (line.startsWith("### ")) {
      elements.push(<h3 key={elementKey++} className="md-h3">{renderInline(line.slice(4))}</h3>);
      i++;
      continue;
    }
    if (line.startsWith("#### ")) {
      elements.push(<h4 key={elementKey++} className="md-h4">{renderInline(line.slice(5))}</h4>);
      i++;
      continue;
    }

    // Horizontal Rule ---
    if (line.trim() === "---" || line.trim() === "***") {
      elements.push(<hr key={elementKey++} className="md-hr" />);
      i++;
      continue;
    }

    // Unordered List - or *
    if (/^\s*[-*]\s+/.test(line)) {
      const listItems: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        listItems.push(lines[i].replace(/^\s*[-*]\s+/, ""));
        i++;
      }
      elements.push(
        <ul key={elementKey++} className="md-ul">
          {listItems.map((item, idx) => (
            <li key={idx}>{renderInline(item)}</li>
          ))}
        </ul>
      );
      continue;
    }

    // Ordered List 1. 2.
    if (/^\s*\d+\.\s+/.test(line)) {
      const listItems: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        listItems.push(lines[i].replace(/^\s*\d+\.\s+/, ""));
        i++;
      }
      elements.push(
        <ol key={elementKey++} className="md-ol">
          {listItems.map((item, idx) => (
            <li key={idx}>{renderInline(item)}</li>
          ))}
        </ol>
      );
      continue;
    }

    // Image ![alt](url)
    const imgMatch = line.trim().match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imgMatch) {
      elements.push(
        <div key={elementKey++} className="md-image-wrapper">
          <img src={imgMatch[2]} alt={imgMatch[1]} className="md-image" />
          {imgMatch[1] && <span className="md-image-caption">{imgMatch[1]}</span>}
        </div>
      );
      i++;
      continue;
    }

    // Empty Line
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Regular Paragraph
    elements.push(
      <p key={elementKey++} className="md-paragraph">
        {renderInline(line)}
      </p>
    );
    i++;
  }

  return <div className="markdown-body">{elements}</div>;
}
