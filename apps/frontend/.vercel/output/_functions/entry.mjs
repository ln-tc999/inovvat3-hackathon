import { renderers } from './renderers.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_BVyBm8Xw.mjs';
import { manifest } from './manifest_3CAwnrVw.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/dashboard/history.astro.mjs');
const _page2 = () => import('./pages/dashboard/portfolio.astro.mjs');
const _page3 = () => import('./pages/dashboard.astro.mjs');
const _page4 = () => import('./pages/onboarding.astro.mjs');
const _page5 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["../../node_modules/.pnpm/astro@5.18.1_@types+node@20.19.37_@vercel+functions@3.4.3_idb-keyval@6.2.2_jiti@1.21.7_rollup_miouksji3rp5ug5nrpa5hngutu/node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/dashboard/history.astro", _page1],
    ["src/pages/dashboard/portfolio.astro", _page2],
    ["src/pages/dashboard/index.astro", _page3],
    ["src/pages/onboarding.astro", _page4],
    ["src/pages/index.astro", _page5]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./noop-entrypoint.mjs'),
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "middlewareSecret": "38cd545d-1f0a-448b-a6e2-69bf32b0a85c",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;
const _start = 'start';
if (Object.prototype.hasOwnProperty.call(serverEntrypointModule, _start)) ;

export { __astrojsSsrVirtualEntry as default, pageMap };
