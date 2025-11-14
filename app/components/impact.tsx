export function Impact() {
  const items = [
    { value: "24K+", label: "Individuals", sub: "Thousands monitored for proactive heart care" },
    { value: "586+", label: "Risks Prevented", sub: "Early alerts to avoid potential emergencies" },
    { value: "400+", label: "Doctors", sub: "Specialists connected for faster, better decisions" },
    { value: "48+", label: "Cities", sub: "Expanding heart monitoring across regions" },
  ]

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 md:py-12" aria-labelledby="impact-heading">
      <div className="mb-8">
        <h2 id="impact-heading" className="text-balance text-xl font-bold tracking-tight md:text-2xl text-center">
          OUR IMPACT
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        {items.map((item) => (
          <div key={item.label} className="rounded-lg border border-border p-4">
            <div className="text-2xl font-bold text-[#8B5CF6]">{item.value}</div>
            <div className="text-sm font-semibold">{item.label}</div>
            <p className="mt-1 text-xs text-muted-foreground">{item.sub}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
