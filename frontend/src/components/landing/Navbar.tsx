"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

const navLinks = [
	{ label: "Features", href: "#features" },
	{ label: "How It Works", href: "#how-it-works" },
	{ label: "Pricing", href: "/pricing" },
	{ label: "FAQ", href: "#faq" },
];

export default function Navbar() {
	const [open, setOpen] = useState(false);
	const [scrolled, setScrolled] = useState(false);

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 24);
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	useEffect(() => {
		document.body.style.overflow = open ? "hidden" : "";
		return () => {
			document.body.style.overflow = "";
		};
	}, [open]);

	return (
		<>
			<motion.header
				initial={{ y: -16, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
				style={{
					position: "fixed",
					inset: "0 0 auto 0",
					zIndex: 50,
					height: 64,
					backdropFilter: scrolled ? "blur(20px)" : "blur(0px)",
					WebkitBackdropFilter: scrolled ? "blur(20px)" : "blur(0px)",
					background: scrolled ? "rgba(5,5,5,0.9)" : "transparent",
					borderBottom: scrolled
						? "1px solid rgba(255,255,255,0.06)"
						: "1px solid transparent",
					display: "flex",
					alignItems: "center",
					transition:
						"background 0.4s ease, border-color 0.4s ease, backdrop-filter 0.4s ease",
				}}
			>
				<nav
					style={{
						maxWidth: 1280,
						margin: "0 auto",
						padding: "0 24px",
						width: "100%",
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
					}}
				>
					{/* Logo */}
					<Link
						href="/"
						style={{
							textDecoration: "none",
							display: "flex",
							alignItems: "center",
							gap: 8,
						}}
					>
						<span
							style={{
								fontWeight: 800,
								fontSize: 17,
								color: "#ffffff",
								letterSpacing: "-0.03em",
							}}
						>
							brandvertise
							<span style={{ color: "rgba(255,255,255,0.4)" }}>.ai</span>
						</span>
					</Link>

					{/* Desktop nav links */}
					<div
						className="hidden md:flex"
						style={{ gap: 4, alignItems: "center" }}
					>
						{navLinks.map((l) => (
							<a
								key={l.href}
								href={l.href}
								style={{
									fontSize: 13.5,
									fontWeight: 500,
									color: "rgba(255,255,255,0.55)",
									textDecoration: "none",
									padding: "6px 14px",
									borderRadius: 8,
									transition: "color 0.2s ease, background 0.2s ease",
								}}
								onMouseEnter={(e) => {
									(e.currentTarget as HTMLAnchorElement).style.color = "#ffffff";
									(e.currentTarget as HTMLAnchorElement).style.background =
										"rgba(255,255,255,0.06)";
								}}
								onMouseLeave={(e) => {
									(e.currentTarget as HTMLAnchorElement).style.color =
										"rgba(255,255,255,0.55)";
									(e.currentTarget as HTMLAnchorElement).style.background =
										"transparent";
								}}
							>
								{l.label}
							</a>
						))}
					</div>

					{/* Desktop CTA */}
					<div
						className="hidden md:flex"
						style={{ gap: 10, alignItems: "center" }}
					>
						<ThemeToggle />
						<Link
							href="/auth"
							style={{
								fontSize: 13.5,
								fontWeight: 500,
								color: "rgba(255,255,255,0.5)",
								textDecoration: "none",
								padding: "8px 16px",
								borderRadius: 999,
								transition: "color 0.2s ease",
							}}
							onMouseEnter={(e) => {
								(e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.9)";
							}}
							onMouseLeave={(e) => {
								(e.currentTarget as HTMLAnchorElement).style.color =
									"rgba(255,255,255,0.5)";
							}}
						>
							Log in
						</Link>
						<Link
							href="/auth?tab=signup"
							className="gradient-border"
							style={{
								color: "#ffffff",
								fontWeight: 600,
								fontSize: 13.5,
								padding: "8px 18px",
								borderRadius: 999,
								textDecoration: "none",
								transition: "background 0.2s ease",
								display: "inline-block",
							}}
							onMouseEnter={(e) => {
								(e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.07)";
							}}
							onMouseLeave={(e) => {
								(e.currentTarget as HTMLAnchorElement).style.background = "";
							}}
						>
							Get Started
						</Link>
					</div>

					{/* Mobile hamburger */}
					<button
						className="md:hidden"
						onClick={() => setOpen(true)}
						style={{
							background: "none",
							border: "none",
							color: "#ffffff",
							cursor: "pointer",
							padding: 8,
							display: "flex",
						}}
						aria-label="Open menu"
					>
						<Menu size={20} />
					</button>
				</nav>
			</motion.header>

			{/* Mobile menu overlay */}
			<AnimatePresence>
				{open && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2 }}
						style={{
							position: "fixed",
							inset: 0,
							zIndex: 99,
							background: "rgba(0,0,0,0.5)",
							backdropFilter: "blur(4px)",
						}}
						onClick={() => setOpen(false)}
					/>
				)}
			</AnimatePresence>

			<AnimatePresence>
				{open && (
					<motion.div
						initial={{ x: "100%" }}
						animate={{ x: 0 }}
						exit={{ x: "100%" }}
						transition={{ type: "spring", stiffness: 300, damping: 30 }}
						style={{
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
							gap: 8,
						}}
					>
						<div
							style={{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
								marginBottom: 32,
							}}
						>
							<span
								style={{
									fontWeight: 800,
									fontSize: 17,
									color: "#ffffff",
									letterSpacing: "-0.03em",
								}}
							>
								brandvertise
								<span style={{ color: "rgba(255,255,255,0.4)" }}>.ai</span>
							</span>
							<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
								<ThemeToggle />
								<button
									onClick={() => setOpen(false)}
									style={{
										background: "none",
										border: "none",
										color: "rgba(255,255,255,0.5)",
										cursor: "pointer",
										padding: 4,
									}}
									aria-label="Close menu"
								>
									<X size={20} />
								</button>
							</div>
						</div>

						{navLinks.map((l, i) => (
							<motion.a
								key={l.href}
								href={l.href}
								initial={{ opacity: 0, x: 20 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ delay: 0.05 * i, ease: [0.16, 1, 0.3, 1] }}
								onClick={() => setOpen(false)}
								style={{
									fontSize: 16,
									fontWeight: 500,
									color: "rgba(255,255,255,0.65)",
									textDecoration: "none",
									padding: "12px 14px",
									borderRadius: 8,
									transition: "color 0.2s ease, background 0.2s ease",
								}}
								onMouseEnter={(e) => {
									(e.currentTarget as HTMLAnchorElement).style.color = "#ffffff";
									(e.currentTarget as HTMLAnchorElement).style.background =
										"rgba(255,255,255,0.06)";
								}}
								onMouseLeave={(e) => {
									(e.currentTarget as HTMLAnchorElement).style.color =
										"rgba(255,255,255,0.65)";
									(e.currentTarget as HTMLAnchorElement).style.background =
										"transparent";
								}}
							>
								{l.label}
							</motion.a>
						))}

						<div
							style={{
								marginTop: "auto",
								display: "flex",
								flexDirection: "column",
								gap: 10,
							}}
						>
							<Link
								href="/auth"
								onClick={() => setOpen(false)}
								style={{
									color: "rgba(255,255,255,0.55)",
									fontWeight: 600,
									fontSize: 14,
									padding: "12px 20px",
									borderRadius: 10,
									textDecoration: "none",
									textAlign: "center",
									border: "1px solid rgba(255,255,255,0.1)",
									display: "block",
								}}
							>
								Log in
							</Link>
							<Link
								href="/auth?tab=signup"
								onClick={() => setOpen(false)}
								style={{
									background: "#ffffff",
									color: "#000000",
									fontWeight: 700,
									fontSize: 14,
									padding: "12px 20px",
									borderRadius: 10,
									textDecoration: "none",
									textAlign: "center",
									display: "block",
								}}
							>
								Get Started Free
							</Link>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
}
