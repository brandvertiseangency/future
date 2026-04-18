"use client";

import { motion } from "framer-motion";

const floatingCards = [
	{
		icon: (
			<svg
				width="18"
				height="18"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				strokeWidth={2}
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					d="M5 13l4 4L19 7"
				/>
			</svg>
		),
		text: "New user signed up",
		sub: "Just 2 seconds ago",
		delay: 0,
	},
	{
		icon: (
			<svg
				width="18"
				height="18"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				strokeWidth={2}
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
				/>
			</svg>
		),
		text: "Revenue +24% this week",
		sub: "AI-optimised campaigns",
		delay: 0.5,
	},
	{
		icon: (
			<svg
				width="18"
				height="18"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				strokeWidth={2}
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
				/>
			</svg>
		),
		text: "10M+ posts generated",
		sub: "Across all platforms",
		delay: 1,
	},
];

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const fadeUp = {
	hidden: { opacity: 0, y: 28 },
	show: (i: number) => ({
		opacity: 1,
		y: 0,
		transition: {
			delay: i * 0.1,
			duration: 0.65,
			ease: EASE,
		},
	}),
};

export default function Hero() {
	return (
		<section
			style={{
				minHeight: "100vh",
				display: "flex",
				alignItems: "center",
				position: "relative",
				overflow: "hidden",
				background: "#050505",
				paddingTop: 64,
			}}
		>
			{/* Radial ambient glows */}
			<div style={{ position: "absolute", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
				<div style={{ position: "absolute", top: "-10%", left: "20%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)" }} />
				<div style={{ position: "absolute", top: "30%", right: "5%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)" }} />
				<div style={{ position: "absolute", bottom: "0%", left: "40%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(52,211,153,0.06) 0%, transparent 70%)" }} />
			</div>

			{/* Grid background */}
			<div
				className="grid-bg"
				style={{
					position: "absolute",
					inset: 0,
					zIndex: 0,
					opacity: 0.6,
				}}
			/>

			{/* Radial spotlight */}
			<div
				style={{
					position: "absolute",
					top: "20%",
					left: "50%",
					transform: "translate(-50%, -50%)",
					width: "80vw",
					height: "80vw",
					maxWidth: 900,
					maxHeight: 900,
					background:
						"radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 65%)",
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
					padding: "80px 24px",
					width: "100%",
					display: "grid",
					gridTemplateColumns: "1fr 1fr",
					gap: 80,
					alignItems: "center",
				}}
				className="hero-grid"
			>
				<div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
					{/* Badge */}
					<motion.div
						custom={0}
						initial="hidden"
						animate="show"
						variants={fadeUp}
					>
						<span
							style={{
								display: "inline-flex",
								alignItems: "center",
								gap: 8,
								border: "1px solid rgba(255,255,255,0.12)",
								borderRadius: 999,
								padding: "5px 14px",
								fontSize: 12,
								fontWeight: 600,
								color: "rgba(255,255,255,0.55)",
								background: "rgba(255,255,255,0.03)",
								letterSpacing: "0.06em",
								textTransform: "uppercase",
							}}
						>
							<span style={{ color: "#e8e0d0", fontSize: 11 }}>★★★★★</span>
							&nbsp;4.9/5 from 500+ brands
						</span>
					</motion.div>

					<motion.h1
						custom={1}
						initial="hidden"
						animate="show"
						variants={fadeUp}
						style={{
							fontSize: "clamp(44px, 6.5vw, 84px)",
							fontWeight: 800,
							lineHeight: 1.04,
							letterSpacing: "-0.04em",
							color: "#ffffff",
							margin: 0,
						}}
					>
						Drive results
						<br />
						through{" "}
						<span style={{ color: "rgba(255,255,255,0.4)" }}>
							social media
						</span>
						<br />
						<em className="accent" style={{ fontStyle: "italic" }}>mastery.</em>
					</motion.h1>

					<motion.p
						custom={2}
						initial="hidden"
						animate="show"
						variants={fadeUp}
						style={{
							fontSize: 17,
							fontWeight: 400,
							lineHeight: 1.72,
							color: "rgba(255,255,255,0.5)",
							maxWidth: 480,
							margin: 0,
						}}
					>
						Brandvertise AI generates scroll-stopping visuals, writes
						platform-native captions, and auto-publishes across all social
						platforms — completely on autopilot.
					</motion.p>

					<motion.div
						custom={3}
						initial="hidden"
						animate="show"
						variants={fadeUp}
						style={{ display: "flex", gap: 10, flexWrap: "wrap" }}
					>
						<a href="/auth?tab=signup" className="btn-primary">
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

					{/* Trust line */}
					<motion.div
						custom={4}
						initial="hidden"
						animate="show"
						variants={fadeUp}
						style={{
							display: "flex",
							alignItems: "center",
							gap: 16,
							paddingTop: 8,
						}}
					>
						<div style={{ display: "flex" }}>
							{[
								"https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&q=80",
								"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&q=80",
								"https://images.unsplash.com/photo-1580489944761-15a19d654956?w=60&q=80",
							].map((src, i) => (
								<img
									key={i}
									src={src}
									alt=""
									style={{
										width: 28,
										height: 28,
										borderRadius: "50%",
										border: "2px solid #050505",
										objectFit: "cover",
										marginLeft: i === 0 ? 0 : -10,
									}}
								/>
							))}
						</div>
						<span
							style={{
								fontSize: 13,
								color: "rgba(255,255,255,0.4)",
							}}
						>
							Joined by{" "}
							<strong
								style={{
									color: "rgba(255,255,255,0.7)",
									fontWeight: 600,
								}}
							>
								2,000+
							</strong>{" "}
							brands this month
						</span>
					</motion.div>
				</div>

				{/* Right side floating cards */}
				<div
					className="hero-cards-col"
					style={{ display: "flex", flexDirection: "column", gap: 14 }}
				>
					{floatingCards.map((card, i) => (
						<motion.div
							key={i}
							initial={{ opacity: 0, x: 30 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{
								delay: 0.6 + card.delay,
								duration: 0.65,
								ease: EASE,
							}}
						>
							<motion.div
								animate={{ y: [0, -8, 0] }}
								transition={{
									delay: i * 0.3,
									duration: 4 + i,
									repeat: Infinity,
									ease: "easeInOut",
								}}
								className="gradient-border"
								style={{
									backdropFilter: "blur(16px)",
									WebkitBackdropFilter: "blur(16px)",
									padding: "18px 22px",
									display: "flex",
									alignItems: "center",
									gap: 14,
								}}
							>
								<span
									style={{
										width: 40,
										height: 40,
										borderRadius: 10,
										background: "rgba(255,255,255,0.07)",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										color: "rgba(255,255,255,0.7)",
										flexShrink: 0,
									}}
								>
									{card.icon}
								</span>
								<div>
									<p
										style={{
											margin: 0,
											fontSize: 14,
											fontWeight: 600,
											color: "#ffffff",
										}}
									>
										{card.text}
									</p>
									<p
										style={{
											margin: 0,
											fontSize: 12,
											color: "rgba(255,255,255,0.4)",
											marginTop: 2,
										}}
									>
										{card.sub}
									</p>
								</div>
							</motion.div>
						</motion.div>
					))}

					{/* Dashboard preview card */}
					<motion.div
						initial={{ opacity: 0, x: 30 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{
							delay: 1.4,
							duration: 0.65,
							ease: EASE,
						}}
						className="gradient-border"
						style={{
							padding: "20px 22px",
							marginTop: 4,
						}}
					>
						<p
							style={{
								margin: "0 0 12px",
								fontSize: 11,
								fontWeight: 600,
								letterSpacing: "0.08em",
								textTransform: "uppercase",
								color: "rgba(255,255,255,0.3)",
							}}
						>
							Content Performance
						</p>
						<svg
							width="100%"
							height="60"
							viewBox="0 0 300 60"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							{[22, 38, 28, 50, 42, 65, 58, 72, 80, 70].map((h, i) => (
								<rect
									key={i}
									x={i * 30 + 2}
									y={60 - h}
									width={24}
									height={h}
									rx={4}
									fill={
										i === 9
											? "rgba(255,255,255,0.8)"
											: "rgba(255,255,255,0.1)"
									}
								/>
							))}
						</svg>
						<div
							style={{
								display: "flex",
								justifyContent: "space-between",
								marginTop: 12,
								alignItems: "flex-end",
							}}
						>
							<span
								style={{
									fontSize: 28,
									fontWeight: 800,
									color: "#ffffff",
									letterSpacing: "-0.04em",
								}}
							>
								+80%
							</span>
							<span
								style={{
									fontSize: 12,
									color: "rgba(255,255,255,0.35)",
								}}
							>
								engagement lift
							</span>
						</div>
					</motion.div>
				</div>
			</div>

			<style>{`
        @media (max-width: 767px) {
          .hero-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .hero-cards-col { display: none !important; }
        }
      `}</style>
		</section>
	);
}
