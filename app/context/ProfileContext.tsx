"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";

export interface FreelancerProfile {
  userId: string;
  bio: string;
  hourlyRate: number;
  skills: string[];
  updatedAt: string;
}

interface ProfileContextValue {
  profile: FreelancerProfile | null;
  saveProfile: (data: Omit<FreelancerProfile, "userId" | "updatedAt">) => void;
  loading: boolean;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

function storageKey(userId: string) {
  return `ty_profile_${userId}`;
}

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState<FreelancerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Load profile whenever the logged-in user changes
  useEffect(() => {
    setLoading(true);
    if (currentUser) {
      try {
        const raw = localStorage.getItem(storageKey(currentUser.id));
        setProfile(raw ? JSON.parse(raw) : null);
      } catch {
        setProfile(null);
      }
    } else {
      setProfile(null);
    }
    setLoading(false);
  }, [currentUser]);

  const saveProfile = useCallback(
    (data: Omit<FreelancerProfile, "userId" | "updatedAt">) => {
      if (!currentUser) return;
      const updated: FreelancerProfile = {
        ...data,
        userId: currentUser.id,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(storageKey(currentUser.id), JSON.stringify(updated));
      setProfile(updated);
    },
    [currentUser]
  );

  return (
    <ProfileContext.Provider value={{ profile, saveProfile, loading }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used within ProfileProvider");
  return ctx;
}

/** Read a profile for ANY userId from localStorage (for public view pages). */
export function readPublicProfile(userId: string): FreelancerProfile | null {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
