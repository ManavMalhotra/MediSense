import { SiteHeader } from "./components/site-header"
import { Hero } from "./components/hero"
import { Features } from "./components/features"
import { Impact } from "./components/impact"
import { HowTo } from "./components/how-to"
import { SiteFooter } from "./components/site-footer"

export default function Page() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <Features />
        <Impact />
        <HowTo />
      </main>
      <SiteFooter />
    </>
  )
}
