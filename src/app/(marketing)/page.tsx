import { Hero } from "@/components/marketing/hero";
import { Benefits } from "@/components/marketing/benefits";
import { FeaturedProjects } from "@/components/marketing/featured-projects";
import { FeaturedFreelancers } from "@/components/marketing/featured-freelancers";
import { Testimonials } from "@/components/marketing/testimonials";
import { FAQ } from "@/components/marketing/faq";
import { CTA } from "@/components/marketing/cta";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Hero />
      <Benefits />
      <FeaturedProjects />
      <FeaturedFreelancers />
      <Testimonials />
      <FAQ />
      <CTA />
    </div>
  );
}
