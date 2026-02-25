import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CommunityMap from "@/components/CommunityMap";

export default function MapViewPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold md:text-4xl">Community Map</h1>
          <p className="mt-2 text-muted-foreground">
            Explore stories by the places where they happened
          </p>
        </div>
        <CommunityMap />
      </main>
      <Footer />
    </div>
  );
}
