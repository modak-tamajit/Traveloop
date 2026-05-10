import {Heart, MessageCircle, Search, Share2} from "lucide-react"
import {Avatar} from "@/components/ui/avatar"
import {Badge} from "@/components/ui/badge"
import {Button} from "@/components/ui/button"
import {Card, CardContent} from "@/components/ui/card"
import {PageHeader, PageShell} from "@/components/layout/page-shell"
import {SearchToolbar} from "@/components/travel/search-toolbar"

const posts = [
  {
    id: "post-1",
    author: "Ira",
    title: "Kerala in five slow days",
    body: "Backwaters first, then Fort Kochi cafes. Keep one afternoon empty for weather changes.",
    tag: "Itinerary",
  },
  {
    id: "post-2",
    author: "Dev",
    title: "Jaipur food walk after Amber",
    body: "Start early, rest in the afternoon, and book dinner near the old city before sunset.",
    tag: "Food",
  },
  {
    id: "post-3",
    author: "Mina",
    title: "Rome museum pass timing",
    body: "Morning slots were calmer. Keep transit buffers because the old streets invite detours.",
    tag: "Tip",
  },
  {
    id: "post-4",
    author: "Kabir",
    title: "Packing light for monsoon travel",
    body: "Quick-dry layers, waterproof document pouch, and one backup pair of walking shoes.",
    tag: "Packing",
  },
]

export function CommunityPage() {
  return (
    <PageShell>
      <PageHeader
        description="Community stories, tips, and public itineraries shared by travelers."
        eyebrow="Community"
        title="Community Tab"
      />
      <SearchToolbar placeholder="Search community posts" />

      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_320px]">
        <section className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id}>
              <CardContent className="grid gap-4 pt-5 sm:grid-cols-[56px_1fr]">
                <Avatar fallback={post.author} />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold">{post.title}</h2>
                    <Badge variant="muted">{post.tag}</Badge>
                  </div>
                  <p className="mt-2 text-foreground/70">{post.body}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button size="sm" variant="outline">
                      <Heart className="h-4 w-4" />
                      Save
                    </Button>
                    <Button size="sm" variant="outline">
                      <MessageCircle className="h-4 w-4" />
                      Reply
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Share2 className="h-4 w-4" />
                      Share
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        <aside className="space-y-4">
          <Card>
            <CardContent className="pt-5">
              <Search className="h-6 w-6 text-accent" />
              <h2 className="mt-3 font-bold">How community search works</h2>
              <p className="mt-2 text-sm text-foreground/65">
                Search, group, filter, and sort public experiences to narrow down the exact route, activity, or planning
                tip you need.
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </PageShell>
  )
}
