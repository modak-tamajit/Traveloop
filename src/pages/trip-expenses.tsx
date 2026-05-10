import {ArrowLeft, Download, FileText, IndianRupee, WalletCards} from "lucide-react"
import {Link, useParams} from "react-router-dom"
import {Button} from "@/components/ui/button"
import {Card, CardContent} from "@/components/ui/card"
import {PageHeader, PageShell} from "@/components/layout/page-shell"
import {ExpenseCard} from "@/components/travel/expense-card"
import {SearchToolbar} from "@/components/travel/search-toolbar"
import {TripTabs} from "@/pages/trip-detail"
import {expenseLines, trips} from "@/data/mock"

export function TripExpensesPage() {
  const {id} = useParams()
  const trip = trips.find((item) => item.id === id) ?? trips[0]
  const subtotal = expenseLines.reduce((sum, line) => sum + line.amount, 0)
  const tax = 1050
  const discount = 50
  const total = subtotal + tax - discount

  return (
    <PageShell>
      <PageHeader
        actions={
          <Button variant="outline">
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
        }
        description={`${trip.title} · expense invoice and budget view`}
        eyebrow="Expenses"
        title="Billing"
      />
      <TripTabs id={trip.id} />

      <div className="mt-5 space-y-5">
        <SearchToolbar placeholder="Search invoices" />
        <Button asChild size="sm" variant="ghost">
          <Link to={`/trip/${trip.id}`}>
            <ArrowLeft className="h-4 w-4" />
            Back to trip
          </Link>
        </Button>

        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          <Card>
            <CardContent className="pt-5">
              <div className="grid gap-5 border-b border-border pb-5 md:grid-cols-[180px_1fr_1fr]">
                <div className="grid aspect-square place-items-center rounded-xl bg-muted">
                  <FileText className="h-14 w-14 text-primary" />
                </div>
                <div>
                  <h2 className="font-bold">{trip.title}</h2>
                  <p className="mt-2 text-sm text-foreground/60">
                    {trip.startDate} to {trip.endDate} · {trip.destination}
                  </p>
                  <p className="mt-2 text-sm text-foreground/60">Created by Aarav</p>
                </div>
                <div className="text-sm text-foreground/70">
                  <p>
                    <b>Invoice ID</b> INV-30240
                  </p>
                  <p className="mt-2">
                    <b>Generated</b> May 20, 2025
                  </p>
                  <p className="mt-2">
                    <b>Status</b> Pending
                  </p>
                </div>
              </div>

              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[720px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-foreground/55">
                      <th className="py-3">#</th>
                      <th>Category</th>
                      <th>Description</th>
                      <th>Qty/details</th>
                      <th>Unit cost</th>
                      <th className="text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenseLines.map((line, index) => (
                      <tr className="border-b border-border" key={line.id}>
                        <td className="py-3">{index + 1}</td>
                        <td>{line.category}</td>
                        <td>{line.description}</td>
                        <td>{line.quantity}</td>
                        <td>₹{line.unitCost.toLocaleString("en-IN")}</td>
                        <td className="text-right font-bold">₹{line.amount.toLocaleString("en-IN")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="ml-auto mt-5 max-w-xs space-y-2 text-sm">
                <Row label="Subtotal" value={subtotal} />
                <Row label="Tax" value={tax} />
                <Row label="Discount" value={discount} />
                <Row label="Grand total" strong value={total} />
              </div>
            </CardContent>
          </Card>

          <aside className="space-y-4">
            <Card>
              <CardContent className="pt-5">
                <WalletCards className="h-6 w-6 text-accent" />
                <h2 className="mt-3 font-bold">Budget insights</h2>
                <div className="mt-5 grid place-items-center">
                  <div className="relative h-32 w-32 rounded-full bg-[conic-gradient(hsl(var(--primary))_0_58%,hsl(var(--gold))_58%_100%)]">
                    <div className="absolute inset-7 rounded-full bg-card" />
                  </div>
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <Row label="Budget" value={trip.budget ?? 0} />
                  <Row label="Spent" value={trip.spent ?? 0} />
                  <Row label="Remaining" value={(trip.budget ?? 0) - (trip.spent ?? 0)} />
                </div>
              </CardContent>
            </Card>
            {expenseLines.map((expense) => (
              <ExpenseCard expense={expense} key={expense.id} />
            ))}
          </aside>
        </div>
      </div>
    </PageShell>
  )
}

function Row({label, value, strong}: {label: string; value: number; strong?: boolean}) {
  return (
    <div className={strong ? "flex justify-between border-t border-border pt-2 font-bold" : "flex justify-between"}>
      <span>{label}</span>
      <span className="flex items-center">
        <IndianRupee className="h-4 w-4" />
        {value.toLocaleString("en-IN")}
      </span>
    </div>
  )
}
