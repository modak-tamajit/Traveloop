import {Outlet} from "react-router-dom"
import {AppNav} from "@/components/layout/app-nav"
export function AppLayout(){return <div className="min-h-screen"><AppNav/><Outlet/></div>}
