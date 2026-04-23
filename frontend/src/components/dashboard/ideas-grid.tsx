"use client";

import { useRouter } from "next/navigation";
import { ArrowUpRight } from "lucide-react";

const IDEAS = [
  { label: "Write a carousel post", desc: "Educational content for this week", emoji: "🎨" },
  { label: "Plan next month content", desc: "Full calendar with mix & cadence", emoji: "📅" },
  { label: "Write a promo caption", desc: "Conversion-focused post copy", emoji: "✍️" },
  { label: "Analyse my brand voice", desc: "Deep dive on tone & personality", emoji: "🔍" },
];

export function IdeasGrid({ brand }: { brand: any }) {
  const router = useRouter();
  const brandName = brand?.name ?? "your brand";

  const handleIdea = (label: string) => {
    if (/plan|calendar|month/i.test(label)) {
      router.push("/calendar/generate?brief=" + encodeURIComponent(label));
      return;
    }
    if (typeof window !== "undefined") {
      sessionStorage.setItem("bv_chat_prefill", label + ` for ${brandName}`);
    }
    router.push("/dashboard");
  };

  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/20 mb-3">
        Ideas to get started
      </p>
      <div className="grid grid-cols-4 gap-2">
        {IDEAS.map(({ label, desc, emoji }) => (
          <button
            key={label}
            onClick={() => handleIdea(label)}
            className="group relative bento-card rounded-xl p-3.5 text-left
                       hover:-translate-y-0.5
                       transition-all duration-150 overflow-hidden"
          >
            <span className="text-[18px] leading-none block mb-2.5">{emoji}</span>
            <p className="text-[11.5px] font-medium text-white/75 leading-[1.4] mb-1">{label}</p>
            <p className="text-[10.5px] text-white/28 leading-[1.4]">{desc}</p>
            <ArrowUpRight
              size={11}
              className="absolute top-3 right-3 text-white/15 group-hover:text-white/40 transition-colors"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
