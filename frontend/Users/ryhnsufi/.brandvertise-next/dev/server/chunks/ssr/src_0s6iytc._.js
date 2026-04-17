module.exports = [
"[project]/src/components/ThemeToggle.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ThemeToggle",
    ()=>ThemeToggle
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-themes/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/components/AnimatePresence/index.mjs [app-ssr] (ecmascript)");
"use client";
;
;
;
;
function ThemeToggle() {
    const { theme, setTheme } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTheme"])();
    const [mounted, setMounted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>setMounted(true), []);
    if (!mounted) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            width: 36,
            height: 36
        }
    }, void 0, false, {
        fileName: "[project]/src/components/ThemeToggle.tsx",
        lineNumber: 12,
        columnNumber: 24
    }, this);
    const isDark = theme === "dark";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].button, {
        "aria-label": "Toggle theme",
        onClick: ()=>setTheme(isDark ? "light" : "dark"),
        whileTap: {
            scale: 0.88
        },
        style: {
            width: 36,
            height: 36,
            borderRadius: 8,
            border: `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)"}`,
            background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
            color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            transition: "background 0.25s ease, border-color 0.25s ease, color 0.25s ease",
            position: "relative",
            overflow: "hidden"
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AnimatePresence"], {
            mode: "wait",
            initial: false,
            children: isDark ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].span, {
                initial: {
                    opacity: 0,
                    rotate: -30,
                    scale: 0.7
                },
                animate: {
                    opacity: 1,
                    rotate: 0,
                    scale: 1
                },
                exit: {
                    opacity: 0,
                    rotate: 30,
                    scale: 0.7
                },
                transition: {
                    duration: 0.22,
                    ease: [
                        0.16,
                        1,
                        0.3,
                        1
                    ]
                },
                style: {
                    display: "flex"
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                    width: "16",
                    height: "16",
                    viewBox: "0 0 24 24",
                    fill: "none",
                    stroke: "currentColor",
                    strokeWidth: "2",
                    strokeLinecap: "round",
                    strokeLinejoin: "round",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                        d: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
                    }, void 0, false, {
                        fileName: "[project]/src/components/ThemeToggle.tsx",
                        lineNumber: 50,
                        columnNumber: 15
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/ThemeToggle.tsx",
                    lineNumber: 49,
                    columnNumber: 13
                }, this)
            }, "moon", false, {
                fileName: "[project]/src/components/ThemeToggle.tsx",
                lineNumber: 40,
                columnNumber: 11
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].span, {
                initial: {
                    opacity: 0,
                    rotate: 30,
                    scale: 0.7
                },
                animate: {
                    opacity: 1,
                    rotate: 0,
                    scale: 1
                },
                exit: {
                    opacity: 0,
                    rotate: -30,
                    scale: 0.7
                },
                transition: {
                    duration: 0.22,
                    ease: [
                        0.16,
                        1,
                        0.3,
                        1
                    ]
                },
                style: {
                    display: "flex"
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                    width: "16",
                    height: "16",
                    viewBox: "0 0 24 24",
                    fill: "none",
                    stroke: "currentColor",
                    strokeWidth: "2",
                    strokeLinecap: "round",
                    strokeLinejoin: "round",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                            cx: "12",
                            cy: "12",
                            r: "5"
                        }, void 0, false, {
                            fileName: "[project]/src/components/ThemeToggle.tsx",
                            lineNumber: 64,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                            x1: "12",
                            y1: "1",
                            x2: "12",
                            y2: "3"
                        }, void 0, false, {
                            fileName: "[project]/src/components/ThemeToggle.tsx",
                            lineNumber: 65,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                            x1: "12",
                            y1: "21",
                            x2: "12",
                            y2: "23"
                        }, void 0, false, {
                            fileName: "[project]/src/components/ThemeToggle.tsx",
                            lineNumber: 66,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                            x1: "4.22",
                            y1: "4.22",
                            x2: "5.64",
                            y2: "5.64"
                        }, void 0, false, {
                            fileName: "[project]/src/components/ThemeToggle.tsx",
                            lineNumber: 67,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                            x1: "18.36",
                            y1: "18.36",
                            x2: "19.78",
                            y2: "19.78"
                        }, void 0, false, {
                            fileName: "[project]/src/components/ThemeToggle.tsx",
                            lineNumber: 68,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                            x1: "1",
                            y1: "12",
                            x2: "3",
                            y2: "12"
                        }, void 0, false, {
                            fileName: "[project]/src/components/ThemeToggle.tsx",
                            lineNumber: 69,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                            x1: "21",
                            y1: "12",
                            x2: "23",
                            y2: "12"
                        }, void 0, false, {
                            fileName: "[project]/src/components/ThemeToggle.tsx",
                            lineNumber: 70,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                            x1: "4.22",
                            y1: "19.78",
                            x2: "5.64",
                            y2: "18.36"
                        }, void 0, false, {
                            fileName: "[project]/src/components/ThemeToggle.tsx",
                            lineNumber: 71,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                            x1: "18.36",
                            y1: "5.64",
                            x2: "19.78",
                            y2: "4.22"
                        }, void 0, false, {
                            fileName: "[project]/src/components/ThemeToggle.tsx",
                            lineNumber: 72,
                            columnNumber: 15
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/ThemeToggle.tsx",
                    lineNumber: 63,
                    columnNumber: 13
                }, this)
            }, "sun", false, {
                fileName: "[project]/src/components/ThemeToggle.tsx",
                lineNumber: 54,
                columnNumber: 11
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/ThemeToggle.tsx",
            lineNumber: 38,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/ThemeToggle.tsx",
        lineNumber: 17,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/components/landing/Navbar.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Navbar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/components/AnimatePresence/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$menu$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Menu$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/menu.js [app-ssr] (ecmascript) <export default as Menu>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-ssr] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ThemeToggle$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ThemeToggle.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
const navLinks = [
    {
        label: "Features",
        href: "#features"
    },
    {
        label: "How It Works",
        href: "#how-it-works"
    },
    {
        label: "Pricing",
        href: "#pricing"
    },
    {
        label: "Testimonials",
        href: "#testimonials"
    },
    {
        label: "FAQ",
        href: "#faq"
    }
];
function Navbar() {
    const [open, setOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [scrolled, setScrolled] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const onScroll = ()=>setScrolled(window.scrollY > 24);
        window.addEventListener("scroll", onScroll, {
            passive: true
        });
        return ()=>window.removeEventListener("scroll", onScroll);
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        document.body.style.overflow = open ? "hidden" : "";
        return ()=>{
            document.body.style.overflow = "";
        };
    }, [
        open
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].header, {
                initial: {
                    y: -16,
                    opacity: 0
                },
                animate: {
                    y: 0,
                    opacity: 1
                },
                transition: {
                    duration: 0.5,
                    ease: [
                        0.16,
                        1,
                        0.3,
                        1
                    ]
                },
                style: {
                    position: "fixed",
                    inset: "0 0 auto 0",
                    zIndex: 50,
                    height: 64,
                    backdropFilter: scrolled ? "blur(20px)" : "blur(0px)",
                    WebkitBackdropFilter: scrolled ? "blur(20px)" : "blur(0px)",
                    background: scrolled ? "rgba(5,5,5,0.9)" : "transparent",
                    borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
                    display: "flex",
                    alignItems: "center",
                    transition: "background 0.4s ease, border-color 0.4s ease, backdrop-filter 0.4s ease"
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                    style: {
                        maxWidth: 1280,
                        margin: "0 auto",
                        padding: "0 24px",
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between"
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                            href: "#",
                            style: {
                                textDecoration: "none",
                                display: "flex",
                                alignItems: "center",
                                gap: 8
                            },
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    fontWeight: 800,
                                    fontSize: 17,
                                    color: "#ffffff",
                                    letterSpacing: "-0.03em"
                                },
                                children: [
                                    "brandvertise",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            color: "rgba(255,255,255,0.4)"
                                        },
                                        children: ".ai"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/landing/Navbar.tsx",
                                        lineNumber: 86,
                                        columnNumber: 8
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/landing/Navbar.tsx",
                                lineNumber: 77,
                                columnNumber: 7
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/landing/Navbar.tsx",
                            lineNumber: 68,
                            columnNumber: 6
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "hidden md:flex",
                            style: {
                                gap: 4,
                                alignItems: "center"
                            },
                            children: navLinks.map((l)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                    href: l.href,
                                    style: {
                                        fontSize: 13.5,
                                        fontWeight: 500,
                                        color: "rgba(255,255,255,0.55)",
                                        textDecoration: "none",
                                        padding: "6px 14px",
                                        borderRadius: 8,
                                        transition: "color 0.2s ease, background 0.2s ease"
                                    },
                                    onMouseEnter: (e)=>{
                                        e.currentTarget.style.color = "#ffffff";
                                        e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                                    },
                                    onMouseLeave: (e)=>{
                                        e.currentTarget.style.color = "rgba(255,255,255,0.55)";
                                        e.currentTarget.style.background = "transparent";
                                    },
                                    children: l.label
                                }, l.href, false, {
                                    fileName: "[project]/src/components/landing/Navbar.tsx",
                                    lineNumber: 96,
                                    columnNumber: 8
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/src/components/landing/Navbar.tsx",
                            lineNumber: 91,
                            columnNumber: 6
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "hidden md:flex",
                            style: {
                                gap: 10,
                                alignItems: "center"
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ThemeToggle$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ThemeToggle"], {}, void 0, false, {
                                    fileName: "[project]/src/components/landing/Navbar.tsx",
                                    lineNumber: 130,
                                    columnNumber: 7
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                    href: "#pricing",
                                    style: {
                                        fontSize: 13.5,
                                        fontWeight: 600,
                                        color: "rgba(255,255,255,0.7)",
                                        textDecoration: "none",
                                        padding: "8px 16px",
                                        borderRadius: 8,
                                        transition: "color 0.2s ease"
                                    },
                                    onMouseEnter: (e)=>{
                                        e.currentTarget.style.color = "#ffffff";
                                    },
                                    onMouseLeave: (e)=>{
                                        e.currentTarget.style.color = "rgba(255,255,255,0.7)";
                                    },
                                    children: "Log in"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/landing/Navbar.tsx",
                                    lineNumber: 131,
                                    columnNumber: 7
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                    href: "#",
                                    style: {
                                        background: "#ffffff",
                                        color: "#000000",
                                        fontWeight: 600,
                                        fontSize: 13.5,
                                        padding: "8px 18px",
                                        borderRadius: 8,
                                        textDecoration: "none",
                                        transition: "opacity 0.2s ease, transform 0.2s ease"
                                    },
                                    onMouseEnter: (e)=>{
                                        e.currentTarget.style.opacity = "0.88";
                                        e.currentTarget.style.transform = "translateY(-1px)";
                                    },
                                    onMouseLeave: (e)=>{
                                        e.currentTarget.style.opacity = "1";
                                        e.currentTarget.style.transform = "translateY(0)";
                                    },
                                    children: "Get Started"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/landing/Navbar.tsx",
                                    lineNumber: 152,
                                    columnNumber: 7
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/landing/Navbar.tsx",
                            lineNumber: 126,
                            columnNumber: 6
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            className: "md:hidden",
                            onClick: ()=>setOpen(true),
                            style: {
                                background: "none",
                                border: "none",
                                color: "#ffffff",
                                cursor: "pointer",
                                padding: 8,
                                display: "flex"
                            },
                            "aria-label": "Open menu",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$menu$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Menu$3e$__["Menu"], {
                                size: 20
                            }, void 0, false, {
                                fileName: "[project]/src/components/landing/Navbar.tsx",
                                lineNumber: 194,
                                columnNumber: 7
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/landing/Navbar.tsx",
                            lineNumber: 181,
                            columnNumber: 6
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/landing/Navbar.tsx",
                    lineNumber: 56,
                    columnNumber: 5
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/landing/Navbar.tsx",
                lineNumber: 35,
                columnNumber: 4
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                children: open && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                    initial: {
                        opacity: 0
                    },
                    animate: {
                        opacity: 1
                    },
                    exit: {
                        opacity: 0
                    },
                    transition: {
                        duration: 0.2
                    },
                    style: {
                        position: "fixed",
                        inset: 0,
                        zIndex: 99,
                        background: "rgba(0,0,0,0.5)",
                        backdropFilter: "blur(4px)"
                    },
                    onClick: ()=>setOpen(false)
                }, void 0, false, {
                    fileName: "[project]/src/components/landing/Navbar.tsx",
                    lineNumber: 202,
                    columnNumber: 6
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/landing/Navbar.tsx",
                lineNumber: 200,
                columnNumber: 4
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                children: open && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                    initial: {
                        x: "100%"
                    },
                    animate: {
                        x: 0
                    },
                    exit: {
                        x: "100%"
                    },
                    transition: {
                        type: "spring",
                        stiffness: 300,
                        damping: 30
                    },
                    style: {
                        position: "fixed",
                        top: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 100,
                        width: "min(340px, 90vw)",
                        background: "#0d0d0d",
                        borderLeft: "1px solid rgba(255,255,255,0.07)",
                        padding: "32px 28px",
                        display: "flex",
                        flexDirection: "column",
                        gap: 8
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: 32
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    style: {
                                        fontWeight: 800,
                                        fontSize: 17,
                                        color: "#ffffff",
                                        letterSpacing: "-0.03em"
                                    },
                                    children: [
                                        "brandvertise",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                color: "rgba(255,255,255,0.4)"
                                            },
                                            children: ".ai"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/landing/Navbar.tsx",
                                            lineNumber: 258,
                                            columnNumber: 9
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/landing/Navbar.tsx",
                                    lineNumber: 249,
                                    columnNumber: 8
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 8
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ThemeToggle$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ThemeToggle"], {}, void 0, false, {
                                            fileName: "[project]/src/components/landing/Navbar.tsx",
                                            lineNumber: 261,
                                            columnNumber: 9
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>setOpen(false),
                                            style: {
                                                background: "none",
                                                border: "none",
                                                color: "rgba(255,255,255,0.5)",
                                                cursor: "pointer",
                                                padding: 4
                                            },
                                            "aria-label": "Close menu",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                                size: 20
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/landing/Navbar.tsx",
                                                lineNumber: 273,
                                                columnNumber: 10
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/landing/Navbar.tsx",
                                            lineNumber: 262,
                                            columnNumber: 9
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/landing/Navbar.tsx",
                                    lineNumber: 260,
                                    columnNumber: 8
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/landing/Navbar.tsx",
                            lineNumber: 241,
                            columnNumber: 7
                        }, this),
                        navLinks.map((l, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].a, {
                                href: l.href,
                                initial: {
                                    opacity: 0,
                                    x: 20
                                },
                                animate: {
                                    opacity: 1,
                                    x: 0
                                },
                                transition: {
                                    delay: 0.05 * i,
                                    ease: [
                                        0.16,
                                        1,
                                        0.3,
                                        1
                                    ]
                                },
                                onClick: ()=>setOpen(false),
                                style: {
                                    fontSize: 16,
                                    fontWeight: 500,
                                    color: "rgba(255,255,255,0.65)",
                                    textDecoration: "none",
                                    padding: "12px 14px",
                                    borderRadius: 8,
                                    transition: "color 0.2s ease, background 0.2s ease"
                                },
                                onMouseEnter: (e)=>{
                                    e.currentTarget.style.color = "#ffffff";
                                    e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                                },
                                onMouseLeave: (e)=>{
                                    e.currentTarget.style.color = "rgba(255,255,255,0.65)";
                                    e.currentTarget.style.background = "transparent";
                                },
                                children: l.label
                            }, l.href, false, {
                                fileName: "[project]/src/components/landing/Navbar.tsx",
                                lineNumber: 279,
                                columnNumber: 8
                            }, this)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                marginTop: "auto",
                                display: "flex",
                                flexDirection: "column",
                                gap: 10
                            },
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                href: "#",
                                onClick: ()=>setOpen(false),
                                style: {
                                    background: "#ffffff",
                                    color: "#000000",
                                    fontWeight: 700,
                                    fontSize: 14,
                                    padding: "12px 20px",
                                    borderRadius: 10,
                                    textDecoration: "none",
                                    textAlign: "center"
                                },
                                children: "Get Started Free"
                            }, void 0, false, {
                                fileName: "[project]/src/components/landing/Navbar.tsx",
                                lineNumber: 319,
                                columnNumber: 8
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/landing/Navbar.tsx",
                            lineNumber: 311,
                            columnNumber: 7
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/landing/Navbar.tsx",
                    lineNumber: 221,
                    columnNumber: 6
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/landing/Navbar.tsx",
                lineNumber: 219,
                columnNumber: 4
            }, this)
        ]
    }, void 0, true);
}
}),
"[project]/src/components/landing/Hero.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Hero
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-ssr] (ecmascript)");
"use client";
;
;
const floatingCards = [
    {
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
            width: "18",
            height: "18",
            fill: "none",
            viewBox: "0 0 24 24",
            stroke: "currentColor",
            strokeWidth: 2,
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                strokeLinecap: "round",
                strokeLinejoin: "round",
                d: "M5 13l4 4L19 7"
            }, void 0, false, {
                fileName: "[project]/src/components/landing/Hero.tsx",
                lineNumber: 16,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0))
        }, void 0, false, {
            fileName: "[project]/src/components/landing/Hero.tsx",
            lineNumber: 8,
            columnNumber: 4
        }, ("TURBOPACK compile-time value", void 0)),
        text: "New user signed up",
        sub: "Just 2 seconds ago",
        delay: 0
    },
    {
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
            width: "18",
            height: "18",
            fill: "none",
            viewBox: "0 0 24 24",
            stroke: "currentColor",
            strokeWidth: 2,
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                strokeLinecap: "round",
                strokeLinejoin: "round",
                d: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
            }, void 0, false, {
                fileName: "[project]/src/components/landing/Hero.tsx",
                lineNumber: 37,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0))
        }, void 0, false, {
            fileName: "[project]/src/components/landing/Hero.tsx",
            lineNumber: 29,
            columnNumber: 4
        }, ("TURBOPACK compile-time value", void 0)),
        text: "Revenue +24% this week",
        sub: "AI-optimised campaigns",
        delay: 0.5
    },
    {
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
            width: "18",
            height: "18",
            fill: "none",
            viewBox: "0 0 24 24",
            stroke: "currentColor",
            strokeWidth: 2,
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                strokeLinecap: "round",
                strokeLinejoin: "round",
                d: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            }, void 0, false, {
                fileName: "[project]/src/components/landing/Hero.tsx",
                lineNumber: 58,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0))
        }, void 0, false, {
            fileName: "[project]/src/components/landing/Hero.tsx",
            lineNumber: 50,
            columnNumber: 4
        }, ("TURBOPACK compile-time value", void 0)),
        text: "10M+ posts generated",
        sub: "Across all platforms",
        delay: 1
    }
];
const EASE = [
    0.16,
    1,
    0.3,
    1
];
const fadeUp = {
    hidden: {
        opacity: 0,
        y: 28
    },
    show: (i)=>({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.1,
                duration: 0.65,
                ease: EASE
            }
        })
};
function Hero() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        style: {
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            position: "relative",
            overflow: "hidden",
            background: "#050505",
            paddingTop: 64
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid-bg",
                style: {
                    position: "absolute",
                    inset: 0,
                    zIndex: 0,
                    opacity: 0.6
                }
            }, void 0, false, {
                fileName: "[project]/src/components/landing/Hero.tsx",
                lineNumber: 100,
                columnNumber: 4
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    position: "absolute",
                    top: "20%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "80vw",
                    height: "80vw",
                    maxWidth: 900,
                    maxHeight: 900,
                    background: "radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 65%)",
                    zIndex: 0,
                    pointerEvents: "none"
                }
            }, void 0, false, {
                fileName: "[project]/src/components/landing/Hero.tsx",
                lineNumber: 111,
                columnNumber: 4
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    position: "relative",
                    zIndex: 2,
                    maxWidth: 1280,
                    margin: "0 auto",
                    padding: "80px 24px",
                    width: "100%",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 80,
                    alignItems: "center"
                },
                className: "hero-grid",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: "flex",
                            flexDirection: "column",
                            gap: 28
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                                custom: 0,
                                initial: "hidden",
                                animate: "show",
                                variants: fadeUp,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    style: {
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 8,
                                        border: "1px solid rgba(255,255,255,0.12)",
                                        borderRadius: 999,
                                        padding: "5px 14px",
                                        fontSize: 12,
                                        fontWeight: 600,
                                        color: "rgba(255,255,255,0.55)",
                                        background: "rgba(255,255,255,0.03)",
                                        letterSpacing: "0.06em",
                                        textTransform: "uppercase"
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                color: "#e8e0d0",
                                                fontSize: 11
                                            },
                                            children: "★★★★★"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/landing/Hero.tsx",
                                            lineNumber: 167,
                                            columnNumber: 8
                                        }, this),
                                        " 4.9/5 from 500+ brands"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/landing/Hero.tsx",
                                    lineNumber: 151,
                                    columnNumber: 7
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/landing/Hero.tsx",
                                lineNumber: 145,
                                columnNumber: 6
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].h1, {
                                custom: 1,
                                initial: "hidden",
                                animate: "show",
                                variants: fadeUp,
                                style: {
                                    fontSize: "clamp(44px, 6.5vw, 84px)",
                                    fontWeight: 800,
                                    lineHeight: 1.04,
                                    letterSpacing: "-0.04em",
                                    color: "#ffffff",
                                    margin: 0
                                },
                                children: [
                                    "Drive results",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                        fileName: "[project]/src/components/landing/Hero.tsx",
                                        lineNumber: 187,
                                        columnNumber: 7
                                    }, this),
                                    "through",
                                    " ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            color: "rgba(255,255,255,0.4)"
                                        },
                                        children: "social media"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/landing/Hero.tsx",
                                        lineNumber: 189,
                                        columnNumber: 7
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                        fileName: "[project]/src/components/landing/Hero.tsx",
                                        lineNumber: 192,
                                        columnNumber: 7
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "mastery."
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/landing/Hero.tsx",
                                        lineNumber: 193,
                                        columnNumber: 7
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/landing/Hero.tsx",
                                lineNumber: 172,
                                columnNumber: 6
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].p, {
                                custom: 2,
                                initial: "hidden",
                                animate: "show",
                                variants: fadeUp,
                                style: {
                                    fontSize: 17,
                                    fontWeight: 400,
                                    lineHeight: 1.72,
                                    color: "rgba(255,255,255,0.5)",
                                    maxWidth: 480,
                                    margin: 0
                                },
                                children: "Brandvertise AI generates scroll-stopping visuals, writes platform-native captions, and auto-publishes across all social platforms — completely on autopilot."
                            }, void 0, false, {
                                fileName: "[project]/src/components/landing/Hero.tsx",
                                lineNumber: 196,
                                columnNumber: 6
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                                custom: 3,
                                initial: "hidden",
                                animate: "show",
                                variants: fadeUp,
                                style: {
                                    display: "flex",
                                    gap: 10,
                                    flexWrap: "wrap"
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                        href: "#pricing",
                                        className: "btn-primary",
                                        children: [
                                            "Start Free Trial",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                width: "14",
                                                height: "14",
                                                fill: "none",
                                                viewBox: "0 0 24 24",
                                                stroke: "currentColor",
                                                strokeWidth: 2.5,
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                    strokeLinecap: "round",
                                                    strokeLinejoin: "round",
                                                    d: "M17 8l4 4m0 0l-4 4m4-4H3"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/landing/Hero.tsx",
                                                    lineNumber: 232,
                                                    columnNumber: 9
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/landing/Hero.tsx",
                                                lineNumber: 224,
                                                columnNumber: 8
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/landing/Hero.tsx",
                                        lineNumber: 222,
                                        columnNumber: 7
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                        href: "#how-it-works",
                                        className: "btn-outline",
                                        children: "See How It Works"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/landing/Hero.tsx",
                                        lineNumber: 239,
                                        columnNumber: 7
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/landing/Hero.tsx",
                                lineNumber: 215,
                                columnNumber: 6
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                                custom: 4,
                                initial: "hidden",
                                animate: "show",
                                variants: fadeUp,
                                style: {
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 16,
                                    paddingTop: 8
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: "flex"
                                        },
                                        children: [
                                            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&q=80",
                                            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&q=80",
                                            "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=60&q=80"
                                        ].map((src, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                src: src,
                                                alt: "",
                                                style: {
                                                    width: 28,
                                                    height: 28,
                                                    borderRadius: "50%",
                                                    border: "2px solid #050505",
                                                    objectFit: "cover",
                                                    marginLeft: i === 0 ? 0 : -10
                                                }
                                            }, i, false, {
                                                fileName: "[project]/src/components/landing/Hero.tsx",
                                                lineNumber: 263,
                                                columnNumber: 9
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/landing/Hero.tsx",
                                        lineNumber: 257,
                                        columnNumber: 7
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            fontSize: 13,
                                            color: "rgba(255,255,255,0.4)"
                                        },
                                        children: [
                                            "Joined by",
                                            " ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                style: {
                                                    color: "rgba(255,255,255,0.7)",
                                                    fontWeight: 600
                                                },
                                                children: "2,000+"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/landing/Hero.tsx",
                                                lineNumber: 285,
                                                columnNumber: 8
                                            }, this),
                                            " ",
                                            "brands this month"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/landing/Hero.tsx",
                                        lineNumber: 278,
                                        columnNumber: 7
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/landing/Hero.tsx",
                                lineNumber: 245,
                                columnNumber: 6
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/landing/Hero.tsx",
                        lineNumber: 143,
                        columnNumber: 5
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "hero-cards-col",
                        style: {
                            display: "flex",
                            flexDirection: "column",
                            gap: 14
                        },
                        children: [
                            floatingCards.map((card, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                                    initial: {
                                        opacity: 0,
                                        x: 30
                                    },
                                    animate: {
                                        opacity: 1,
                                        x: 0
                                    },
                                    transition: {
                                        delay: 0.6 + card.delay,
                                        duration: 0.65,
                                        ease: EASE
                                    },
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                                        animate: {
                                            y: [
                                                0,
                                                -8,
                                                0
                                            ]
                                        },
                                        transition: {
                                            delay: i * 0.3,
                                            duration: 4 + i,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        },
                                        style: {
                                            background: "rgba(255,255,255,0.04)",
                                            backdropFilter: "blur(16px)",
                                            WebkitBackdropFilter: "blur(16px)",
                                            border: "1px solid rgba(255,255,255,0.09)",
                                            borderRadius: 16,
                                            padding: "18px 22px",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 14
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    width: 40,
                                                    height: 40,
                                                    borderRadius: 10,
                                                    background: "rgba(255,255,255,0.07)",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    color: "rgba(255,255,255,0.7)",
                                                    flexShrink: 0
                                                },
                                                children: card.icon
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/landing/Hero.tsx",
                                                lineNumber: 334,
                                                columnNumber: 9
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        style: {
                                                            margin: 0,
                                                            fontSize: 14,
                                                            fontWeight: 600,
                                                            color: "#ffffff"
                                                        },
                                                        children: card.text
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/landing/Hero.tsx",
                                                        lineNumber: 350,
                                                        columnNumber: 10
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        style: {
                                                            margin: 0,
                                                            fontSize: 12,
                                                            color: "rgba(255,255,255,0.4)",
                                                            marginTop: 2
                                                        },
                                                        children: card.sub
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/landing/Hero.tsx",
                                                        lineNumber: 360,
                                                        columnNumber: 10
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/landing/Hero.tsx",
                                                lineNumber: 349,
                                                columnNumber: 9
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/landing/Hero.tsx",
                                        lineNumber: 314,
                                        columnNumber: 8
                                    }, this)
                                }, i, false, {
                                    fileName: "[project]/src/components/landing/Hero.tsx",
                                    lineNumber: 304,
                                    columnNumber: 7
                                }, this)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                                initial: {
                                    opacity: 0,
                                    x: 30
                                },
                                animate: {
                                    opacity: 1,
                                    x: 0
                                },
                                transition: {
                                    delay: 1.4,
                                    duration: 0.65,
                                    ease: EASE
                                },
                                style: {
                                    background: "rgba(255,255,255,0.03)",
                                    border: "1px solid rgba(255,255,255,0.07)",
                                    borderRadius: 16,
                                    padding: "20px 22px",
                                    marginTop: 4
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        style: {
                                            margin: "0 0 12px",
                                            fontSize: 11,
                                            fontWeight: 600,
                                            letterSpacing: "0.08em",
                                            textTransform: "uppercase",
                                            color: "rgba(255,255,255,0.3)"
                                        },
                                        children: "Content Performance"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/landing/Hero.tsx",
                                        lineNumber: 392,
                                        columnNumber: 7
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                        width: "100%",
                                        height: "60",
                                        viewBox: "0 0 300 60",
                                        fill: "none",
                                        xmlns: "http://www.w3.org/2000/svg",
                                        children: [
                                            22,
                                            38,
                                            28,
                                            50,
                                            42,
                                            65,
                                            58,
                                            72,
                                            80,
                                            70
                                        ].map((h, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                                                x: i * 30 + 2,
                                                y: 60 - h,
                                                width: 24,
                                                height: h,
                                                rx: 4,
                                                fill: i === 9 ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.1)"
                                            }, i, false, {
                                                fileName: "[project]/src/components/landing/Hero.tsx",
                                                lineNumber: 412,
                                                columnNumber: 9
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/landing/Hero.tsx",
                                        lineNumber: 404,
                                        columnNumber: 7
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: "flex",
                                            justifyContent: "space-between",
                                            marginTop: 12,
                                            alignItems: "flex-end"
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontSize: 28,
                                                    fontWeight: 800,
                                                    color: "#ffffff",
                                                    letterSpacing: "-0.04em"
                                                },
                                                children: "+80%"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/landing/Hero.tsx",
                                                lineNumber: 435,
                                                columnNumber: 8
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontSize: 12,
                                                    color: "rgba(255,255,255,0.35)"
                                                },
                                                children: "engagement lift"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/landing/Hero.tsx",
                                                lineNumber: 445,
                                                columnNumber: 8
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/landing/Hero.tsx",
                                        lineNumber: 427,
                                        columnNumber: 7
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/landing/Hero.tsx",
                                lineNumber: 376,
                                columnNumber: 6
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/landing/Hero.tsx",
                        lineNumber: 299,
                        columnNumber: 5
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/landing/Hero.tsx",
                lineNumber: 128,
                columnNumber: 4
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("style", {
                children: `
        @media (max-width: 767px) {
          .hero-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .hero-cards-col { display: none !important; }
        }
      `
            }, void 0, false, {
                fileName: "[project]/src/components/landing/Hero.tsx",
                lineNumber: 458,
                columnNumber: 4
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/landing/Hero.tsx",
        lineNumber: 88,
        columnNumber: 3
    }, this);
}
}),
"[project]/src/components/landing/MarqueeBrands.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>MarqueeBrands
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
"use client";
;
const brands = [
    "Notion",
    "Linear",
    "Stripe",
    "Vercel",
    "Figma",
    "Loom",
    "Raycast",
    "Resend",
    "Clerk",
    "Neon",
    "Turso",
    "PlanetScale"
];
const doubled = [
    ...brands,
    ...brands
];
function MarqueeBrands() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            padding: "36px 0",
            background: "#050505",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
            overflow: "hidden"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                style: {
                    textAlign: "center",
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.22)",
                    marginBottom: 22
                },
                children: "Trusted by fast-growing brands worldwide"
            }, void 0, false, {
                fileName: "[project]/src/components/landing/MarqueeBrands.tsx",
                lineNumber: 16,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    position: "relative",
                    display: "flex",
                    overflow: "hidden",
                    maskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
                    WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)"
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "animate-marquee",
                    style: {
                        display: "flex",
                        gap: 60,
                        alignItems: "center",
                        whiteSpace: "nowrap",
                        width: "max-content"
                    },
                    children: doubled.map((b, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            style: {
                                fontSize: 14,
                                fontWeight: 700,
                                letterSpacing: "-0.01em",
                                color: "rgba(255,255,255,0.18)",
                                userSelect: "none"
                            },
                            children: b
                        }, i, false, {
                            fileName: "[project]/src/components/landing/MarqueeBrands.tsx",
                            lineNumber: 43,
                            columnNumber: 13
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/src/components/landing/MarqueeBrands.tsx",
                    lineNumber: 38,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/landing/MarqueeBrands.tsx",
                lineNumber: 29,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/landing/MarqueeBrands.tsx",
        lineNumber: 8,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/lib/motion.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Shared Framer Motion helpers
__turbopack_context__.s([
    "EASE",
    ()=>EASE,
    "EASE_IN",
    ()=>EASE_IN,
    "fadeUpVariants",
    ()=>fadeUpVariants,
    "scaleInVariants",
    ()=>scaleInVariants,
    "staggerContainer",
    ()=>staggerContainer
]);
const EASE = [
    0.16,
    1,
    0.3,
    1
];
const EASE_IN = [
    0.4,
    0,
    1,
    1
];
const fadeUpVariants = {
    hidden: {
        opacity: 0,
        y: 28
    },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.65,
            ease: EASE
        }
    }
};
const staggerContainer = {
    hidden: {},
    show: {
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1
        }
    }
};
const scaleInVariants = {
    hidden: {
        opacity: 0,
        scale: 0.94
    },
    show: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.5,
            ease: EASE
        }
    }
};
}),
"[project]/src/components/landing/Stats.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Stats
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$utils$2f$use$2d$in$2d$view$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/utils/use-in-view.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$motion$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/motion.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
const stats = [
    {
        value: "2,400+",
        label: "Active Brands",
        sub: "Growing every week"
    },
    {
        value: "10M+",
        label: "Posts Generated",
        sub: "Across all platforms"
    },
    {
        value: "+47%",
        label: "Avg. Engagement Lift",
        sub: "Within first 90 days"
    },
    {
        value: "12 hrs",
        label: "Saved Per Week",
        sub: "Per brand, on average"
    }
];
function Stats() {
    const ref = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const isInView = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$utils$2f$use$2d$in$2d$view$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useInView"])(ref, {
        once: true,
        margin: "-80px"
    });
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        ref: ref,
        id: "stats",
        style: {
            padding: "72px 0",
            background: "#050505",
            borderTop: "1px solid rgba(255,255,255,0.05)",
            borderBottom: "1px solid rgba(255,255,255,0.05)"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    maxWidth: 1280,
                    margin: "0 auto",
                    padding: "0 24px"
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                    initial: "hidden",
                    animate: isInView ? "show" : "hidden",
                    variants: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$motion$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["staggerContainer"],
                    className: "stats-grid",
                    style: {
                        display: "grid",
                        gridTemplateColumns: "repeat(4, 1fr)",
                        gap: 0
                    },
                    children: stats.map((s, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                            variants: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$motion$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fadeUpVariants"],
                            style: {
                                textAlign: "center",
                                padding: "32px 20px",
                                borderRight: i < stats.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none"
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    style: {
                                        fontSize: "clamp(32px, 3.5vw, 52px)",
                                        fontWeight: 800,
                                        color: "#ffffff",
                                        letterSpacing: "-0.04em",
                                        lineHeight: 1,
                                        marginBottom: 8
                                    },
                                    children: s.value
                                }, void 0, false, {
                                    fileName: "[project]/src/components/landing/Stats.tsx",
                                    lineNumber: 47,
                                    columnNumber: 8
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    style: {
                                        fontSize: 14,
                                        fontWeight: 600,
                                        color: "rgba(255,255,255,0.65)",
                                        marginBottom: 4
                                    },
                                    children: s.label
                                }, void 0, false, {
                                    fileName: "[project]/src/components/landing/Stats.tsx",
                                    lineNumber: 59,
                                    columnNumber: 8
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    style: {
                                        fontSize: 12,
                                        color: "rgba(255,255,255,0.3)"
                                    },
                                    children: s.sub
                                }, void 0, false, {
                                    fileName: "[project]/src/components/landing/Stats.tsx",
                                    lineNumber: 62,
                                    columnNumber: 8
                                }, this)
                            ]
                        }, s.label, true, {
                            fileName: "[project]/src/components/landing/Stats.tsx",
                            lineNumber: 38,
                            columnNumber: 7
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/src/components/landing/Stats.tsx",
                    lineNumber: 30,
                    columnNumber: 5
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/landing/Stats.tsx",
                lineNumber: 29,
                columnNumber: 4
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("style", {
                children: `
        @media (max-width: 767px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .stats-grid > div { border-right: none !important; border-bottom: 1px solid rgba(255,255,255,0.05) !important; }
        }
      `
            }, void 0, false, {
                fileName: "[project]/src/components/landing/Stats.tsx",
                lineNumber: 67,
                columnNumber: 4
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/landing/Stats.tsx",
        lineNumber: 19,
        columnNumber: 3
    }, this);
}
}),
"[project]/src/components/landing/Features.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Features
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$utils$2f$use$2d$in$2d$view$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/utils/use-in-view.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$motion$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/motion.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
const BrainIcon = ()=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        width: "20",
        height: "20",
        fill: "none",
        viewBox: "0 0 24 24",
        stroke: "currentColor",
        strokeWidth: 1.5,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            d: "M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611l-1.594.267a9 9 0 01-2.985.018l-.214-.027"
        }, void 0, false, {
            fileName: "[project]/src/components/landing/Features.tsx",
            lineNumber: 9,
            columnNumber: 5
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/src/components/landing/Features.tsx",
        lineNumber: 8,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
const ZapIcon = ()=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        width: "20",
        height: "20",
        fill: "none",
        viewBox: "0 0 24 24",
        stroke: "currentColor",
        strokeWidth: 1.5,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            d: "M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
        }, void 0, false, {
            fileName: "[project]/src/components/landing/Features.tsx",
            lineNumber: 15,
            columnNumber: 5
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/src/components/landing/Features.tsx",
        lineNumber: 14,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
const GlobeIcon = ()=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        width: "20",
        height: "20",
        fill: "none",
        viewBox: "0 0 24 24",
        stroke: "currentColor",
        strokeWidth: 1.5,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            d: "M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
        }, void 0, false, {
            fileName: "[project]/src/components/landing/Features.tsx",
            lineNumber: 21,
            columnNumber: 5
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/src/components/landing/Features.tsx",
        lineNumber: 20,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
const platforms = [
    "Instagram",
    "LinkedIn",
    "Twitter/X",
    "Facebook",
    "Pinterest",
    "TikTok",
    "YouTube",
    "Instagram",
    "LinkedIn",
    "Twitter/X"
];
function Features() {
    const ref = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const isInView = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$utils$2f$use$2d$in$2d$view$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useInView"])(ref, {
        once: true,
        margin: "-80px"
    });
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        ref: ref,
        id: "features",
        style: {
            padding: "120px 0",
            background: "#050505"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    maxWidth: 1280,
                    margin: "0 auto",
                    padding: "0 24px"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                        initial: "hidden",
                        animate: isInView ? "show" : "hidden",
                        variants: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$motion$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["staggerContainer"],
                        style: {
                            marginBottom: 64
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].span, {
                                variants: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$motion$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fadeUpVariants"],
                                className: "section-tag",
                                children: "Why Brandvertise?"
                            }, void 0, false, {
                                fileName: "[project]/src/components/landing/Features.tsx",
                                lineNumber: 45,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].h2, {
                                variants: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$motion$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fadeUpVariants"],
                                style: {
                                    fontSize: "clamp(32px, 4.5vw, 56px)",
                                    fontWeight: 800,
                                    lineHeight: 1.08,
                                    color: "#ffffff",
                                    letterSpacing: "-0.04em",
                                    maxWidth: 600,
                                    margin: 0
                                },
                                children: "Why the fastest growing teams choose us."
                            }, void 0, false, {
                                fileName: "[project]/src/components/landing/Features.tsx",
                                lineNumber: 48,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/landing/Features.tsx",
                        lineNumber: 39,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                        initial: "hidden",
                        animate: isInView ? "show" : "hidden",
                        variants: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$motion$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["staggerContainer"],
                        className: "bento-outer",
                        style: {
                            display: "grid",
                            gridTemplateColumns: "1fr 300px",
                            gap: 14
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: "grid",
                                    gridTemplateColumns: "1.4fr 1fr",
                                    gridTemplateRows: "auto auto",
                                    gap: 14
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                                        variants: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$motion$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fadeUpVariants"],
                                        whileHover: {
                                            y: -6,
                                            borderColor: "rgba(255,255,255,0.16)"
                                        },
                                        transition: {
                                            duration: 0.3,
                                            ease: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$motion$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["EASE"]
                                        },
                                        style: {
                                            gridRow: "span 2",
                                            background: "#0d0d0d",
                                            border: "1px solid rgba(255,255,255,0.07)",
                                            borderRadius: 20,
                                            padding: 32,
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: 20,
                                            position: "relative",
                                            overflow: "hidden"
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    width: 44,
                                                    height: 44,
                                                    borderRadius: 12,
                                                    background: "rgba(255,255,255,0.07)",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    color: "rgba(255,255,255,0.7)"
                                                },
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(BrainIcon, {}, void 0, false, {
                                                    fileName: "[project]/src/components/landing/Features.tsx",
                                                    lineNumber: 111,
                                                    columnNumber: 17
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/landing/Features.tsx",
                                                lineNumber: 99,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                        style: {
                                                            fontSize: 20,
                                                            fontWeight: 700,
                                                            color: "#ffffff",
                                                            marginBottom: 10,
                                                            letterSpacing: "-0.02em"
                                                        },
                                                        children: "Brand Intelligence"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/landing/Features.tsx",
                                                        lineNumber: 114,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        style: {
                                                            fontSize: 14,
                                                            color: "rgba(255,255,255,0.5)",
                                                            lineHeight: 1.75
                                                        },
                                                        children: "Upload your brand kit once. AI learns your voice, colors and messaging — used in every piece of content forever."
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/landing/Features.tsx",
                                                        lineNumber: 117,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/landing/Features.tsx",
                                                lineNumber: 113,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    marginTop: "auto"
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        style: {
                                                            fontSize: 11,
                                                            color: "rgba(255,255,255,0.3)",
                                                            marginBottom: 12,
                                                            textTransform: "uppercase",
                                                            letterSpacing: "0.08em"
                                                        },
                                                        children: "Content Performance"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/landing/Features.tsx",
                                                        lineNumber: 122,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                        width: "100%",
                                                        height: "72",
                                                        viewBox: "0 0 240 72",
                                                        fill: "none",
                                                        xmlns: "http://www.w3.org/2000/svg",
                                                        children: [
                                                            18,
                                                            36,
                                                            26,
                                                            54,
                                                            46,
                                                            68,
                                                            60,
                                                            72
                                                        ].map((h, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                                                                x: i * 30 + 2,
                                                                y: 72 - h,
                                                                width: 22,
                                                                height: h,
                                                                rx: 4,
                                                                fill: i === 7 ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.1)"
                                                            }, i, false, {
                                                                fileName: "[project]/src/components/landing/Features.tsx",
                                                                lineNumber: 125,
                                                                columnNumber: 21
                                                            }, this))
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/landing/Features.tsx",
                                                        lineNumber: 123,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            display: "flex",
                                                            justifyContent: "space-between",
                                                            marginTop: 10
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                style: {
                                                                    fontSize: 28,
                                                                    fontWeight: 800,
                                                                    color: "#ffffff",
                                                                    letterSpacing: "-0.04em"
                                                                },
                                                                children: "+80%"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/landing/Features.tsx",
                                                                lineNumber: 130,
                                                                columnNumber: 19
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                style: {
                                                                    fontSize: 12,
                                                                    color: "rgba(255,255,255,0.35)",
                                                                    alignSelf: "flex-end",
                                                                    marginBottom: 3
                                                                },
                                                                children: "engagement lift"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/landing/Features.tsx",
                                                                lineNumber: 131,
                                                                columnNumber: 19
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/landing/Features.tsx",
                                                        lineNumber: 129,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/landing/Features.tsx",
                                                lineNumber: 121,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/landing/Features.tsx",
                                        lineNumber: 82,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                                        variants: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$motion$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fadeUpVariants"],
                                        whileHover: {
                                            y: -6,
                                            borderColor: "rgba(255,255,255,0.16)"
                                        },
                                        transition: {
                                            duration: 0.3,
                                            ease: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$motion$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["EASE"]
                                        },
                                        style: {
                                            background: "#0d0d0d",
                                            border: "1px solid rgba(255,255,255,0.07)",
                                            borderRadius: 20,
                                            padding: 28,
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: 14
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    width: 44,
                                                    height: 44,
                                                    borderRadius: 12,
                                                    background: "rgba(255,255,255,0.07)",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    color: "rgba(255,255,255,0.7)"
                                                },
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ZapIcon, {}, void 0, false, {
                                                    fileName: "[project]/src/components/landing/Features.tsx",
                                                    lineNumber: 163,
                                                    columnNumber: 17
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/landing/Features.tsx",
                                                lineNumber: 151,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                style: {
                                                    fontSize: 18,
                                                    fontWeight: 700,
                                                    color: "#ffffff",
                                                    letterSpacing: "-0.02em"
                                                },
                                                children: "AI Creative Generation"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/landing/Features.tsx",
                                                lineNumber: 165,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                style: {
                                                    fontSize: 13,
                                                    color: "rgba(255,255,255,0.5)",
                                                    lineHeight: 1.65
                                                },
                                                children: "Generate polished visuals and captions in seconds."
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/landing/Features.tsx",
                                                lineNumber: 166,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    display: "flex",
                                                    gap: 6,
                                                    flexWrap: "wrap",
                                                    marginTop: "auto"
                                                },
                                                children: [
                                                    "10x faster",
                                                    "99.9% uptime",
                                                    "2x ROI"
                                                ].map((pill)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            border: "1px solid rgba(255,255,255,0.12)",
                                                            borderRadius: 999,
                                                            padding: "3px 11px",
                                                            fontSize: 11,
                                                            fontWeight: 600,
                                                            color: "rgba(255,255,255,0.6)"
                                                        },
                                                        children: pill
                                                    }, pill, false, {
                                                        fileName: "[project]/src/components/landing/Features.tsx",
                                                        lineNumber: 171,
                                                        columnNumber: 19
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/landing/Features.tsx",
                                                lineNumber: 169,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/landing/Features.tsx",
                                        lineNumber: 137,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                                        variants: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$motion$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fadeUpVariants"],
                                        whileHover: {
                                            y: -6,
                                            borderColor: "rgba(255,255,255,0.16)"
                                        },
                                        transition: {
                                            duration: 0.3,
                                            ease: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$motion$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["EASE"]
                                        },
                                        style: {
                                            background: "#0d0d0d",
                                            border: "1px solid rgba(255,255,255,0.07)",
                                            borderRadius: 20,
                                            padding: 28,
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: 14,
                                            overflow: "hidden"
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    width: 44,
                                                    height: 44,
                                                    borderRadius: 12,
                                                    background: "rgba(255,255,255,0.07)",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    color: "rgba(255,255,255,0.7)"
                                                },
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(GlobeIcon, {}, void 0, false, {
                                                    fileName: "[project]/src/components/landing/Features.tsx",
                                                    lineNumber: 216,
                                                    columnNumber: 17
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/landing/Features.tsx",
                                                lineNumber: 204,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                style: {
                                                    fontSize: 18,
                                                    fontWeight: 700,
                                                    color: "#ffffff",
                                                    letterSpacing: "-0.02em"
                                                },
                                                children: "Multi-Platform Publish"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/landing/Features.tsx",
                                                lineNumber: 218,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                style: {
                                                    fontSize: 13,
                                                    color: "rgba(255,255,255,0.5)",
                                                    lineHeight: 1.65
                                                },
                                                children: "Instagram, LinkedIn, Twitter/X, Facebook, Pinterest — one hub."
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/landing/Features.tsx",
                                                lineNumber: 219,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    overflow: "hidden",
                                                    maskImage: "linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)"
                                                },
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "animate-marquee-logos",
                                                    style: {
                                                        display: "flex",
                                                        gap: 10,
                                                        width: "max-content"
                                                    },
                                                    children: [
                                                        ...platforms,
                                                        ...platforms
                                                    ].map((item, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            style: {
                                                                whiteSpace: "nowrap",
                                                                fontSize: 12,
                                                                fontWeight: 500,
                                                                color: "rgba(255,255,255,0.45)",
                                                                border: "1px solid rgba(255,255,255,0.09)",
                                                                borderRadius: 999,
                                                                padding: "3px 11px"
                                                            },
                                                            children: item
                                                        }, i, false, {
                                                            fileName: "[project]/src/components/landing/Features.tsx",
                                                            lineNumber: 225,
                                                            columnNumber: 21
                                                        }, this))
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/landing/Features.tsx",
                                                    lineNumber: 223,
                                                    columnNumber: 17
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/landing/Features.tsx",
                                                lineNumber: 222,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/landing/Features.tsx",
                                        lineNumber: 189,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/landing/Features.tsx",
                                lineNumber: 73,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                                variants: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$motion$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fadeUpVariants"],
                                whileHover: {
                                    y: -4
                                },
                                transition: {
                                    duration: 0.3,
                                    ease: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$motion$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["EASE"]
                                },
                                className: "bento-side",
                                style: {
                                    background: "#0d0d0d",
                                    border: "1px solid rgba(255,255,255,0.07)",
                                    borderRadius: 20,
                                    overflow: "hidden",
                                    display: "flex",
                                    flexDirection: "column"
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                        src: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&q=80",
                                        alt: "Expert team",
                                        style: {
                                            width: "100%",
                                            height: 220,
                                            objectFit: "cover"
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/landing/Features.tsx",
                                        lineNumber: 260,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            padding: "28px"
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                style: {
                                                    fontSize: 20,
                                                    fontWeight: 700,
                                                    color: "#ffffff",
                                                    marginBottom: 10,
                                                    letterSpacing: "-0.02em"
                                                },
                                                children: "Scale with our expert team"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/landing/Features.tsx",
                                                lineNumber: 266,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                style: {
                                                    fontSize: 13,
                                                    color: "rgba(255,255,255,0.5)",
                                                    lineHeight: 1.7,
                                                    marginBottom: 20
                                                },
                                                children: "World-class AI engineers and brand strategists behind every feature."
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/landing/Features.tsx",
                                                lineNumber: 269,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                href: "#pricing",
                                                className: "btn-primary",
                                                style: {
                                                    fontSize: 13,
                                                    padding: "10px 20px"
                                                },
                                                children: "Get Started"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/landing/Features.tsx",
                                                lineNumber: 272,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/landing/Features.tsx",
                                        lineNumber: 265,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/landing/Features.tsx",
                                lineNumber: 246,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/landing/Features.tsx",
                        lineNumber: 65,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/landing/Features.tsx",
                lineNumber: 37,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("style", {
                children: `
        @media (max-width: 1023px) {
          .bento-outer { grid-template-columns: 1fr !important; }
          .bento-side { display: none !important; }
        }
        @media (max-width: 639px) {
          .bento-outer > div:first-child { grid-template-columns: 1fr !important; }
        }
      `
            }, void 0, false, {
                fileName: "[project]/src/components/landing/Features.tsx",
                lineNumber: 280,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/landing/Features.tsx",
        lineNumber: 32,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/components/landing/About.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>About
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
;
function About() {
    const ref = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const observer = new IntersectionObserver((entries)=>entries.forEach((e)=>{
                if (e.isIntersecting) e.target.classList.add("visible");
            }), {
            threshold: 0.1
        });
        ref.current?.querySelectorAll(".fade-up").forEach((el)=>observer.observe(el));
        return ()=>observer.disconnect();
    }, []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        ref: ref,
        id: "about",
        style: {
            padding: "120px 0",
            background: "#080808"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    maxWidth: 1280,
                    margin: "0 auto",
                    padding: "0 24px"
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "fade-up about-grid",
                    style: {
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 80,
                        alignItems: "center"
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                position: "relative"
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                    src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80",
                                    alt: "Our mission",
                                    style: {
                                        width: "100%",
                                        height: 480,
                                        objectFit: "cover",
                                        borderRadius: 20,
                                        border: "1px solid rgba(255,255,255,0.08)",
                                        filter: "brightness(0.9) sepia(0.1)"
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/src/components/landing/About.tsx",
                                    lineNumber: 29,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        position: "absolute",
                                        inset: 0,
                                        borderRadius: 20,
                                        background: "rgba(245,210,150,0.06)",
                                        pointerEvents: "none"
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/src/components/landing/About.tsx",
                                    lineNumber: 42,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/landing/About.tsx",
                            lineNumber: 28,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: "flex",
                                flexDirection: "column",
                                gap: 24
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "section-tag",
                                    children: "About Us"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/landing/About.tsx",
                                    lineNumber: 55,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    style: {
                                        fontSize: "clamp(28px, 4vw, 44px)",
                                        fontWeight: 700,
                                        color: "#ffffff",
                                        letterSpacing: "-0.03em",
                                        lineHeight: 1.15,
                                        margin: 0
                                    },
                                    children: "We're building the future of brand marketing."
                                }, void 0, false, {
                                    fileName: "[project]/src/components/landing/About.tsx",
                                    lineNumber: 56,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    style: {
                                        fontSize: 17,
                                        color: "rgba(255,255,255,0.55)",
                                        lineHeight: 1.75,
                                        margin: 0
                                    },
                                    children: "Brandvertise was founded with a single mission: make world-class brand marketing accessible to every business, not just the ones with agency budgets. We combine generative AI with deep brand intelligence to create content that actually converts."
                                }, void 0, false, {
                                    fileName: "[project]/src/components/landing/About.tsx",
                                    lineNumber: 68,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    style: {
                                        fontSize: 17,
                                        color: "rgba(255,255,255,0.55)",
                                        lineHeight: 1.75,
                                        margin: 0
                                    },
                                    children: "Our team of former engineers from Google, Razorpay, and Ogilvy built a platform that doesn't just automate — it thinks, adapts, and grows with your brand."
                                }, void 0, false, {
                                    fileName: "[project]/src/components/landing/About.tsx",
                                    lineNumber: 78,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        display: "flex",
                                        gap: 12,
                                        flexWrap: "wrap",
                                        marginTop: 8
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                            href: "#features",
                                            className: "btn-primary",
                                            children: "See Our Features"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/landing/About.tsx",
                                            lineNumber: 89,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                            href: "#team",
                                            className: "btn-outline",
                                            children: "Meet the Team"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/landing/About.tsx",
                                            lineNumber: 90,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/landing/About.tsx",
                                    lineNumber: 88,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/landing/About.tsx",
                            lineNumber: 54,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/landing/About.tsx",
                    lineNumber: 23,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/landing/About.tsx",
                lineNumber: 22,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("style", {
                children: `
        @media (max-width: 767px) {
          .about-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
        }
      `
            }, void 0, false, {
                fileName: "[project]/src/components/landing/About.tsx",
                lineNumber: 96,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/landing/About.tsx",
        lineNumber: 17,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/components/landing/HowItWorks.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>HowItWorks
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$utils$2f$use$2d$in$2d$view$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/utils/use-in-view.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$motion$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/motion.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
const steps = [
    {
        num: "01",
        title: "Onboard Your Brand",
        desc: "Upload logo, colors, fonts, tone and target audience. Takes 5 minutes. Works forever.",
        tags: [
            "Fast Setup",
            "No-Code"
        ],
        img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80"
    },
    {
        num: "02",
        title: "AI Builds Your Strategy",
        desc: "Content Strategy Engine analyses your brand, industry and competitors — full monthly plan generated automatically.",
        tags: [
            "AI-Powered",
            "Auto Strategy"
        ],
        img: "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=600&q=80"
    },
    {
        num: "03",
        title: "Creatives Are Generated",
        desc: "AI designs on-brand visuals and writes captions, hashtags, CTAs for each platform.",
        tags: [
            "Instant Output",
            "On-Brand"
        ],
        img: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&q=80"
    },
    {
        num: "04",
        title: "Review & Auto-Schedule",
        desc: "Approve in one click or go full autopilot. Posts publish at peak engagement times.",
        tags: [
            "Auto-Publish",
            "Full Autopilot"
        ],
        img: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&q=80"
    }
];
function HowItWorks() {
    const ref = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const isInView = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$utils$2f$use$2d$in$2d$view$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useInView"])(ref, {
        once: true,
        margin: "-80px"
    });
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        ref: ref,
        id: "how-it-works",
        style: {
            padding: "120px 0",
            background: "#050505"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    maxWidth: 1280,
                    margin: "0 auto",
                    padding: "0 24px"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                        initial: "hidden",
                        animate: isInView ? "show" : "hidden",
                        variants: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$motion$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["staggerContainer"],
                        style: {
                            marginBottom: 72
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].span, {
                                variants: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$motion$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fadeUpVariants"],
                                className: "section-tag",
                                children: "Our Process"
                            }, void 0, false, {
                                fileName: "[project]/src/components/landing/HowItWorks.tsx",
                                lineNumber: 55,
                                columnNumber: 6
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].h2, {
                                variants: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$motion$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fadeUpVariants"],
                                style: {
                                    fontSize: "clamp(32px, 4.5vw, 56px)",
                                    fontWeight: 800,
                                    lineHeight: 1.08,
                                    color: "#ffffff",
                                    letterSpacing: "-0.04em",
                                    maxWidth: 560,
                                    margin: 0
                                },
                                children: "From onboarding to full growth."
                            }, void 0, false, {
                                fileName: "[project]/src/components/landing/HowItWorks.tsx",
                                lineNumber: 58,
                                columnNumber: 6
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/landing/HowItWorks.tsx",
                        lineNumber: 49,
                        columnNumber: 5
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: "flex",
                            flexDirection: "column"
                        },
                        children: steps.map((step, i)=>{
                            const isEven = i % 2 === 0;
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                                        initial: {
                                            opacity: 0,
                                            y: 40
                                        },
                                        whileInView: {
                                            opacity: 1,
                                            y: 0
                                        },
                                        viewport: {
                                            once: true,
                                            margin: "-60px"
                                        },
                                        transition: {
                                            duration: 0.65,
                                            ease: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$motion$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["EASE"]
                                        },
                                        className: "process-row",
                                        style: {
                                            display: "grid",
                                            gridTemplateColumns: "1fr 1fr",
                                            gap: 72,
                                            alignItems: "center",
                                            padding: "60px 0"
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    order: isEven ? 0 : 1
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        style: {
                                                            fontSize: 80,
                                                            fontWeight: 800,
                                                            color: "#ffffff",
                                                            opacity: 0.05,
                                                            lineHeight: 1,
                                                            margin: "0 0 4px",
                                                            letterSpacing: "-0.06em"
                                                        },
                                                        children: step.num
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/landing/HowItWorks.tsx",
                                                        lineNumber: 95,
                                                        columnNumber: 11
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                        style: {
                                                            fontSize: 26,
                                                            fontWeight: 700,
                                                            color: "#ffffff",
                                                            marginBottom: 12,
                                                            letterSpacing: "-0.02em"
                                                        },
                                                        children: step.title
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/landing/HowItWorks.tsx",
                                                        lineNumber: 108,
                                                        columnNumber: 11
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        style: {
                                                            fontSize: 15,
                                                            color: "rgba(255,255,255,0.5)",
                                                            lineHeight: 1.75,
                                                            marginBottom: 20,
                                                            maxWidth: 420
                                                        },
                                                        children: step.desc
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/landing/HowItWorks.tsx",
                                                        lineNumber: 119,
                                                        columnNumber: 11
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            display: "flex",
                                                            gap: 8
                                                        },
                                                        children: step.tags.map((tag)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                style: {
                                                                    border: "1px solid rgba(255,255,255,0.12)",
                                                                    borderRadius: 999,
                                                                    padding: "4px 13px",
                                                                    fontSize: 11,
                                                                    fontWeight: 600,
                                                                    color: "rgba(255,255,255,0.5)",
                                                                    letterSpacing: "0.04em"
                                                                },
                                                                children: tag
                                                            }, tag, false, {
                                                                fileName: "[project]/src/components/landing/HowItWorks.tsx",
                                                                lineNumber: 132,
                                                                columnNumber: 13
                                                            }, this))
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/landing/HowItWorks.tsx",
                                                        lineNumber: 130,
                                                        columnNumber: 11
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/landing/HowItWorks.tsx",
                                                lineNumber: 94,
                                                columnNumber: 10
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    order: isEven ? 1 : 0
                                                },
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].img, {
                                                    whileHover: {
                                                        scale: 1.02
                                                    },
                                                    transition: {
                                                        duration: 0.4,
                                                        ease: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$motion$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["EASE"]
                                                    },
                                                    src: step.img,
                                                    alt: step.title,
                                                    style: {
                                                        width: "100%",
                                                        height: 280,
                                                        objectFit: "cover",
                                                        borderRadius: 18,
                                                        border: "1px solid rgba(255,255,255,0.07)",
                                                        display: "block"
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/landing/HowItWorks.tsx",
                                                    lineNumber: 152,
                                                    columnNumber: 11
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/landing/HowItWorks.tsx",
                                                lineNumber: 151,
                                                columnNumber: 10
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/landing/HowItWorks.tsx",
                                        lineNumber: 79,
                                        columnNumber: 9
                                    }, this),
                                    i < steps.length - 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            borderTop: "1px solid rgba(255,255,255,0.05)"
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/landing/HowItWorks.tsx",
                                        lineNumber: 170,
                                        columnNumber: 10
                                    }, this)
                                ]
                            }, step.num, true, {
                                fileName: "[project]/src/components/landing/HowItWorks.tsx",
                                lineNumber: 78,
                                columnNumber: 8
                            }, this);
                        })
                    }, void 0, false, {
                        fileName: "[project]/src/components/landing/HowItWorks.tsx",
                        lineNumber: 74,
                        columnNumber: 5
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/landing/HowItWorks.tsx",
                lineNumber: 48,
                columnNumber: 4
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("style", {
                children: `
        @media (max-width: 767px) {
          .process-row { grid-template-columns: 1fr !important; gap: 32px !important; }
          .process-row > div { order: unset !important; }
        }
      `
            }, void 0, false, {
                fileName: "[project]/src/components/landing/HowItWorks.tsx",
                lineNumber: 178,
                columnNumber: 4
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/landing/HowItWorks.tsx",
        lineNumber: 43,
        columnNumber: 3
    }, this);
}
}),
"[project]/src/components/landing/Services.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Services
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$utils$2f$use$2d$in$2d$view$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/utils/use-in-view.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$motion$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/motion.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
const CheckIcon = ()=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        width: "13",
        height: "13",
        fill: "none",
        viewBox: "0 0 24 24",
        stroke: "currentColor",
        strokeWidth: 2.5,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            d: "M5 13l4 4L19 7"
        }, void 0, false, {
            fileName: "[project]/src/components/landing/Services.tsx",
            lineNumber: 9,
            columnNumber: 5
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/src/components/landing/Services.tsx",
        lineNumber: 8,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
const platforms = [
    "IG",
    "LI",
    "X",
    "FB",
    "PIN",
    "TK",
    "YT",
    "EM",
    "ADS",
    "SEO"
];
const services = [
    {
        category: "AI Strategy",
        title: "AI Brand Strategy",
        desc: "Personalised content strategy built around your goals, industry and competitors. Updated monthly by AI.",
        bullets: [
            "Competitor analysis",
            "Monthly content calendar",
            "Platform-specific strategy"
        ]
    },
    {
        category: "Content",
        title: "Content Marketing",
        desc: "Blogs, carousels, infographics, reel scripts — all generated on-brand and on-time without manual effort.",
        platforms: platforms
    },
    {
        category: "Growth",
        title: "Performance Optimisation",
        desc: "AI continuously analyses what performs best and refines your content mix to maximise reach and conversions.",
        stat: {
            value: "3.8×",
            change: "+280%",
            label: "Average ROAS"
        },
        personImg: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&q=80"
    }
];
function Services() {
    const ref = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const isInView = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$utils$2f$use$2d$in$2d$view$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useInView"])(ref, {
        once: true,
        margin: "-80px"
    });
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        ref: ref,
        id: "services",
        style: {
            padding: "120px 0",
            background: "#050505"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    maxWidth: 1280,
                    margin: "0 auto",
                    padding: "0 24px"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                        initial: "hidden",
                        animate: isInView ? "show" : "hidden",
                        variants: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$motion$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["staggerContainer"],
                        style: {
                            marginBottom: 64,
                            textAlign: "center"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].span, {
                                variants: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$motion$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fadeUpVariants"],
                                className: "section-tag",
                                children: "Our Services"
                            }, void 0, false, {
                                fileName: "[project]/src/components/landing/Services.tsx",
                                lineNumber: 54,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].h2, {
                                variants: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$motion$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fadeUpVariants"],
                                style: {
                                    fontSize: "clamp(32px, 4.5vw, 56px)",
                                    fontWeight: 800,
                                    lineHeight: 1.08,
                                    color: "#ffffff",
                                    letterSpacing: "-0.04em",
                                    margin: 0
                                },
                                children: "Unlock your brand's true potential."
                            }, void 0, false, {
                                fileName: "[project]/src/components/landing/Services.tsx",
                                lineNumber: 55,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/landing/Services.tsx",
                        lineNumber: 48,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                        initial: "hidden",
                        animate: isInView ? "show" : "hidden",
                        variants: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$motion$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["staggerContainer"],
                        className: "services-grid",
                        style: {
                            display: "grid",
                            gridTemplateColumns: "repeat(3, 1fr)",
                            gap: 14
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                                variants: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$motion$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fadeUpVariants"],
                                whileHover: {
                                    y: -6,
                                    borderColor: "rgba(255,255,255,0.16)"
                                },
                                transition: {
                                    duration: 0.3,
                                    ease: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$motion$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["EASE"]
                                },
                                style: {
                                    background: "#0d0d0d",
                                    border: "1px solid rgba(255,255,255,0.07)",
                                    borderRadius: 20,
                                    padding: 32,
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 16
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "section-tag",
                                        style: {
                                            marginBottom: 0,
                                            fontSize: 10
                                        },
                                        children: services[0].category
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/landing/Services.tsx",
                                        lineNumber: 92,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                        style: {
                                            fontSize: 20,
                                            fontWeight: 700,
                                            color: "#ffffff",
                                            margin: 0,
                                            letterSpacing: "-0.02em"
                                        },
                                        children: services[0].title
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/landing/Services.tsx",
                                        lineNumber: 93,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        style: {
                                            fontSize: 14,
                                            color: "rgba(255,255,255,0.5)",
                                            lineHeight: 1.75,
                                            margin: 0
                                        },
                                        children: services[0].desc
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/landing/Services.tsx",
                                        lineNumber: 94,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                        style: {
                                            margin: 0,
                                            padding: 0,
                                            listStyle: "none",
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: 10,
                                            marginTop: "auto"
                                        },
                                        children: services[0].bullets.map((b)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                style: {
                                                    fontSize: 13,
                                                    color: "rgba(255,255,255,0.6)",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 9
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            color: "rgba(255,255,255,0.5)",
                                                            display: "flex"
                                                        },
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(CheckIcon, {}, void 0, false, {
                                                            fileName: "[project]/src/components/landing/Services.tsx",
                                                            lineNumber: 98,
                                                            columnNumber: 85
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/landing/Services.tsx",
                                                        lineNumber: 98,
                                                        columnNumber: 19
                                                    }, this),
                                                    b
                                                ]
                                            }, b, true, {
                                                fileName: "[project]/src/components/landing/Services.tsx",
                                                lineNumber: 97,
                                                columnNumber: 17
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/landing/Services.tsx",
                                        lineNumber: 95,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/landing/Services.tsx",
                                lineNumber: 78,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                                variants: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$motion$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fadeUpVariants"],
                                whileHover: {
                                    y: -6,
                                    borderColor: "rgba(255,255,255,0.16)"
                                },
                                transition: {
                                    duration: 0.3,
                                    ease: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$motion$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["EASE"]
                                },
                                style: {
                                    background: "#0d0d0d",
                                    border: "1px solid rgba(255,255,255,0.07)",
                                    borderRadius: 20,
                                    padding: 32,
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 16
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "section-tag",
                                        style: {
                                            marginBottom: 0,
                                            fontSize: 10
                                        },
                                        children: services[1].category
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/landing/Services.tsx",
                                        lineNumber: 120,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                        style: {
                                            fontSize: 20,
                                            fontWeight: 700,
                                            color: "#ffffff",
                                            margin: 0,
                                            letterSpacing: "-0.02em"
                                        },
                                        children: services[1].title
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/landing/Services.tsx",
                                        lineNumber: 121,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        style: {
                                            fontSize: 14,
                                            color: "rgba(255,255,255,0.5)",
                                            lineHeight: 1.75,
                                            margin: 0
                                        },
                                        children: services[1].desc
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/landing/Services.tsx",
                                        lineNumber: 122,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: "grid",
                                            gridTemplateColumns: "repeat(5, 1fr)",
                                            gap: 8,
                                            marginTop: "auto"
                                        },
                                        children: services[1].platforms.map((label, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    width: "100%",
                                                    aspectRatio: "1",
                                                    background: "rgba(255,255,255,0.04)",
                                                    border: "1px solid rgba(255,255,255,0.07)",
                                                    borderRadius: 10,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    fontSize: 10,
                                                    fontWeight: 700,
                                                    color: "rgba(255,255,255,0.4)",
                                                    letterSpacing: "0.04em"
                                                },
                                                children: label
                                            }, i, false, {
                                                fileName: "[project]/src/components/landing/Services.tsx",
                                                lineNumber: 125,
                                                columnNumber: 17
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/landing/Services.tsx",
                                        lineNumber: 123,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/landing/Services.tsx",
                                lineNumber: 106,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                                variants: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$motion$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fadeUpVariants"],
                                whileHover: {
                                    y: -6,
                                    borderColor: "rgba(255,255,255,0.16)"
                                },
                                transition: {
                                    duration: 0.3,
                                    ease: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$motion$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["EASE"]
                                },
                                style: {
                                    background: "#0d0d0d",
                                    border: "1px solid rgba(255,255,255,0.07)",
                                    borderRadius: 20,
                                    padding: 32,
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 16
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "section-tag",
                                        style: {
                                            marginBottom: 0,
                                            fontSize: 10
                                        },
                                        children: services[2].category
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/landing/Services.tsx",
                                        lineNumber: 163,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                        style: {
                                            fontSize: 20,
                                            fontWeight: 700,
                                            color: "#ffffff",
                                            margin: 0,
                                            letterSpacing: "-0.02em"
                                        },
                                        children: services[2].title
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/landing/Services.tsx",
                                        lineNumber: 164,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        style: {
                                            fontSize: 14,
                                            color: "rgba(255,255,255,0.5)",
                                            lineHeight: 1.75,
                                            margin: 0
                                        },
                                        children: services[2].desc
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/landing/Services.tsx",
                                        lineNumber: 165,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            marginTop: "auto",
                                            background: "rgba(255,255,255,0.03)",
                                            border: "1px solid rgba(255,255,255,0.07)",
                                            borderRadius: 14,
                                            padding: "20px 24px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between"
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        style: {
                                                            fontSize: 44,
                                                            fontWeight: 800,
                                                            color: "#ffffff",
                                                            margin: 0,
                                                            lineHeight: 1,
                                                            letterSpacing: "-0.04em"
                                                        },
                                                        children: services[2].stat.value
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/landing/Services.tsx",
                                                        lineNumber: 179,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        style: {
                                                            fontSize: 12,
                                                            color: "rgba(255,255,255,0.35)",
                                                            marginTop: 6
                                                        },
                                                        children: services[2].stat.label
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/landing/Services.tsx",
                                                        lineNumber: 180,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/landing/Services.tsx",
                                                lineNumber: 178,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    alignItems: "flex-end",
                                                    gap: 10
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            background: "rgba(16,185,129,0.12)",
                                                            color: "#10b981",
                                                            fontSize: 12,
                                                            fontWeight: 600,
                                                            padding: "3px 10px",
                                                            borderRadius: 999,
                                                            border: "1px solid rgba(16,185,129,0.25)"
                                                        },
                                                        children: services[2].stat.change
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/landing/Services.tsx",
                                                        lineNumber: 183,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                        src: services[2].personImg,
                                                        alt: "Client",
                                                        style: {
                                                            width: 38,
                                                            height: 38,
                                                            borderRadius: "50%",
                                                            objectFit: "cover",
                                                            border: "1px solid rgba(255,255,255,0.12)"
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/landing/Services.tsx",
                                                        lineNumber: 196,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/landing/Services.tsx",
                                                lineNumber: 182,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/landing/Services.tsx",
                                        lineNumber: 166,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/landing/Services.tsx",
                                lineNumber: 149,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/landing/Services.tsx",
                        lineNumber: 70,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/landing/Services.tsx",
                lineNumber: 47,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("style", {
                children: `
        @media (max-width: 767px) {
          .services-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 1023px) and (min-width: 768px) {
          .services-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `
            }, void 0, false, {
                fileName: "[project]/src/components/landing/Services.tsx",
                lineNumber: 213,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/landing/Services.tsx",
        lineNumber: 42,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/components/landing/Portfolio.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Portfolio
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$utils$2f$use$2d$in$2d$view$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/utils/use-in-view.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$motion$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/motion.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
const caseStudies = [
    {
        stats: [
            "400%",
            "15K+",
            "25M+"
        ],
        labels: [
            "ROI",
            "New Users",
            "Impressions"
        ],
        client: "01",
        name: "Bloom Beauty Co.",
        tag: "E-commerce",
        img: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80"
    },
    {
        stats: [
            "3.8×",
            "12K+",
            "+112%"
        ],
        labels: [
            "ROAS",
            "Signups",
            "Engagement"
        ],
        client: "02",
        name: "TechScale SaaS",
        tag: "B2B SaaS",
        img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80"
    },
    {
        stats: [
            "10×",
            "80K+",
            "€2M+"
        ],
        labels: [
            "Faster",
            "Followers",
            "Revenue"
        ],
        client: "03",
        name: "Wanderlust Agency",
        tag: "Agency",
        img: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&q=80"
    },
    {
        stats: [
            "5×",
            "200K+",
            "+320%"
        ],
        labels: [
            "Content Output",
            "Reach",
            "Sales Lift"
        ],
        client: "04",
        name: "Spice Trail Foods",
        tag: "FMCG",
        img: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80"
    }
];
function Portfolio() {
    const ref = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const isInView = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$utils$2f$use$2d$in$2d$view$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useInView"])(ref, {
        once: true,
        margin: "-80px"
    });
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        ref: ref,
        id: "case-studies",
        style: {
            padding: "120px 0",
            background: "#050505"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    maxWidth: 1280,
                    margin: "0 auto",
                    padding: "0 24px"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                        initial: "hidden",
                        animate: isInView ? "show" : "hidden",
                        variants: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$motion$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["staggerContainer"],
                        style: {
                            marginBottom: 64,
                            textAlign: "center"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].span, {
                                variants: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$motion$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fadeUpVariants"],
                                className: "section-tag",
                                children: "Case Studies"
                            }, void 0, false, {
                                fileName: "[project]/src/components/landing/Portfolio.tsx",
                                lineNumber: 59,
                                columnNumber: 6
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].h2, {
                                variants: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$motion$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fadeUpVariants"],
                                style: {
                                    fontSize: "clamp(32px, 4.5vw, 56px)",
                                    fontWeight: 800,
                                    lineHeight: 1.08,
                                    color: "#ffffff",
                                    letterSpacing: "-0.04em",
                                    margin: 0
                                },
                                children: "Results that speak for themselves."
                            }, void 0, false, {
                                fileName: "[project]/src/components/landing/Portfolio.tsx",
                                lineNumber: 62,
                                columnNumber: 6
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/landing/Portfolio.tsx",
                        lineNumber: 53,
                        columnNumber: 5
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                        initial: {
                            opacity: 0
                        },
                        animate: isInView ? {
                            opacity: 1
                        } : {
                            opacity: 0
                        },
                        transition: {
                            delay: 0.3,
                            duration: 0.6
                        },
                        style: {
                            display: "flex",
                            justifyContent: "center",
                            gap: 40,
                            flexWrap: "wrap",
                            marginBottom: 60
                        },
                        children: [
                            "Bloom Beauty",
                            "TechScale",
                            "Wanderlust",
                            "Spice Trail",
                            "CloudNest"
                        ].map((b)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    fontSize: 13,
                                    fontWeight: 700,
                                    color: "rgba(255,255,255,0.2)",
                                    letterSpacing: "-0.01em"
                                },
                                children: b
                            }, b, false, {
                                fileName: "[project]/src/components/landing/Portfolio.tsx",
                                lineNumber: 92,
                                columnNumber: 8
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/components/landing/Portfolio.tsx",
                        lineNumber: 78,
                        columnNumber: 5
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                        initial: "hidden",
                        animate: isInView ? "show" : "hidden",
                        variants: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$motion$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["staggerContainer"],
                        className: "case-grid",
                        style: {
                            display: "grid",
                            gridTemplateColumns: "repeat(2, 1fr)",
                            gap: 14
                        },
                        children: caseStudies.map((cs, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                                variants: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$motion$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fadeUpVariants"],
                                whileHover: {
                                    y: -6,
                                    borderColor: "rgba(255,255,255,0.15)"
                                },
                                transition: {
                                    duration: 0.3,
                                    ease: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$motion$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["EASE"]
                                },
                                style: {
                                    background: "#0d0d0d",
                                    border: "1px solid rgba(255,255,255,0.07)",
                                    borderRadius: 20,
                                    overflow: "hidden",
                                    cursor: "pointer"
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: "flex",
                                            gap: 28,
                                            padding: "24px 28px 0"
                                        },
                                        children: cs.stats.map((s, j)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        style: {
                                                            fontSize: 24,
                                                            fontWeight: 800,
                                                            color: "#ffffff",
                                                            margin: 0,
                                                            letterSpacing: "-0.03em",
                                                            lineHeight: 1
                                                        },
                                                        children: s
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/landing/Portfolio.tsx",
                                                        lineNumber: 146,
                                                        columnNumber: 11
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        style: {
                                                            fontSize: 11,
                                                            color: "rgba(255,255,255,0.35)",
                                                            margin: "4px 0 0",
                                                            fontWeight: 500
                                                        },
                                                        children: cs.labels[j]
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/landing/Portfolio.tsx",
                                                        lineNumber: 158,
                                                        columnNumber: 11
                                                    }, this)
                                                ]
                                            }, j, true, {
                                                fileName: "[project]/src/components/landing/Portfolio.tsx",
                                                lineNumber: 145,
                                                columnNumber: 10
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/landing/Portfolio.tsx",
                                        lineNumber: 137,
                                        columnNumber: 8
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 10,
                                            padding: "14px 28px"
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontSize: 11,
                                                    color: "rgba(255,255,255,0.25)",
                                                    fontWeight: 700
                                                },
                                                children: cs.client
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/landing/Portfolio.tsx",
                                                lineNumber: 181,
                                                columnNumber: 9
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontSize: 14,
                                                    fontWeight: 700,
                                                    color: "#ffffff"
                                                },
                                                children: cs.name
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/landing/Portfolio.tsx",
                                                lineNumber: 190,
                                                columnNumber: 9
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    marginLeft: "auto",
                                                    border: "1px solid rgba(255,255,255,0.1)",
                                                    borderRadius: 999,
                                                    padding: "2px 11px",
                                                    fontSize: 10,
                                                    fontWeight: 600,
                                                    color: "rgba(255,255,255,0.4)",
                                                    letterSpacing: "0.04em"
                                                },
                                                children: cs.tag
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/landing/Portfolio.tsx",
                                                lineNumber: 199,
                                                columnNumber: 9
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/landing/Portfolio.tsx",
                                        lineNumber: 173,
                                        columnNumber: 8
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            position: "relative",
                                            margin: "0 14px 14px",
                                            borderRadius: 12,
                                            overflow: "hidden"
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                src: cs.img,
                                                alt: cs.name,
                                                style: {
                                                    width: "100%",
                                                    height: 170,
                                                    objectFit: "cover",
                                                    display: "block"
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/landing/Portfolio.tsx",
                                                lineNumber: 224,
                                                columnNumber: 9
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    position: "absolute",
                                                    inset: 0,
                                                    background: "rgba(0,0,0,0.4)",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center"
                                                },
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        width: 44,
                                                        height: 44,
                                                        borderRadius: "50%",
                                                        background: "rgba(255,255,255,0.1)",
                                                        border: "1px solid rgba(255,255,255,0.3)",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center"
                                                    },
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                        width: "15",
                                                        height: "15",
                                                        viewBox: "0 0 24 24",
                                                        fill: "white",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                            d: "M8 5v14l11-7z"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/landing/Portfolio.tsx",
                                                            lineNumber: 257,
                                                            columnNumber: 12
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/landing/Portfolio.tsx",
                                                        lineNumber: 256,
                                                        columnNumber: 11
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/landing/Portfolio.tsx",
                                                    lineNumber: 244,
                                                    columnNumber: 10
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/landing/Portfolio.tsx",
                                                lineNumber: 234,
                                                columnNumber: 9
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/landing/Portfolio.tsx",
                                        lineNumber: 216,
                                        columnNumber: 8
                                    }, this)
                                ]
                            }, i, true, {
                                fileName: "[project]/src/components/landing/Portfolio.tsx",
                                lineNumber: 120,
                                columnNumber: 7
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/components/landing/Portfolio.tsx",
                        lineNumber: 108,
                        columnNumber: 5
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                        initial: "hidden",
                        animate: isInView ? "show" : "hidden",
                        variants: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$motion$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["staggerContainer"],
                        style: {
                            display: "flex",
                            gap: 14,
                            marginTop: 60,
                            justifyContent: "center",
                            flexWrap: "wrap"
                        },
                        children: [
                            {
                                num: "500K+",
                                label: "Active Users"
                            },
                            {
                                num: "$2M+",
                                label: "Revenue Generated"
                            }
                        ].map((stat)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                                variants: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$motion$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fadeUpVariants"],
                                whileHover: {
                                    y: -4
                                },
                                transition: {
                                    duration: 0.3,
                                    ease: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$motion$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["EASE"]
                                },
                                style: {
                                    background: "#0d0d0d",
                                    border: "1px solid rgba(255,255,255,0.07)",
                                    borderRadius: 20,
                                    textAlign: "center",
                                    padding: "44px 60px",
                                    flex: "1 1 280px"
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        style: {
                                            fontSize: "clamp(48px, 5.5vw, 72px)",
                                            fontWeight: 800,
                                            color: "#ffffff",
                                            letterSpacing: "-0.05em",
                                            lineHeight: 1,
                                            marginBottom: 10
                                        },
                                        children: stat.num
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/landing/Portfolio.tsx",
                                        lineNumber: 297,
                                        columnNumber: 8
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        style: {
                                            fontSize: 14,
                                            color: "rgba(255,255,255,0.4)"
                                        },
                                        children: stat.label
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/landing/Portfolio.tsx",
                                        lineNumber: 309,
                                        columnNumber: 8
                                    }, this)
                                ]
                            }, stat.num, true, {
                                fileName: "[project]/src/components/landing/Portfolio.tsx",
                                lineNumber: 283,
                                columnNumber: 7
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/components/landing/Portfolio.tsx",
                        lineNumber: 267,
                        columnNumber: 5
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                        initial: {
                            opacity: 0,
                            y: 16
                        },
                        animate: isInView ? {
                            opacity: 1,
                            y: 0
                        } : {
                            opacity: 0,
                            y: 16
                        },
                        transition: {
                            delay: 0.5,
                            duration: 0.5,
                            ease: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$motion$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["EASE"]
                        },
                        style: {
                            textAlign: "center",
                            marginTop: 28
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            style: {
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 8,
                                border: "1px solid rgba(255,255,255,0.1)",
                                borderRadius: 999,
                                padding: "7px 18px",
                                fontSize: 13,
                                color: "rgba(255,255,255,0.55)"
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                    width: "13",
                                    height: "13",
                                    viewBox: "0 0 24 24",
                                    fill: "#e8e0d0",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                        d: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/landing/Portfolio.tsx",
                                        lineNumber: 338,
                                        columnNumber: 8
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/landing/Portfolio.tsx",
                                    lineNumber: 337,
                                    columnNumber: 7
                                }, this),
                                "4.9/5 · Trusted by 1,000+ businesses"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/landing/Portfolio.tsx",
                            lineNumber: 325,
                            columnNumber: 6
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/landing/Portfolio.tsx",
                        lineNumber: 317,
                        columnNumber: 5
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/landing/Portfolio.tsx",
                lineNumber: 52,
                columnNumber: 4
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("style", {
                children: `
        @media (max-width: 767px) {
          .case-grid { grid-template-columns: 1fr !important; }
        }
      `
            }, void 0, false, {
                fileName: "[project]/src/components/landing/Portfolio.tsx",
                lineNumber: 345,
                columnNumber: 4
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/landing/Portfolio.tsx",
        lineNumber: 47,
        columnNumber: 3
    }, this);
}
}),
"[project]/src/components/landing/Pricing.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Pricing
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$utils$2f$use$2d$in$2d$view$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/utils/use-in-view.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$motion$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/motion.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
const CheckIcon = ()=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        width: "14",
        height: "14",
        fill: "none",
        viewBox: "0 0 24 24",
        stroke: "currentColor",
        strokeWidth: 2.5,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            d: "M5 13l4 4L19 7"
        }, void 0, false, {
            fileName: "[project]/src/components/landing/Pricing.tsx",
            lineNumber: 9,
            columnNumber: 5
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/src/components/landing/Pricing.tsx",
        lineNumber: 8,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
const plans = [
    {
        name: "Starter",
        badge: "Basic",
        price: "₹999",
        period: "/mo",
        tagline: "Perfect for solopreneurs and early-stage brands.",
        features: [
            "1 Brand Profile",
            "30 AI posts/month",
            "Instagram & LinkedIn",
            "Basic Analytics"
        ],
        cta: "Start Free Trial",
        highlighted: false
    },
    {
        name: "Growth",
        badge: "Most Popular",
        price: "₹2,999",
        period: "/mo",
        tagline: "Built for growing brands that need more firepower.",
        features: [
            "5 Brand Profiles",
            "200 AI posts/month",
            "All 5 platforms",
            "Advanced Analytics",
            "Custom Brand Kit"
        ],
        cta: "Start Free Trial",
        highlighted: true
    }
];
function Pricing() {
    const ref = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const isInView = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$utils$2f$use$2d$in$2d$view$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useInView"])(ref, {
        once: true,
        margin: "-80px"
    });
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        ref: ref,
        id: "pricing",
        style: {
            padding: "120px 0",
            background: "#050505"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    maxWidth: 1280,
                    margin: "0 auto",
                    padding: "0 24px"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                        initial: "hidden",
                        animate: isInView ? "show" : "hidden",
                        variants: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$motion$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["staggerContainer"],
                        style: {
                            marginBottom: 64,
                            textAlign: "center"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].span, {
                                variants: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$motion$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fadeUpVariants"],
                                className: "section-tag",
                                children: "Pricing Plans"
                            }, void 0, false, {
                                fileName: "[project]/src/components/landing/Pricing.tsx",
                                lineNumber: 64,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].h2, {
                                variants: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$motion$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fadeUpVariants"],
                                style: {
                                    fontSize: "clamp(32px, 4.5vw, 56px)",
                                    fontWeight: 800,
                                    lineHeight: 1.08,
                                    color: "#ffffff",
                                    letterSpacing: "-0.04em",
                                    margin: 0
                                },
                                children: "Simple, transparent pricing."
                            }, void 0, false, {
                                fileName: "[project]/src/components/landing/Pricing.tsx",
                                lineNumber: 67,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].p, {
                                variants: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$motion$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fadeUpVariants"],
                                style: {
                                    fontSize: 16,
                                    color: "rgba(255,255,255,0.45)",
                                    marginTop: 12
                                },
                                children: "Start free for 14 days. No credit card required."
                            }, void 0, false, {
                                fileName: "[project]/src/components/landing/Pricing.tsx",
                                lineNumber: 80,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/landing/Pricing.tsx",
                        lineNumber: 58,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                        initial: "hidden",
                        animate: isInView ? "show" : "hidden",
                        variants: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$motion$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["staggerContainer"],
                        className: "pricing-grid",
                        style: {
                            display: "grid",
                            gridTemplateColumns: "repeat(2, 1fr)",
                            gap: 14,
                            maxWidth: 820,
                            margin: "0 auto"
                        },
                        children: plans.map((plan, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                                variants: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$motion$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fadeUpVariants"],
                                whileHover: {
                                    y: -8
                                },
                                transition: {
                                    duration: 0.3,
                                    ease: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$motion$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["EASE"]
                                },
                                style: {
                                    background: plan.highlighted ? "#0f0f0f" : "#0d0d0d",
                                    border: plan.highlighted ? "1px solid rgba(255,255,255,0.2)" : "1px solid rgba(255,255,255,0.07)",
                                    borderRadius: 20,
                                    padding: "36px 32px",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 24,
                                    position: "relative",
                                    boxShadow: plan.highlighted ? "0 0 60px rgba(255,255,255,0.04), 0 32px 80px rgba(0,0,0,0.5)" : "none"
                                },
                                children: [
                                    plan.highlighted && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            position: "absolute",
                                            top: -1,
                                            left: "50%",
                                            transform: "translateX(-50%)",
                                            background: "#ffffff",
                                            color: "#000000",
                                            fontSize: 11,
                                            fontWeight: 700,
                                            letterSpacing: "0.06em",
                                            textTransform: "uppercase",
                                            padding: "4px 14px",
                                            borderRadius: "0 0 10px 10px"
                                        },
                                        children: "Most Popular"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/landing/Pricing.tsx",
                                        lineNumber: 115,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            paddingTop: plan.highlighted ? 12 : 0
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                style: {
                                                    fontSize: 20,
                                                    fontWeight: 700,
                                                    color: "#ffffff",
                                                    margin: 0,
                                                    letterSpacing: "-0.02em"
                                                },
                                                children: plan.name
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/landing/Pricing.tsx",
                                                lineNumber: 137,
                                                columnNumber: 17
                                            }, this),
                                            !plan.highlighted && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    background: "rgba(255,255,255,0.07)",
                                                    color: "rgba(255,255,255,0.5)",
                                                    fontSize: 11,
                                                    fontWeight: 600,
                                                    padding: "3px 10px",
                                                    borderRadius: 999,
                                                    letterSpacing: "0.04em"
                                                },
                                                children: plan.badge
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/landing/Pricing.tsx",
                                                lineNumber: 139,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/landing/Pricing.tsx",
                                        lineNumber: 136,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    display: "flex",
                                                    alignItems: "baseline",
                                                    gap: 4
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            fontSize: 52,
                                                            fontWeight: 800,
                                                            color: "#ffffff",
                                                            letterSpacing: "-0.04em",
                                                            lineHeight: 1
                                                        },
                                                        children: plan.price
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/landing/Pricing.tsx",
                                                        lineNumber: 158,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            fontSize: 15,
                                                            color: "rgba(255,255,255,0.35)"
                                                        },
                                                        children: plan.period
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/landing/Pricing.tsx",
                                                        lineNumber: 161,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/landing/Pricing.tsx",
                                                lineNumber: 157,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                style: {
                                                    fontSize: 13,
                                                    color: "rgba(255,255,255,0.4)",
                                                    marginTop: 6,
                                                    lineHeight: 1.6
                                                },
                                                children: plan.tagline
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/landing/Pricing.tsx",
                                                lineNumber: 163,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/landing/Pricing.tsx",
                                        lineNumber: 156,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            height: 1,
                                            background: "rgba(255,255,255,0.06)"
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/landing/Pricing.tsx",
                                        lineNumber: 167,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                        style: {
                                            margin: 0,
                                            padding: 0,
                                            listStyle: "none",
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: 11
                                        },
                                        children: plan.features.map((f)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                style: {
                                                    fontSize: 14,
                                                    color: "rgba(255,255,255,0.65)",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 10
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            color: "rgba(255,255,255,0.6)",
                                                            flexShrink: 0,
                                                            display: "flex"
                                                        },
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(CheckIcon, {}, void 0, false, {
                                                            fileName: "[project]/src/components/landing/Pricing.tsx",
                                                            lineNumber: 174,
                                                            columnNumber: 23
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/landing/Pricing.tsx",
                                                        lineNumber: 173,
                                                        columnNumber: 21
                                                    }, this),
                                                    f
                                                ]
                                            }, f, true, {
                                                fileName: "[project]/src/components/landing/Pricing.tsx",
                                                lineNumber: 172,
                                                columnNumber: 19
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/landing/Pricing.tsx",
                                        lineNumber: 170,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                        href: "#",
                                        style: {
                                            marginTop: "auto"
                                        },
                                        className: plan.highlighted ? "btn-primary" : "btn-outline",
                                        children: plan.cta
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/landing/Pricing.tsx",
                                        lineNumber: 182,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, plan.name, true, {
                                fileName: "[project]/src/components/landing/Pricing.tsx",
                                lineNumber: 96,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/components/landing/Pricing.tsx",
                        lineNumber: 88,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/landing/Pricing.tsx",
                lineNumber: 57,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("style", {
                children: `
        @media (max-width: 639px) {
          .pricing-grid { grid-template-columns: 1fr !important; }
        }
      `
            }, void 0, false, {
                fileName: "[project]/src/components/landing/Pricing.tsx",
                lineNumber: 194,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/landing/Pricing.tsx",
        lineNumber: 52,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/components/landing/Team.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Team
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$utils$2f$use$2d$in$2d$view$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/utils/use-in-view.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$motion$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/motion.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
const LinkedInIcon = ()=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        width: "13",
        height: "13",
        viewBox: "0 0 24 24",
        fill: "currentColor",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
            d: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
        }, void 0, false, {
            fileName: "[project]/src/components/landing/Team.tsx",
            lineNumber: 9,
            columnNumber: 5
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/src/components/landing/Team.tsx",
        lineNumber: 8,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
const team = [
    {
        name: "Arjun Kapoor",
        role: "CEO & Co-Founder",
        img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
        wide: true
    },
    {
        name: "Neha Verma",
        role: "CTO & Co-Founder",
        img: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&q=80",
        wide: false
    },
    {
        name: "Rohan Desai",
        role: "Head of Design",
        img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80",
        wide: false
    },
    {
        name: "Meera Iyer",
        role: "Head of Growth",
        img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80",
        wide: false
    },
    {
        name: "Vikram Singh",
        role: "Lead Engineer",
        img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80",
        wide: false
    },
    {
        name: "Priya Nair",
        role: "Brand Strategist",
        img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80",
        wide: true
    }
];
function Team() {
    const ref = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const isInView = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$utils$2f$use$2d$in$2d$view$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useInView"])(ref, {
        once: true,
        margin: "-80px"
    });
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        ref: ref,
        id: "team",
        style: {
            padding: "120px 0",
            background: "#050505"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    maxWidth: 1280,
                    margin: "0 auto",
                    padding: "0 24px"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                        initial: "hidden",
                        animate: isInView ? "show" : "hidden",
                        variants: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$motion$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["staggerContainer"],
                        style: {
                            marginBottom: 64,
                            textAlign: "center"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].span, {
                                variants: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$motion$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fadeUpVariants"],
                                className: "section-tag",
                                children: "Our Team"
                            }, void 0, false, {
                                fileName: "[project]/src/components/landing/Team.tsx",
                                lineNumber: 39,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].h2, {
                                variants: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$motion$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fadeUpVariants"],
                                style: {
                                    fontSize: "clamp(32px, 4.5vw, 56px)",
                                    fontWeight: 800,
                                    lineHeight: 1.08,
                                    color: "#ffffff",
                                    letterSpacing: "-0.04em",
                                    margin: 0
                                },
                                children: "Meet the people behind the product."
                            }, void 0, false, {
                                fileName: "[project]/src/components/landing/Team.tsx",
                                lineNumber: 40,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/landing/Team.tsx",
                        lineNumber: 33,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                        initial: "hidden",
                        animate: isInView ? "show" : "hidden",
                        variants: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$motion$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["staggerContainer"],
                        className: "team-grid",
                        style: {
                            display: "grid",
                            gridTemplateColumns: "repeat(3, 1fr)",
                            gap: 14
                        },
                        children: team.map((m, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                                variants: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$motion$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fadeUpVariants"],
                                whileHover: {
                                    y: -6,
                                    borderColor: "rgba(255,255,255,0.16)"
                                },
                                transition: {
                                    duration: 0.3,
                                    ease: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$motion$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["EASE"]
                                },
                                style: {
                                    background: "#0d0d0d",
                                    border: "1px solid rgba(255,255,255,0.07)",
                                    borderRadius: 20,
                                    overflow: "hidden",
                                    gridColumn: m.wide ? "span 2" : "span 1"
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                        src: m.img,
                                        alt: m.name,
                                        style: {
                                            width: "100%",
                                            height: m.wide ? 300 : 210,
                                            objectFit: "cover",
                                            objectPosition: "top",
                                            display: "block"
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/landing/Team.tsx",
                                        lineNumber: 80,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            padding: "16px 20px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between"
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        style: {
                                                            margin: 0,
                                                            fontSize: 15,
                                                            fontWeight: 700,
                                                            color: "#ffffff",
                                                            letterSpacing: "-0.01em"
                                                        },
                                                        children: m.name
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/landing/Team.tsx",
                                                        lineNumber: 93,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        style: {
                                                            margin: 0,
                                                            fontSize: 12,
                                                            color: "rgba(255,255,255,0.4)",
                                                            marginTop: 2
                                                        },
                                                        children: m.role
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/landing/Team.tsx",
                                                        lineNumber: 94,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/landing/Team.tsx",
                                                lineNumber: 92,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                href: "#",
                                                style: {
                                                    width: 32,
                                                    height: 32,
                                                    borderRadius: 8,
                                                    border: "1px solid rgba(255,255,255,0.1)",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    color: "rgba(255,255,255,0.4)",
                                                    textDecoration: "none",
                                                    transition: "border-color 0.2s, color 0.2s"
                                                },
                                                onMouseEnter: (e)=>{
                                                    const el = e.currentTarget;
                                                    el.style.borderColor = "rgba(255,255,255,0.3)";
                                                    el.style.color = "#ffffff";
                                                },
                                                onMouseLeave: (e)=>{
                                                    const el = e.currentTarget;
                                                    el.style.borderColor = "rgba(255,255,255,0.1)";
                                                    el.style.color = "rgba(255,255,255,0.4)";
                                                },
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(LinkedInIcon, {}, void 0, false, {
                                                    fileName: "[project]/src/components/landing/Team.tsx",
                                                    lineNumber: 121,
                                                    columnNumber: 19
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/landing/Team.tsx",
                                                lineNumber: 96,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/landing/Team.tsx",
                                        lineNumber: 91,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, m.name, true, {
                                fileName: "[project]/src/components/landing/Team.tsx",
                                lineNumber: 67,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/components/landing/Team.tsx",
                        lineNumber: 55,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/landing/Team.tsx",
                lineNumber: 32,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("style", {
                children: `
        @media (max-width: 767px) {
          .team-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .team-grid > div { grid-column: span 1 !important; }
        }
        @media (max-width: 479px) {
          .team-grid { grid-template-columns: 1fr !important; }
        }
      `
            }, void 0, false, {
                fileName: "[project]/src/components/landing/Team.tsx",
                lineNumber: 129,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/landing/Team.tsx",
        lineNumber: 27,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/components/landing/Testimonials.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Testimonials
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$utils$2f$use$2d$in$2d$view$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/utils/use-in-view.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$motion$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/motion.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
const featured = {
    quote: "Brandvertise AI completely replaced our social media agency. We went from spending ₹50k/month on a designer to ₹2,999 — and our engagement doubled in 60 days. It doesn't just generate content, it generates the right content, every time.",
    name: "Priya Sharma",
    title: "Founder, Bloom Beauty Co.",
    img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80",
    stars: 5
};
const textTestimonials = [
    {
        name: "Rahul Mehta",
        role: "CMO, TechScale SaaS",
        img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
        quote: "We use it for 8 client brands. The brand intelligence is genuinely impressive — it doesn't generate generic content, it sounds like each individual brand.",
        stars: 5
    },
    {
        name: "Aisha Khan",
        role: "Director, Wanderlust Agency",
        img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&q=80",
        quote: "The white-label dashboard on the Agency plan is a game changer. Our clients think we have a 10-person design team. We have Brandvertise AI and one junior manager.",
        stars: 5
    }
];
const videoTestimonials = [
    {
        name: "Vikram Nair",
        role: "E-commerce Lead, Spice Trail",
        img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&q=80"
    },
    {
        name: "Sneha Patel",
        role: "Personal Brand Coach",
        img: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&q=80"
    }
];
const Stars = ({ count })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: "flex",
            gap: 3
        },
        children: Array.from({
            length: count
        }).map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                width: "13",
                height: "13",
                viewBox: "0 0 24 24",
                fill: "#e8e0d0",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                    d: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                }, void 0, false, {
                    fileName: "[project]/src/components/landing/Testimonials.tsx",
                    lineNumber: 29,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            }, i, false, {
                fileName: "[project]/src/components/landing/Testimonials.tsx",
                lineNumber: 28,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)))
    }, void 0, false, {
        fileName: "[project]/src/components/landing/Testimonials.tsx",
        lineNumber: 26,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
function Testimonials() {
    const ref = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const isInView = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$utils$2f$use$2d$in$2d$view$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useInView"])(ref, {
        once: true,
        margin: "-80px"
    });
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        ref: ref,
        id: "testimonials",
        style: {
            padding: "120px 0",
            background: "#050505"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    maxWidth: 1280,
                    margin: "0 auto",
                    padding: "0 24px"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                        initial: "hidden",
                        animate: isInView ? "show" : "hidden",
                        variants: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$motion$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["staggerContainer"],
                        style: {
                            marginBottom: 64,
                            textAlign: "center"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].span, {
                                variants: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$motion$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fadeUpVariants"],
                                className: "section-tag",
                                children: "Testimonials"
                            }, void 0, false, {
                                fileName: "[project]/src/components/landing/Testimonials.tsx",
                                lineNumber: 52,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].h2, {
                                variants: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$motion$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fadeUpVariants"],
                                style: {
                                    fontSize: "clamp(32px, 4.5vw, 56px)",
                                    fontWeight: 800,
                                    lineHeight: 1.08,
                                    color: "#ffffff",
                                    letterSpacing: "-0.04em",
                                    margin: 0
                                },
                                children: "Stories of real growth."
                            }, void 0, false, {
                                fileName: "[project]/src/components/landing/Testimonials.tsx",
                                lineNumber: 53,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/landing/Testimonials.tsx",
                        lineNumber: 46,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                        initial: "hidden",
                        animate: isInView ? "show" : "hidden",
                        variants: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$motion$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["staggerContainer"],
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                                variants: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$motion$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fadeUpVariants"],
                                whileHover: {
                                    borderColor: "rgba(255,255,255,0.15)"
                                },
                                style: {
                                    display: "grid",
                                    gridTemplateColumns: "1fr auto",
                                    gap: 40,
                                    alignItems: "center",
                                    marginBottom: 14,
                                    background: "#0d0d0d",
                                    border: "1px solid rgba(255,255,255,0.07)",
                                    borderRadius: 20,
                                    padding: 36
                                },
                                className: "feat-card",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Stars, {
                                                count: featured.stars
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/landing/Testimonials.tsx",
                                                lineNumber: 91,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("blockquote", {
                                                style: {
                                                    fontSize: 19,
                                                    fontWeight: 500,
                                                    color: "#ffffff",
                                                    lineHeight: 1.65,
                                                    margin: "16px 0",
                                                    fontStyle: "normal",
                                                    letterSpacing: "-0.01em"
                                                },
                                                children: [
                                                    "“",
                                                    featured.quote,
                                                    "”"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/landing/Testimonials.tsx",
                                                lineNumber: 92,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                style: {
                                                    fontSize: 14,
                                                    fontWeight: 700,
                                                    color: "#ffffff",
                                                    margin: 0
                                                },
                                                children: featured.name
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/landing/Testimonials.tsx",
                                                lineNumber: 105,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                style: {
                                                    fontSize: 12,
                                                    color: "rgba(255,255,255,0.4)",
                                                    marginTop: 3
                                                },
                                                children: featured.title
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/landing/Testimonials.tsx",
                                                lineNumber: 106,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/landing/Testimonials.tsx",
                                        lineNumber: 90,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                        src: featured.img,
                                        alt: featured.name,
                                        className: "feat-img",
                                        style: {
                                            width: 110,
                                            height: 110,
                                            borderRadius: "50%",
                                            objectFit: "cover",
                                            border: "1px solid rgba(255,255,255,0.12)",
                                            flexShrink: 0
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/landing/Testimonials.tsx",
                                        lineNumber: 108,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/landing/Testimonials.tsx",
                                lineNumber: 74,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "testi-grid",
                                style: {
                                    display: "grid",
                                    gridTemplateColumns: "repeat(2, 1fr)",
                                    gap: 14
                                },
                                children: [
                                    textTestimonials.map((t)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                                            variants: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$motion$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fadeUpVariants"],
                                            whileHover: {
                                                y: -6,
                                                borderColor: "rgba(255,255,255,0.15)"
                                            },
                                            style: {
                                                background: "#0d0d0d",
                                                border: "1px solid rgba(255,255,255,0.07)",
                                                borderRadius: 20,
                                                padding: 28,
                                                display: "flex",
                                                flexDirection: "column",
                                                gap: 14
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Stars, {
                                                    count: t.stars
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/landing/Testimonials.tsx",
                                                    lineNumber: 143,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("blockquote", {
                                                    style: {
                                                        fontSize: 14,
                                                        color: "rgba(255,255,255,0.65)",
                                                        lineHeight: 1.75,
                                                        margin: 0,
                                                        flex: 1,
                                                        letterSpacing: "-0.01em"
                                                    },
                                                    children: [
                                                        "“",
                                                        t.quote,
                                                        "”"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/landing/Testimonials.tsx",
                                                    lineNumber: 144,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 12,
                                                        marginTop: "auto"
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                            src: t.img,
                                                            alt: t.name,
                                                            style: {
                                                                width: 38,
                                                                height: 38,
                                                                borderRadius: "50%",
                                                                objectFit: "cover",
                                                                border: "1px solid rgba(255,255,255,0.09)"
                                                            }
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/landing/Testimonials.tsx",
                                                            lineNumber: 157,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    style: {
                                                                        margin: 0,
                                                                        fontSize: 13,
                                                                        fontWeight: 700,
                                                                        color: "#ffffff"
                                                                    },
                                                                    children: t.name
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/landing/Testimonials.tsx",
                                                                    lineNumber: 163,
                                                                    columnNumber: 21
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    style: {
                                                                        margin: 0,
                                                                        fontSize: 12,
                                                                        color: "rgba(255,255,255,0.38)"
                                                                    },
                                                                    children: t.role
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/landing/Testimonials.tsx",
                                                                    lineNumber: 164,
                                                                    columnNumber: 21
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/landing/Testimonials.tsx",
                                                            lineNumber: 162,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/landing/Testimonials.tsx",
                                                    lineNumber: 156,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, t.name, true, {
                                            fileName: "[project]/src/components/landing/Testimonials.tsx",
                                            lineNumber: 129,
                                            columnNumber: 15
                                        }, this)),
                                    videoTestimonials.map((v)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                                            variants: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$motion$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fadeUpVariants"],
                                            whileHover: {
                                                y: -6,
                                                borderColor: "rgba(255,255,255,0.15)"
                                            },
                                            style: {
                                                background: "#0d0d0d",
                                                border: "1px solid rgba(255,255,255,0.07)",
                                                borderRadius: 20,
                                                overflow: "hidden",
                                                cursor: "pointer",
                                                position: "relative"
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                    src: v.img,
                                                    alt: v.name,
                                                    style: {
                                                        width: "100%",
                                                        height: 180,
                                                        objectFit: "cover",
                                                        display: "block"
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/landing/Testimonials.tsx",
                                                    lineNumber: 184,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        position: "absolute",
                                                        top: 0,
                                                        left: 0,
                                                        right: 0,
                                                        height: 180,
                                                        background: "rgba(0,0,0,0.45)",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center"
                                                    },
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            width: 48,
                                                            height: 48,
                                                            borderRadius: "50%",
                                                            background: "rgba(255,255,255,0.12)",
                                                            border: "1px solid rgba(255,255,255,0.35)",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center"
                                                        },
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                            width: "16",
                                                            height: "16",
                                                            viewBox: "0 0 24 24",
                                                            fill: "white",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                d: "M8 5v14l11-7z"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/landing/Testimonials.tsx",
                                                                lineNumber: 215,
                                                                columnNumber: 23
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/landing/Testimonials.tsx",
                                                            lineNumber: 214,
                                                            columnNumber: 21
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/landing/Testimonials.tsx",
                                                        lineNumber: 202,
                                                        columnNumber: 19
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/landing/Testimonials.tsx",
                                                    lineNumber: 189,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        padding: "14px 20px"
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            style: {
                                                                margin: 0,
                                                                fontSize: 13,
                                                                fontWeight: 700,
                                                                color: "#ffffff"
                                                            },
                                                            children: v.name
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/landing/Testimonials.tsx",
                                                            lineNumber: 220,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            style: {
                                                                margin: 0,
                                                                fontSize: 12,
                                                                color: "rgba(255,255,255,0.38)"
                                                            },
                                                            children: v.role
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/landing/Testimonials.tsx",
                                                            lineNumber: 221,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/landing/Testimonials.tsx",
                                                    lineNumber: 219,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, v.name, true, {
                                            fileName: "[project]/src/components/landing/Testimonials.tsx",
                                            lineNumber: 171,
                                            columnNumber: 15
                                        }, this))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/landing/Testimonials.tsx",
                                lineNumber: 124,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/landing/Testimonials.tsx",
                        lineNumber: 68,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/landing/Testimonials.tsx",
                lineNumber: 45,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("style", {
                children: `
        @media (max-width: 767px) {
          .testi-grid { grid-template-columns: 1fr !important; }
          .feat-img { display: none !important; }
          .feat-card { grid-template-columns: 1fr !important; }
        }
      `
            }, void 0, false, {
                fileName: "[project]/src/components/landing/Testimonials.tsx",
                lineNumber: 229,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/landing/Testimonials.tsx",
        lineNumber: 40,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/components/landing/FAQ.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>FAQ
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$utils$2f$use$2d$in$2d$view$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/utils/use-in-view.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/components/AnimatePresence/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$motion$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/motion.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
const faqs = [
    {
        q: "Do I need design skills to use Brandvertise AI?",
        a: "Not at all. You provide your brand details once and the AI generates professional, on-brand creatives automatically. No Canva, no Photoshop, no design knowledge required."
    },
    {
        q: "How does the AI learn my brand style?",
        a: "During onboarding you upload your logo, define your color palette, choose typography and describe your brand voice. Our Brand Intelligence Engine uses this as persistent context for every piece of content."
    },
    {
        q: "Which social media platforms are supported?",
        a: "We support Instagram, LinkedIn, Twitter/X, Facebook and Pinterest. Each platform gets properly sized assets and platform-native captions. TikTok and YouTube Shorts are on the roadmap."
    },
    {
        q: "Can I edit AI-generated content before it goes live?",
        a: "Absolutely. You can review every post before publishing, edit captions, swap images, regenerate sections, or set up an approval workflow where nothing publishes without your sign-off."
    },
    {
        q: "Is there a free trial? Do I need a credit card?",
        a: "Yes — all plans come with a 14-day free trial. No credit card required to start. You only enter billing information if you decide to upgrade after the trial."
    },
    {
        q: "Can I manage multiple brands on one account?",
        a: "Yes. The Growth plan supports up to 5 brand profiles, and the Agency plan supports unlimited brands. Each brand has its own isolated AI persona, asset library and publishing schedule."
    },
    {
        q: "Is my brand data secure?",
        a: "Your brand data is stored in isolated Firestore collections with role-based access controls. We use Firebase Auth for authentication, Google Cloud Storage for assets, and never use your data to train shared models."
    }
];
function FAQ() {
    const [open, setOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const ref = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const isInView = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$utils$2f$use$2d$in$2d$view$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useInView"])(ref, {
        once: true,
        margin: "-80px"
    });
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        ref: ref,
        id: "faq",
        style: {
            padding: "120px 0",
            background: "#050505"
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: {
                maxWidth: 720,
                margin: "0 auto",
                padding: "0 24px"
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                    initial: "hidden",
                    animate: isInView ? "show" : "hidden",
                    variants: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$motion$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["staggerContainer"],
                    style: {
                        marginBottom: 64,
                        textAlign: "center"
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].span, {
                            variants: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$motion$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fadeUpVariants"],
                            className: "section-tag",
                            children: "FAQs"
                        }, void 0, false, {
                            fileName: "[project]/src/components/landing/FAQ.tsx",
                            lineNumber: 56,
                            columnNumber: 6
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].h2, {
                            variants: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$motion$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fadeUpVariants"],
                            style: {
                                fontSize: "clamp(32px, 4.5vw, 56px)",
                                fontWeight: 800,
                                lineHeight: 1.08,
                                color: "#ffffff",
                                letterSpacing: "-0.04em",
                                margin: 0
                            },
                            children: "Clear answers for your growth."
                        }, void 0, false, {
                            fileName: "[project]/src/components/landing/FAQ.tsx",
                            lineNumber: 59,
                            columnNumber: 6
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/landing/FAQ.tsx",
                    lineNumber: 50,
                    columnNumber: 5
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                    initial: "hidden",
                    animate: isInView ? "show" : "hidden",
                    variants: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$motion$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["staggerContainer"],
                    style: {
                        display: "flex",
                        flexDirection: "column"
                    },
                    children: faqs.map((faq, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                            variants: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$motion$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fadeUpVariants"],
                            style: {
                                borderBottom: "1px solid rgba(255,255,255,0.06)"
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setOpen(open === i ? null : i),
                                    style: {
                                        width: "100%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        gap: 24,
                                        padding: "22px 0",
                                        background: "none",
                                        border: "none",
                                        cursor: "pointer",
                                        textAlign: "left"
                                    },
                                    "aria-expanded": open === i,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 16
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    style: {
                                                        fontSize: 12,
                                                        fontWeight: 600,
                                                        color: "rgba(255,255,255,0.2)",
                                                        flexShrink: 0,
                                                        fontVariantNumeric: "tabular-nums",
                                                        letterSpacing: "0.02em"
                                                    },
                                                    children: String(i + 1).padStart(2, "0")
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/landing/FAQ.tsx",
                                                    lineNumber: 103,
                                                    columnNumber: 10
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    style: {
                                                        fontSize: 15,
                                                        fontWeight: 600,
                                                        color: open === i ? "#ffffff" : "rgba(255,255,255,0.8)",
                                                        lineHeight: 1.4,
                                                        transition: "color 0.2s ease"
                                                    },
                                                    children: faq.q
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/landing/FAQ.tsx",
                                                    lineNumber: 115,
                                                    columnNumber: 10
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/landing/FAQ.tsx",
                                            lineNumber: 102,
                                            columnNumber: 9
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].span, {
                                            animate: {
                                                rotate: open === i ? 45 : 0
                                            },
                                            transition: {
                                                duration: 0.2
                                            },
                                            style: {
                                                flexShrink: 0,
                                                width: 26,
                                                height: 26,
                                                borderRadius: "50%",
                                                border: "1px solid rgba(255,255,255,0.12)",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontSize: 18,
                                                color: "rgba(255,255,255,0.5)"
                                            },
                                            children: "+"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/landing/FAQ.tsx",
                                            lineNumber: 130,
                                            columnNumber: 9
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/landing/FAQ.tsx",
                                    lineNumber: 86,
                                    columnNumber: 8
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                                    initial: false,
                                    children: open === i && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                                        initial: {
                                            height: 0,
                                            opacity: 0
                                        },
                                        animate: {
                                            height: "auto",
                                            opacity: 1
                                        },
                                        exit: {
                                            height: 0,
                                            opacity: 0
                                        },
                                        transition: {
                                            duration: 0.3,
                                            ease: [
                                                0.16,
                                                1,
                                                0.3,
                                                1
                                            ]
                                        },
                                        style: {
                                            overflow: "hidden"
                                        },
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            style: {
                                                fontSize: 14,
                                                color: "rgba(255,255,255,0.5)",
                                                lineHeight: 1.75,
                                                paddingBottom: 22,
                                                paddingLeft: 42,
                                                margin: 0
                                            },
                                            children: faq.a
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/landing/FAQ.tsx",
                                            lineNumber: 162,
                                            columnNumber: 11
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/landing/FAQ.tsx",
                                        lineNumber: 152,
                                        columnNumber: 10
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/landing/FAQ.tsx",
                                    lineNumber: 150,
                                    columnNumber: 8
                                }, this)
                            ]
                        }, i, true, {
                            fileName: "[project]/src/components/landing/FAQ.tsx",
                            lineNumber: 81,
                            columnNumber: 7
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/src/components/landing/FAQ.tsx",
                    lineNumber: 74,
                    columnNumber: 5
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/landing/FAQ.tsx",
            lineNumber: 49,
            columnNumber: 4
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/landing/FAQ.tsx",
        lineNumber: 44,
        columnNumber: 3
    }, this);
}
}),
"[project]/src/components/landing/CTA.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CTA
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$utils$2f$use$2d$in$2d$view$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/utils/use-in-view.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$motion$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/motion.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
const statCards = [
    {
        value: "2,400+",
        label: "Active Brands"
    },
    {
        value: "10M+",
        label: "Posts Generated"
    },
    {
        value: "+47%",
        label: "Avg. Engagement Lift"
    },
    {
        value: "14 days",
        label: "Free Trial"
    }
];
function CTA() {
    const ref = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const isInView = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$utils$2f$use$2d$in$2d$view$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useInView"])(ref, {
        once: true,
        margin: "-80px"
    });
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        ref: ref,
        style: {
            position: "relative",
            overflow: "hidden",
            background: "#050505",
            padding: "120px 0"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "70vw",
                    height: "70vw",
                    maxWidth: 800,
                    maxHeight: 800,
                    background: "radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 65%)",
                    zIndex: 0,
                    pointerEvents: "none"
                }
            }, void 0, false, {
                fileName: "[project]/src/components/landing/CTA.tsx",
                lineNumber: 29,
                columnNumber: 4
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    position: "relative",
                    zIndex: 2,
                    maxWidth: 1280,
                    margin: "0 auto",
                    padding: "0 24px"
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                    initial: "hidden",
                    animate: isInView ? "show" : "hidden",
                    variants: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$motion$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["staggerContainer"],
                    style: {
                        background: "#0d0d0d",
                        border: "1px solid rgba(255,255,255,0.09)",
                        borderRadius: 24,
                        padding: "80px 48px",
                        textAlign: "center"
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].span, {
                            variants: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$motion$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fadeUpVariants"],
                            className: "section-tag",
                            children: "Get Started"
                        }, void 0, false, {
                            fileName: "[project]/src/components/landing/CTA.tsx",
                            lineNumber: 68,
                            columnNumber: 6
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].h2, {
                            variants: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$motion$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fadeUpVariants"],
                            style: {
                                fontSize: "clamp(36px, 5.5vw, 72px)",
                                fontWeight: 800,
                                lineHeight: 1.04,
                                color: "#ffffff",
                                letterSpacing: "-0.04em",
                                maxWidth: 700,
                                margin: "0 auto 16px"
                            },
                            children: "Turn your brand into a sensation."
                        }, void 0, false, {
                            fileName: "[project]/src/components/landing/CTA.tsx",
                            lineNumber: 71,
                            columnNumber: 6
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].p, {
                            variants: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$motion$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fadeUpVariants"],
                            style: {
                                fontSize: 17,
                                color: "rgba(255,255,255,0.45)",
                                lineHeight: 1.72,
                                maxWidth: 500,
                                margin: "0 auto 36px"
                            },
                            children: "Join 2,400+ brands already using Brandvertise AI to generate, schedule and grow their social media — on complete autopilot."
                        }, void 0, false, {
                            fileName: "[project]/src/components/landing/CTA.tsx",
                            lineNumber: 85,
                            columnNumber: 6
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                            variants: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$motion$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fadeUpVariants"],
                            style: {
                                display: "flex",
                                gap: 10,
                                justifyContent: "center",
                                flexWrap: "wrap",
                                marginBottom: 60
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                    href: "#pricing",
                                    className: "btn-primary",
                                    children: [
                                        "Start Free Trial",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                            width: "14",
                                            height: "14",
                                            fill: "none",
                                            viewBox: "0 0 24 24",
                                            stroke: "currentColor",
                                            strokeWidth: 2.5,
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                strokeLinecap: "round",
                                                strokeLinejoin: "round",
                                                d: "M17 8l4 4m0 0l-4 4m4-4H3"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/landing/CTA.tsx",
                                                lineNumber: 119,
                                                columnNumber: 9
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/landing/CTA.tsx",
                                            lineNumber: 111,
                                            columnNumber: 8
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/landing/CTA.tsx",
                                    lineNumber: 109,
                                    columnNumber: 7
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                    href: "#how-it-works",
                                    className: "btn-outline",
                                    children: "See How It Works"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/landing/CTA.tsx",
                                    lineNumber: 126,
                                    columnNumber: 7
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/landing/CTA.tsx",
                            lineNumber: 99,
                            columnNumber: 6
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                height: 1,
                                background: "rgba(255,255,255,0.06)",
                                marginBottom: 48
                            }
                        }, void 0, false, {
                            fileName: "[project]/src/components/landing/CTA.tsx",
                            lineNumber: 132,
                            columnNumber: 6
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                            variants: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$motion$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["staggerContainer"],
                            initial: "hidden",
                            animate: isInView ? "show" : "hidden",
                            className: "cta-stats",
                            style: {
                                display: "grid",
                                gridTemplateColumns: "repeat(4, 1fr)",
                                gap: 1
                            },
                            children: statCards.map((s, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                                    variants: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$motion$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fadeUpVariants"],
                                    style: {
                                        textAlign: "center",
                                        padding: "20px 16px",
                                        borderRight: i < statCards.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none"
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            style: {
                                                fontSize: 36,
                                                fontWeight: 800,
                                                color: "#ffffff",
                                                margin: 0,
                                                letterSpacing: "-0.04em",
                                                lineHeight: 1
                                            },
                                            children: s.value
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/landing/CTA.tsx",
                                            lineNumber: 165,
                                            columnNumber: 9
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            style: {
                                                fontSize: 13,
                                                color: "rgba(255,255,255,0.38)",
                                                margin: "8px 0 0"
                                            },
                                            children: s.label
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/landing/CTA.tsx",
                                            lineNumber: 177,
                                            columnNumber: 9
                                        }, this)
                                    ]
                                }, s.label, true, {
                                    fileName: "[project]/src/components/landing/CTA.tsx",
                                    lineNumber: 153,
                                    columnNumber: 8
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/src/components/landing/CTA.tsx",
                            lineNumber: 141,
                            columnNumber: 6
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/landing/CTA.tsx",
                    lineNumber: 56,
                    columnNumber: 5
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/landing/CTA.tsx",
                lineNumber: 46,
                columnNumber: 4
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("style", {
                children: `
        @media (max-width: 639px) {
          .cta-stats { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `
            }, void 0, false, {
                fileName: "[project]/src/components/landing/CTA.tsx",
                lineNumber: 192,
                columnNumber: 4
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/landing/CTA.tsx",
        lineNumber: 19,
        columnNumber: 3
    }, this);
}
}),
"[project]/src/components/landing/Footer.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Footer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
"use client";
;
const links = {
    Product: [
        "Features",
        "How It Works",
        "Pricing",
        "Changelog",
        "Roadmap"
    ],
    Company: [
        "About Us",
        "Blog",
        "Careers",
        "Press",
        "Contact"
    ],
    Pages: [
        "Case Studies",
        "Team",
        "FAQ",
        "Testimonials"
    ],
    Support: [
        "support@brandvertise.ai",
        "Twitter/X",
        "LinkedIn",
        "Instagram"
    ]
};
const XIcon = ()=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        width: "14",
        height: "14",
        viewBox: "0 0 24 24",
        fill: "currentColor",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
            d: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.736-8.838L1.254 2.25H8.08l4.261 5.635 5.903-5.635Zm-1.161 17.52h1.833L7.084 4.126H5.117z"
        }, void 0, false, {
            fileName: "[project]/src/components/landing/Footer.tsx",
            lineNumber: 12,
            columnNumber: 5
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/src/components/landing/Footer.tsx",
        lineNumber: 11,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
const LinkedInIcon = ()=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        width: "14",
        height: "14",
        viewBox: "0 0 24 24",
        fill: "currentColor",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
            d: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
        }, void 0, false, {
            fileName: "[project]/src/components/landing/Footer.tsx",
            lineNumber: 17,
            columnNumber: 5
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/src/components/landing/Footer.tsx",
        lineNumber: 16,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
const IGIcon = ()=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        width: "14",
        height: "14",
        viewBox: "0 0 24 24",
        fill: "currentColor",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
            d: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"
        }, void 0, false, {
            fileName: "[project]/src/components/landing/Footer.tsx",
            lineNumber: 22,
            columnNumber: 5
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/src/components/landing/Footer.tsx",
        lineNumber: 21,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
function Footer() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("footer", {
        style: {
            background: "#050505",
            borderTop: "1px solid rgba(255,255,255,0.06)"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    maxWidth: 1280,
                    margin: "0 auto",
                    padding: "80px 24px 40px"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "footer-grid",
                        style: {
                            display: "grid",
                            gridTemplateColumns: "1.6fr 1fr 1fr 1fr 1fr",
                            gap: 48,
                            marginBottom: 64
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                        href: "#",
                                        style: {
                                            textDecoration: "none",
                                            display: "inline-block",
                                            marginBottom: 14
                                        },
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                fontWeight: 800,
                                                fontSize: 16,
                                                color: "#ffffff",
                                                letterSpacing: "-0.03em"
                                            },
                                            children: [
                                                "brandvertise",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    style: {
                                                        color: "rgba(255,255,255,0.35)"
                                                    },
                                                    children: ".ai"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/landing/Footer.tsx",
                                                    lineNumber: 49,
                                                    columnNumber: 29
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/landing/Footer.tsx",
                                            lineNumber: 48,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/landing/Footer.tsx",
                                        lineNumber: 47,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        style: {
                                            fontSize: 13,
                                            color: "rgba(255,255,255,0.35)",
                                            lineHeight: 1.75,
                                            maxWidth: 230,
                                            marginBottom: 24
                                        },
                                        children: "The fully automated AI creative agency for fast-growing brands. Generate, schedule and grow — on autopilot."
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/landing/Footer.tsx",
                                        lineNumber: 52,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: "flex",
                                            gap: 8
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(XIcon, {}, "x", false, {
                                                fileName: "[project]/src/components/landing/Footer.tsx",
                                                lineNumber: 56,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(LinkedInIcon, {}, "li", false, {
                                                fileName: "[project]/src/components/landing/Footer.tsx",
                                                lineNumber: 56,
                                                columnNumber: 36
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(IGIcon, {}, "ig", false, {
                                                fileName: "[project]/src/components/landing/Footer.tsx",
                                                lineNumber: 56,
                                                columnNumber: 63
                                            }, this)
                                        ].map((icon, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                href: "#",
                                                style: {
                                                    width: 34,
                                                    height: 34,
                                                    borderRadius: 8,
                                                    border: "1px solid rgba(255,255,255,0.09)",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    color: "rgba(255,255,255,0.35)",
                                                    textDecoration: "none",
                                                    transition: "border-color 0.2s, color 0.2s"
                                                },
                                                onMouseEnter: (e)=>{
                                                    const el = e.currentTarget;
                                                    el.style.borderColor = "rgba(255,255,255,0.3)";
                                                    el.style.color = "#ffffff";
                                                },
                                                onMouseLeave: (e)=>{
                                                    const el = e.currentTarget;
                                                    el.style.borderColor = "rgba(255,255,255,0.09)";
                                                    el.style.color = "rgba(255,255,255,0.35)";
                                                },
                                                children: icon
                                            }, i, false, {
                                                fileName: "[project]/src/components/landing/Footer.tsx",
                                                lineNumber: 57,
                                                columnNumber: 17
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/landing/Footer.tsx",
                                        lineNumber: 55,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/landing/Footer.tsx",
                                lineNumber: 46,
                                columnNumber: 11
                            }, this),
                            Object.entries(links).map(([section, items])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                            style: {
                                                fontSize: 11,
                                                fontWeight: 700,
                                                textTransform: "uppercase",
                                                letterSpacing: "0.1em",
                                                color: "rgba(255,255,255,0.25)",
                                                marginBottom: 18,
                                                margin: "0 0 18px"
                                            },
                                            children: section
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/landing/Footer.tsx",
                                            lineNumber: 92,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                            style: {
                                                margin: 0,
                                                padding: 0,
                                                listStyle: "none",
                                                display: "flex",
                                                flexDirection: "column",
                                                gap: 10
                                            },
                                            children: items.map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                        href: "#",
                                                        style: {
                                                            fontSize: 13,
                                                            color: "rgba(255,255,255,0.38)",
                                                            textDecoration: "none",
                                                            transition: "color 0.2s"
                                                        },
                                                        onMouseEnter: (e)=>{
                                                            e.currentTarget.style.color = "rgba(255,255,255,0.8)";
                                                        },
                                                        onMouseLeave: (e)=>{
                                                            e.currentTarget.style.color = "rgba(255,255,255,0.38)";
                                                        },
                                                        children: item
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/landing/Footer.tsx",
                                                        lineNumber: 108,
                                                        columnNumber: 21
                                                    }, this)
                                                }, item, false, {
                                                    fileName: "[project]/src/components/landing/Footer.tsx",
                                                    lineNumber: 107,
                                                    columnNumber: 19
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/landing/Footer.tsx",
                                            lineNumber: 105,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, section, true, {
                                    fileName: "[project]/src/components/landing/Footer.tsx",
                                    lineNumber: 91,
                                    columnNumber: 13
                                }, this))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/landing/Footer.tsx",
                        lineNumber: 41,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            borderTop: "1px solid rgba(255,255,255,0.05)",
                            paddingTop: 24,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            flexWrap: "wrap",
                            gap: 12
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: {
                                    fontSize: 12,
                                    color: "rgba(255,255,255,0.2)",
                                    margin: 0
                                },
                                children: "© 2026 Brandvertise AI. All rights reserved."
                            }, void 0, false, {
                                fileName: "[project]/src/components/landing/Footer.tsx",
                                lineNumber: 140,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: "flex",
                                    gap: 20
                                },
                                children: [
                                    "Privacy Policy",
                                    "Terms of Service",
                                    "Cookies"
                                ].map((l)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                        href: "#",
                                        style: {
                                            fontSize: 12,
                                            color: "rgba(255,255,255,0.2)",
                                            textDecoration: "none",
                                            transition: "color 0.2s"
                                        },
                                        onMouseEnter: (e)=>{
                                            e.currentTarget.style.color = "rgba(255,255,255,0.5)";
                                        },
                                        onMouseLeave: (e)=>{
                                            e.currentTarget.style.color = "rgba(255,255,255,0.2)";
                                        },
                                        children: l
                                    }, l, false, {
                                        fileName: "[project]/src/components/landing/Footer.tsx",
                                        lineNumber: 145,
                                        columnNumber: 15
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/src/components/landing/Footer.tsx",
                                lineNumber: 143,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/landing/Footer.tsx",
                        lineNumber: 129,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/landing/Footer.tsx",
                lineNumber: 34,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("style", {
                children: `
        @media (max-width: 1023px) {
          .footer-grid { grid-template-columns: 1fr 1fr 1fr !important; }
        }
        @media (max-width: 639px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `
            }, void 0, false, {
                fileName: "[project]/src/components/landing/Footer.tsx",
                lineNumber: 159,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/landing/Footer.tsx",
        lineNumber: 28,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=src_0s6iytc._.js.map