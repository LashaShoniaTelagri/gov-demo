export interface Portfolio {
  id: string;
  name: string;
  fieldIds: string[];
  createdAt: string;
}

const KEY = 'telagri.demo.portfolios.v1';

const read = (): Portfolio[] => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const write = (list: Portfolio[]) => {
  localStorage.setItem(KEY, JSON.stringify(list));
};

export const listPortfolios = (): Portfolio[] => read();

export const getPortfolio = (id: string): Portfolio | undefined =>
  read().find((p) => p.id === id);

export const savePortfolio = (name: string, fieldIds: string[]): Portfolio => {
  const item: Portfolio = {
    id: `p-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: name.trim(),
    fieldIds,
    createdAt: new Date().toISOString(),
  };
  write([item, ...read()]);
  return item;
};

export const deletePortfolio = (id: string): void => {
  write(read().filter((p) => p.id !== id));
};
