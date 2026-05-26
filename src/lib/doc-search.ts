/**
 * Go2GST Full-Text Search Engine
 * In-memory inverted index with relevance scoring
 * Supports: text search, field filters, date ranges
 */

export interface SearchableDocument {
  id: string;
  text: string;
  title: string;
  vendor: string;
  gstin: string;
  category: string;
  documentType: string;
  amount: number;
  date: string; // ISO
  tags: string[];
}

interface IndexEntry {
  docId: string;
  frequency: number;
  positions: number[];
}

class SearchIndex {
  private invertedIndex = new Map<string, IndexEntry[]>();
  private documents = new Map<string, SearchableDocument>();

  add(doc: SearchableDocument) {
    this.documents.set(doc.id, doc);
    const tokens = this.tokenize(`${doc.text} ${doc.title} ${doc.vendor} ${doc.gstin} ${doc.category} ${doc.tags.join(" ")}`);

    const freq = new Map<string, number[]>();
    tokens.forEach((token, pos) => {
      if (!freq.has(token)) freq.set(token, []);
      freq.get(token)!.push(pos);
    });

    for (const [token, positions] of freq) {
      if (!this.invertedIndex.has(token)) this.invertedIndex.set(token, []);
      this.invertedIndex.get(token)!.push({ docId: doc.id, frequency: positions.length, positions });
    }
  }

  remove(docId: string) {
    this.documents.delete(docId);
    for (const [token, entries] of this.invertedIndex) {
      const filtered = entries.filter((e) => e.docId !== docId);
      if (filtered.length === 0) this.invertedIndex.delete(token);
      else this.invertedIndex.set(token, filtered);
    }
  }

  search(query: string, filters?: SearchFilters): SearchResult[] {
    const tokens = this.tokenize(query);
    if (tokens.length === 0) return [];

    // Score documents by TF-IDF-like relevance
    const scores = new Map<string, number>();
    const totalDocs = this.documents.size || 1;

    for (const token of tokens) {
      const entries = this.invertedIndex.get(token) || [];
      const idf = Math.log(totalDocs / (entries.length || 1));

      for (const entry of entries) {
        const current = scores.get(entry.docId) || 0;
        scores.set(entry.docId, current + entry.frequency * idf);
      }
    }

    // Apply filters
    let results = Array.from(scores.entries())
      .map(([docId, score]) => ({ doc: this.documents.get(docId)!, score }))
      .filter((r) => r.doc);

    if (filters) {
      if (filters.category) results = results.filter((r) => r.doc.category === filters.category);
      if (filters.documentType) results = results.filter((r) => r.doc.documentType === filters.documentType);
      if (filters.vendor) results = results.filter((r) => r.doc.vendor.toLowerCase().includes(filters.vendor!.toLowerCase()));
      if (filters.gstin) results = results.filter((r) => r.doc.gstin === filters.gstin);
      if (filters.dateFrom) results = results.filter((r) => r.doc.date >= filters.dateFrom!);
      if (filters.dateTo) results = results.filter((r) => r.doc.date <= filters.dateTo!);
      if (filters.amountMin !== undefined) results = results.filter((r) => r.doc.amount >= filters.amountMin!);
      if (filters.amountMax !== undefined) results = results.filter((r) => r.doc.amount <= filters.amountMax!);
      if (filters.tags?.length) results = results.filter((r) => filters.tags!.some((t) => r.doc.tags.includes(t)));
    }

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, filters?.limit || 50)
      .map((r) => ({
        id: r.doc.id,
        title: r.doc.title,
        vendor: r.doc.vendor,
        category: r.doc.category,
        amount: r.doc.amount,
        date: r.doc.date,
        score: r.score,
        snippet: this.getSnippet(r.doc.text, tokens),
      }));
  }

  getStats() {
    return { documentCount: this.documents.size, termCount: this.invertedIndex.size };
  }

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s₹]/g, " ")
      .split(/\s+/)
      .filter((t) => t.length > 1);
  }

  private getSnippet(text: string, queryTokens: string[]): string {
    const lower = text.toLowerCase();
    for (const token of queryTokens) {
      const idx = lower.indexOf(token);
      if (idx >= 0) {
        const start = Math.max(0, idx - 40);
        const end = Math.min(text.length, idx + token.length + 80);
        return (start > 0 ? "..." : "") + text.slice(start, end).trim() + (end < text.length ? "..." : "");
      }
    }
    return text.slice(0, 120) + "...";
  }
}

export interface SearchFilters {
  category?: string;
  documentType?: string;
  vendor?: string;
  gstin?: string;
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
  tags?: string[];
  limit?: number;
}

export interface SearchResult {
  id: string;
  title: string;
  vendor: string;
  category: string;
  amount: number;
  date: string;
  score: number;
  snippet: string;
}

// Singleton index instance
export const searchIndex = new SearchIndex();
