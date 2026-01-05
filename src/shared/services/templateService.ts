import type { CategoryTemplate } from "../types/template";

const STORAGE_KEY = "category_templates";

export const saveTemplate = (template: CategoryTemplate): void => {
  const templates = loadTemplates();
  const existingIndex = templates.findIndex((t) => t.id === template.id);
  
  if (existingIndex >= 0) {
    templates[existingIndex] = template;
  } else {
    templates.push(template);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
};

export const loadTemplates = (): CategoryTemplate[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as CategoryTemplate[];
  } catch {
    return [];
  }
};

export const deleteTemplate = (id: string): void => {
  const templates = loadTemplates();
  const filtered = templates.filter((t) => t.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};

export const applyTemplates = (
  description: string
): { category: string; confidence: "high" | "medium" } | null => {
  const templates = loadTemplates();
  const normalizedDescription = description.toUpperCase().trim();

  for (const template of templates) {
    for (const rule of template.rules) {
      const matchesKeyword = rule.keywords.some((keyword) =>
        normalizedDescription.includes(keyword.toUpperCase())
      );

      if (matchesKeyword) {
        return {
          category: rule.category,
          confidence: rule.confidence,
        };
      }
    }
  }

  return null;
};

