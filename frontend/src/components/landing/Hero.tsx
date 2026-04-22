"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { FlickeringGrid } from "@/components/magicui/flickering-grid";
import { TextReveal } from "@/components/ui/TextReveal";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export default function Hero() {
	const ref = useRef(null);
	// amount: 0 ensures it triggers as soon as ANY part of the section is in view.
	// This matters for above-the-fold content where the element is already visible on load.
	const inView = useInView(ref, { once: true, amount: 0 });
	// Hydration-safe: only animate after client mounts to avoid flash of invisible content
	const [mounted, setMounted] = useState(false);
	useEffect(() => { setMounted(true); }, []);

	return (
		<section
			ref={ref}
			style={{
				background: "#000000",
				paddingTop: 64,
				position: "relative",
				overflow: "hidden",
				paddingBottom: 80,
			}}
		>
			{/* FlickeringGrid background */}
			<FlickeringGrid
				className="absolute inset-0 z-0"
				squareSize={4}
				gridGap={6}
				color="#ffffff"
				maxOpacity={0.12}
				flickerChance={0.08}
			/>

			{/* Radial fade — keeps centre dark so text reads clean */}
			<div
				style={{
					position: "absolute",
					inset: 0,
					zIndex: 1,
					pointerEvents: "none",
					background:
						"radial-gradient(ellipse 80% 60% at 50% 0%, transparent 0%, #000000 75%)",
				}}
			/>

			<div
				style={{
					position: "relative",
					zIndex: 2,
					maxWidth: 1100,
					margin: "0 auto",
					padding: "0 40px",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					textAlign: "center",
					paddingTop: 72,
				}}
			>
				{/* Badge */}
				<motion.div
					initial={mounted ? { opacity: 0, y: 12 } : false}
					animate={inView ? { opacity: 1, y: 0 } : {}}
					transition={{ duration: 0.5, ease: EASE }}
				>
					<span
						style={{
							display: "inline-flex",
							alignItems: "center",
							gap: 8,
							border: "1px solid rgba(255,255,255,0.1)",
							borderRadius: 999,
							padding: "5px 14px 5px 8px",
							fontSize: 12,
							fontWeight: 600,
							color: "rgba(255,255,255,0.45)",
							background: "rgba(255,255,255,0.03)",
							letterSpacing: "0.05em",
						}}
					>
						<span
							style={{
								display: "inline-flex",
								alignItems: "center",
								gap: 4,
								background: "rgba(255,255,255,0.08)",
								color: "rgba(255,255,255,0.7)",
								borderRadius: 999,
								padding: "2px 8px",
								fontSize: 11,
							}}
						>
							<Sparkles size={10} /> NEW
						</span>
						Agent System now live — unlock 3 new AI agents
					</span>
				</motion.div>

				{/* Headline */}
				<h1
					style={{
						fontSize: "clamp(60px, 8.5vw, 120px)",
						fontWeight: 900,
						lineHeight: 1.05,
						letterSpacing: "-0.04em",
						color: "#ffffff",
						margin: "28px 0 0",
						textAlign: "center",
					}}
				>
					<span style={{ display: "block", whiteSpace: "nowrap" }}>
						Your brand&apos;s social media
					</span>
					<span style={{ display: "block", marginTop: "0.04em", whiteSpace: "nowrap" }}>
						on{" "}
						<TextReveal
							text="full autopilot."
							inView={inView}
							delay={0.1}
							stagger={0.05}
							className="highlight"
							style={{ fontStyle: "italic" }}
							gradientCss="linear-gradient(90deg, #ff4ecd, #ff8c00, #ffe600, #00e676, #00cfff, #a259ff, #ff4ecd)"
						/>
					</span>
				</h1>

				{/* Subheadline */}
				<motion.p
					initial={mounted ? { opacity: 0, y: 16 } : false}
					animate={inView ? { opacity: 1, y: 0 } : {}}
					transition={{ delay: 0.18, duration: 0.6, ease: EASE }}
					style={{
						fontSize: "clamp(15px, 1.6vw, 18px)",
						lineHeight: 1.75,
						color: "rgba(255,255,255,0.38)",
						maxWidth: 520,
						margin: "20px auto 0",
					}}
				>
					Brandvertise AI generates on-brand visuals, writes platform-native
					captions, and auto-schedules across all channels — powered by your
					brand DNA.
				</motion.p>

				{/* CTAs */}
				<motion.div
					initial={mounted ? { opacity: 0, y: 14 } : false}
					animate={inView ? { opacity: 1, y: 0 } : {}}
					transition={{ delay: 0.26, duration: 0.6, ease: EASE }}
					style={{
						display: "flex",
						gap: 12,
						flexWrap: "wrap",
						justifyContent: "center",
						marginTop: 36,
					}}
				>
					<a
						href="/auth?tab=signup"
						style={{
							display: "inline-flex",
							alignItems: "center",
							gap: 8,
							background: "#ffffff",
							color: "#000000",
							fontWeight: 700,
							fontSize: 14,
							padding: "14px 28px",
							borderRadius: 14,
							textDecoration: "none",
							transition: "opacity 0.15s",
						}}
						onMouseEnter={(e) =>
							((e.currentTarget as HTMLAnchorElement).style.opacity = "0.88")
						}
						onMouseLeave={(e) =>
							((e.currentTarget as HTMLAnchorElement).style.opacity = "1")
						}
					>
						Start Free Trial <ArrowRight size={14} />
					</a>
					<a
						href="#how-it-works"
						style={{
							display: "inline-flex",
							alignItems: "center",
							gap: 8,
							background: "transparent",
							color: "rgba(255,255,255,0.55)",
							fontWeight: 600,
							fontSize: 14,
							padding: "14px 28px",
							borderRadius: 14,
							textDecoration: "none",
							border: "1px solid rgba(255,255,255,0.1)",
							transition: "all 0.15s",
						}}
						onMouseEnter={(e) => {
							(e.currentTarget as HTMLAnchorElement).style.borderColor =
								"rgba(255,255,255,0.25)";
							(e.currentTarget as HTMLAnchorElement).style.color = "#fff";
						}}
						onMouseLeave={(e) => {
							(e.currentTarget as HTMLAnchorElement).style.borderColor =
								"rgba(255,255,255,0.1)";
							(e.currentTarget as HTMLAnchorElement).style.color =
								"rgba(255,255,255,0.55)";
						}}
					>
						See How It Works
					</a>
				</motion.div>

				{/* Trust line */}
				<motion.div
					initial={mounted ? { opacity: 0 } : false}
					animate={inView ? { opacity: 1 } : {}}
					transition={{ delay: 0.38, duration: 0.6 }}
					style={{
						display: "flex",
						alignItems: "center",
						gap: 16,
						marginTop: 28,
						flexWrap: "wrap",
						justifyContent: "center",
					}}
				>
					<div style={{ display: "flex" }}>
						{[
							"https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&q=80",
							"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&q=80",
							"https://images.unsplash.com/photo-1580489944761-15a19d654956?w=60&q=80",
							"https://images.unsplash.com/photo-1517841905240-472988babdf9?w=60&q=80",
						].map((src, i) => (
							<img
								key={i}
								src={src}
								alt=""
								style={{
									width: 28,
									height: 28,
									borderRadius: "50%",
									border: "2px solid #000000",
									objectFit: "cover",
									marginLeft: i === 0 ? 0 : -9,
								}}
							/>
						))}
					</div>
					<span style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>
						Trusted by{" "}
						<strong style={{ color: "rgba(255,255,255,0.55)", fontWeight: 600 }}>
							2,000+
						</strong>{" "}
						brands · No credit card required
					</span>
				</motion.div>
			</div>
		</section>
	);
}
