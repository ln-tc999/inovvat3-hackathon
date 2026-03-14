"use client";

import { useState } from "react";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import WalletConnect from "./WalletConnect";

const navItems = [
  { name: "About",        link: "#about" },
  { name: "Features",     link: "#features" },
  { name: "How it works", link: "#how-it-works" },
  { name: "FAQ",          link: "#faq" },
];

export default function SiteNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <Navbar>
      {/* Desktop */}
      <NavBody>
        <NavbarLogo />
        <NavItems items={navItems} />
        <div className="flex items-center gap-3">
          <NavbarButton variant="secondary" href="/dashboard">
            Dashboard
          </NavbarButton>
          <WalletConnect variant="header" redirectToDashboard={true} />
        </div>
      </NavBody>

      {/* Mobile */}
      <MobileNav>
        <MobileNavHeader>
          <NavbarLogo />
          <MobileNavToggle
            isOpen={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          />
        </MobileNavHeader>

        <MobileNavMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        >
          {navItems.map((item, idx) => (
            <a
              key={`mobile-link-${idx}`}
              href={item.link}
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-white/60 hover:text-white text-sm font-medium transition-colors w-full py-1"
            >
              {item.name}
            </a>
          ))}
          <div className="flex w-full flex-col gap-3 pt-2 border-t border-white/8">
            <NavbarButton
              variant="secondary"
              href="/dashboard"
              className="w-full"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Dashboard
            </NavbarButton>
            <WalletConnect variant="hero" redirectToDashboard={true} />
          </div>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
}
