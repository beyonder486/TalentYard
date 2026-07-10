export interface Project {
  id: string;
  title: string;
  description: string | null;
  skills: string[];
  budget_min: number;
  budget_max: number;
  client_name: string | null;
  status: string;
  created_at: string;
}

export interface ProjectFilters {
  skillQuery: string;
  budgetRange: [number, number];
}
