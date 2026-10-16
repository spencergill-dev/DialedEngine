import { motion } from "framer-motion";
import { AnimatedNumber } from "./AnimatedNumber";

interface RadialGaugeProps {
  value: number;
  max?: number;
  precision?: number;
  size?: number;
  strokeWidth?: number;
  statusLabel?: string;
}

export function RadialGauge({
  value,
  max,
  precision = 1,
  size = 148,
  strokeWidth = 9,
  statusLabel = "OPTIMAL",
}: RadialGaugeProps) {
  const center = size / 2;
  const radius = center - strokeWidth - 2;
  const circumference = 2 * Math.PI * radius;

  // Calibrate gauge psychology: visual max defaults to 1.35x target to land in the ~74% sweet spot
  const visualMax = max && max > 0 ? max : value * 1.35;
  const percentage = Math.min(100, Math.max(0, (value / visualMax) * 100));
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const barValue = (value * 0.0689476).toFixed(2);

  return (
    <div
      className="relative flex items-center justify-center shrink-0 select-none"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        {/* Background Subtle Track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="transparent"
          stroke="currentColor"
          className="text-zinc-800/80"
          strokeWidth={strokeWidth}
        />

        {/* Dynamic Progress Fill (Volt Green with subtle athletic glow) */}
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="transparent"
          stroke="currentColor"
          className="text-lime-400 drop-shadow-[0_0_8px_rgba(163,230,53,0.35)]"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
        />
      </svg>

      {/* Centered Readout Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
        <div className="flex items-baseline justify-center">
          <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white leading-none">
            <AnimatedNumber value={value} precision={precision} />
          </span>
        </div>
        <div className="flex items-center gap-1 mt-1 font-mono">
          <span className="text-xs font-bold text-zinc-300">PSI</span>
          <span className="text-[10px] text-zinc-500">•</span>
          <span className="text-[10px] text-zinc-400">{barValue} bar</span>
        </div>
        <span className="text-[9px] font-mono text-lime-400 font-bold mt-1 uppercase tracking-widest">
          {statusLabel}
        </span>
      </div>
    </div>
  );
}
