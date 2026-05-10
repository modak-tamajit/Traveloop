import {createContext, useCallback, useContext, useEffect, useMemo, useState} from "react"
import type {ReactNode} from "react"
import type {Session, User} from "@supabase/supabase-js"
import {supabase} from "@/lib/supabase"
import type {JsonObject, ProfileRow} from "@/services/supabase/contracts"
import type {UserProfile} from "@/types"

type AuthCredentials = {
  email: string
  password: string
}

type SignUpCredentials = AuthCredentials & {
  firstName: string
  lastName?: string
  phone?: string
  city?: string
  country?: string
  bio?: string
}

type SignUpResult = {
  needsEmailConfirmation: boolean
}

type ProfileUpdateInput = {
  fullName: string
  phone?: string
  city?: string
  country?: string
  bio?: string
  avatarUrl?: string
}

type AuthContextValue = {
  profile: UserProfile | null
  session: Session | null
  user: User | null
  isAuthenticated: boolean
  isAdmin: boolean
  isLoading: boolean
  authError: string | null
  signIn: (credentials: AuthCredentials) => Promise<void>
  signUp: (credentials: SignUpCredentials) => Promise<SignUpResult>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  updateProfile: (input: ProfileUpdateInput) => Promise<void>
}

const demoProfile: UserProfile = {
  id: "demo-user",
  email: "traveler@safarnama.app",
  fullName: "Aarav Mehta",
  role: "admin",
  city: "Mumbai",
  country: "India",
  phone: "+91 90000 12000",
  avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=320&q=80",
  bio: "Travel planner, culture seeker, and keeper of calm itineraries.",
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({children}: {children: ReactNode}) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(supabase ? null : demoProfile)
  const [isLoading, setIsLoading] = useState(Boolean(supabase))
  const [authError, setAuthError] = useState<string | null>(null)

  const loadProfile = useCallback(async (authUser: User) => {
    if (!supabase) {
      setProfile(demoProfile)
      return
    }

    const row = await ensureProfile(authUser)
    setProfile(mapProfileRow(row, authUser))
  }, [])

  const refreshProfile = useCallback(async () => {
    if (!user) return
    await loadProfile(user)
  }, [loadProfile, user])

  useEffect(() => {
    if (!supabase) return undefined

    const client = supabase
    let isMounted = true
    const restoreSession = async () => {
      const {data, error} = await client.auth.getSession()
      if (!isMounted) return

      if (error) {
        setAuthError(error.message)
        setSession(null)
        setUser(null)
        setProfile(null)
        setIsLoading(false)
        return
      }

      setSession(data.session)
      setUser(data.session?.user ?? null)
      if (data.session?.user) {
        await loadProfile(data.session.user)
      } else {
        setProfile(null)
      }
      if (isMounted) setIsLoading(false)
    }

    void restoreSession()

    const {
      data: {subscription},
    } = client.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setUser(nextSession?.user ?? null)
      if (!nextSession?.user) {
        setProfile(null)
        return
      }
      void loadProfile(nextSession.user).catch((error: unknown) => {
        setAuthError(error instanceof Error ? error.message : "Could not load your profile")
      })
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [loadProfile])

  const signIn = useCallback(
    async ({email, password}: AuthCredentials) => {
      setAuthError(null)
      if (!supabase) {
        setProfile(demoProfile)
        return
      }

      const {data, error} = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) {
        setAuthError(error.message)
        throw error
      }

      setSession(data.session)
      setUser(data.user)
      if (data.user) await loadProfile(data.user)
    },
    [loadProfile],
  )

  const signUp = useCallback(
    async (credentials: SignUpCredentials): Promise<SignUpResult> => {
      setAuthError(null)
      if (!supabase) {
        setProfile(demoProfile)
        return {needsEmailConfirmation: false}
      }

      const metadata = profileMetadataFromInput(credentials)
      const {data, error} = await supabase.auth.signUp({
        email: credentials.email.trim(),
        password: credentials.password,
        options: {data: metadata},
      })

      if (error) {
        setAuthError(error.message)
        throw error
      }

      if (data.session) setSession(data.session)
      if (data.user) {
        setUser(data.user)
        if (data.session) await loadProfile(data.user)
      }

      return {needsEmailConfirmation: !data.session}
    },
    [loadProfile],
  )

  const signOut = useCallback(async () => {
    setAuthError(null)
    if (supabase) {
      const {error} = await supabase.auth.signOut()
      if (error) {
        setAuthError(error.message)
        throw error
      }
    }
    setSession(null)
    setUser(null)
    setProfile(null)
  }, [])

  const updateProfile = useCallback(
    async (input: ProfileUpdateInput) => {
      setAuthError(null)
      if (!supabase) {
        setProfile((current) => ({
          ...(current ?? demoProfile),
          ...input,
        }))
        return
      }

      if (!user) throw new Error("You must be signed in to update your profile")

      const {firstName, lastName} = splitFullName(input.fullName)
      const metadata = compactJson({
        city: input.city,
        country: input.country,
      })

      const {data, error} = await supabase
        .from("profiles")
        .update({
          first_name: firstName,
          last_name: lastName,
          phone: input.phone ?? null,
          bio: input.bio ?? null,
          profile_picture_url: input.avatarUrl ?? null,
          metadata,
        })
        .eq("user_id", user.id)
        .select("*")
        .single()

      if (error) {
        setAuthError(error.message)
        throw error
      }

      setProfile(mapProfileRow(data as ProfileRow, user))
    },
    [user],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      profile,
      session,
      user,
      isAuthenticated: Boolean(profile),
      isAdmin: profile?.role === "admin",
      isLoading,
      authError,
      signIn,
      signUp,
      signOut,
      refreshProfile,
      updateProfile,
    }),
    [authError, isLoading, profile, refreshProfile, session, signIn, signOut, signUp, updateProfile, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used inside AuthProvider")
  return context
}

async function ensureProfile(authUser: User): Promise<ProfileRow> {
  if (!supabase) throw new Error("Supabase is not configured")

  const {data: existing, error: selectError} = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", authUser.id)
    .maybeSingle()

  if (selectError) throw selectError
  if (existing) return existing as ProfileRow

  const metadata = authUser.user_metadata as Record<string, unknown>
  const {data: inserted, error: insertError} = await supabase
    .from("profiles")
    .insert({
      user_id: authUser.id,
      first_name: metadataText(metadata, "first_name") ?? metadataText(metadata, "firstName") ?? authUser.email?.split("@")[0] ?? "Traveler",
      last_name: metadataText(metadata, "last_name") ?? metadataText(metadata, "lastName") ?? null,
      phone: metadataText(metadata, "phone") ?? null,
      bio: metadataText(metadata, "bio") ?? null,
      profile_picture_url: metadataText(metadata, "avatar_url") ?? null,
      role: "user",
      metadata: compactJson({
        city: metadataText(metadata, "city"),
        country: metadataText(metadata, "country"),
      }),
    })
    .select("*")
    .single()

  if (insertError) {
    const {data: retry, error: retryError} = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", authUser.id)
      .single()

    if (retryError) throw insertError
    return retry as ProfileRow
  }

  return inserted as ProfileRow
}

function mapProfileRow(row: ProfileRow, authUser: User): UserProfile {
  const fullName = [row.first_name, row.last_name].filter(Boolean).join(" ").trim()
  return {
    id: row.id,
    email: authUser.email ?? "",
    fullName: fullName || authUser.email?.split("@")[0] || "Traveler",
    role: row.role,
    city: metadataText(row.metadata, "city"),
    country: metadataText(row.metadata, "country"),
    phone: row.phone ?? undefined,
    avatarUrl: row.profile_picture_url ?? undefined,
    bio: row.bio ?? undefined,
  }
}

function profileMetadataFromInput(input: SignUpCredentials): JsonObject {
  return compactJson({
    first_name: input.firstName,
    firstName: input.firstName,
    last_name: input.lastName,
    lastName: input.lastName,
    phone: input.phone,
    city: input.city,
    country: input.country,
    bio: input.bio,
  })
}

function compactJson(input: Record<string, string | undefined>): JsonObject {
  return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined && value !== "")) as JsonObject
}

function metadataText(metadata: Record<string, unknown> | JsonObject | undefined, key: string): string | undefined {
  const value = metadata?.[key]
  return typeof value === "string" ? value : undefined
}

function splitFullName(fullName: string): {firstName: string; lastName: string | null} {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  const firstName = parts.shift() ?? "Traveler"
  const lastName = parts.length ? parts.join(" ") : null
  return {firstName, lastName}
}
