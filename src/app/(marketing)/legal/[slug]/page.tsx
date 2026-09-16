import type { Metadata } from "next";
import { notFound } from "next/navigation";

const DOCS: Record<string, { title: string; updated: string; sections: { h: string; body: string[] }[] }> = {
  terms: {
    title: "Terms of Service",
    updated: "September 2026",
    sections: [
      {
        h: "1. The service",
        body: [
          "Gigmint is a marketplace that connects clients who need work done with freelancers who do the work. We provide the platform, escrow tooling, and dispute process — we are not a party to the contract between client and freelancer.",
        ],
      },
      {
        h: "2. Accounts",
        body: [
          "You must provide accurate information, keep your credentials secure, and be at least 18 years old. One person may hold one account. Accounts may be suspended for fraud, spam, or repeated policy violations.",
        ],
      },
      {
        h: "3. Payments and escrow",
        body: [
          "Clients fund milestones into escrow before work begins. Funds are released to the freelancer when the client approves the work, or automatically after the review window closes. Gigmint charges a service fee on completed milestones, disclosed at checkout.",
        ],
      },
      {
        h: "4. Disputes",
        body: [
          "Either side may open a dispute on an active milestone. Gigmint reviews evidence from both parties (deliverables, messages, files) and decides release, refund, or split. Our decision is final for amounts under the dispute threshold published on the pricing page.",
        ],
      },
      {
        h: "5. Liability",
        body: [
          "The service is provided \"as is.\" Gigmint is not liable for indirect or consequential damages, and our aggregate liability is capped at the fees you paid us in the preceding 12 months.",
        ],
      },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    updated: "September 2026",
    sections: [
      {
        h: "1. What we collect",
        body: [
          "Account data (name, email, role), profile content you publish, messages and files you exchange through the platform, and technical logs (IP, device, actions) needed to run and secure the service.",
        ],
      },
      {
        h: "2. How we use it",
        body: [
          "To operate the marketplace: matching, messaging, escrow, fraud prevention, support, and product improvement. We do not sell personal data. We do not use your content to train third-party models without consent.",
        ],
      },
      {
        h: "3. Sharing",
        body: [
          "Processors we rely on: our database host (Aiven), object storage (Cloudflare R2), payments (our PSP), and email delivery. Each is bound by a data-processing agreement. We disclose data only when the law requires it.",
        ],
      },
      {
        h: "4. Your rights",
        body: [
          "Access, correction, export, and deletion on request from Settings or by contacting privacy@gigmint.com. Deleting your account anonymizes your profile and removes personal data within 30 days, except records we must retain for payments and disputes.",
        ],
      },
    ],
  },
  cookies: {
    title: "Cookie Policy",
    updated: "September 2026",
    sections: [
      {
        h: "1. What we set",
        body: [
          "One essential session cookie (httpOnly, SameSite=Lax) that keeps you logged in. No analytics or advertising cookies are set today.",
        ],
      },
      {
        h: "2. Third parties",
        body: [
          "If we add analytics or embedded content later, this page will list every third-party cookie, its purpose, and its expiry before it goes live.",
        ],
      },
      {
        h: "3. Controlling cookies",
        body: [
          "You can clear or block cookies in your browser, but blocking the session cookie will log you out and break sign-in.",
        ],
      },
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(DOCS).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const doc = DOCS[params.slug];
  if (!doc) return {};
  return { title: `${doc.title} — Gigmint`, description: `${doc.title} for the Gigmint marketplace.` };
}

export default function LegalPage({ params }: { params: { slug: string } }) {
  const doc = DOCS[params.slug];
  if (!doc) notFound();

  return (
    <article className="mx-auto max-w-[720px] px-6 py-16">
      <h1 className="notion-title mb-2">{doc.title}</h1>
      <p className="mb-10 text-sm text-[rgba(55,53,47,0.5)]">Last updated {doc.updated}</p>
      <div className="space-y-8">
        {doc.sections.map((s) => (
          <section key={s.h}>
            <h2 className="notion-h3 mb-2">{s.h}</h2>
            {s.body.map((p, i) => (
              <p key={i} className="mb-3 text-[16px] leading-[1.6] text-[rgb(55,53,47)]">
                {p}
              </p>
            ))}
          </section>
        ))}
      </div>
    </article>
  );
}
