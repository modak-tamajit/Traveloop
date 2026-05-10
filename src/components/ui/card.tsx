import type {HTMLAttributes} from "react"
import {cn} from "@/lib/utils"
export function Card({className,...props}:HTMLAttributes<HTMLDivElement>){return <div className={cn("rounded-xl border border-border bg-card shadow-soft",className)} {...props}/>}
export function CardHeader({className,...props}:HTMLAttributes<HTMLDivElement>){return <div className={cn("p-5 pb-3",className)} {...props}/>}
export function CardContent({className,...props}:HTMLAttributes<HTMLDivElement>){return <div className={cn("p-5 pt-0",className)} {...props}/>}
