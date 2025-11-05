import { useEffect, useRef, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return window.matchMedia("(min-width: 768px)").matches;
  });
  const [isInView, setIsInView] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const handleMediaChange = (event: MediaQueryListEvent) => {
      setIsDesktop(event.matches);
    };

    setIsDesktop(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleMediaChange);

    return () => mediaQuery.removeEventListener("change", handleMediaChange);
  }, []);

  // Track when the inline toggle leaves the viewport so we can surface the desktop floater
  useEffect(() => {
    const target = buttonRef.current;

    if (!isDesktop || !target) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      {
        threshold: 0.1,
      },
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, [isDesktop]);

  const showFloatingButton = isDesktop && !isInView;

  const renderContent = (showLabel: boolean) =>
    isDark ? (
      <>
        <Sun size={16} />
        {showLabel && <span className="hidden md:inline">라이트</span>}
      </>
    ) : (
      <>
        <Moon size={16} />
        {showLabel && <span className="hidden md:inline">다크</span>}
      </>
    );

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleTheme}
        className="fixed bottom-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card text-sm font-medium text-foreground shadow-lg transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 dark:bg-muted dark:hover:bg-muted md:static md:inline-flex md:h-auto md:w-auto md:gap-2 md:rounded-full md:bg-card/70 md:px-3 md:py-2 md:shadow-sm"
        aria-label={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
      >
        {renderContent(true)}
      </button>

      {showFloatingButton && (
        <button
          type="button"
          onClick={toggleTheme}
          className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card text-sm font-medium text-foreground shadow-lg transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 dark:bg-muted dark:hover:bg-muted"
          aria-label={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
        >
          {renderContent(false)}
        </button>
      )}
    </>
  );
}
