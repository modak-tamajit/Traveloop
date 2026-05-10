import {Filter, SlidersHorizontal} from "lucide-react"
import {Button} from "@/components/ui/button"
import {SearchBar} from "@/components/ui/input"
import {cn} from "@/lib/utils"

export function SearchToolbar({
  placeholder = "Search",
  className,
}: {
  placeholder?: string
  className?: string
}) {
  return (
    <div className={cn("flex flex-col gap-2 sm:flex-row sm:items-center", className)}>
      <SearchBar className="min-w-0 flex-1" placeholder={placeholder} />
      <div className="grid grid-cols-3 gap-2 sm:flex">
        <Button size="sm" variant="outline">
          Group
        </Button>
        <Button size="sm" variant="outline">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
        <Button size="sm" variant="outline">
          <SlidersHorizontal className="h-4 w-4" />
          Sort
        </Button>
      </div>
    </div>
  )
}
