import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { PlayCircle } from "lucide-react"

function extractYouTubeId(input?: string | null) {
  if (!input) return null
  try {
    // If it's already an ID without URL parts, return as-is
    if (!input.includes("http")) return input.trim()
    const url = new URL(input)
    if (url.hostname.includes("youtube.com")) {
      // Watch URL: https://www.youtube.com/watch?v=ID
      const v = url.searchParams.get("v")
      if (v) return v
      // Share URL variant like /embed/ID
      const parts = url.pathname.split("/")
      const idx = parts.findIndex((p) => p === "embed")
      if (idx >= 0 && parts[idx + 1]) return parts[idx + 1]
    }
    if (url.hostname === "youtu.be") {
      // Short URL: https://youtu.be/ID
      const candidate = url.pathname.replace("/", "")
      if (candidate) return candidate
    }
  } catch {}
  return null
}

export function HowTo() {
  const steps = [
    { step: 1, title: "Register Yourself", desc: "Sign up on our platform to create your personal health profile." },
    { step: 2, title: "Receive Your Kit", desc: "Get the IoT heart monitoring device delivered to your home." },
    {
      step: 3,
      title: "Monitor Your Health",
      desc: "Record ECG and pulse anytime and view the results on your dashboard.",
    },
    {
      step: 4,
      title: "Connect with a Doctor",
      desc: "Share your readings with a specialist for advice and detailed reports.",
    },
  ]

  const configuredId =
    extractYouTubeId(process.env.NEXT_PUBLIC_YOUTUBE_TUTORIAL) ||
    extractYouTubeId(process.env.YOUTUBE_TUTORIAL) ||
    "BSlRvD-CZSo"

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 md:py-16" aria-labelledby="howto-heading">
      <div className="mb-6">
        <h2
          id="howto-heading"
          className="text-balance text-xl font-bold tracking-tight md:text-2xl text-center"
        >
          HOW TO USE
        </h2>
      </div>


      <div className="grid gap-6 md:grid-cols-2 items-center">
      {/* Steps */}
      <ol className="space-y-4">
        {steps.map((s) => (
          <li key={s.step} className="flex items-start gap-3">
            <div
              aria-hidden="true"
              className="mt-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#8B5CF6] text-primary-foreground text-sm font-medium"
              title={`Step ${s.step}`}
            >
              {s.step}
            </div>
            <div>
              <h3 className="font-semibold">{`${s.title}`}</h3>
              <p className="text-sm text-muted-foreground">{s.desc}</p>
            </div>
          </li>
        ))}
      </ol>

      {/* Video tutorial */}
      <Card className="overflow-hidden">
        <CardHeader>
          <p className="text-sm text-muted-foreground">
            How to use the kit? Watch the below video for the demonstration.
          </p>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-hidden rounded-md border border-border" style={{ aspectRatio: "16 / 9" }}>
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${configuredId}?rel=0`}
              title="CardioSense video tutorial"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              className="h-full w-full"
            />
          </div>
        </CardContent>
      </Card>
    </div>

    </section>
  )
}
