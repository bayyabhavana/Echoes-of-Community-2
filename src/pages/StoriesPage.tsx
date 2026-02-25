import Header from "@/components/Header";
import StoriesGrid from "@/components/StoriesGrid";
import Footer from "@/components/Footer";

export default function StoriesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <StoriesGrid />
      </main>
      <Footer />
    </div>
  );
}
