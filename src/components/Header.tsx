import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, BookOpen, Moon, Sun, User, LogOut, Languages, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const { t, i18n } = useTranslation();
  const [isDark, setIsDark] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const navLinks = [
    { to: "/", label: t("nav.home") },
    { to: "/stories", label: t("nav.explore") },
    { to: "/circles", label: t("nav.circles") },
    { to: "/map", label: t("nav.map") },
    { to: "/bookmarks", label: t("nav.bookmarks") },
  ];

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <nav className="mt-8 flex flex-col gap-2">
                <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                  Navigation
                </div>
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setOpen(false)}
                    className={`rounded-lg px-4 py-3 text-sm font-medium transition-colors ${location.pathname === link.to
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      }`}
                  >
                    {link.label}
                  </Link>
                ))}

                <div className="mt-4 border-t border-border/50 pt-4">
                  <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                    Account
                  </div>
                  {user ? (
                    <>
                      <Link
                        to={`/profile/${user.id}`}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                      >
                        <User className="h-4 w-4" />
                        View Profile
                      </Link>
                      {user.role === 'admin' && (
                        <Link
                          to="/admin/moderation"
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                        >
                          <ShieldAlert className="h-4 w-4 text-primary" />
                          Moderation
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          logout();
                          setOpen(false);
                        }}
                        className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Log out
                      </button>
                    </>
                  ) : (
                    <Link
                      to="/login"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
                    >
                      <User className="h-4 w-4" />
                      {t("nav.login", "Sign In")}
                    </Link>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>

          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary">
              <BookOpen className="h-4.5 w-4.5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold font-serif tracking-tight">
              Echoes of Community
            </span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${location.pathname === link.to
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Languages className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => changeLanguage("en")}>
                English
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeLanguage("es")}>
                Español
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeLanguage("te")}>
                తెలుగు
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeLanguage("hi")}>
                हिन्दी
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeLanguage("ta")}>
                தமிழ்
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeLanguage("kn")}>
                ಕನ್ನಡ
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-full gap-2">
                  <User className="h-4 w-4" />
                  <span className="max-w-[100px] truncate">{user.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link to={`/profile/${user.id}`}>
                    <User className="mr-2 h-4 w-4" />
                    <span>View Profile</span>
                  </Link>
                </DropdownMenuItem>
                {user.role === 'admin' && (
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to="/admin/moderation">
                      <ShieldAlert className="mr-2 h-4 w-4 text-primary" />
                      <span>Moderation</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={logout} className="text-destructive cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="outline" size="sm" className="hidden sm:flex rounded-full" asChild>
              <Link to="/login">{t("nav.login", "Sign In")}</Link>
            </Button>
          )}
        </div>
      </div>
    </header>

  );
}
