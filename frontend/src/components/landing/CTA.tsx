"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Zap } from "lucide-react";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const stats = [
	{ value: "2,400+", label: "Active Brands" },
	{ value: "10M+", label: "Posts Generated" },
	{ value: "+47%", label: "Avg. Engagement" },
	{ value: "14 days", label: "Free Trial" },
];

export default function CTA() {
	const ref = useRef(null);
	const isInView = useInView(ref, { once: true, margin: "-80px" });

	return (
		<section
			ref={ref}
			style={{
				position: "relative",
				overflow: "hidden",
				background: "#050505",
				padding: "120px 0",
			}}
		>
			{/* Center glow */}
			<div
				style={{
					position: "absolute",
					top: "50%",
					left: "50%",
					transform: "translate(-50%,-50%)",
					width: "60vw",
					height: "60vw",
					maxWidth: 700,
					maxHeight: 700,
					background:
						"radial-gradient(ellipse, rgba(0,212,255,0.08) 0%, rgba(124,58,237,0.06) 40%, transparent 70%)",
					zIndex: 0,
					pointerEvents: "none",
				}}
			/>

			<div
				style={{
					position: "relative",
					zIndex: 2,
					maxWidth: 1280,
					margin: "0 auto",
					padding: "0 24px",
				}}
			>
				<motion.div
					initial={{ opacity: 0, y: 24 }}
					animate={isInView ? { opacity: 1, y: 0 } : {}}
					transition={{ duration: 0.7, ease: EASE }}
					style={{
						background: "rgba(255,255,255,0.02)",
						border: "1px solid rgba(255,255,255,0.08)",
						borderRadius: 28,
						padding: "80px 48px",
						textAlign: "center",
						position: "relative",
						overflow: "hidden",
					}}
				>
					<div
						style={{
							position: "absolute",
							top: 0,
							left: 0,
							right: 0,
							height: 1,
							background:
								"linear-gradient(90deg, transparent, rgba(0,212,255,0.5), rgba(124,58,237,0.5), transparent)",
						}}
					/>

					<span
						style={{
							display: "inline-flex",
							alignItems: "center",
							gap: 6,
							fontSize: 11,
							fontWeight: 700,
							letterSpacing: "0.12em",
							textTransform: "uppercase",
							color: "#00d4ff",
							marginBottom: 20,
							border: "1px solid rgba(0,212,255,0.25)",
							borderRadius: 999,
							padding: "3px 12px",
							background: "rgba(0,212,255,0.06)",
						}}
					>
						<Zap size={10} className="fill-current" /> Get Started
					</span>

					<h2
						style={{
							fontSize: "clamp(36px, 5vw, 68px)",
							fontWeight: 900,
							lineHeight: 1.04,
							color: "#ffffff",
							letterSpacing: "-0.04em",
							maxWidth: 680,
							margin: "0 auto 16px",
						}}
					>
						Turn your brand into a{" "}
						<em
							style={{
								fontStyle: "italic",
								background:
									"linear-gradient(90deg,#00d4ff,#7c3aed)",
								WebkitBackgroundClip: "text",
								WebkitTextFillColor: "transparent",
							}}
						>
							sensation.
						</em>
					</h2>

					<p
						style={{
							fontSize: 16,
							color: "rgba(255,255,255,0.42)",
							lineHeight: 1.75,
							maxWidth: 500,
							margin: "0 auto 36px",
						}}
					>
						Join 2,400+ brands already using Brandvertise AI to generate,
						schedule and grow their social media — on complete autopilot.
					</p>

					<div
						style={{
							display: "flex",
							gap: 12,
							justifyContent: "center",
							flexWrap: "wrap",
							marginBottom: 64,
						}}
					>
						<a
							href="/auth?tab=signup"
							style={{
								display: "inline-flex",
								alignItems: "center",
								gap: 8,
								background: "#ffffff",
								color: "#000",
								fontWeight: 700,
								fontSize: 14,
								padding: "14px 28px",
								borderRadius: 14,
								textDecoration: "none",
								transition: "all 0.2s",
							}}
							onMouseEnter={(e) => {
								(e.currentTarget as HTMLAnchorElement).style.background =
									"rgba(255,255,255,0.88)";
							}}
							onMouseLeave={(e) => {
								(e.currentTarget as HTMLAnchorElement).style.background =
									"#ffffff";
							}}
						>
							Start Free Trial <ArrowRight size={14} />
						</a>
						<a
							href="#how-it-works"
							style={{
								display: "inline-flex",
								alignItems: "center",
								gap: 8,
								background: "rgba(255,255,255,0.04)",
								color: "rgba(255,255,255,0.65)",
								fontWeight: 600,
								fontSize: 14,
								padding: "14px 28px",
								borderRadius: 14,
								textDecoration: "none",
								border: "1px solid rgba(255,255,255,0.1)",
								transition: "all 0.2s",
							}}
							onMouseEnter={(e) => {
								(e.currentTarget as HTMLAnchorElement).style.color = "#fff";
							}}
							onMouseLeave={(e) => {
								(e.currentTarget as HTMLAnchorElement).style.color =
									"rgba(255,255,255,0.65)";
							}}
						>
							See How It Works
						</a>
					</div>

					<div
						style={{
							height: 1,
							background: "rgba(255,255,255,0.06)",
							marginBottom: 48,
						}}
					/>

					<div
						style={{
							display: "grid",
							gridTemplateColumns: "repeat(4, 1fr)",
							gap: 1,
						}}
						className="cta-stats"
					>
						{stats.map((s, i) => (
							<div
								key={s.label}
								style={{
									textAlign: "center",
									padding: "20px 16px",
									borderRight:
										i < stats.length - 1
											? "1px solid rgba(255,255,255,0.06)"
											: "none",
								}}
							>
								<p
									style={{
										fontSize: "clamp(28px, 3.5vw, 40px)",
										fontWeight: 900,
										color: "#ffffff",
										margin: 0,
										letterSpacing: "-0.04em",
										lineHeight: 1,
									}}
								>
									{s.value}
								</p>
								<p
									style={{
										fontSize: 13,
										color: "rgba(255,255,255,0.35)",
										margin: "8px 0 0",
									}}
								>
									{s.label}
								</p>
							</div>
						))}
					</div>
				</motion.div>
			</div>

			<style>{`@media (max-width: 639px) { .cta-stats { grid-template-columns: repeat(2, 1fr) !important; } }`}</style>
		</section>
	);
}
