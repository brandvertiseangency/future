import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import MarqueeBrands from "@/components/landing/MarqueeBrands";
import Stats from "@/components/landing/Stats";
import Features from "@/components/landing/Features";
import About from "@/components/landing/About";
import HowItWorks from "@/components/landing/HowItWorks";
import Services from "@/components/landing/Services";
import FAQ from "@/components/landing/FAQ";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main style={{ display: "flex", flexDirection: "column", background: "#080808" }}>
        <Hero />
        <MarqueeBrands />
        <Stats />
        <Features />
        <About />
        <HowItWorks />
        <Services />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
