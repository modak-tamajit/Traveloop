import {ReceiptText} from "lucide-react"
import {Card, CardContent} from "@/components/ui/card"
import type {ExpenseLine} from "@/types"

export function ExpenseCard({expense}: {expense: ExpenseLine}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-4 pt-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-accent/10 text-accent">
            <ReceiptText className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h3 className="truncate font-bold">{expense.description}</h3>
            <p className="text-sm text-foreground/60">
              {expense.category} · {expense.quantity}
            </p>
          </div>
        </div>
        <p className="font-bold">₹{expense.amount.toLocaleString("en-IN")}</p>
      </CardContent>
    </Card>
  )
}
