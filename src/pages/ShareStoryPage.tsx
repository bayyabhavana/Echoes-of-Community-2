import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ShareStoryForm from "@/components/ShareStoryForm";
import { useTranslation } from "react-i18next";

export default function ShareStoryPage() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-10">
        <div className="mx-auto max-w-2xl text-center mb-8">
          <h1 className="text-3xl font-bold md:text-4xl font-serif">{t("share.form_title", "Share Your Story")}</h1>
          <p className="mt-2 text-muted-foreground">
            {t("share.form_subtitle", "Every voice matters. Take your time—there's no rush.")}
          </p>
        </div>
        <ShareStoryForm />
      </main>
      <Footer />
    </div>
  );
}
