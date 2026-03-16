import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { FeaturesBento } from "@/components/landing/features-bento";
import { DemoSection } from "@/components/landing/demo-section";
import { Pricing } from "@/components/landing/pricing";
import { Testimonials } from "@/components/landing/testimonials";
import { ContactForm } from "@/components/landing/contact-form";
import { Footer } from "@/components/landing/footer";

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <FeaturesBento />
      <DemoSection />
      <Pricing />
      <Testimonials />
      <ContactForm />
      <Footer />
    </main>
  );
}
