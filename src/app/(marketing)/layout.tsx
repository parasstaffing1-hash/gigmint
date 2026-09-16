import { NotionMarketingNav } from "@/components/layout/notion-marketing-nav";
import { Footer } from "@/components/layout/footer";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      <NotionMarketingNav />
      {children}
      <Footer />
    </div>
  );
}
