import {Navigate,useLocation} from "react-router-dom"
import type {ReactNode} from "react"
import {useAuth} from "@/providers/auth-provider"
export function ProtectedRoute({children,adminOnly=false}:{children:ReactNode;adminOnly?:boolean}){const {isAuthenticated,isAdmin}=useAuth();const location=useLocation();if(!isAuthenticated)return <Navigate to="/" replace state={{from:location}}/>;if(adminOnly&&!isAdmin)return <Navigate to="/dashboard" replace/>;return children}
