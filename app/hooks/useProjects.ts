"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "../../lib/supabase";
import type { Project, ProjectFilters } from "../../types/project";

const BUDGET_MAX = 10000;

export function useProjects(filters: ProjectFilters) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stable ref to avoid re-renders triggering fetch loops
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  useEffect(() => {
    let cancelled = false;

    async function fetchProjects() {
      setLoading(true);
      setError(null);

      try {
        const { skillQuery, budgetRange, clientName } = filtersRef.current;
        const [budgetMin, budgetMax] = budgetRange;

        let query = supabase
          .from("projects")
          .select("*")
          .eq("status", "active")
          .lte("budget_min", budgetMax === BUDGET_MAX ? 9999999 : budgetMax)
          .gte("budget_max", budgetMin)
          .order("created_at", { ascending: false });

        if (clientName) {
          query = query.eq("client_name", clientName);
        }

        // Free-text skill filter: match rows where any skill contains the query string (case-insensitive)
        if (skillQuery.trim()) {
          // Use ilike on the text representation of the skills array
          query = query.ilike("skills", `%${skillQuery.trim()}%`);
        }

        const { data, error: sbError } = await query;

        if (cancelled) return;

        if (sbError) {
          setError(sbError.message);
          setProjects([]);
        } else {
          setProjects((data as Project[]) ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unknown error");
          setProjects([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void fetchProjects();
    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.skillQuery, filters.budgetRange[0], filters.budgetRange[1]]);

  return { projects, loading, error };
}
