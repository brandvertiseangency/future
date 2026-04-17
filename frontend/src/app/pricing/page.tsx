import Navbar from "@/components/landing/Navbar";
import Pricing from "@/components/landing/Pricing";
import Footer from "@/components/landing/Footer";

export const metadata = {
  title: "Pricing — Brandvertise AI",
  description: "Simple, transparent pricing for every stage of your brand. Start free, scale as you grow.",
};

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <main style={{ background: "#080808", minHeight: "100vh", paddingTop: 80 }}>
        <Pricing />
      </main>
      <Footer />
    </>
  );
}
