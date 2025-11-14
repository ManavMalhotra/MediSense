import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { PlayCircle } from "lucide-react";
import hero from "./demo.jpg";
import Image from "next/image";

function extractYouTubeId(input?: string | null) {
  if (!input) return null;
  try {
    // If it's already an ID without URL parts, return as-is
    if (!input.includes("http")) return input.trim();
    const url = new URL(input);
    if (url.hostname.includes("youtube.com")) {
      // Watch URL: https://www.youtube.com/watch?v=ID
      const v = url.searchParams.get("v");
      if (v) return v;
      // Share URL variant like /embed/ID
      const parts = url.pathname.split("/");
      const idx = parts.findIndex((p) => p === "embed");
      if (idx >= 0 && parts[idx + 1]) return parts[idx + 1];
    }
    if (url.hostname === "youtu.be") {
      // Short URL: https://youtu.be/ID
      const candidate = url.pathname.replace("/", "");
      if (candidate) return candidate;
    }
  } catch {}
  return null;
}

export function HowTo() {
  const steps = [
    {
      step: 1,
      title: "Set Up Your Profile",
      desc: "Create your health profile or scan your Smart Health Card to load your records instantly.",
    },
    {
      step: 2,
      title: "Connect the Smart Medicine Box",
      desc: "Power on the IoT pill box and let it auto-sync with your app for real-time dose tracking.",
    },
    {
      step: 3,
      title: "Use the AI Assistant",
      desc: "Ask the AI (voice or chat) to remind medicines, book appointments, or explain prescriptions in simple language.",
    },
    {
      step: 4,
      title: "Track & Share Your Health",
      desc: "View your vitals, dose history, and medical reports in one dashboard and share it with doctors or family when needed.",
    },
  ];

  const configuredId =
    extractYouTubeId(process.env.NEXT_PUBLIC_YOUTUBE_TUTORIAL) ||
    extractYouTubeId(process.env.YOUTUBE_TUTORIAL) ||
    "BSlRvD-CZSo";

  return (
    <section
      className="mx-auto max-w-6xl px-4 py-12 md:py-16"
      aria-labelledby="howto-heading"
    >
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
          <CardContent>
            <div
              className="w-full overflow-hidden rounded-md border border-border"
              style={{ aspectRatio: "16 / 9" }}
            >
              <Image src={hero} alt="Video tutorial placeholder" className="" />
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
