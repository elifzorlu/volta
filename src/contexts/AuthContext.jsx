import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)
  const [isDemoMode, setIsDemoMode] = useState(false)

  // Check for forced demo mode
  useEffect(() => {
    const forceDemoMode = localStorage.getItem('volta_force_demo_mode');
    if (forceDemoMode === 'true' && user) {
      setIsDemoMode(true);
    }
  }, [user]);

  // Isolated async operations - never called from auth callbacks
  const profileOperations = {
    async load(userId) {
      if (!userId) return
      setProfileLoading(true)
      try {
        const { data, error } = await supabase?.from('user_profiles')?.select('*')?.eq('id', userId)?.single()
        if (!error) {
          // Convert snake_case to camelCase for display_name and timezone
          const profile = {
            ...data,
            displayName: data?.display_name,
            timezone: data?.timezone,
            fullName: data?.full_name,
            evolutionBadges: data?.evolution_badges,
            notificationTimes: data?.notification_times,
            notificationEnabled: data?.notification_enabled
          };
          setUserProfile(profile);
        }
      } catch (error) {
        console.error('Profile load error:', error)
      } finally {
        setProfileLoading(false)
      }
    },

    clear() {
      setUserProfile(null)
      setProfileLoading(false)
    }
  }

  // Auth state handlers - PROTECTED from async modification
  const authStateHandlers = {
    // This handler MUST remain synchronous - Supabase requirement
    onChange: (event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
      
      if (session?.user) {
        profileOperations?.load(session?.user?.id) // Fire-and-forget
      } else {
        profileOperations?.clear()
      }
    }
  }

  useEffect(() => {
    // Initial session check
    supabase?.auth?.getSession()?.then(({ data: { session } }) => {
      authStateHandlers?.onChange(null, session)
      // Set demo mode if no session
      if (!session) {
        setIsDemoMode(true)
      }
    })

    // CRITICAL: This must remain synchronous
    const { data: { subscription } } = supabase?.auth?.onAuthStateChange(
      (event, session) => {
        authStateHandlers?.onChange(event, session)
        // Update demo mode based on session
        const forceDemoMode = localStorage.getItem('volta_force_demo_mode');
        setIsDemoMode(!session || forceDemoMode === 'true')
      }
    )

    return () => subscription?.unsubscribe()
  }, [])

  // Auth methods
  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase?.auth?.signInWithPassword({ email, password })
      if (!error) {
        setIsDemoMode(false)
        localStorage.removeItem('volta_force_demo_mode');
      }
      return { data, error }
    } catch (error) {
      return { error: { message: 'Network error. Please try again.' } }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase?.auth?.signOut()
      if (!error) {
        setUser(null)
        profileOperations?.clear()
        setIsDemoMode(true)
        localStorage.removeItem('volta_force_demo_mode');
      }
      return { error }
    } catch (error) {
      return { error: { message: 'Network error. Please try again.' } }
    }
  }

  const updateProfile = async (updates) => {
    if (!user) return { error: { message: 'No user logged in' } }
    
    try {
      // Convert camelCase to snake_case for database
      const dbUpdates = {};
      if (updates?.displayName !== undefined) dbUpdates.display_name = updates?.displayName;
      if (updates?.timezone !== undefined) dbUpdates.timezone = updates?.timezone;
      if (updates?.settings !== undefined) dbUpdates.settings = updates?.settings;
      if (updates?.evolutionBadges !== undefined) dbUpdates.evolution_badges = updates?.evolutionBadges;
      if (updates?.notificationTimes !== undefined) dbUpdates.notification_times = updates?.notificationTimes;
      if (updates?.notificationEnabled !== undefined) dbUpdates.notification_enabled = updates?.notificationEnabled;
      
      const { data, error } = await supabase?.from('user_profiles')?.update(dbUpdates)?.eq('id', user?.id)?.select()?.single()
      if (!error) {
        // Convert back to camelCase
        const profile = {
          ...data,
          displayName: data?.display_name,
          timezone: data?.timezone,
          fullName: data?.full_name,
          evolutionBadges: data?.evolution_badges,
          notificationTimes: data?.notification_times,
          notificationEnabled: data?.notification_enabled
        };
        setUserProfile(profile);
      }
      return { data, error }
    } catch (error) {
      return { error: { message: 'Network error. Please try again.' } }
    }
  }

  const signUp = async (email, password, options = {}) => {
    try {
      const { data, error } = await supabase?.auth?.signUp({ email, password, ...options })
      if (!error) {
        setIsDemoMode(false)
        localStorage.removeItem('volta_force_demo_mode');
      }
      return { data, error }
    } catch (error) {
      return { error: { message: 'Network error. Please try again.' } }
    }
  }

  const value = {
    user,
    userProfile,
    loading,
    profileLoading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    isAuthenticated: !!user,
    isDemoMode
  }

  // Graceful loading state with black background
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4">
            <div className="w-2 h-2 bg-[#10b981] rounded-full animate-pulse mx-auto"></div>
          </div>
          <p className="text-zinc-600 text-sm tracking-wide">Loading Volta...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
