import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { supabase, isSupabaseEnabled } from '@/lib/supabase'

export interface AuthUser {
  id: string
  email?: string
}

interface AuthContextValue {
  /** True only when a Supabase backend is configured. */
  enabled: boolean
  user: AuthUser | null
  loading: boolean
  /** Sends a magic-link email (Supabase mode only). Returns an error message or null. */
  signInWithEmail: (email: string) => Promise<string | null>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState<boolean>(isSupabaseEnabled)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }
    let active = true
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      const u = data.session?.user
      setUser(u ? { id: u.id, email: u.email ?? undefined } : null)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user
      setUser(u ? { id: u.id, email: u.email ?? undefined } : null)
    })
    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [])

  const signInWithEmail = useCallback(async (email: string): Promise<string | null> => {
    if (!supabase) return 'Cloud sync is not configured. Your data is saved on this device.'
    const { error } = await supabase.auth.signInWithOtp({ email })
    return error ? error.message : null
  }, [])

  const signOut = useCallback(async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    setUser(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ enabled: isSupabaseEnabled, user, loading, signInWithEmail, signOut }),
    [user, loading, signInWithEmail, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
