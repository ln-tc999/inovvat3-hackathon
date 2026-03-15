import { e as createComponent, r as renderTemplate, n as renderSlot, l as renderHead, m as maybeRenderHead, g as addAttribute, h as createAstro } from './astro/server_BSg5bIr_.mjs';
import 'clsx';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro();
const $$MainLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$MainLayout;
  const {
    title = "DeFAI YieldGuard — AI Yield Agent on Base",
    description = "Your AI Agent that earns yield 24/7 while you sleep — anywhere in the world"
  } = Astro2.props;
  return renderTemplate(_a || (_a = __template(['<html lang="en"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="description"', "><title>", `</title><!-- Theme init: runs before paint to avoid flash --><script>
      (function () {
        var saved = localStorage.getItem("theme");
        var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        if (saved === "light") {
          document.documentElement.classList.remove("dark");
        } else if (saved === "dark" || prefersDark) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.add("dark"); // default dark
        }
      })();
    </script><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&display=swap" rel="stylesheet" media="print" onload="this.media='all'">`, '<noscript><link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&display=swap" rel="stylesheet"></noscript><link rel="stylesheet" href="/src/styles/global.css">', '</head> <body class="min-h-screen"> ', " </body></html>"])), addAttribute(description, "content"), title, maybeRenderHead(), renderHead(), renderSlot($$result, $$slots["default"]));
}, "/Users/em/web/vatiin-hackathon/apps/frontend/src/layouts/MainLayout.astro", void 0);

export { $$MainLayout as $ };
