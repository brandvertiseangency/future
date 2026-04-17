"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { fadeUpVariants, staggerContainer } from "@/lib/motion";

const statCards = [
	{ value: "2,400+", label: "Active Brands" },
	{ value: "10M+", label: "Posts Generated" },
	{ value: "+47%", label: "Avg. Engagement Lift" },
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
			{/* Radial ambient glow */}
			<div
				style={{
					position: "absolute",
					top: "50%",
					left: "50%",
					transform: "translate(-50%, -50%)",
					width: "70vw",
					height: "70vw",
					maxWidth: 800,
					maxHeight: 800,
					background:
						"radial-gradient(ellipse, rgba(139,92,246,0.18) 0%, rgba(59,130,246,0.08) 50%, transparent 70%)",
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
				{/* Big bordered box */}
				<motion.div
					initial="hidden"
					animate={isInView ? "show" : "hidden"}
					variants={staggerContainer}
					className="gradient-border noise-overlay"
					style={{
						padding: "80px 48px",
						textAlign: "center",
						position: "relative",
						overflow: "hidden",
					}}
				>
					<motion.span variants={fadeUpVariants} className="section-tag">
						Get Started
					</motion.span>
					<motion.h2
						variants={fadeUpVariants}
						style={{
							fontSize: "clamp(36px, 5.5vw, 72px)",
							fontWeight: 800,
							lineHeight: 1.04,
							color: "#ffffff",
							letterSpacing: "-0.04em",
							maxWidth: 700,
							margin: "0 auto 16px",
						}}
					>
						Turn your brand into a <em className="accent">sensation.</em>
					</motion.h2>
					<motion.p
						variants={fadeUpVariants}
						style={{
							fontSize: 17,
							color: "rgba(255,255,255,0.45)",
							lineHeight: 1.72,
							maxWidth: 500,
							margin: "0 auto 36px",
						}}
					>
						Join 2,400+ brands already using Brandvertise AI to generate,
						schedule and grow their social media — on complete autopilot.
					</motion.p>

					<motion.div
						variants={fadeUpVariants}
						style={{
							display: "flex",
							gap: 10,
							justifyContent: "center",
							flexWrap: "wrap",
							marginBottom: 60,
						}}
					>
						<a href="/pricing" className="btn-primary">
							Start Free Trial
							<svg
								width="14"
								height="14"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								strokeWidth={2.5}
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M17 8l4 4m0 0l-4 4m4-4H3"
								/>
							</svg>
						</a>
						<a href="#how-it-works" className="btn-outline">
							See How It Works
						</a>
					</motion.div>

					{/* Divider */}
					<div
						style={{
							height: 1,
							background: "rgba(255,255,255,0.06)",
							marginBottom: 48,
						}}
					/>

					{/* Stat cards */}
					<motion.div
						variants={staggerContainer}
						initial="hidden"
						animate={isInView ? "show" : "hidden"}
						className="cta-stats"
						style={{
							display: "grid",
							gridTemplateColumns: "repeat(4, 1fr)",
							gap: 1,
						}}
					>
						{statCards.map((s, i) => (
							<motion.div
								key={s.label}
								variants={fadeUpVariants}
								style={{
									textAlign: "center",
									padding: "20px 16px",
									borderRight:
										i < statCards.length - 1
											? "1px solid rgba(255,255,255,0.06)"
											: "none",
								}}
							>
								<p
									style={{
										fontSize: 36,
										fontWeight: 800,
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
										color: "rgba(255,255,255,0.38)",
										margin: "8px 0 0",
									}}
								>
									{s.label}
								</p>
							</motion.div>
						))}
					</motion.div>
				</motion.div>
			</div>

			<style>{`
        @media (max-width: 639px) {
          .cta-stats { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
		</section>
	);
}
