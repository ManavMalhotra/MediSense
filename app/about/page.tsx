import { SiteHeader } from "../components/site-header"
import { SiteFooter } from "../components/site-footer"

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl md:max-w-4xl px-4 py-29 space-y-8">
        <section className="space-y-4">
          <h2 id="impact-heading" className="text-balance text-xl font-bold tracking-tight md:text-2xl">
            ABOUT US
          </h2>
          <p className="text-muted-foreground">
            Our platform is designed to make heart health monitoring smarter, faster, and more accessible. Using an
            IoT-based monitoring system, patients can record ECG and pulse data anytime, anywhere. The data is sent to a
            live dashboard for doctors and patients, allowing timely interventions.
          </p>
          <p className="text-muted-foreground">
            With AI-powered analysis, our system predicts potential heart risks based on vitals and medical history,
            empowering both doctors and patients to act proactively. The Smart Health Card stores a complete medical
            history from birth, making healthcare connected, transparent, and personalized.
          </p>
        </section>

        <section className="space-y-4">
          <h2 id="impact-heading" className="text-balance text-xl font-bold tracking-tight md:text-2xl">
            OBJECTIVE
          </h2>
          <p className="text-muted-foreground">
            Our goal is to make heart health monitoring accessible, proactive, and reliable. We aim to detect risks
            early, provide timely insights to doctors and patients, and store complete medical histories through the
            Smart Health Card, enabling better healthcare decisions.
          </p>
          <p className="text-muted-foreground">
            To predict, prevent, and protect—we strive to reduce heart-related risks by empowering patients and doctors
            with real-time monitoring, smart insights, and a complete view of each individual's health journey.
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
