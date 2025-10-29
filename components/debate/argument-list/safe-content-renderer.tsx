interface SafeContentRendererProps {
  content: string;
}

export function SafeContentRenderer({ content }: SafeContentRendererProps) {
  const stripHtml = (html: string): string => {
    if (typeof window === "undefined") {
      return html
        .replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
    }

    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  };

  const formatPlainText = (text: string): string => {
    return text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .join("\n\n");
  };

  const plainText = formatPlainText(stripHtml(content));

  return (
    <div className="text-sm whitespace-pre-wrap leading-relaxed">
      {plainText}
    </div>
  );
}
