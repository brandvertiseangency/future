"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Brain, Zap, Globe, Calendar, BarChart2, Layers } from "lucide-react";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const features = [
	{
		icon: Brain,
		title: "Brand Intelligence",
		desc: "Upload your brand kit once. AI learns your voice, colors and messaging — used in every piece of content forever.",
		color: "#00d4ff",
		wide: true,
		chart: true,
	},
	{
		icon: Zap,
		title: "AI Creative Generation",
		desc: "Generate polished visuals and captions in seconds — on-brand, every time.",
		color: "#7c3aed",
		pills: ["10x faster", "99.9% uptime", "2x ROI"],
	},
	{
		icon: Globe,
		title: "Multi-Platform Publish",
		desc: "Instagram, LinkedIn, Twitter/X, TikTok, Pinterest — one hub.",
		color: "#10b981",
		platforms: true,
	},
	{
		icon: Calendar,
		title: "Smart Scheduling",
		desc: "Posts go live at peak engagement windows, automatically.",
		color: "#f59e0b",
	},
	{
		icon: BarChart2,
		title: "Performance Analytics",
		desc: "Know what's working. Real-time metrics across every channel.",
		color: "#f43f5e",
	},
	{
		icon: Layers,
		title: "Agent System",
		desc: "Unlock specialist agents: Website Builder, Branding Kit, Pitch Decks.",
		color: "#8b5cf6",
		badge: "NEW",
	},
];

const platformPills = [
	"Instagram",
	"LinkedIn",
	"Twitter/X",
	"Facebook",
	"Pinterest",
	"TikTok",
	"YouTube",
	"Threads",
	"Instagram",
	"LinkedIn",
	"Twitter/X",
	"Facebook",
	"Pinterest",
	"TikTok",
	"YouTube",
	"Threads",
];

export default function Features() {
	const ref = useRef(null);
	const isInView = useInView(ref, { once: true, margin: "-80px" });

	return (
		<section
			ref={ref}
			id="features"
			style={{ padding: "120px 0", background: "#050505" }}
		>
			<div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>
				{/* Header */}
				<motion.div
					initial={{ opacity: 0, y: 24 }}
					animate={isInView ? { opacity: 1, y: 0 } : {}}
					transition={{ duration: 0.6, ease: EASE }}
					style={{ marginBottom: 64, maxWidth: 600 }}
				>
					<span
						style={{
							display: "inline-block",
							fontSize: 11,
							fontWeight: 700,
							letterSpacing: "0.12em",
							textTransform: "uppercase",
							color: "#00d4ff",
							marginBottom: 14,
							border: "1px solid rgba(0,212,255,0.25)",
							borderRadius: 999,
							padding: "3px 12px",
							background: "rgba(0,212,255,0.06)",
						}}
					>
						Why Brandvertise?
					</span>
					<h2
						style={{
							fontSize: "clamp(32px, 4vw, 52px)",
							fontWeight: 800,
							lineHeight: 1.08,
							color: "#ffffff",
							letterSpacing: "-0.04em",
							margin: 0,
						}}
					>
						Everything your brand needs to{" "}
						<em
							style={{
								fontStyle: "italic",
								color: "rgba(255,255,255,0.35)",
							}}
						>
							dominate social.
						</em>
					</h2>
				</motion.div>

				{/* Bento grid */}
				<div
					style={{
						display: "grid",
						gridTemplateColumns: "repeat(3, 1fr)",
						gap: 14,
					}}
					className="features-grid"
				>
					{features.map(
						({ icon: Icon, title, desc, color, wide, chart, pills, platforms, badge }, i) => (
							<motion.div
								key={title}
								initial={{ opacity: 0, y: 20 }}
								animate={isInView ? { opacity: 1, y: 0 } : {}}
								transition={{ delay: i * 0.06, duration: 0.5, ease: EASE }}
								whileHover={{ y: -6, transition: { duration: 0.25 } }}
								style={{
									gridColumn: wide ? "span 2" : "span 1",
									background: "rgba(255,255,255,0.02)",
									border: "1px solid rgba(255,255,255,0.07)",
									borderRadius: 20,
									padding: 28,
									display: "flex",
									flexDirection: "column",
									gap: 16,
									overflow: "hidden",
									position: "relative",
									cursor: "default",
									transition: "border-color 0.2s, box-shadow 0.2s",
								}}
								onMouseEnter={(e) => {
									(e.currentTarget as HTMLDivElement).style.borderColor = `${color}30`;
									(e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 40px ${color}08`;
								}}
								onMouseLeave={(e) => {
									(e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.07)";
									(e.currentTarget as HTMLDivElement).style.boxShadow = "none";
								}}
							>
								{/* Top accent line */}
								<div
									style={{
										position: "absolute",
										top: 0,
										left: 0,
										right: 0,
										height: 1,
										background: `linear-gradient(90deg, transparent, ${color}40, transparent)`,
									}}
								/>

								<div
									style={{
										display: "flex",
										alignItems: "flex-start",
										justifyContent: "space-between",
									}}
								>
									<div
										style={{
											width: 42,
											height: 42,
											borderRadius: 12,
											background: `${color}12`,
											border: `1px solid ${color}20`,
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											color,
											flexShrink: 0,
										}}
									>
										<Icon size={19} />
									</div>
									{badge && (
										<span
											style={{
												fontSize: 10,
												fontWeight: 700,
												letterSpacing: "0.08em",
												textTransform: "uppercase",
												background: "rgba(139,92,246,0.15)",
												border: "1px solid rgba(139,92,246,0.3)",
												color: "#a78bfa",
												borderRadius: 999,
												padding: "3px 10px",
											}}
										>
											{badge}
										</span>
									)}
								</div>

								<div>
									<h3
										style={{
											fontSize: 18,
											fontWeight: 700,
											color: "#ffffff",
											letterSpacing: "-0.02em",
											marginBottom: 8,
										}}
									>
										{title}
									</h3>
									<p
										style={{
											fontSize: 13.5,
											color: "rgba(255,255,255,0.45)",
											lineHeight: 1.7,
											margin: 0,
										}}
									>
										{desc}
									</p>
								</div>

								{/* Chart for Brand Intelligence */}
								{chart && (
									<div style={{ marginTop: "auto" }}>
										<p
											style={{
												fontSize: 11,
												color: "rgba(255,255,255,0.28)",
												marginBottom: 10,
												textTransform: "uppercase",
												letterSpacing: "0.08em",
											}}
										>
											Content Performance
										</p>
										<svg
											width="100%"
											height="64"
											viewBox="0 0 320 64"
											fill="none"
										>
											{[18, 36, 26, 54, 42, 68, 58, 72, 80, 76].map(
												(h, idx) => (
													<rect
														key={idx}
														x={idx * 32 + 2}
														y={64 - h * 0.85}
														width={26}
														height={h * 0.85}
														rx={5}
														fill={
															idx === 9
																? "rgba(0,212,255,0.9)"
																: "rgba(255,255,255,0.08)"
														}
													/>
												)
											)}
										</svg>
										<div
											style={{
												display: "flex",
												justifyContent: "space-between",
												alignItems: "center",
												marginTop: 10,
											}}
										>
											<span
												style={{
													fontSize: 30,
													fontWeight: 800,
													color: "#ffffff",
													letterSpacing: "-0.04em",
												}}
											>
												+80%
											</span>
											<span
												style={{
													fontSize: 11,
													fontWeight: 600,
													padding: "3px 11px",
													borderRadius: 999,
													background: "rgba(0,212,255,0.1)",
													border: "1px solid rgba(0,212,255,0.25)",
													color: "#67e8f9",
												}}
											>
												engagement lift
											</span>
										</div>
									</div>
								)}

								{/* Pills */}
								{pills && (
									<div
										style={{
											display: "flex",
											gap: 6,
											flexWrap: "wrap",
											marginTop: "auto",
										}}
									>
										{pills.map((p: string) => (
											<span
												key={p}
												style={{
													fontSize: 11,
													fontWeight: 600,
													borderRadius: 999,
													padding: "3px 11px",
													background: "rgba(124,58,237,0.1)",
													border: "1px solid rgba(124,58,237,0.25)",
													color: "#c4b5fd",
												}}
											>
												{p}
											</span>
										))}
									</div>
								)}

								{/* Platform marquee */}
								{platforms && (
									<div
										style={{
											overflow: "hidden",
											maskImage:
												"linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)",
											marginTop: "auto",
										}}
									>
										<div
											className="animate-marquee-logos"
											style={{
												display: "flex",
												gap: 8,
												width: "max-content",
											}}
										>
											{platformPills.map((p, idx) => (
												<span
													key={idx}
													style={{
														whiteSpace: "nowrap",
														fontSize: 12,
														fontWeight: 500,
														color: "rgba(255,255,255,0.4)",
														border: "1px solid rgba(255,255,255,0.08)",
														borderRadius: 999,
														padding: "3px 11px",
													}}
												>
													{p}
												</span>
											))}
										</div>
									</div>
								)}
							</motion.div>
						)
					)}
				</div>
			</div>

			<style>{`
        @media (max-width: 1023px) { .features-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 639px) { .features-grid { grid-template-columns: 1fr !important; } }
        .features-grid > *:first-child { grid-column: span 1 !important; }
        @media (min-width: 1024px) { .features-grid > *:first-child { grid-column: span 2 !important; } }
      `}</style>
		</section>
	);
}
