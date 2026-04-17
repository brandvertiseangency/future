"use client";

import { useRef, useEffect } from "react";
import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { fadeUpVariants, staggerContainer } from "@/lib/motion";

// Parse numeric value and suffix from strings like "2,400+", "10M+", "+47%", "12 hrs"
function parseStatValue(val: string): { num: number; prefix: string; suffix: string } {
	if (val.startsWith("+")) {
		const num = parseInt(val.replace(/[^0-9]/g, ""), 10);
		return { num, prefix: "+", suffix: val.replace(/[0-9,]/g, "").replace("+", "") };
	}
	if (val.includes("M")) {
		const num = parseInt(val.replace(/[^0-9]/g, ""), 10);
		return { num, prefix: "", suffix: "M+" };
	}
	if (val.includes(",")) {
		const num = parseInt(val.replace(/[^0-9]/g, ""), 10);
		return { num, prefix: "", suffix: "+" };
	}
	const num = parseInt(val.replace(/[^0-9]/g, ""), 10);
	return { num, prefix: "", suffix: val.replace(/[0-9]/g, "").trim() };
}

function AnimatedStat({ value, isInView }: { value: string; isInView: boolean }) {
	const { num, prefix, suffix } = parseStatValue(value);
	const count = useMotionValue(0);
	const rounded = useTransform(count, (v) => {
		if (num >= 1000) return prefix + Math.round(v).toLocaleString() + suffix;
		return prefix + Math.round(v) + suffix;
	});

	useEffect(() => {
		if (!isInView) return;
		const ctrl = animate(count, num, { duration: 1.6, ease: [0.16, 1, 0.3, 1] });
		return ctrl.stop;
	}, [isInView, count, num]);

	return <motion.span>{rounded}</motion.span>;
}

const stats = [
	{ value: "2,400+", label: "Active Brands", sub: "Growing every week" },
	{ value: "10M+", label: "Posts Generated", sub: "Across all platforms" },
	{ value: "+47%", label: "Avg. Engagement Lift", sub: "Within first 90 days" },
	{ value: "12 hrs", label: "Saved Per Week", sub: "Per brand, on average" },
];

export default function Stats() {
	const ref = useRef(null);
	const isInView = useInView(ref, { once: true, margin: "-80px" });

	return (
		<section
			ref={ref}
			id="stats"
			style={{
				padding: "72px 0",
				background: "#050505",
				borderTop: "1px solid rgba(255,255,255,0.05)",
				borderBottom: "1px solid rgba(255,255,255,0.05)",
			}}
		>
			<div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>
				<motion.div
					initial="hidden"
					animate={isInView ? "show" : "hidden"}
					variants={staggerContainer}
					className="stats-grid"
					style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0 }}
				>
					{stats.map((s, i) => (
						<motion.div
							key={s.label}
							variants={fadeUpVariants}
							style={{
								textAlign: "center",
								padding: "32px 20px",
								borderRight: i < stats.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
							}}
						>
							<p
								style={{
									fontSize: "clamp(32px, 3.5vw, 52px)",
									fontWeight: 800,
									color: "#ffffff",
									letterSpacing: "-0.04em",
									lineHeight: 1,
									marginBottom: 8,
								}}
							>
								<AnimatedStat value={s.value} isInView={isInView} />
							</p>
							<p style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.65)", marginBottom: 4 }}>
								{s.label}
							</p>
							<p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>{s.sub}</p>
						</motion.div>
					))}
				</motion.div>
			</div>
			<style>{`
        @media (max-width: 767px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .stats-grid > div { border-right: none !important; border-bottom: 1px solid rgba(255,255,255,0.05) !important; }
        }
      `}</style>
		</section>
	);
}
