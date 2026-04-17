"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { fadeUpVariants, staggerContainer, EASE } from "@/lib/motion";

const caseStudies = [
	{
		stats: ["400%", "15K+", "25M+"],
		labels: ["ROI", "New Users", "Impressions"],
		client: "01",
		name: "Bloom Beauty Co.",
		tag: "E-commerce",
		img: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80",
	},
	{
		stats: ["3.8×", "12K+", "+112%"],
		labels: ["ROAS", "Signups", "Engagement"],
		client: "02",
		name: "TechScale SaaS",
		tag: "B2B SaaS",
		img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80",
	},
	{
		stats: ["10×", "80K+", "€2M+"],
		labels: ["Faster", "Followers", "Revenue"],
		client: "03",
		name: "Wanderlust Agency",
		tag: "Agency",
		img: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&q=80",
	},
	{
		stats: ["5×", "200K+", "+320%"],
		labels: ["Content Output", "Reach", "Sales Lift"],
		client: "04",
		name: "Spice Trail Foods",
		tag: "FMCG",
		img: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80",
	},
];

export default function Portfolio() {
	const ref = useRef(null);
	const isInView = useInView(ref, { once: true, margin: "-80px" });

	return (
		<section
			ref={ref}
			id="case-studies"
			style={{ padding: "120px 0", background: "#050505" }}
		>
			<div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>
				<motion.div
					initial="hidden"
					animate={isInView ? "show" : "hidden"}
					variants={staggerContainer}
					style={{ marginBottom: 64, textAlign: "center" }}
				>
					<motion.span variants={fadeUpVariants} className="section-tag">
						Case Studies
					</motion.span>
					<motion.h2
						variants={fadeUpVariants}
						style={{
							fontSize: "clamp(32px, 4.5vw, 56px)",
							fontWeight: 800,
							lineHeight: 1.08,
							color: "#ffffff",
							letterSpacing: "-0.04em",
							margin: 0,
						}}
					>
						Results that speak for themselves.
					</motion.h2>
				</motion.div>

				{/* Partner logos strip */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={isInView ? { opacity: 1 } : { opacity: 0 }}
					transition={{ delay: 0.3, duration: 0.6 }}
					style={{
						display: "flex",
						justifyContent: "center",
						gap: 40,
						flexWrap: "wrap",
						marginBottom: 60,
					}}
				>
					{["Bloom Beauty", "TechScale", "Wanderlust", "Spice Trail", "CloudNest"].map(
						(b) => (
							<span
								key={b}
								style={{
									fontSize: 13,
									fontWeight: 700,
									color: "rgba(255,255,255,0.2)",
									letterSpacing: "-0.01em",
								}}
							>
								{b}
							</span>
						)
					)}
				</motion.div>

				{/* 2×2 case study grid */}
				<motion.div
					initial="hidden"
					animate={isInView ? "show" : "hidden"}
					variants={staggerContainer}
					className="case-grid"
					style={{
						display: "grid",
						gridTemplateColumns: "repeat(2, 1fr)",
						gap: 14,
					}}
				>
					{caseStudies.map((cs, i) => (
						<motion.div
							key={i}
							variants={fadeUpVariants}
							whileHover={{
								y: -6,
								borderColor: "rgba(255,255,255,0.15)",
							}}
							transition={{ duration: 0.3, ease: EASE }}
							style={{
								background: "#0d0d0d",
								border: "1px solid rgba(255,255,255,0.07)",
								borderRadius: 20,
								overflow: "hidden",
								cursor: "pointer",
							}}
						>
							{/* Stats row */}
							<div
								style={{
									display: "flex",
									gap: 28,
									padding: "24px 28px 0",
								}}
							>
								{cs.stats.map((s, j) => (
									<div key={j}>
										<p
											style={{
												fontSize: 24,
												fontWeight: 800,
												color: "#ffffff",
												margin: 0,
												letterSpacing: "-0.03em",
												lineHeight: 1,
											}}
										>
											{s}
										</p>
										<p
											style={{
												fontSize: 11,
												color: "rgba(255,255,255,0.35)",
												margin: "4px 0 0",
												fontWeight: 500,
											}}
										>
											{cs.labels[j]}
										</p>
									</div>
								))}
							</div>

							{/* Client info */}
							<div
								style={{
									display: "flex",
									alignItems: "center",
									gap: 10,
									padding: "14px 28px",
								}}
							>
								<span
									style={{
										fontSize: 11,
										color: "rgba(255,255,255,0.25)",
										fontWeight: 700,
									}}
								>
									{cs.client}
								</span>
								<span
									style={{
										fontSize: 14,
										fontWeight: 700,
										color: "#ffffff",
									}}
								>
									{cs.name}
								</span>
								<span
									style={{
										marginLeft: "auto",
										border: "1px solid rgba(255,255,255,0.1)",
										borderRadius: 999,
										padding: "2px 11px",
										fontSize: 10,
										fontWeight: 600,
										color: "rgba(255,255,255,0.4)",
										letterSpacing: "0.04em",
									}}
								>
									{cs.tag}
								</span>
							</div>

							{/* Image */}
							<div
								style={{
									position: "relative",
									margin: "0 14px 14px",
									borderRadius: 12,
									overflow: "hidden",
								}}
							>
								<img
									src={cs.img}
									alt={cs.name}
									style={{
										width: "100%",
										height: 170,
										objectFit: "cover",
										display: "block",
									}}
								/>
								<div
									style={{
										position: "absolute",
										inset: 0,
										background: "rgba(0,0,0,0.4)",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
									}}
								>
									<div
										style={{
											width: 44,
											height: 44,
											borderRadius: "50%",
											background: "rgba(255,255,255,0.1)",
											border: "1px solid rgba(255,255,255,0.3)",
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
										}}
									>
										<svg width="15" height="15" viewBox="0 0 24 24" fill="white">
											<path d="M8 5v14l11-7z" />
										</svg>
									</div>
								</div>
							</div>
						</motion.div>
					))}
				</motion.div>

				{/* Big stats */}
				<motion.div
					initial="hidden"
					animate={isInView ? "show" : "hidden"}
					variants={staggerContainer}
					style={{
						display: "flex",
						gap: 14,
						marginTop: 60,
						justifyContent: "center",
						flexWrap: "wrap",
					}}
				>
					{[
						{ num: "500K+", label: "Active Users" },
						{ num: "$2M+", label: "Revenue Generated" },
					].map((stat) => (
						<motion.div
							key={stat.num}
							variants={fadeUpVariants}
							whileHover={{ y: -4 }}
							transition={{ duration: 0.3, ease: EASE }}
							style={{
								background: "#0d0d0d",
								border: "1px solid rgba(255,255,255,0.07)",
								borderRadius: 20,
								textAlign: "center",
								padding: "44px 60px",
								flex: "1 1 280px",
							}}
						>
							<p
								style={{
									fontSize: "clamp(48px, 5.5vw, 72px)",
									fontWeight: 800,
									color: "#ffffff",
									letterSpacing: "-0.05em",
									lineHeight: 1,
									marginBottom: 10,
								}}
							>
								{stat.num}
							</p>
							<p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>
								{stat.label}
							</p>
						</motion.div>
					))}
				</motion.div>

				{/* Rating badge */}
				<motion.div
					initial={{ opacity: 0, y: 16 }}
					animate={
						isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }
					}
					transition={{ delay: 0.5, duration: 0.5, ease: EASE }}
					style={{ textAlign: "center", marginTop: 28 }}
				>
					<span
						style={{
							display: "inline-flex",
							alignItems: "center",
							gap: 8,
							border: "1px solid rgba(255,255,255,0.1)",
							borderRadius: 999,
							padding: "7px 18px",
							fontSize: 13,
							color: "rgba(255,255,255,0.55)",
						}}
					>
						<svg width="13" height="13" viewBox="0 0 24 24" fill="#e8e0d0">
							<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
						</svg>
						4.9/5 · Trusted by 1,000+ businesses
					</span>
				</motion.div>
			</div>

			<style>{`
        @media (max-width: 767px) {
          .case-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
		</section>
	);
}
