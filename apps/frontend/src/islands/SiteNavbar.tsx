"use client";

import { useState } from "react";
import { Sun, Moon } from "lucide-react";
import {
  Navbar, NavBody, NavItems, MobileNav,
  NavbarLogo, NavbarButton,
  MobileNavHeader, MobileNavToggle, MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import WalletConnect from "./WalletConnect";
import { useTheme } from "@/lib/useTheme";

const navItems = [
  { name: "About",        link: "#about" },
  { name: "Features",     link: "#features" },
  { name: "How it works", link: "#how-it-works" },
  { name: "FAQ",          link: "#faq" },
];

function ThemeBtn({ isDark, toggle }: { isDark: boolean; toggle: () => void }) {
  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="btn-fill-up"
      style={{
        width: 36, height: 36,
        borderRadius: 8,
        background: "var(--surface-2)",
        border: "1px solid var(--border)",
        color: "var(--muted)",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer",
        flexShrink: 0,
      }}
    >
      {isDark ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  );
}

export default function SiteNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isDark, toggle } = useTheme();

  return (
    <Navbar>
      {/* Desktop */}
      <NavBody>
        <NavbarLogo />
        <NavItems items={navItems} />
        <div className="flex items-center gap-2">
          <ThemeBtn isDark={isDark} toggle={toggle} />
          <NavbarButton variant="secondary" href="/dashboard">Dashboard</NavbarButton>
          <WalletConnect variant="header" redirectToDashboard={true} />
        </div>
      </NavBody>

      {/* Mobile */}
      <MobileNav>
        <MobileNavHeader>
          <NavbarLogo />
          <div className="flex items-center gap-2">
            <ThemeBtn isDark={isDark} toggle={toggle} />
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </div>
        </MobileNavHeader>

        <MobileNavMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)}>
          {navItems.map((item, idx) => (
            <a
              key={`mobile-link-${idx}`}
              href={item.link}
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-sm font-medium transition-colors w-full py-1"
              style={{ color: "var(--muted)" }}
            >
              {item.name}
            </a>
          ))}
          <div className="flex w-full flex-col gap-3 pt-3" style={{ borderTop: "1px solid var(--border)" }}>
            <NavbarButton variant="secondary" href="/dashboard" className="w-full"
              onClick={() => setIsMobileMenuOpen(false)}>
              Dashboard
            </NavbarButton>
            <WalletConnect variant="hero" redirectToDashboard={true} />
          </div>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
}
