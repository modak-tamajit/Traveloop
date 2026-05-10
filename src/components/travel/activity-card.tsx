import {Clock3, IndianRupee, Star} from "lucide-react"
import {Button} from "@/components/ui/button"
import {InteractiveCard} from "@/components/ui/card"
import {Badge} from "@/components/ui/badge"
import type {Activity} from "@/types"

export function ActivityCard({activity}: {activity: Activity}) {
  return (
    <InteractiveCard className="overflow-hidden">
      <div className="aspect-[4/3] overflow-hidden bg-muted">
        <img alt={activity.name} className="h-full w-full object-cover" src={activity.imageUrl} />
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <Badge variant="muted">{activity.category}</Badge>
            <h3 className="mt-3 font-bold">{activity.name}</h3>
          </div>
          <span className="flex items-center gap-1 text-sm font-bold text-gold">
            <Star className="h-4 w-4 fill-current" />
            {activity.rating}
          </span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-foreground/65">
          <span className="flex items-center gap-1">
            <Clock3 className="h-4 w-4" />
            {activity.duration}
          </span>
          <span className="flex items-center gap-1">
            <IndianRupee className="h-4 w-4" />
            {activity.cost.toLocaleString("en-IN")}
          </span>
        </div>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {activity.tags.slice(0, 3).map((tag) => (
            <span className="rounded-full bg-muted px-2 py-1 text-xs font-semibold text-foreground/60" key={tag}>
              {tag}
            </span>
          ))}
        </div>
        <Button className="mt-4 w-full" size="sm" variant="outline">
          Add to day
        </Button>
      </div>
    </InteractiveCard>
  )
}
