import Link from "next/link";
import { Button } from "../components/ui/button";
import Image from "next/image";
import cardiosense_logo from "../img/cardiosense_logo.svg";

export function SiteHeader() {
  return (
    <header className="w-full border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2"
          aria-label="CardioSense Home"
        >
          {/* <Image src={cardiosense_logo} alt="CardioSense logo" className="w-50 m-2 ms-0 rounded" /> */}
          LOGO
        </Link>

        <nav aria-label="Primary" className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className="text-sm hover:text-primary transition-colors"
          >
            Home
          </Link>
          <Link
            href="/about"
            className="text-sm hover:text-primary transition-colors"
          >
            About
          </Link>
          <Link
            href="/contact"
            className="text-sm hover:text-primary transition-colors"
          >
            Contact
          </Link>
          <Link
            href="/faqs"
            className="text-sm hover:text-primary transition-colors"
          >
            FAQS
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/login" className="hidden sm:block">
            <Button size="sm" className="px-4">
              {"Sign in"}
            </Button>
          </Link>
        </div>
      </div>

      {/* Mobile nav */}
      <nav
        aria-label="Primary mobile"
        className="md:hidden border-t border-border"
      >
        <div className="mx-auto max-w-6xl px-4 py-2 flex items-center justify-between text-sm">
          <Link href="/" className="hover:text-primary">
            Home
          </Link>
          <Link href="/about" className="hover:text-primary">
            About
          </Link>
          <Link href="/contact" className="hover:text-primary">
            Contact
          </Link>
          <Link href="/faqs" className="hover:text-primary">
            FAQS
          </Link>
          <Link href="/sign-in" className="hover:text-primary">
            Sign in
          </Link>
        </div>
      </nav>
    </header>
  );
}
