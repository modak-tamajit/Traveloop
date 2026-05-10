import type {ReactNode} from "react"
import {cn} from "@/lib/utils"
export function PageShell({children,className}:{children:ReactNode;className?:string}){return <main className={cn("mx-auto w-full max-w-7xl px-4 pb-24 pt-4 sm:px-6 lg:px-8 lg:pb-8",className)}>{children}</main>}
export function PageHeader({title,eyebrow,actions}:{title:string;eyebrow?:string;actions?:ReactNode}){return <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div>{eyebrow&&<p className="text-sm font-semibold uppercase tracking-wide text-accent">{eyebrow}</p>}<h1 className="text-3xl font-bold">{title}</h1></div>{actions}</div>}
