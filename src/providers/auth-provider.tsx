import {createContext,useContext,useMemo,useState} from "react"
import type {ReactNode} from "react"
import type {UserProfile} from "@/types"
type AuthContextValue={profile:UserProfile|null;isAuthenticated:boolean;isAdmin:boolean;signIn:()=>void;signOut:()=>void}
const demoProfile:UserProfile={id:"demo-user",email:"traveler@safarnama.app",fullName:"Aarav Mehta",role:"admin"}
const AuthContext=createContext<AuthContextValue|null>(null)
export function AuthProvider({children}:{children:ReactNode}){const [profile,setProfile]=useState<UserProfile|null>(demoProfile);const value=useMemo<AuthContextValue>(()=>({profile,isAuthenticated:Boolean(profile),isAdmin:profile?.role==="admin",signIn:()=>setProfile(demoProfile),signOut:()=>setProfile(null)}),[profile]);return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>}
export function useAuth(){const context=useContext(AuthContext);if(!context)throw new Error("useAuth must be used inside AuthProvider");return context}
