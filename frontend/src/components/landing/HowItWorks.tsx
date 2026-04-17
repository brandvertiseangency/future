"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { fadeUpVariants, staggerContainer, EASE } from "@/lib/motion";

const steps = [
	{
		num: "01",
		title: "Onboard Your Brand",
		desc: "Upload logo, colors, fonts, tone and target audience. Takes 5 minutes. Works forever.",
		tags: ["Fast Setup", "No-Code"],
		img: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&q=80",
	},
	{
		num: "02",
		title: "AI Builds Your Strategy",
		desc: "Content Strategy Engine analyses your brand, industry and competitors — full monthly plan generated automatically.",
		tags: ["AI-Powered", "Auto Strategy"],
		img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80",
	},
	{
		num: "03",
		title: "Creatives Are Generated",
		desc: "AI designs on-brand visuals and writes captions, hashtags, CTAs for each platform.",
		tags: ["Instant Output", "On-Brand"],
		img: "https://images.unsplash.com/photo-1542744094-24638eff58bb?w=600&q=80",
	},
	{
		num: "04",
		title: "Review & Auto-Schedule",
		desc: "Approve in one click or go full autopilot. Posts publish at peak engagement times.",
		tags: ["Auto-Publish", "Full Autopilot"],
		img: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&q=80",
	},
];

const stepAccents = [
	{ bg: "rgba(52,211,153,0.10)", border: "rgba(52,211,153,0.25)", text: "#6ee7b7" },
	{ bg: "rgba(59,130,246,0.10)", border: "rgba(59,130,246,0.25)", text: "#93c5fd" },
	{ bg: "rgba(139,92,246,0.10)", border: "rgba(139,92,246,0.25)", text: "#c4b5fd" },
	{ bg: "rgba(251,191,36,0.10)", border: "rgba(251,191,36,0.25)", text: "#fde68a" },
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
					initial="hidden"
					animate={isInView ? "show" : "hidden"}
					variants={staggerContainer}
					style={{ marginBottom: 72 }}
				>
					<motion.span variants={fadeUpVariants} className="section-tag">
						Our Process
					</motion.span>
					<motion.h2
						variants={fadeUpVariants}
						style={{
							fontSize: "clamp(32px, 4.5vw, 56px)",
							fontWeight: 800,
							lineHeight: 1.08,
							color: "#ffffff",
							letterSpacing: "-0.04em",
							maxWidth: 560,
							margin: 0,
						}}
					>
						From onboarding to <em className="accent">full growth.</em>
					</motion.h2>
				</motion.div>

				<div style={{ display: "flex", flexDirection: "column" }}>
					{steps.map((step, i) => {
						const isEven = i % 2 === 0;
						return (
							<div key={step.num}>
								<motion.div
									initial={{ opacity: 0, y: 40 }}
									whileInView={{ opacity: 1, y: 0 }}
									viewport={{ once: true, margin: "-60px" }}
									transition={{ duration: 0.65, ease: EASE }}
									className="process-row"
									style={{
										display: "grid",
										gridTemplateColumns: "1fr 1fr",
										gap: 72,
										alignItems: "center",
										padding: "60px 0",
									}}
								>
									{/* Text side */}
									<div style={{ order: isEven ? 0 : 1 }}>
										<p
											style={{
												fontSize: 80,
												fontWeight: 800,
												color: "#ffffff",
												opacity: 0.05,
												lineHeight: 1,
												margin: "0 0 4px",
												letterSpacing: "-0.06em",
											}}
										>
											{step.num}
										</p>
										<h3
											style={{
												fontSize: 26,
												fontWeight: 700,
												color: "#ffffff",
												marginBottom: 12,
												letterSpacing: "-0.02em",
											}}
										>
											{step.title}
										</h3>
										<p
											style={{
												fontSize: 15,
												color: "rgba(255,255,255,0.5)",
												lineHeight: 1.75,
												marginBottom: 20,
												maxWidth: 420,
											}}
										>
											{step.desc}
										</p>
										<div style={{ display: "flex", gap: 8 }}>
											{step.tags.map((tag) => (
												<span
													key={tag}
													style={{
														borderRadius: 999,
														padding: "4px 13px",
														fontSize: 11,
														fontWeight: 600,
														letterSpacing: "0.04em",
														background: stepAccents[i].bg,
														border: `1px solid ${stepAccents[i].border}`,
														color: stepAccents[i].text,
													}}
												>
													{tag}
												</span>
											))}
										</div>
									</div>

									{/* Image side */}
									<div style={{ order: isEven ? 1 : 0 }}>
										<motion.img
											whileHover={{ scale: 1.02 }}
											transition={{ duration: 0.4, ease: EASE }}
											src={step.img}
											alt={step.title}
											className="img-cinematic"
											style={{
												width: "100%",
												height: 280,
												objectFit: "cover",
											}}
										/>
									</div>
								</motion.div>

								{ i < steps.length - 1 && (
									<div style={{ width: "100%", height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08) 30%, rgba(255,255,255,0.08) 70%, transparent)" }} />
								)}
							</div>
						);
					})}
				</div>
			</div>

			<style>{`
        @media (max-width: 767px) {
          .process-row { grid-template-columns: 1fr !important; gap: 32px !important; }
          .process-row > div { order: unset !important; }
        }
      `}</style>
		</section>
	);
}
