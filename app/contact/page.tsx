import { SiteHeader } from "../components/site-header";
import { SiteFooter } from "../components/site-footer";

export default function Contact() {
  return (
    <div>
      <SiteHeader />
      <main className="mx-auto max-w-3xl md:max-w-4xl px-4 py-29 space-y-8">
        <section className="space-y-4">
          <h2
            id="contact-heading"
            className="text-balance text-xl font-bold tracking-tight md:text-2xl"
          >
            CONTACT US
          </h2>
          <p className="text-muted-foreground">
            If you have any questions, feedback, or need assistance, feel free
            to reach out to us at{" "}
            <a
              href="mailto:temp@mail.com"
              className="text-indigo-600 underline"
            >
              temp@mail.com
            </a>
            . We value your input and are here to help!
          </p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
