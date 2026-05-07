import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import ScrollGallery from "@/components/landing/ScrollGallery";
import MarqueeBrands from "@/components/landing/MarqueeBrands";
import Stats from "@/components/landing/Stats";
import Features from "@/components/landing/Features";
import About from "@/components/landing/About";
import Team from "@/components/landing/Team";
import HowItWorks from "@/components/landing/HowItWorks";
import Services from "@/components/landing/Services";
import Pricing from "@/components/landing/Pricing";
import Testimonials from "@/components/landing/Testimonials";
import FAQ from "@/components/landing/FAQ";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex flex-col bg-[#080808]">
        <Hero />
        <ScrollGallery />
        <MarqueeBrands />
        <Stats />
        <Features />
        <About />
        <Team />
        <HowItWorks />
        <Services />
        <Pricing />
        <Testimonials />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
