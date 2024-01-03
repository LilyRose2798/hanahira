import { ReactNode } from "react"
import { Card } from "@/components/ui/card"

export const AccountCard = ({ header, description, children }: {
  header: string
  description: string
  children: ReactNode
}) => (
  <Card>
    <div id="body" className="p-4">
      <h3 className="text-xl font-semibold">{header}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
    {children}
  </Card>
)

export const AccountCardBody = ({ children }: { children: ReactNode }) => (
  <div className="p-4">{children}</div>
)

export const AccountCardFooter = ({ description, children }: {
  children: ReactNode
  description: string
}) => (
  <div className="bg-primary-foreground p-4 border flex justify-between items-center" id="footer">
    <p className="text-muted-foreground text-sm">{description}</p>
    {children}
  </div>
)

export default AccountCard
