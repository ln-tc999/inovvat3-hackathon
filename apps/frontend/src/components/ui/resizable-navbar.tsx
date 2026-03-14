"use client";

import { cn } from "@/lib/utils";
import { IconMenu2, IconX } from "@tabler/icons-react";
import { motion, AnimatePresence } from "motion/react";
import React, { useEffect, useRef, useState } from "react";

interface NavbarProps   { children: React.ReactNode; className?: string; }
interface NavBodyProps  { children: React.ReactNode; className?: string; visible?: boolean; }
interface NavItemsProps { items: { name: string; link: string }[]; className?: string; onItemClick?: () => void; }
interface MobileNavProps { children: React.ReactNode; className?: string; visible?: boolean; }
interface MobileNavHeaderProps { children: React.ReactNode; className?: string; }
interface MobileNavMenuProps   { children: React.ReactNode; className?: string; isOpen: boolean; onClose: () => void; }

export const Navbar = ({ children, className }: NavbarProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const container = document.getElementById("scroll-container") ?? window;
    const getY = () =>
      container instanceof Window
        ? container.scrollY
        : (container as HTMLElement).scrollTop;
    const onScroll = () => setVisible(getY() > 80);
    container.addEventListener("scroll", onScroll, { passive: true });
    return () => container.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.div
      ref={ref}
      className={cn("fixed inset-x-0 top-0 z-50 w-full", className)}
    >
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<{ visible?: boolean }>, { visible })
          : child,
      )}
    </motion.div>
  );
};

export const NavBody = ({ children, className, visible }: NavBodyProps) => {
  return (
    <motion.div
      animate={{
        width: visible ? "65%" : "100%",
        y: visible ? 10 : 0,
        borderRadius: visible ? "8px" : "0px",
        paddingLeft: visible ? "20px" : "24px",
        paddingRight: visible ? "20px" : "24px",
      }}
      transition={{ type: "spring", stiffness: 200, damping: 50 }}
      style={{
        minWidth: "720px",
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: visible ? "var(--border)" : "transparent",
        backgroundColor: visible ? "var(--nav)" : "transparent",
      }}
      className={cn(
        "relative z-[60] mx-auto hidden max-w-6xl flex-row items-center justify-between self-start py-3 lg:flex",
        className,
      )}
    >
      {children}
    </motion.div>
  );
};

export const NavItems = ({ items, className, onItemClick }: NavItemsProps) => {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <motion.div
      onMouseLeave={() => setHovered(null)}
      className={cn(
        "absolute inset-0 hidden flex-1 flex-row items-center justify-center space-x-1 text-sm font-medium lg:flex pointer-events-none",
        className,
      )}
    >
      {items.map((item, idx) => (
        <a
          onMouseEnter={() => setHovered(idx)}
          onClick={onItemClick}
          className="relative px-4 py-2 transition-colors pointer-events-auto"
          style={{ color: "var(--muted)" }}
          key={`link-${idx}`}
          href={item.link}
          onMouseEnterCapture={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--text)"; }}
          onMouseLeaveCapture={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--muted)"; }}
        >
          {hovered === idx && (
            <motion.div
              layoutId="hovered"
              className="absolute inset-0 h-full w-full rounded-lg"
              style={{ background: "var(--surface-2)" }}
            />
          )}
          <span className="relative z-20">{item.name}</span>
        </a>
      ))}
    </motion.div>
  );
};

export const MobileNav = ({ children, className, visible }: MobileNavProps) => {
  return (
    <motion.div
      animate={{
        borderRadius: visible ? "8px" : "0px",
        width: visible ? "calc(100% - 2rem)" : "100%",
        y: visible ? 10 : 0,
      }}
      transition={{ type: "spring", stiffness: 200, damping: 50 }}
      style={{
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: visible ? "var(--border)" : "transparent",
        backgroundColor: visible ? "var(--nav)" : "transparent",
      }}
      className={cn(
        "relative z-50 mx-auto flex w-full flex-col items-center justify-between px-4 py-3 lg:hidden",
        className,
      )}
    >
      {children}
    </motion.div>
  );
};

export const MobileNavHeader = ({ children, className }: MobileNavHeaderProps) => (
  <div className={cn("flex w-full flex-row items-center justify-between", className)}>
    {children}
  </div>
);

export const MobileNavMenu = ({ children, className, isOpen }: MobileNavMenuProps) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className={cn(
          "absolute inset-x-0 top-16 z-50 flex w-full flex-col items-start gap-4 rounded-xl px-6 py-6",
          className,
        )}
        style={{
          background: "var(--nav)",
          border: "1px solid var(--border)",
        }}
      >
        {children}
      </motion.div>
    )}
  </AnimatePresence>
);

export const MobileNavToggle = ({ isOpen, onClick }: { isOpen: boolean; onClick: () => void }) =>
  isOpen
    ? <IconX style={{ color: "var(--text)" }} className="cursor-pointer" onClick={onClick} />
    : <IconMenu2 style={{ color: "var(--text)" }} className="cursor-pointer" onClick={onClick} />;

export const NavbarLogo = () => (
  <a href="/" className="relative z-20 flex items-center gap-2 px-2 py-1" style={{ textDecoration: "none" }}>
    <span style={{ fontWeight: 900, fontSize: 17, color: "var(--text)" }}>DeFAI</span>
    <span style={{ fontWeight: 900, fontSize: 17, color: "var(--accent)" }}>YieldGuard</span>
  </a>
);

export const NavbarButton = ({
  href,
  as: Tag = "a",
  children,
  className,
  variant = "primary",
  ...props
}: {
  href?: string;
  as?: React.ElementType;
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "dark" | "gradient";
} & (React.ComponentPropsWithoutRef<"a"> | React.ComponentPropsWithoutRef<"button">)) => {
  const base = "px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 hover:-translate-y-0.5 inline-flex items-center justify-center gap-2 btn-fill-up";

  const styles: Record<string, React.CSSProperties> = {
    primary:   { background: "var(--surface-2)", color: "var(--text)", border: "1px solid var(--accent)" },
    secondary: { background: "var(--surface-2)", color: "var(--text)", border: "1px solid var(--border)" },
    dark:      { background: "var(--surface-2)", color: "var(--text)", border: "1px solid var(--border)" },
    gradient:  { background: "var(--surface-2)", color: "var(--text)", border: "1px solid var(--accent)" },
  };

  return (
    <Tag
      href={href || undefined}
      className={cn(base, className)}
      style={styles[variant]}
      data-variant={variant}
      {...props}
    >
      {children}
    </Tag>
  );
};
