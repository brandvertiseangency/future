"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Check, Zap } from "lucide-react";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const plans = [
	{
		name: "Starter",
		price: "₹999",
		period: "/mo",
		tagline: "Perfect for solopreneurs and early-stage brands.",
		features: [
			"1 Brand Profile",
			"30 AI posts/month",
			"Instagram & LinkedIn",
			"Basic Analytics",
			"Content Calendar",
		],
		cta: "Start Free Trial",
		highlighted: false,
		color: "#ffffff",
	},
	{
		name: "Growth",
		badge: "Most Popular",
		price: "₹2,999",
		period: "/mo",
		tagline: "Built for growing brands that need more firepower.",
		features: [
			"5 Brand Profiles",
			"200 AI posts/month",
			"All 8 platforms",
			"Advanced Analytics",
			"Custom Brand Kit",
			"AI Agent System",
			"Priority Support",
		],
		cta: "Start Free Trial",
		highlighted: true,
		color: "#00d4ff",
	},
	{
		name: "Agency",
		price: "₹7,999",
		period: "/mo",
		tagline: "For agencies managing multiple clients at scale.",
		features: [
			"Unlimited Brands",
			"1,000 AI posts/month",
			"All 8 platforms",
			"White-label reports",
			"API Access",
			"All Agents Unlocked",
			"Dedicated Account Manager",
		],
		cta: "Contact Sales",
		highlighted: false,
		color: "#ffffff",
	},
];

export default function Pricing() {
	const ref = useRef(null);
	const isInView = useInView(ref, { once: true, margin: "-80px" });

	return (
		<section
			ref={ref}
			id="pricing"
			style={{ padding: "120px 0", background: "#050505" }}
		>
			<div
				style={{
					maxWidth: 1280,
					margin: "0 auto",
					padding: "0 24px",
				}}
			>
				<motion.div
					initial={{ opacity: 0, y: 24 }}
					animate={isInView ? { opacity: 1, y: 0 } : {}}
					transition={{ duration: 0.6, ease: EASE }}
					style={{
						marginBottom: 64,
						textAlign: "center",
					}}
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
						Pricing Plans
					</span>
					<h2
						style={{
							fontSize: "clamp(32px, 4vw, 52px)",
							fontWeight: 800,
							lineHeight: 1.08,
							color: "#ffffff",
							letterSpacing: "-0.04em",
							margin: "0 0 12px",
						}}
					>
						Simple, transparent pricing.
					</h2>
					<p
						style={{
							fontSize: 15,
							color: "rgba(255,255,255,0.4)",
							margin: 0,
						}}
					>
						Start free for 14 days. No credit card required.
					</p>
				</motion.div>

				<div
					style={{
						display: "grid",
						gridTemplateColumns: "repeat(3, 1fr)",
						gap: 14,
						maxWidth: 1100,
						margin: "0 auto",
					}}
					className="pricing-grid"
				>
					{plans.map((plan, i) => (
						<motion.div
							key={plan.name}
							initial={{ opacity: 0, y: 24 }}
							animate={isInView ? { opacity: 1, y: 0 } : {}}
							transition={{
								delay: i * 0.08,
								duration: 0.5,
								ease: EASE,
							}}
							style={{
								background: plan.highlighted ? "#080808" : "#050505",
								border: plan.highlighted
									? "1px solid rgba(0,212,255,0.25)"
									: "1px solid rgba(255,255,255,0.07)",
								borderRadius: 24,
								padding: "36px 28px",
								display: "flex",
								flexDirection: "column",
								gap: 24,
								position: "relative",
								boxShadow: plan.highlighted
									? "0 0 80px rgba(0,212,255,0.06), 0 32px 80px rgba(0,0,0,0.5)"
									: "none",
							}}
						>
							{plan.highlighted && (
								<div
									style={{
										position: "absolute",
										top: 0,
										left: 0,
										right: 0,
										height: 1,
										background:
											"linear-gradient(90deg, transparent, rgba(0,212,255,0.6), transparent)",
										borderRadius: "24px 24px 0 0",
									}}
								/>
							)}
							{plan.badge && (
								<div
									style={{
										position: "absolute",
										top: -1,
										left: "50%",
										transform: "translateX(-50%)",
										background:
											"linear-gradient(135deg, #00d4ff, #7c3aed)",
										color: "#000",
										fontSize: 10,
										fontWeight: 800,
										letterSpacing: "0.08em",
										textTransform: "uppercase",
										padding: "4px 14px",
										borderRadius: "0 0 12px 12px",
									}}
								>
									{plan.badge}
								</div>
							)}

							<div style={{ paddingTop: plan.badge ? 14 : 0 }}>
								<p
									style={{
										margin: "0 0 16px",
										fontSize: 13,
										fontWeight: 600,
										color: "rgba(255,255,255,0.4)",
										textTransform: "uppercase",
										letterSpacing: "0.08em",
									}}
								>
									{plan.name}
								</p>
								<div
									style={{
										display: "flex",
										alignItems: "baseline",
										gap: 4,
									}}
								>
									<span
										style={{
											fontSize: 52,
											fontWeight: 900,
											color: "#ffffff",
											letterSpacing: "-0.04em",
											lineHeight: 1,
										}}
									>
										{plan.price}
									</span>
									<span
										style={{
											fontSize: 14,
											color: "rgba(255,255,255,0.3)",
										}}
									>
										{plan.period}
									</span>
								</div>
								<p
									style={{
										fontSize: 13,
										color: "rgba(255,255,255,0.38)",
										marginTop: 8,
									}}
								>
									{plan.tagline}
								</p>
							</div>

							<div
								style={{
									height: 1,
									background: "rgba(255,255,255,0.06)",
								}}
							/>

							<ul
								style={{
									margin: 0,
									padding: 0,
									listStyle: "none",
									display: "flex",
									flexDirection: "column",
									gap: 11,
								}}
							>
								{plan.features.map((f) => (
									<li
										key={f}
										style={{
											fontSize: 13.5,
											color: "rgba(255,255,255,0.6)",
											display: "flex",
											alignItems: "center",
											gap: 10,
										}}
									>
										<span
											style={{
												width: 18,
												height: 18,
												borderRadius: "50%",
												background: plan.highlighted
													? "rgba(0,212,255,0.12)"
													: "rgba(255,255,255,0.06)",
												border: `1px solid ${
													plan.highlighted
														? "rgba(0,212,255,0.3)"
														: "rgba(255,255,255,0.1)"
												}`,
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
												flexShrink: 0,
												color: plan.highlighted
													? "#00d4ff"
													: "rgba(255,255,255,0.5)",
											}}
										>
											<Check size={10} strokeWidth={3} />
										</span>
										{f}
									</li>
								))}
							</ul>

							<a
								href="/auth?tab=signup"
								style={{
									marginTop: "auto",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									gap: 8,
									padding: "13px 20px",
									borderRadius: 14,
									fontSize: 13.5,
									fontWeight: 700,
									textDecoration: "none",
									transition: "all 0.2s",
									background: plan.highlighted
										? "#00d4ff"
										: "rgba(255,255,255,0.05)",
									color: plan.highlighted
										? "#000"
										: "rgba(255,255,255,0.7)",
									border: plan.highlighted
										? "none"
										: "1px solid rgba(255,255,255,0.1)",
								}}
								onMouseEnter={(e) => {
									const el = e.currentTarget as HTMLAnchorElement;
									if (plan.highlighted) el.style.background = "#22d9ff";
									else {
										el.style.background = "rgba(255,255,255,0.1)";
										el.style.color = "#fff";
									}
								}}
								onMouseLeave={(e) => {
									const el = e.currentTarget as HTMLAnchorElement;
									if (plan.highlighted) el.style.background = "#00d4ff";
									else {
										el.style.background = "rgba(255,255,255,0.05)";
										el.style.color = "rgba(255,255,255,0.7)";
									}
								}}
							>
								{plan.highlighted && (
									<Zap size={14} className="fill-black" />
								)}
								{plan.cta}
							</a>
						</motion.div>
					))}
				</div>

				<motion.p
					initial={{ opacity: 0 }}
					animate={isInView ? { opacity: 1 } : {}}
					transition={{ delay: 0.4 }}
					style={{
						textAlign: "center",
						marginTop: 28,
						fontSize: 13,
						color: "rgba(255,255,255,0.28)",
					}}
				>
					All plans include a 14-day free trial · Cancel anytime · No credit card
					required
				</motion.p>
			</div>

			<style>{`
        @media (max-width: 1023px) { .pricing-grid { grid-template-columns: 1fr !important; max-width: 480px !important; } }
        @media (max-width: 639px) { .pricing-grid { grid-template-columns: 1fr !important; } }
      `}</style>
		</section>
	);
}
