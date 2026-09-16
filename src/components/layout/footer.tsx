import Link from "next/link";
import { Github, Twitter, Linkedin, Mail } from "lucide-react";

const footerLinks = {
  Product: [
    { label: "Browse Projects", href: "/projects" },
    { label: "How It Works", href: "/#how-it-works" },
    { label: "Pricing", href: "/#pricing" },
    { label: "Enterprise", href: "/enterprise" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Careers", href: "/careers" },
    { label: "Contact", href: "/contact" },
  ],
  Resources: [
    { label: "Help Center", href: "/help" },
    { label: "Community", href: "/community" },
    { label: "API Docs", href: "/docs" },
    { label: "Status", href: "/status" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/legal/privacy" },
    { label: "Terms of Service", href: "/legal/terms" },
    { label: "Cookie Policy", href: "/legal/cookies" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 py-12 md:grid-cols-5">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                <span className="text-sm font-bold text-white">G</span>
              </div>
              <span className="text-lg font-bold tracking-tight">Gigmint</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              The premium freelance marketplace. Connect with top talent or find
              your next opportunity.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <Link
                href="https://twitter.com"
                className="text-muted-foreground hover:text-white transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </Link>
              <Link
                href="https://github.com"
                className="text-muted-foreground hover:text-white transition-colors"
              >
                <Github className="h-5 w-5" />
              </Link>
              <Link
                href="https://linkedin.com"
                className="text-muted-foreground hover:text-white transition-colors"
              >
                <Linkedin className="h-5 w-5" />
              </Link>
              <Link
                href="mailto:hello@gigmint.com"
                className="text-muted-foreground hover:text-white transition-colors"
              >
                <Mail className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold mb-3">{category}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Gigmint. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Built with ♥ for the freelance community
          </p>
        </div>
      </div>
    </footer>
  );
}
