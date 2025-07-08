import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthState {
  user: User | null
  loading: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  signOut: () => Promise<void>
  updateProfile: (updates: any) => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      loading: true,

      setUser: (user) => set({ user }),
      setLoading: (loading) => set({ loading }),

      signOut: async () => {
        set({ loading: true })
        const { error } = await supabase.auth.signOut()
        if (!error) {
          set({ user: null })
        }
        set({ loading: false })
      },

      updateProfile: async (updates) => {
        const { user } = get()
        if (!user) return

        const { error } = await supabase
          .from('users')
          .update(updates)
          .eq('id', user.id)

        if (error) throw error
      }
    }),
    {
      name: 'nunuza-auth',
      partialize: (state) => ({ user: state.user })
    }
  )
) 