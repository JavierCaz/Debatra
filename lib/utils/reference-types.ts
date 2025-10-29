function detectReferenceType(url: string): string {
  if (!url) return "WEBSITE";

  const lowerUrl = url.toLowerCase();

  if (
    lowerUrl.includes("arxiv.org") ||
    lowerUrl.includes("researchgate") ||
    lowerUrl.includes(".edu/") ||
    lowerUrl.includes("academic")
  ) {
    return "ACADEMIC_PAPER";
  } else if (
    lowerUrl.includes("youtube.com") ||
    lowerUrl.includes("vimeo.com") ||
    lowerUrl.includes("ted.com")
  ) {
    return "VIDEO";
  } else if (
    lowerUrl.includes("news.") ||
    lowerUrl.includes("reuters") ||
    lowerUrl.includes("bbc") ||
    lowerUrl.includes("cnn")
  ) {
    return "NEWS_ARTICLE";
  } else if (
    lowerUrl.includes("gov") ||
    lowerUrl.includes(".gov") ||
    lowerUrl.includes("whitehouse")
  ) {
    return "GOVERNMENT_DOCUMENT";
  } else if (
    lowerUrl.includes("amazon.com") ||
    lowerUrl.includes("books.google")
  ) {
    return "BOOK";
  } else if (lowerUrl.match(/\.(pdf|doc|docx)$/)) {
    return "ACADEMIC_PAPER";
  }

  return "WEBSITE";
}
