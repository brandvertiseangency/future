"use client";

import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { fadeUpVariants, staggerContainer } from "@/lib/motion";

const faqs = [
	{
		q: "Do I need design skills to use Brandvertise AI?",
		a: "Not at all. You provide your brand details once and the AI generates professional, on-brand creatives automatically. No Canva, no Photoshop, no design knowledge required.",
	},
	{
		q: "How does the AI learn my brand style?",
		a: "During onboarding you upload your logo, define your color palette, choose typography and describe your brand voice. Our Brand Intelligence Engine uses this as persistent context for every piece of content.",
	},
	{
		q: "Which social media platforms are supported?",
		a: "We support Instagram, LinkedIn, Twitter/X, Facebook and Pinterest. Each platform gets properly sized assets and platform-native captions. TikTok and YouTube Shorts are on the roadmap.",
	},
	{
		q: "Can I edit AI-generated content before it goes live?",
		a: "Absolutely. You can review every post before publishing, edit captions, swap images, regenerate sections, or set up an approval workflow where nothing publishes without your sign-off.",
	},
	{
		q: "Is there a free trial? Do I need a credit card?",
		a: "Yes — all plans come with a 14-day free trial. No credit card required to start. You only enter billing information if you decide to upgrade after the trial.",
	},
	{
		q: "Can I manage multiple brands on one account?",
		a: "Yes. The Growth plan supports up to 5 brand profiles, and the Agency plan supports unlimited brands. Each brand has its own isolated AI persona, asset library and publishing schedule.",
	},
	{
		q: "Is my brand data secure?",
		a: "Your brand data is stored in isolated Firestore collections with role-based access controls. We use Firebase Auth for authentication, Google Cloud Storage for assets, and never use your data to train shared models.",
	},
];

export default function FAQ() {
	const [open, setOpen] = useState<number | null>(null);
	const ref = useRef(null);
	const isInView = useInView(ref, { once: true, margin: "-80px" });

	return (
		<section
			ref={ref}
			id="faq"
			style={{ padding: "120px 0", background: "#050505" }}
		>
			<div style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px" }}>
				<motion.div
					initial="hidden"
					animate={isInView ? "show" : "hidden"}
					variants={staggerContainer}
					style={{ marginBottom: 64, textAlign: "center" }}
				>
					<motion.span variants={fadeUpVariants} className="section-tag">
						FAQs
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
						Clear answers for your growth.
					</motion.h2>
				</motion.div>

				<motion.div
					initial="hidden"
					animate={isInView ? "show" : "hidden"}
					variants={staggerContainer}
					style={{ display: "flex", flexDirection: "column" }}
				>
					{faqs.map((faq, i) => (
						<motion.div
							key={i}
							variants={fadeUpVariants}
							style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
						>
							<button
								onClick={() => setOpen(open === i ? null : i)}
								style={{
									width: "100%",
									display: "flex",
									alignItems: "center",
									justifyContent: "space-between",
									gap: 24,
									padding: "22px 0",
									background: "none",
									border: "none",
									cursor: "pointer",
									textAlign: "left",
								}}
								aria-expanded={open === i}
							>
								<div style={{ display: "flex", alignItems: "center", gap: 16 }}>
									<span
										style={{
											fontSize: 12,
											fontWeight: 600,
											color: "rgba(255,255,255,0.2)",
											flexShrink: 0,
											fontVariantNumeric: "tabular-nums",
											letterSpacing: "0.02em",
										}}
									>
										{String(i + 1).padStart(2, "0")}
									</span>
									<span
										style={{
											fontSize: 15,
											fontWeight: 600,
											color:
												open === i
													? "#ffffff"
													: "rgba(255,255,255,0.8)",
											lineHeight: 1.4,
											transition: "color 0.2s ease",
										}}
									>
										{faq.q}
									</span>
								</div>
								<motion.span
									animate={{ rotate: open === i ? 45 : 0 }}
									transition={{ duration: 0.2 }}
									style={{
										flexShrink: 0,
										width: 26,
										height: 26,
										borderRadius: "50%",
										border: "1px solid rgba(255,255,255,0.12)",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										fontSize: 18,
										color: "rgba(255,255,255,0.5)",
									}}
								>
									+
								</motion.span>
							</button>

							<AnimatePresence initial={false}>
								{open === i && (
									<motion.div
										initial={{ height: 0, opacity: 0 }}
										animate={{ height: "auto", opacity: 1 }}
										exit={{ height: 0, opacity: 0 }}
										transition={{
											duration: 0.3,
											ease: [0.16, 1, 0.3, 1],
										}}
										style={{ overflow: "hidden" }}
									>
										<p
											style={{
												fontSize: 14,
												color: "rgba(255,255,255,0.5)",
												lineHeight: 1.75,
												paddingBottom: 22,
												paddingLeft: 42,
												margin: 0,
											}}
										>
											{faq.a}
										</p>
									</motion.div>
								)}
							</AnimatePresence>
						</motion.div>
					))}
				</motion.div>
			</div>
		</section>
	);
}
