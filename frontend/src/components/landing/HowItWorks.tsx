"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Upload, Brain, Wand2, CalendarCheck } from "lucide-react";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const steps = [
	{
		num: "01",
		icon: Upload,
		title: "Onboard Your Brand",
		desc: "Upload your logo, colours, fonts, tone and target audience. Takes 5 minutes. Works forever.",
		tags: ["Fast Setup", "No-Code"],
		color: "#10b981",
	},
	{
		num: "02",
		icon: Brain,
		title: "AI Builds Your Strategy",
		desc: "The Content Strategy Engine analyses your brand, industry and competitors — full monthly plan generated automatically.",
		tags: ["AI-Powered", "Auto Strategy"],
		color: "#00d4ff",
	},
	{
		num: "03",
		icon: Wand2,
		title: "Creatives Are Generated",
		desc: "AI designs on-brand visuals and writes captions, hashtags, CTAs for each platform — in seconds.",
		tags: ["Instant Output", "On-Brand"],
		color: "#7c3aed",
	},
	{
		num: "04",
		icon: CalendarCheck,
		title: "Review & Auto-Schedule",
		desc: "Approve in one click or go full autopilot. Posts publish at peak engagement times automatically.",
		tags: ["Auto-Publish", "Full Autopilot"],
		color: "#f59e0b",
	},
];

export default function HowItWorks() {
	const ref = useRef(null);
	const isInView = useInView(ref, { once: true, margin: "-80px" });

	return (
		<section
			ref={ref}
			id="how-it-works"
			style={{ padding: "120px 0", background: "#050505" }}
		>
			<div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>
				<motion.div
					initial={{ opacity: 0, y: 24 }}
					animate={isInView ? { opacity: 1, y: 0 } : {}}
					transition={{ duration: 0.6, ease: EASE }}
					style={{ marginBottom: 72 }}
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
						Our Process
					</span>
					<h2
						style={{
							fontSize: "clamp(32px, 4vw, 52px)",
							fontWeight: 800,
							lineHeight: 1.08,
							color: "#ffffff",
							letterSpacing: "-0.04em",
							margin: 0,
							maxWidth: 520,
						}}
					>
						From onboarding to{" "}
						<em
							style={{
								fontStyle: "italic",
								color: "rgba(255,255,255,0.3)",
							}}
						>
							full growth.
						</em>
					</h2>
				</motion.div>

				<div
					style={{
						display: "grid",
						gridTemplateColumns: "repeat(4, 1fr)",
						gap: 14,
						position: "relative",
					}}
					className="hiw-grid"
				>
					{/* Connector line */}
					<div
						style={{
							position: "absolute",
							top: 42,
							left: "calc(25% + 21px)",
							right: "calc(25% - 21px)",
							height: 1,
							background:
								"linear-gradient(90deg, rgba(255,255,255,0.04), rgba(255,255,255,0.12), rgba(255,255,255,0.04))",
							pointerEvents: "none",
							zIndex: 0,
						}}
						className="hiw-connector"
					/>

					{steps.map(
						({ num, icon: Icon, title, desc, tags, color }, i) => (
							<motion.div
								key={num}
								initial={{ opacity: 0, y: 24 }}
								animate={isInView ? { opacity: 1, y: 0 } : {}}
								transition={{
									delay: i * 0.1,
									duration: 0.55,
									ease: EASE,
								}}
								style={{
									background: "rgba(255,255,255,0.02)",
									border: "1px solid rgba(255,255,255,0.07)",
									borderRadius: 20,
									padding: 24,
									display: "flex",
									flexDirection: "column",
									gap: 16,
									position: "relative",
									zIndex: 1,
								}}
							>
								<div
									style={{
										display: "flex",
										alignItems: "center",
										justifyContent: "space-between",
									}}
								>
									<div
										style={{
											width: 42,
											height: 42,
											borderRadius: 12,
											background: `${color}12`,
											border: `1px solid ${color}25`,
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											color,
										}}
									>
										<Icon size={19} />
									</div>
									<span
										style={{
											fontSize: 12,
											fontWeight: 700,
											color: "rgba(255,255,255,0.18)",
											letterSpacing: "0.04em",
											fontFeatureSettings: '"tnum"',
										}}
									>
										{num}
									</span>
								</div>
								<div>
									<h3
										style={{
											fontSize: 16,
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
											fontSize: 13,
											color: "rgba(255,255,255,0.42)",
											lineHeight: 1.7,
											margin: 0,
										}}
									>
										{desc}
									</p>
								</div>
								<div
									style={{
										display: "flex",
										gap: 6,
										flexWrap: "wrap",
										marginTop: "auto",
									}}
								>
									{tags.map((tag) => (
										<span
											key={tag}
											style={{
												fontSize: 11,
												fontWeight: 600,
												color: "rgba(255,255,255,0.38)",
												background: "rgba(255,255,255,0.04)",
												border: "1px solid rgba(255,255,255,0.07)",
												borderRadius: 999,
												padding: "2px 9px",
											}}
										>
											{tag}
										</span>
									))}
								</div>
							</motion.div>
						)
					)}
				</div>
			</div>

			<style>{`
        @media (max-width: 1023px) { .hiw-grid { grid-template-columns: repeat(2, 1fr) !important; } .hiw-connector { display: none !important; } }
        @media (max-width: 639px) { .hiw-grid { grid-template-columns: 1fr !important; } }
      `}</style>
		</section>
	);
}
