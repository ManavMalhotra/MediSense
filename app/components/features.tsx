import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Activity, Brain, CreditCard } from "lucide-react"

const features = [
  {
    title: "Real-Time Heart Monitoring",
    description:
      "Record ECG and pulse anytime, anywhere with our IoT device. Stay connected to your health with instant data updates on your dashboard.",
    Icon: Activity,
  },
  {
    title: "AI-Powered Predictions",
    description:
      "Smart algorithms analyze your vitals and history to detect early warning signs. Get alerts before risks turn into emergencies.",
    Icon: Brain,
  },
  {
    title: "Smart Health Card",
    description:
      "Carry your complete medical history securely in one digital card. Access past reports and health records anytime, from birth to present.",
    Icon: CreditCard,
  },
]

export function Features() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-2 md:py-0">
      <div className="grid gap-6 md:grid-cols-3">
        {features.map(({ title, description, Icon }) => (
          <Card key={title}>
            <CardHeader className="flex-row items-center gap-3">
              <div className="rounded-md bg-accent p-2 text-accent-foreground">
                <Icon className="h-5 w-5" aria-hidden="true" style={{ color: "#8B5CF6" }} />
              </div>
              <CardTitle className="text-base md:text-lg">{title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">{description}</CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
