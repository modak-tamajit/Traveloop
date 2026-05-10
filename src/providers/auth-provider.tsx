import {createContext,useContext,useMemo,useState} from "react"
import type {ReactNode} from "react"
import type {UserProfile} from "@/types"
type AuthContextValue={profile:UserProfile|null;isAuthenticated:boolean;isAdmin:boolean;signIn:()=>void;signOut:()=>void}
const demoProfile:UserProfile={
  id:"demo-user",
  email:"traveler@safarnama.app",
  fullName:"Aarav Mehta",
  role:"admin",
  city:"Mumbai",
  country:"India",
  phone:"+91 90000 12000",
  avatarUrl:"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=320&q=80",
  bio:"Travel planner, culture seeker, and keeper of calm itineraries.",
}
const AuthContext=createContext<AuthContextValue|null>(null)
export function AuthProvider({children}:{children:ReactNode}){const [profile,setProfile]=useState<UserProfile|null>(demoProfile);const value=useMemo<AuthContextValue>(()=>({profile,isAuthenticated:Boolean(profile),isAdmin:profile?.role==="admin",signIn:()=>setProfile(demoProfile),signOut:()=>setProfile(null)}),[profile]);return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>}
export function useAuth(){const context=useContext(AuthContext);if(!context)throw new Error("useAuth must be used inside AuthProvider");return context}
