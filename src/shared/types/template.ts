export interface CategoryTemplate {
  id: string;
  name?: string;
  rules: {
    keywords: string[];
    category: string;
    confidence: "high" | "medium";
  }[];
  createdAt: number;
}

