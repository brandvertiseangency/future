"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";

const navLinks = [
	{ label: "Features", href: "#features" },
	{ label: "How It Works", href: "#how-it-works" },
	{ label: "Pricing", href: "/pricing" },
	{ label: "FAQ", href: "#faq" },
];

export default function Navbar() {
	const [open, setOpen] = useState(false);
	const [scrolled, setScrolled] = useState(false);
	const [activeLink, setActiveLink] = useState("Features");

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 24);
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	useEffect(() => {
		document.body.style.overflow = open ? "hidden" : "";
		return () => { document.body.style.overflow = ""; };
	}, [open]);

	return (
		<>
			<style>{`
				@keyframes spin-border {
					0%   { background-position: 0% 50%; }
					50%  { background-position: 100% 50%; }
					100% { background-position: 0% 50%; }
				}
				.nav-glow-border {
					position: relative;
					border-radius: 9999px;
					padding: 1.5px;
					background: linear-gradient(
						270deg,
						rgba(255,255,255,0.03),
						rgba(255,255,255,0.9),
						rgba(255,255,255,0.08),
						rgba(255,255,255,0.6),
						rgba(255,255,255,0.03)
					);
					background-size: 300% 300%;
					animation: spin-border 4s ease infinite;
				}
				.nav-glow-inner {
					border-radius: 9999px;
					background: rgba(10,10,10,0.92);
					backdrop-filter: blur(20px);
					-webkit-backdrop-filter: blur(20px);
				}
			`}</style>

			<motion.header
				initial={false}
				animate={{ y: 0, opacity: 1 }}
				transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
				className="fixed inset-x-0 top-0 z-50 h-16 flex items-center"
			>
				<div className="max-w-[1280px] mx-auto px-6 w-full flex items-center justify-between">

					{/* Logo — left, outside pill */}
					<Link href="/" className="flex items-center no-underline flex-shrink-0">
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							src="/Brandvertise-Light-Logo.webp"
							alt="Brandvertise"
							style={{ height: 38, width: "auto" }}
						/>
					</Link>

					{/* Center pill nav — desktop only */}
					<div className="hidden md:block nav-glow-border">
						<div className="nav-glow-inner flex items-center gap-1 px-2 py-1.5">
							{navLinks.map((l) => {
								const isActive = activeLink === l.label;
								return (
									<a
										key={l.href}
										href={l.href}
										onClick={() => setActiveLink(l.label)}
										className="no-underline relative px-4 py-1.5 rounded-full text-[13.5px] font-medium transition-all duration-200"
										style={{
											color: isActive ? "#000" : "rgba(255,255,255,0.55)",
											background: isActive ? "#ffffff" : "transparent",
										}}
									>
										{l.label}
									</a>
								);
							})}
						</div>
					</div>

					{/* Auth — right, outside pill */}
					<div className="hidden md:flex items-center gap-2 flex-shrink-0">
						<Link
							href="/auth"
							className="text-[13.5px] font-medium text-white/55 hover:text-white px-4 py-2 rounded-lg transition-all duration-150 no-underline"
						>
							Log in
						</Link>
						<Link
							href="/auth?tab=signup"
							className="no-underline flex items-center gap-1.5 px-4 py-2 rounded-full text-[13.5px] font-semibold transition-all duration-150"
							style={{
								color: "#ffffff",
								border: "1.5px solid rgba(255,255,255,0.5)",
								background: "transparent",
							}}
							onMouseEnter={e => {
								(e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.08)";
							}}
							onMouseLeave={e => {
								(e.currentTarget as HTMLAnchorElement).style.background = "transparent";
							}}
						>
							Get started
						</Link>
					</div>

					{/* Mobile hamburger */}
					<button
						className="md:hidden text-white p-2 rounded-lg hover:bg-white/5 transition-all"
						onClick={() => setOpen(true)}
						aria-label="Open menu"
					>
						<Menu size={20} />
					</button>
				</div>
			</motion.header>

			{/* Mobile menu */}
			<AnimatePresence>
				{open && (
					<>
						<motion.div
							initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
							className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md"
							onClick={() => setOpen(false)}
						/>
						<motion.div
							initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
							transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
							className="fixed right-0 top-0 bottom-0 z-50 w-72 flex flex-col"
							style={{ background: "#0a0a0a", borderLeft: "1px solid rgba(255,255,255,0.08)" }}
						>
							<div className="flex items-center justify-between px-5 h-16 border-b border-white/6">
								{/* eslint-disable-next-line @next/next/no-img-element */}
								<img src="/Brandvertise-Light-Logo.webp" alt="Brandvertise" style={{ height: 24, width: "auto" }} />
								<button onClick={() => setOpen(false)} className="text-white/50 hover:text-white transition-colors p-1">
									<X size={18} />
								</button>
							</div>
							<nav className="flex-1 p-4 flex flex-col gap-1">
								{navLinks.map((l) => (
									<a
										key={l.href} href={l.href} onClick={() => setOpen(false)}
										className="text-[14px] font-medium text-white/60 hover:text-white px-4 py-3 rounded-xl hover:bg-white/5 transition-all no-underline"
									>
										{l.label}
									</a>
								))}
							</nav>
							<div className="p-4 border-t border-white/6 flex flex-col gap-2">
								<Link href="/auth" className="block text-center px-4 py-3 rounded-xl text-[14px] font-medium text-white/60 hover:bg-white/5 transition-all no-underline">
									Log in
								</Link>
								<Link href="/auth?tab=signup" className="block text-center px-4 py-3 rounded-full text-[14px] font-semibold no-underline"
									style={{ color: "#ffffff", border: "1.5px solid rgba(255,255,255,0.5)" }}>
									Get started
								</Link>
							</div>
						</motion.div>
					</>
				)}
			</AnimatePresence>
		</>
	);
}
