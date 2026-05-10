import {createContext,useContext,useEffect,useMemo,useState} from "react"
import type {ReactNode} from "react"
type Theme="light"|"dark"
type ThemeContextValue={theme:Theme;toggleTheme:()=>void;setTheme:(theme:Theme)=>void}
const ThemeContext=createContext<ThemeContextValue|null>(null)
export function ThemeProvider({children}:{children:ReactNode}){const [theme,setTheme]=useState<Theme>(()=>(localStorage.getItem("safarnama-theme") as Theme)||"light");useEffect(()=>{document.documentElement.classList.toggle("dark",theme==="dark");localStorage.setItem("safarnama-theme",theme)},[theme]);const value=useMemo(()=>({theme,setTheme,toggleTheme:()=>setTheme(current=>current==="dark"?"light":"dark")}),[theme]);return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>}
export function useTheme(){const context=useContext(ThemeContext);if(!context)throw new Error("useTheme must be used inside ThemeProvider");return context}
