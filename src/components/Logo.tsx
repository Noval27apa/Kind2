import { Coffee } from "lucide-react";

interface LogoProps {
  size?: number;
  showText?: boolean;
}

export function Logo({ size = 28, showText = true }: LogoProps) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="rounded-xl bg-espresso-800 text-cream-50 flex items-center justify-center shadow-soft"
        style={{ width: size, height: size }}
      >
        <Coffee size={size * 0.55} />
      </div>
      {showText && (
        <div className="leading-tight">
          <div className="font-display text-base text-espresso-900">Kind Comfy Pleasure</div>
          <div className="text-[10px] tracking-widest uppercase text-sage-600">Cafe &amp; Kitchen</div>
        </div>
      )}
    </div>
  );
}
