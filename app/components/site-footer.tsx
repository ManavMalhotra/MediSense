import Link from "next/link"
import { Instagram, Linkedin, Twitter, Youtube } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-[#1F2937]">
      <div className="mx-auto max-w-6xl px-4 py-12 grid gap-8 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <h3 className="text-sm font-bold mb-3 text-[#ffffff] border-b-2 border-[#8B5CF6] inline-block">Platform</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/about" className="hover:text-[#A4A4A4] text-[#D2D2D2]">
                About Us
              </Link>
            </li>
            <li>
              <Link href="/" className="hover:text-[#A4A4A4] text-[#D2D2D2]">
                Home
              </Link>
            </li>
            <li>
              <Link href="/faqs" className="hover:text-[#A4A4A4] text-[#D2D2D2]">
                FAQs
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold mb-3 text-[#ffffff] border-b-2 border-[#8B5CF6] inline-block">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/sign-in" className="hover:text-[#A4A4A4] text-[#D2D2D2]">
                Login
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-[#A4A4A4] text-[#D2D2D2]">
                Contact Us
              </Link>
            </li>
            <li>
              <Link href="/register-specialist" className="hover:text-[#A4A4A4] text-[#D2D2D2]">
                Register
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold mb-3 text-[#ffffff] border-b-2 border-[#8B5CF6] inline-block">Get Help</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/contact" className="hover:text-[#A4A4A4] text-[#D2D2D2]">
                Support
              </Link>
            </li>
            <li>
              <Link href="/privacy-policy" className="hover:text-[#A4A4A4] text-[#D2D2D2]">
                Privacy Policy
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold mb-3 text-[#ffffff] border-b-2 border-[#8B5CF6] inline-block">Follow Us</h3>
          <div className="flex items-center gap-3">
            <a href="#" aria-label="Twitter" className="hover:text-[#A4A4A4] text-[#D2D2D2]">
              <Twitter className="h-5 w-5" />
              <span className="sr-only">Twitter</span>
            </a>
            <a href="#" aria-label="Instagram" className="hover:text-[#A4A4A4] text-[#D2D2D2]">
              <Instagram className="h-5 w-5" />
              <span className="sr-only">Instagram</span>
            </a>
            <a href="#" aria-label="LinkedIn" className="hover:text-[#A4A4A4] text-[#D2D2D2]">
              <Linkedin className="h-5 w-5" />
              <span className="sr-only">LinkedIn</span>
            </a>
            <a href="#" aria-label="YouTube" className="hover:text-[#A4A4A4] text-[#D2D2D2]">
              <Youtube className="h-5 w-5" />
              <span className="sr-only">YouTube</span>
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-4 text-xs text-muted-foreground">©Copyright. All rights reserved</div>
      </div>
    </footer>
  )
}
