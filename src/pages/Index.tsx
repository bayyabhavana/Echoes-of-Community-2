import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import StoriesGrid from "@/components/StoriesGrid";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <StoriesGrid limit={6} />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
