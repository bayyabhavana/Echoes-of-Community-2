import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="border-t border-border/50 bg-accent/30 py-10">
      <div className="container">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
              <BookOpen className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-serif text-lg font-semibold">
              Echoes of Community
            </span>
          </div>
          <p className="max-w-md text-sm text-muted-foreground leading-relaxed">
            {t("footer.subtitle")}
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link to="/stories" className="hover:text-foreground transition-colors">{t("nav.explore")}</Link>
            <Link to="/circles" className="hover:text-foreground transition-colors">{t("nav.circles")}</Link>
            <Link to="/share" className="hover:text-foreground transition-colors">{t("hero.cta_share")}</Link>
            <Link to="/map" className="hover:text-foreground transition-colors">{t("nav.map")}</Link>
          </div>
          <p className="text-xs text-muted-foreground/60">
            {t("footer.copy")}
          </p>
        </div>
      </div>
    </footer>
  );
}
