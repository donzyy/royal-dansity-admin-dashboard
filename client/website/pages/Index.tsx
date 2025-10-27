import Header from "@/website/components/Header";
import HeroCarousel from "@/website/components/HeroCarousel";
import LogoCloud from "@/website/components/LogoCloud";
import NewsSection from "@/website/components/NewsSection";
import AboutUsSection from "@/website/components/AboutUsSection";
import ServicesSection from "@/website/components/ServicesSection";
import Footer from "@/website/components/Footer";
import BackToTop from "../components/BackToTop";

export default function Index() {
  return (
    <div className="w-full overflow-x-hidden">
      <Header />
      <HeroCarousel />
      <LogoCloud />
      <NewsSection />
      <AboutUsSection />
      <ServicesSection />
      <BackToTop />
      <Footer />
    </div>
  );
}
