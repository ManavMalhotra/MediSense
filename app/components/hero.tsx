import Link from "next/link"
import { Button } from "../components/ui/button"
import { ArrowRight } from "lucide-react"
import landing_pg_img from "../img/landing_page_img.svg"
import Image from "next/image";
import { Amatic_SC } from "next/font/google";

const amatic = Amatic_SC({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-amatic",
});

export function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-8 md:py-8">
      <div className="grid items-center gap-8 md:grid-cols-2 md:gap-12 justify-between">
      {/* Left side (text) */}
      <div className="space-y-5">
        <h1 className={`${amatic.className} text-balance text-4xl font-semibold tracking-tight md:text-6xl`}>
          PREDICT-PREVENT-PROTECT
        </h1>
        <p className="text-pretty text-muted-foreground">
          Smart monitoring, early prediction, and lifetime health records
        </p>
        <p className="text-pretty">
          {
            "Heart diseases are rising due to late detection and delayed care. Our IoT-powered system records ECG and pulse anytime, sending data to a live dashboard for patients and doctors. With AI analysis and a Smart Health Card carrying your complete medical history, we make healthcare proactive, connected, and life-saving."
          }
        </p>
        <div className="flex items-center gap-3">
          <Link href="/register">
            <Button className="gap-1">
              Get Started
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </Link>
          <Link
            href="/about"
            className="text-sm underline underline-offset-4 hover:text-primary"
          >
            Learn more
          </Link>
        </div>
      </div>

      {/* Right side (image) */}
      <div className="flex justify-end">
        <Image
          src={landing_pg_img}
          alt="Illustration of a person using a heart monitoring device with medical icons"
          className="w-100 rounded-lg"
        />
      </div>
    </div>

    </section>
  )
}
