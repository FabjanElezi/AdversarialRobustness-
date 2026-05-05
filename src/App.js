import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, useScroll, useTransform, useInView, animate, AnimatePresence } from "framer-motion";
import "./App.css";

const SLIDE_LABELS = [
  "Hero", "Problem", "Attack Types", "Real-World Impact",
  "Robustness", "Defenses", "Metrics", "Demo", "Conclusion"
];

// Speaker assignment — 3 speakers rotated across 9 slides
const SPEAKERS = [
  { name: "Daniele", color: "#6366f1", bg: "rgba(99,102,241,0.15)", border: "rgba(99,102,241,0.35)", initials: "D" },
  { name: "Fabio",   color: "#f97316", bg: "rgba(249,115,22,0.15)",  border: "rgba(249,115,22,0.35)",  initials: "F" },
  { name: "Frenci",  color: "#06b6d4", bg: "rgba(6,182,212,0.15)",   border: "rgba(6,182,212,0.35)",   initials: "Fr" },
];

// slide index → speaker index
const SLIDE_SPEAKERS = [0, 1, 2, 0, 1, 2, 0, 1, 2];
// Daniele: Hero, Real-World Impact, Metrics
// Fabio:   Problem, Robustness, Demo
// Frenci:  Attack Types, Defenses, Conclusion

const PresentModeContext = React.createContext(false);

// ─── Speaker Badge ────────────────────────────────────────────────────────────
function SpeakerBadge({ slideIndex, animate: doAnimate = false, className = "" }) {
  const sp = SPEAKERS[SLIDE_SPEAKERS[slideIndex]];
  return (
    <motion.div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${className}`}
      style={{ background: sp.bg, border: `1px solid ${sp.border}`, color: sp.color }}
      {...(doAnimate ? {
        initial: { opacity: 0, scale: 0.85 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.85 },
        transition: { duration: 0.35 },
      } : {})}
    >
      {/* Avatar circle */}
      <div
        className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0"
        style={{ background: sp.color, color: "#030712" }}
      >
        {sp.initials}
      </div>
      {sp.name}
    </motion.div>
  );
}

// ─── Scroll-mode section speaker tag (fixed top-right, always visible) ────────
function SectionSpeaker({ slideIndex }) {
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { once: false, margin: "-10% 0px -10% 0px" });
  const sp = SPEAKERS[SLIDE_SPEAKERS[slideIndex]];
  const isPresent = React.useContext(PresentModeContext);

  // In present mode, the badge is shown in the overlay — skip here
  if (isPresent) return <div ref={sectionRef} />;

  return (
    <>
      {/* Invisible sentinel so we know when this section is in view */}
      <div ref={sectionRef} className="absolute inset-0 pointer-events-none" />

      {/* Fixed badge — only visible when this section is in the viewport */}
      <AnimatePresence>
        {inView && (
          <motion.div
            key={`speaker-${slideIndex}`}
            initial={{ opacity: 0, y: -8, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.92 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-6 left-6 z-40 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{
              background: sp.bg,
              backdropFilter: "blur(20px)",
              border: `1px solid ${sp.border}`,
              color: sp.color,
              pointerEvents: "none",
            }}
          >
            <motion.div
              className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0"
              style={{ background: sp.color, color: "#030712" }}
              animate={{ boxShadow: [`0 0 0px ${sp.color}00`, `0 0 8px ${sp.color}90`, `0 0 0px ${sp.color}00`] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              {sp.initials}
            </motion.div>
            {sp.name}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Animated Counter ─────────────────────────────────────────────────────────
function Counter({ from = 0, to, duration = 2, suffix = "", prefix = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(from);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(from, to, {
      duration,
      ease: "easeOut",
      onUpdate(v) { setDisplay(Math.floor(v)); },
    });
    return controls.stop;
  }, [inView, from, to, duration]);

  return <span ref={ref}>{prefix}{display.toLocaleString()}{suffix}</span>;
}

// ─── Section Wrapper — adapts to scroll vs present mode ──────────────────────
function Section({ children, className = "" }) {
  const isPresent = React.useContext(PresentModeContext);
  if (isPresent) {
    return (
      <div className={`relative flex-shrink-0 flex items-center justify-center overflow-hidden ${className}`}
        style={{ width: "100vw", height: "100vh" }}>
        {children}
      </div>
    );
  }
  return (
    <section className={`relative min-h-screen flex items-center justify-center overflow-hidden ${className}`}>
      {children}
    </section>
  );
}

// ─── Slide icons ──────────────────────────────────────────────────────────────
function PresentIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="3" width="20" height="14" rx="2"/>
      <path d="M8 21h8M12 17v4"/>
    </svg>
  );
}
function ScrollIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 5v14M5 12l7 7 7-7"/>
    </svg>
  );
}
function ChevronLeft() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  );
}
function ChevronRight() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="9 6 15 12 9 18"/>
    </svg>
  );
}

// ─── Staggered Text ───────────────────────────────────────────────────────────
function StaggerText({ text, className = "", delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const words = text.split(" ");
  return (
    <motion.span ref={ref} className={className} style={{ display: "inline-block" }}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: delay + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: "inline-block", marginRight: "0.3em" }}
        >
          {word}
        </motion.span>
      ))}
    </motion.span>
  );
}

// ─── Particles ────────────────────────────────────────────────────────────────
function Particles({ count = 40, color = "rgba(99,102,241,0.4)" }) {
  const particles = useRef(
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 8 + 6,
      delay: Math.random() * 4,
    }))
  );
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.current.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, background: color }}
          animate={{ y: [0, -60, 0], opacity: [0.2, 0.8, 0.2] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

// ─── Grid Lines ───────────────────────────────────────────────────────────────
function GridLines() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.04]">
      <div className="w-full h-full" style={{
        backgroundImage: `
          linear-gradient(rgba(99,102,241,1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(99,102,241,1) 1px, transparent 1px)
        `,
        backgroundSize: "80px 80px"
      }} />
    </div>
  );
}

// ─── Glow Orb ─────────────────────────────────────────────────────────────────
function GlowOrb({ color = "#6366f1", size = 400, x = "50%", y = "50%", opacity = 0.15 }) {
  const hex = Math.round(opacity * 255).toString(16).padStart(2, "0");
  return (
    <div className="absolute pointer-events-none" style={{
      left: x, top: y, transform: "translate(-50%,-50%)",
      width: size, height: size,
      background: `radial-gradient(circle, ${color}${hex}, transparent 70%)`,
      filter: "blur(40px)",
    }} />
  );
}

// ─── Shield Icon ──────────────────────────────────────────────────────────────
function ShieldIcon({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z" fill="rgba(255,255,255,0.9)" />
      <path d="M10 14l-2-2 1.4-1.4L10 11.2l4.6-4.6L16 8l-6 6z" fill="rgba(99,102,241,1)" />
    </svg>
  );
}

function BrainIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/>
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>
    </svg>
  );
}

function TargetIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
    </svg>
  );
}

function VirusIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

function ZapIcon({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  );
}

function LayersIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polygon points="12 2 2 7 12 12 22 7 12 2"/>
      <polyline points="2 17 12 22 22 17"/>
      <polyline points="2 12 12 17 22 12"/>
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="5" y1="12" x2="19" y2="12"/>
      <polyline points="12 5 19 12 12 19"/>
    </svg>
  );
}

function CarIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="1" y="3" width="15" height="13" rx="2"/>
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
      <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
    </svg>
  );
}

function FaceIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="8" r="4"/>
      <path d="M6 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
    </svg>
  );
}

function BugIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M8 2l1.88 1.88M14.12 3.88 16 2M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"/>
      <path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6z"/>
      <path d="M12 20v-9M6.53 9C4.6 8.8 3 7.1 3 5M6 13H2M3 21c0-3 1.5-6 3-8M17.47 9c1.93-.2 3.53-1.9 3.53-4M18 13h4M21 21c0-3-1.5-6-3-8"/>
    </svg>
  );
}

// ─── Attack vs Defense Hero Visual ───────────────────────────────────────────
function AttackDefenseVisual() {
  return (
    <motion.div
      className="relative w-72 h-72 mx-auto mt-10"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, delay: 0.5 }}
    >
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ border: "1px solid rgba(99,102,241,0.3)" }}
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute inset-6 rounded-full"
        style={{ border: "1px solid rgba(168,85,247,0.2)" }}
        animate={{ rotate: -360 }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="w-24 h-24 rounded-full flex items-center justify-center"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.6), rgba(168,85,247,0.3))" }}
          animate={{ boxShadow: ["0 0 30px rgba(99,102,241,0.4)", "0 0 80px rgba(168,85,247,0.7)", "0 0 30px rgba(99,102,241,0.4)"] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <ShieldIcon size={44} />
        </motion.div>
      </div>
      {[0, 72, 144, 216, 288].map((angle, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            top: "50%", left: "50%",
            transform: `translate(-50%,-50%) rotate(${angle}deg) translateX(110px)`,
          }}
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, delay: i * 0.4, repeat: Infinity }}
        >
          <div className="w-2.5 h-2.5 bg-red-400 rounded-full" style={{ boxShadow: "0 0 8px rgba(239,68,68,0.9)" }} />
        </motion.div>
      ))}
    </motion.div>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────
function AnimatedBar({ label, value, color = "#6366f1", delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <div ref={ref} className="mb-5">
      <div className="flex justify-between mb-1.5">
        <span className="text-sm text-white/60">{label}</span>
        <span className="text-sm font-bold" style={{ color }}>
          {inView && <Counter to={value} suffix="%" duration={1.5} />}
        </span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}, ${color}80)` }}
          initial={{ width: 0 }}
          animate={inView ? { width: `${value}%` } : {}}
          transition={{ duration: 1.5, delay, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}

// ─── Attack Card ──────────────────────────────────────────────────────────────
function AttackCard({ icon, title, description, color, delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="rounded-2xl p-7 cursor-default relative overflow-hidden group"
      style={{
        background: "rgba(255,255,255,0.03)",
        backdropFilter: "blur(20px)",
        border: hovered ? `1px solid ${color}50` : "1px solid rgba(255,255,255,0.08)",
        transition: "border-color 0.3s"
      }}
      whileHover={{ y: -6, transition: { duration: 0.3 } }}
    >
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `radial-gradient(circle at 50% 0%, ${color}12, transparent 70%)` }}
      />
      <motion.div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
        style={{ background: `${color}20`, color }}
        animate={hovered ? { scale: 1.1 } : { scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {icon}
      </motion.div>
      <h3 className="text-lg font-bold text-white mb-3">{title}</h3>
      <p className="text-white/45 text-sm leading-relaxed">{description}</p>
      <motion.div
        className="absolute bottom-0 left-0 h-0.5 rounded-full"
        style={{ background: `linear-gradient(90deg, ${color}, transparent)` }}
        animate={hovered ? { width: "100%" } : { width: "0%" }}
        transition={{ duration: 0.4 }}
      />
    </motion.div>
  );
}

// ─── Impact Card ──────────────────────────────────────────────────────────────
function ImpactCard({ icon, title, stat, desc, color, delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="rounded-2xl p-7 relative overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.03)",
        backdropFilter: "blur(20px)",
        border: hovered ? `1px solid ${color}40` : "1px solid rgba(255,255,255,0.06)",
        transition: "border-color 0.3s"
      }}
      whileHover={{ scale: 1.03, transition: { duration: 0.3 } }}
    >
      <motion.div
        className="absolute top-0 right-0 w-32 h-32 rounded-full"
        style={{ background: `radial-gradient(circle, ${color}20, transparent)`, transform: "translate(30%, -30%)" }}
        animate={hovered ? { scale: 1.6, opacity: 1 } : { scale: 1, opacity: 0.5 }}
        transition={{ duration: 0.4 }}
      />
      <div className="flex items-center gap-3 mb-5" style={{ color }}>
        {icon}
        <span className="text-xs font-semibold uppercase tracking-widest text-white/40">{title}</span>
      </div>
      <div className="text-4xl font-black mb-2" style={{ color }}>{stat}</div>
      <p className="text-white/45 text-sm leading-relaxed">{desc}</p>
    </motion.div>
  );
}

// ─── Defense Card (expandable) ────────────────────────────────────────────────
function DefenseCard({ icon, title, description, bullets, color, delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -30 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      onClick={() => setOpen(!open)}
      className="rounded-2xl p-6 cursor-pointer relative overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.03)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.08)"
      }}
      whileHover={{ x: 4, transition: { duration: 0.2 } }}
    >
      <motion.div
        className="absolute left-0 top-0 bottom-0 w-0.5 rounded-full"
        style={{ background: color }}
        animate={open ? { opacity: 1 } : { opacity: 0.4 }}
      />
      <div className="flex items-center gap-4 mb-2 pl-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${color}20`, color }}>
          {icon}
        </div>
        <h3 className="text-base font-bold text-white flex-1">{title}</h3>
        <motion.div
          animate={{ rotate: open ? 90 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-white/30"
        >
          <ArrowRight />
        </motion.div>
      </div>
      <p className="text-white/45 text-sm pl-3 leading-relaxed">{description}</p>
      <motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="overflow-hidden pl-3"
      >
        <ul className="mt-3 space-y-2">
          {bullets.map((b, i) => (
            <li key={i} className="flex items-center gap-2 text-sm text-white/55">
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
              {b}
            </li>
          ))}
        </ul>
      </motion.div>
    </motion.div>
  );
}

// ─── Comparison Slider ────────────────────────────────────────────────────────
function ComparisonSlider() {
  const [pos, setPos] = useState(50);
  const containerRef = useRef(null);
  const dragging = useRef(false);

  const handleMove = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const p = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
    setPos(p);
  }, []);

  useEffect(() => {
    const onMove = (e) => { if (dragging.current) handleMove(e.clientX || (e.touches && e.touches[0] && e.touches[0].clientX)); };
    const onUp = () => { dragging.current = false; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove);
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  }, [handleMove]);

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-2xl overflow-hidden cursor-ew-resize select-none"
      style={{ height: 220, border: "1px solid rgba(255,255,255,0.08)" }}
      onMouseDown={() => { dragging.current = true; }}
      onTouchStart={() => { dragging.current = true; }}
      onClick={(e) => handleMove(e.clientX)}
    >
      {/* LEFT panel — clips from the right edge inward; stat anchored at 25% */}
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)`, background: "rgba(239,68,68,0.09)" }}
      >
        <div className="absolute" style={{ left: "25%", top: "50%", transform: "translate(-50%,-50%)", textAlign: "center", whiteSpace: "nowrap" }}>
          <div className="font-black mb-1" style={{ fontSize: 52, color: "#f87171", lineHeight: 1 }}>23%</div>
          <div className="text-sm mb-1" style={{ color: "rgba(255,255,255,0.45)" }}>Accuracy Under Attack</div>
          <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(248,113,113,0.65)" }}>Vulnerable Model</div>
        </div>
      </div>

      {/* RIGHT panel — clips from the left edge inward; stat anchored at 75% */}
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 0 0 ${pos}%)`, background: "rgba(99,102,241,0.09)" }}
      >
        <div className="absolute" style={{ left: "75%", top: "50%", transform: "translate(-50%,-50%)", textAlign: "center", whiteSpace: "nowrap" }}>
          <div className="font-black mb-1" style={{ fontSize: 52, color: "#818cf8", lineHeight: 1 }}>87%</div>
          <div className="text-sm mb-1" style={{ color: "rgba(255,255,255,0.45)" }}>Accuracy Under Attack</div>
          <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(129,140,248,0.65)" }}>Robust Model</div>
        </div>
      </div>

      {/* Subtle background gradient behind each half */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: `linear-gradient(90deg, rgba(239,68,68,0.04) 0%, rgba(239,68,68,0.04) ${pos}%, rgba(99,102,241,0.04) ${pos}%, rgba(99,102,241,0.04) 100%)`
      }} />

      {/* Divider line + drag handle */}
      <div
        className="absolute top-0 bottom-0 pointer-events-none"
        style={{ left: `${pos}%`, width: 1, background: "rgba(255,255,255,0.22)" }}
      >
        {/* Handle */}
        <div
          className="absolute flex items-center justify-center bg-white rounded-full shadow-2xl pointer-events-auto cursor-ew-resize"
          style={{ width: 34, height: 34, top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}
          onMouseDown={(e) => { e.stopPropagation(); dragging.current = true; }}
          onTouchStart={(e) => { e.stopPropagation(); dragging.current = true; }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="9 18 3 12 9 6"/><polyline points="15 6 21 12 15 18"/>
          </svg>
        </div>
      </div>

      {/* Corner labels */}
      <div className="absolute top-4 left-4 text-xs font-bold uppercase tracking-widest pointer-events-none" style={{ color: "rgba(248,113,113,0.5)" }}>Vulnerable</div>
      <div className="absolute top-4 right-4 text-xs font-bold uppercase tracking-widest pointer-events-none" style={{ color: "rgba(129,140,248,0.5)" }}>Robust</div>
    </div>
  );
}

// ─── Demo Section ─────────────────────────────────────────────────────────────
function PredictionDemo() {
  const ATTACKS = {
    FGSM: { label: "FGSM",  steps: 1,  color: "#f97316", desc: "Fast Gradient Sign Method · single step" },
    BIM:  { label: "BIM",   steps: 5,  color: "#ef4444", desc: "Basic Iterative Method · 5 steps" },
    PGD:  { label: "PGD",   steps: 10, color: "#a855f7", desc: "Projected Gradient Descent · 10 steps" },
    CW:   { label: "C&W",   steps: 7,  color: "#ec4899", desc: "Carlini & Wagner · L∞ optimization" },
  };

  const DEFENSES = {
    none:     { label: "None",             color: "#6b7280" },
    advtrain: { label: "Adv. Training",    color: "#6366f1" },
    smooth:   { label: "Input Smoothing",  color: "#22c55e" },
  };

  const CLEAN_PREDS = [
    { label: "Stop Sign", conf: 98 },
    { label: "No Entry",  conf: 1  },
    { label: "Yield",     conf: 1  },
  ];

  const OUTCOMES = {
    FGSM: {
      none:     { fooled: true,  preds: [{ label: "Speed Limit 45", conf: 91 }, { label: "Stop Sign",      conf: 6  }, { label: "Yield",          conf: 2  }] },
      advtrain: { fooled: false, preds: [{ label: "Stop Sign",      conf: 82 }, { label: "No Entry",       conf: 10 }, { label: "Speed Limit 45", conf: 7  }] },
      smooth:   { fooled: false, preds: [{ label: "Stop Sign",      conf: 74 }, { label: "Pedestrian",     conf: 15 }, { label: "Yield",          conf: 9  }] },
    },
    BIM: {
      none:     { fooled: true,  preds: [{ label: "Speed Limit 45", conf: 95 }, { label: "Yield",          conf: 3  }, { label: "Stop Sign",      conf: 1  }] },
      advtrain: { fooled: true,  preds: [{ label: "Speed Limit 45", conf: 54 }, { label: "Stop Sign",      conf: 38 }, { label: "Yield",          conf: 7  }] },
      smooth:   { fooled: false, preds: [{ label: "Stop Sign",      conf: 71 }, { label: "Speed Limit 45", conf: 18 }, { label: "No Entry",       conf: 9  }] },
    },
    PGD: {
      none:     { fooled: true,  preds: [{ label: "Speed Limit 45", conf: 97 }, { label: "Yield",          conf: 2  }, { label: "No Entry",       conf: 1  }] },
      advtrain: { fooled: true,  preds: [{ label: "Yield",          conf: 61 }, { label: "Stop Sign",      conf: 29 }, { label: "Speed Limit 45", conf: 9  }] },
      smooth:   { fooled: true,  preds: [{ label: "Speed Limit 45", conf: 78 }, { label: "Stop Sign",      conf: 16 }, { label: "Yield",          conf: 5  }] },
    },
    CW: {
      none:     { fooled: true,  preds: [{ label: "Speed Limit 45", conf: 99 }, { label: "No Entry",       conf: 1  }, { label: "Yield",          conf: 0  }] },
      advtrain: { fooled: true,  preds: [{ label: "Yield",          conf: 71 }, { label: "Speed Limit 45", conf: 22 }, { label: "Stop Sign",      conf: 6  }] },
      smooth:   { fooled: true,  preds: [{ label: "Speed Limit 45", conf: 85 }, { label: "Yield",          conf: 10 }, { label: "Stop Sign",      conf: 4  }] },
    },
  };

  const [attackKey, setAttackKey] = useState("FGSM");
  const [defense,   setDefense]   = useState("none");
  const [epsilon,   setEpsilon]   = useState(3);
  const [phase,     setPhase]     = useState("clean"); // "clean" | "attacking" | "done"
  const [step,      setStep]      = useState(0);
  const timerRef = useRef(null);

  const attack  = ATTACKS[attackKey];
  const outcome = OUTCOMES[attackKey][defense];

  const launch = () => {
    if (phase !== "clean") return;
    setPhase("attacking");
    setStep(0);
    let s = 0;
    timerRef.current = setInterval(() => {
      s++;
      setStep(s);
      if (s >= attack.steps) {
        clearInterval(timerRef.current);
        setPhase("done");
      }
    }, attack.steps === 1 ? 420 : 270);
  };

  const reset = () => {
    clearInterval(timerRef.current);
    setPhase("clean");
    setStep(0);
  };

  useEffect(() => () => clearInterval(timerRef.current), []);

  const preds      = phase === "done" ? outcome.preds : CLEAN_PREDS;
  const fooled     = phase === "done" && outcome.fooled;
  const signColor  = fooled ? "#ef4444" : "#22c55e";
  const noiseLevel = phase === "attacking"
    ? (step / attack.steps) * 0.6
    : phase === "done" ? (epsilon / 10) * 0.45 + 0.1 : 0;

  return (
    <div className="rounded-2xl p-6 max-w-3xl mx-auto" style={{ background: "rgba(255,255,255,0.03)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)" }}>

      {/* Config row */}
      <div className="grid grid-cols-2 gap-5 mb-5">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-white/30 mb-2">Attack Method</div>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(ATTACKS).map(([k, a]) => (
              <motion.button key={k}
                onClick={() => { reset(); setAttackKey(k); }}
                className="px-2.5 py-1 rounded-lg text-[11px] font-bold"
                style={{
                  background: attackKey === k ? `${a.color}22` : "rgba(255,255,255,0.04)",
                  border: `1px solid ${attackKey === k ? a.color + "55" : "rgba(255,255,255,0.08)"}`,
                  color: attackKey === k ? a.color : "rgba(255,255,255,0.3)",
                  cursor: "pointer",
                }}
                whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.96 }}
              >{a.label}</motion.button>
            ))}
          </div>
          <div className="text-[10px] text-white/20 mt-1.5">{attack.desc}</div>
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-widest text-white/30 mb-2">Defense</div>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(DEFENSES).map(([k, d]) => (
              <motion.button key={k}
                onClick={() => { reset(); setDefense(k); }}
                className="px-2.5 py-1 rounded-lg text-[11px] font-bold"
                style={{
                  background: defense === k ? `${d.color}20` : "rgba(255,255,255,0.04)",
                  border: `1px solid ${defense === k ? d.color + "45" : "rgba(255,255,255,0.08)"}`,
                  color: defense === k ? d.color : "rgba(255,255,255,0.3)",
                  cursor: "pointer",
                }}
                whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.96 }}
              >{d.label}</motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Epsilon slider */}
      <div className="mb-6 px-1">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] uppercase tracking-widest text-white/30">Perturbation Strength ε</span>
          <span className="text-xs font-mono font-bold text-purple-400">{(epsilon / 100).toFixed(2)}</span>
        </div>
        <input type="range" min="1" max="10" step="1" value={epsilon}
          onChange={(e) => { reset(); setEpsilon(Number(e.target.value)); }}
          className="w-full h-1 rounded-full appearance-none cursor-pointer"
          style={{ accentColor: "#a855f7" }}
        />
        <div className="flex justify-between text-[10px] text-white/15 mt-1">
          <span>Subtle</span><span>Moderate</span><span>Strong</span>
        </div>
      </div>

      {/* Main visual */}
      <div className="flex gap-4 items-center justify-center mb-5 flex-wrap">
        {/* Sign */}
        <div className="text-center">
          <motion.div
            className="w-36 h-36 rounded-xl flex items-center justify-center relative overflow-hidden mx-auto"
            style={{ background: `${signColor}12`, border: `2px solid ${signColor}35` }}
            animate={{ borderColor: `${signColor}55` }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="absolute inset-0 z-10 pointer-events-none"
              animate={{ opacity: noiseLevel }}
              transition={{ duration: 0.3 }}
              style={{
                backgroundImage: `
                  repeating-linear-gradient(45deg, rgba(168,85,247,0.3) 0px, rgba(168,85,247,0.3) 1px, transparent 1px, transparent 5px),
                  repeating-linear-gradient(-45deg, rgba(239,68,68,0.2) 0px, rgba(239,68,68,0.2) 1px, transparent 1px, transparent 5px)
                `,
                mixBlendMode: "screen",
              }}
            />
            <motion.svg width="80" height="80" viewBox="0 0 100 100"
              animate={phase === "attacking" ? { opacity: [1, 0.6, 1] } : { opacity: 1 }}
              transition={{ duration: 0.32, repeat: phase === "attacking" ? Infinity : 0 }}
            >
              {fooled ? (
                <>
                  <circle cx="50" cy="50" r="42" fill={`${signColor}22`} stroke={signColor} strokeWidth="4"/>
                  <text x="50" y="40" textAnchor="middle" fill={signColor} fontSize="13" fontWeight="bold">Speed</text>
                  <text x="50" y="62" textAnchor="middle" fill={signColor} fontSize="26" fontWeight="bold">45</text>
                </>
              ) : (
                <>
                  <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" fill={`${signColor}22`} stroke={signColor} strokeWidth="4"/>
                  <text x="50" y="58" textAnchor="middle" fill={signColor} fontSize="22" fontWeight="bold">STOP</text>
                </>
              )}
            </motion.svg>
          </motion.div>
          <div className="text-[11px] text-white/35 mt-2">
            {phase === "clean" ? "Clean Input" : phase === "attacking" ? "Perturbing…" : fooled ? "⚠ Adversarial" : "✓ Defended"}
          </div>
        </div>

        {/* Arrow + step tracker */}
        <div className="flex flex-col items-center gap-2">
          <motion.div animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
            <ArrowRight />
          </motion.div>
          <div className="text-[10px] text-white/20 text-center">
            {phase === "attacking" ? `${step}/${attack.steps}` : "CNN"}
          </div>
          {attack.steps > 1 && (
            <div className="flex gap-0.5 flex-wrap justify-center" style={{ maxWidth: 64 }}>
              {Array.from({ length: attack.steps }).map((_, i) => (
                <motion.div key={i}
                  className="w-1.5 h-1.5 rounded-full"
                  animate={{ background: i < step ? attack.color : "rgba(255,255,255,0.12)" }}
                  transition={{ duration: 0.15 }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Top-3 predictions */}
        <div style={{ minWidth: 190 }}>
          <div className="text-[10px] uppercase tracking-widest text-white/30 mb-3">Top-3 Predictions</div>
          <AnimatePresence mode="wait">
            <motion.div key={`${phase}-${attackKey}-${defense}`}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="space-y-3"
            >
              {preds.map((p, i) => {
                const isWinner = i === 0;
                const barColor = phase === "done"
                  ? (isWinner ? (fooled ? "#ef4444" : "#22c55e") : "rgba(255,255,255,0.12)")
                  : ["#818cf8", "#a5b4fc", "#c4b5fd"][i];
                const labelColor = phase === "done" && isWinner
                  ? (fooled ? "#f87171" : "#86efac")
                  : isWinner ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.35)";
                return (
                  <div key={`${phase}-${p.label}`}>
                    <div className="flex justify-between mb-1">
                      <span className="text-[11px]" style={{ color: labelColor }}>{p.label}</span>
                      <span className="text-[11px] font-bold font-mono" style={{ color: labelColor }}>{p.conf}%</span>
                    </div>
                    <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                      <motion.div className="h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${p.conf}%` }}
                        transition={{ duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                        style={{ background: barColor }}
                      />
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Result badge */}
      <AnimatePresence>
        {phase === "done" && (
          <motion.div
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mb-4 rounded-xl px-4 py-2.5 text-center text-xs font-semibold"
            style={{
              background: fooled ? "rgba(239,68,68,0.1)" : "rgba(34,197,94,0.1)",
              border: `1px solid ${fooled ? "rgba(239,68,68,0.25)" : "rgba(34,197,94,0.25)"}`,
              color: fooled ? "#f87171" : "#86efac",
            }}
          >
            {fooled
              ? `Attack succeeded — ${attack.label} bypassed ${DEFENSES[defense].label}`
              : `Defense held — ${DEFENSES[defense].label} blocked ${attack.label}`}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <div className="flex gap-3 justify-center">
        <motion.button
          onClick={launch}
          disabled={phase !== "clean"}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold"
          style={{
            background: phase !== "clean" ? "rgba(255,255,255,0.04)" : `${attack.color}22`,
            border: `1px solid ${phase !== "clean" ? "rgba(255,255,255,0.08)" : attack.color + "50"}`,
            color: phase !== "clean" ? "rgba(255,255,255,0.2)" : attack.color,
            cursor: phase !== "clean" ? "not-allowed" : "pointer",
          }}
          whileHover={phase === "clean" ? { scale: 1.04 } : {}}
          whileTap={phase === "clean" ? { scale: 0.97 } : {}}
        >
          {phase === "attacking" ? `Running ${attack.label} (${step}/${attack.steps})…` : "Launch Attack"}
        </motion.button>
        <motion.button
          onClick={reset}
          disabled={phase === "clean"}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold"
          style={{
            background: phase === "clean" ? "rgba(255,255,255,0.04)" : "rgba(99,102,241,0.18)",
            border: `1px solid ${phase === "clean" ? "rgba(255,255,255,0.06)" : "rgba(99,102,241,0.4)"}`,
            color: phase === "clean" ? "rgba(255,255,255,0.2)" : "#a5b4fc",
            cursor: phase === "clean" ? "not-allowed" : "pointer",
          }}
          whileHover={phase !== "clean" ? { scale: 1.04 } : {}}
          whileTap={phase !== "clean" ? { scale: 0.97 } : {}}
        >
          Reset
        </motion.button>
      </div>
    </div>
  );
}

// ─── Presentation Mode Controls ───────────────────────────────────────────────
function PresentationControls({ current, total, onPrev, onNext, onGoTo, onExit }) {
  const sp = SPEAKERS[SLIDE_SPEAKERS[current]];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.4 }}
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3"
      style={{
        background: "rgba(10,10,26,0.88)",
        backdropFilter: "blur(24px)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "999px",
        padding: "10px 16px",
      }}
    >
      {/* Speaker badge — animated on slide change */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current + "-sp"}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -8 }}
          transition={{ duration: 0.28 }}
          className="flex items-center gap-2 pr-2"
          style={{ borderRight: "1px solid rgba(255,255,255,0.08)" }}
        >
          <motion.div
            className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black"
            style={{ background: sp.color, color: "#030712" }}
            animate={{ boxShadow: [`0 0 0px ${sp.color}00`, `0 0 10px ${sp.color}80`, `0 0 0px ${sp.color}00`] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {sp.initials}
          </motion.div>
          <span className="text-xs font-semibold" style={{ color: sp.color }}>{sp.name}</span>
        </motion.div>
      </AnimatePresence>

      {/* Prev */}
      <motion.button
        onClick={onPrev}
        disabled={current === 0}
        className="w-9 h-9 rounded-full flex items-center justify-center"
        style={{
          background: current === 0 ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.08)",
          color: current === 0 ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.7)",
          cursor: current === 0 ? "not-allowed" : "pointer",
        }}
        whileHover={current !== 0 ? { scale: 1.1, background: "rgba(255,255,255,0.14)" } : {}}
        whileTap={current !== 0 ? { scale: 0.93 } : {}}
      >
        <ChevronLeft />
      </motion.button>

      {/* Dot indicators — colored per speaker */}
      <div className="flex items-center gap-1.5 px-1">
        {Array.from({ length: total }).map((_, i) => {
          const dotSp = SPEAKERS[SLIDE_SPEAKERS[i]];
          return (
            <motion.button
              key={i}
              onClick={() => i !== current && onGoTo(i)}
              title={`${SLIDE_LABELS[i]} · ${dotSp.name}`}
              animate={{
                width: i === current ? 22 : 6,
                background: i === current ? dotSp.color : "rgba(255,255,255,0.18)",
                opacity: i === current ? 1 : 0.5,
              }}
              transition={{ duration: 0.3 }}
              className="h-1.5 rounded-full cursor-pointer"
              style={{ minWidth: 6 }}
            />
          );
        })}
      </div>

      {/* Slide counter */}
      <span className="text-xs font-mono text-white/35 px-1 select-none tabular-nums">
        {current + 1} / {total}
      </span>

      {/* Next */}
      <motion.button
        onClick={onNext}
        disabled={current === total - 1}
        className="w-9 h-9 rounded-full flex items-center justify-center"
        style={{
          background: current === total - 1 ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.08)",
          color: current === total - 1 ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.7)",
          cursor: current === total - 1 ? "not-allowed" : "pointer",
        }}
        whileHover={current !== total - 1 ? { scale: 1.1, background: "rgba(255,255,255,0.14)" } : {}}
        whileTap={current !== total - 1 ? { scale: 0.93 } : {}}
      >
        <ChevronRight />
      </motion.button>

      {/* Divider */}
      <div className="w-px h-5 bg-white/10 mx-1" />

      {/* Exit */}
      <motion.button
        onClick={onExit}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
        style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)", cursor: "pointer" }}
        whileHover={{ background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.8)" }}
        whileTap={{ scale: 0.96 }}
      >
        <ScrollIcon />
        Scroll
      </motion.button>
    </motion.div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [presentMode, setPresentMode] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const TOTAL = SLIDE_LABELS.length;

  const goTo = useCallback((index) => {
    if (index < 0 || index >= TOTAL || transitioning) return;
    setTransitioning(true);
    setCurrentSlide(index);
    setTimeout(() => setTransitioning(false), 620);
  }, [TOTAL, transitioning]);

  const goNext = useCallback(() => goTo(currentSlide + 1), [currentSlide, goTo]);
  const goPrev = useCallback(() => goTo(currentSlide - 1), [currentSlide, goTo]);

  const enterPresent = useCallback(() => {
    setCurrentSlide(0);
    setPresentMode(true);
  }, []);

  const exitPresent = useCallback(() => {
    setPresentMode(false);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (!presentMode) return;
    const handler = (e) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " ") { e.preventDefault(); goNext(); }
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); goPrev(); }
      if (e.key === "Escape") { e.preventDefault(); exitPresent(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [presentMode, goNext, goPrev, exitPresent]);

  // Lock page scroll in present mode
  useEffect(() => {
    document.documentElement.style.overflow = presentMode ? "hidden" : "";
    return () => { document.documentElement.style.overflow = ""; };
  }, [presentMode]);

  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 600], [0, -130]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);

  // Shared sections content — rendered once, reused in both modes
  const sectionsContent = (
    <>
      {/* 1. HERO */}
      <Section>
        <SectionSpeaker slideIndex={0} />
        <GlowOrb color="#6366f1" size={700} x="60%" y="40%" opacity={0.12} />
        <GlowOrb color="#a855f7" size={500} x="20%" y="70%" opacity={0.08} />
        <GridLines />
        <Particles count={50} color="rgba(99,102,241,0.5)" />

        <motion.div
          className="relative z-10 text-center px-6 max-w-5xl mx-auto"
          style={presentMode ? {} : { y: heroY, opacity: heroOpacity }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-indigo-300 uppercase tracking-widest mb-8"
            style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <motion.div
              className="w-2 h-2 bg-indigo-400 rounded-full"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            Security AI Research · 2025
          </motion.div>

          <h1 className="font-black leading-none mb-6 tracking-tight" style={{ fontSize: "clamp(2.5rem, 7vw, 5.5rem)" }}>
            <StaggerText text="Adversarial" className="block" style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }} />
            <StaggerText text="Robustness" className="text-white block" delay={0.3} />
            <span className="block text-white/35" style={{ fontSize: "clamp(1.4rem, 3.5vw, 2.5rem)", marginTop: "0.25em" }}>
              <StaggerText text="in Security Models" delay={0.6} />
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="text-white/45 text-lg max-w-xl mx-auto mb-10 leading-relaxed"
          >
            How attackers fool AI security systems — and how we build models that fight back.
          </motion.p>

          <AttackDefenseVisual />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.2 }}
            className="mt-12 flex flex-col items-center gap-2 text-white/20 text-xs"
          >
            <span className="uppercase tracking-widest">Scroll</span>
            <motion.div
              className="w-px h-8 bg-gradient-to-b from-white/20 to-transparent"
              animate={{ scaleY: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
        </motion.div>
      </Section>

      {/* 2. PROBLEM */}
      <Section>
        <SectionSpeaker slideIndex={1} />
        <GlowOrb color="#ef4444" size={600} x="80%" y="50%" opacity={0.1} />
        <GlowOrb color="#f97316" size={400} x="10%" y="30%" opacity={0.07} />
        <GridLines />

        <div className="relative z-10 max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center w-full">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="text-xs uppercase tracking-widest text-red-400 font-semibold mb-4"
            >
              The Problem
            </motion.div>
            <h2 className="font-black leading-tight mb-6" style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}>
              <StaggerText text="AI Can Be" className="text-white block" />
              <StaggerText text="Fooled." className="block" delay={0.2} style={{ background: "linear-gradient(135deg,#f97316,#ef4444)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }} />
            </h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="text-white/45 leading-relaxed mb-8"
            >
              Imperceptible perturbations — invisible to humans — can catastrophically corrupt AI model predictions. A change of just 0.007% in pixel values can transform a correctly classified image into a completely wrong prediction with 99% confidence.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="flex gap-10"
            >
              {[
                { val: 97, suffix: "%", label: "Attack success rate", color: "#ef4444" },
                { val: 7, suffix: "‰", label: "Perturbation threshold", color: "#f97316" },
              ].map((s, i) => (
                <div key={i}>
                  <div className="text-3xl font-black" style={{ color: s.color }}>
                    <Counter to={s.val} suffix={s.suffix} duration={2} />
                  </div>
                  <div className="text-white/35 text-xs mt-1">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="rounded-2xl p-8"
            style={{ background: "rgba(255,255,255,0.03)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div className="grid grid-cols-3 gap-4 items-center">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto rounded-xl mb-3 flex items-center justify-center" style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)" }}>
                  <svg width="48" height="48" viewBox="0 0 100 100">
                    <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" fill="rgba(34,197,94,0.25)" stroke="#22c55e" strokeWidth="4"/>
                    <text x="50" y="58" textAnchor="middle" fill="#22c55e" fontSize="20" fontWeight="bold">STOP</text>
                  </svg>
                </div>
                <div className="text-xs text-white/35">Clean Input</div>
                <div className="text-xs text-green-400 font-bold mt-0.5">Stop Sign ✓</div>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 mx-auto rounded-xl mb-3 flex items-center justify-center relative overflow-hidden" style={{ background: "rgba(168,85,247,0.12)", border: "1px solid rgba(168,85,247,0.3)" }}>
                  <motion.div
                    className="absolute inset-0"
                    animate={{ opacity: [0.3, 0.9, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(168,85,247,0.15) 0px, transparent 2px, transparent 4px)" }}
                  />
                  <span className="text-2xl font-black text-purple-400" style={{ position: "relative" }}>+ε</span>
                </div>
                <div className="text-xs text-white/35">+ Noise</div>
                <div className="text-xs text-purple-400 font-bold mt-0.5">Δ = 0.007%</div>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 mx-auto rounded-xl mb-3 flex items-center justify-center" style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)" }}>
                  <svg width="48" height="48" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="rgba(239,68,68,0.2)" stroke="#ef4444" strokeWidth="4"/>
                    <text x="50" y="42" textAnchor="middle" fill="#ef4444" fontSize="13" fontWeight="bold">Speed</text>
                    <text x="50" y="64" textAnchor="middle" fill="#ef4444" fontSize="22" fontWeight="bold">45</text>
                  </svg>
                </div>
                <div className="text-xs text-white/35">Output</div>
                <div className="text-xs text-red-400 font-bold mt-0.5">Speed 45 ✗</div>
              </div>
            </div>
            <div className="mt-5 pt-4 text-center text-xs text-white/25" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              Imperceptible to humans · Catastrophic to AI
            </div>
          </motion.div>
        </div>
      </Section>

      {/* 3. ATTACK TYPES */}
      <Section>
        <SectionSpeaker slideIndex={2} />
        <GlowOrb color="#6366f1" size={500} x="50%" y="20%" opacity={0.1} />
        <GridLines />
        <Particles count={25} color="rgba(168,85,247,0.3)" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 w-full">
          <div className="text-center mb-12">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-xs uppercase tracking-widest text-purple-400 font-semibold mb-4">
              Attack Taxonomy
            </motion.div>
            <h2 className="text-5xl font-black">
              <StaggerText text="Types of Adversarial Attacks" className="text-white" />
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5 mb-5">
            <AttackCard icon={<TargetIcon />} title="Evasion Attacks" description="Crafted inputs at inference time that bypass model detection. Attackers manipulate inputs to evade predictions without touching training data." color="#ef4444" delay={0} />
            <AttackCard icon={<VirusIcon />} title="Poisoning Attacks" description="Malicious data injected during training corrupts learned behavior. Backdoor triggers planted to activate misclassifications on demand." color="#f97316" delay={0.12} />
            <AttackCard icon={<EyeIcon />} title="Model Extraction" description="Systematic queries to a deployed model reconstruct a functional clone — which attackers then use to craft targeted adversarial examples offline." color="#a855f7" delay={0.24} />
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            <AttackCard icon={<ZapIcon />} title="White-Box Attacks (FGSM, PGD, C&W)" description="Full access to model architecture and gradients. Exploit gradient information to craft maximally effective perturbations with surgical precision." color="#6366f1" delay={0.36} />
            <AttackCard icon={<BrainIcon />} title="Black-Box Attacks" description="No model access. Rely on transfer attacks, boundary methods, or decision-based strategies. Surprisingly effective — and stealthy — in real deployments." color="#06b6d4" delay={0.48} />
          </div>
        </div>
      </Section>

      {/* 4. REAL-WORLD IMPACT */}
      <Section>
        <SectionSpeaker slideIndex={3} />
        <GlowOrb color="#f97316" size={600} x="30%" y="60%" opacity={0.08} />
        <GlowOrb color="#ef4444" size={400} x="80%" y="30%" opacity={0.06} />
        <GridLines />

        <div className="relative z-10 max-w-6xl mx-auto px-6 w-full">
          <div className="text-center mb-12">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-xs uppercase tracking-widest text-orange-400 font-semibold mb-4">
              Real-World Impact
            </motion.div>
            <h2 className="font-black leading-tight" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}>
              <StaggerText text="When AI Security Fails," className="text-white block" />
              <StaggerText text="Reality Breaks." className="block" delay={0.3} style={{ background: "linear-gradient(135deg,#f97316,#ef4444)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }} />
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5 mb-6">
            <ImpactCard icon={<CarIcon />} title="Autonomous Vehicles" stat="+240%" desc="Attack success rate against AV perception using physical adversarial stickers on road signs." color="#ef4444" delay={0} />
            <ImpactCard icon={<FaceIcon />} title="Face Recognition" stat="99.9%" desc="Bypass rate for state-of-the-art facial recognition using adversarial makeup or eyeglass patterns." color="#f97316" delay={0.15} />
            <ImpactCard icon={<BugIcon />} title="Malware Detection" stat="76%" desc="Of ML-based malware detectors successfully evaded via adversarial feature manipulation." color="#a855f7" delay={0.3} />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="rounded-2xl p-5 text-center"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <p className="text-white/35 text-sm max-w-2xl mx-auto">
              In 2024, adversarial attacks on AI security systems caused an estimated{" "}
              <span className="text-orange-400 font-bold">$38.5B</span> in potential enterprise exposure —
              up from <span className="text-red-400 font-bold">$12.1B</span> in 2022.
            </p>
          </motion.div>
        </div>
      </Section>

      {/* 5. ROBUSTNESS CONCEPT */}
      <Section>
        <SectionSpeaker slideIndex={4} />
        <GlowOrb color="#6366f1" size={700} x="50%" y="50%" opacity={0.12} />
        <GridLines />

        <div className="relative z-10 max-w-5xl mx-auto px-6 w-full">
          <div className="text-center mb-10">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-xs uppercase tracking-widest text-indigo-400 font-semibold mb-4">
              Core Concept
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              <StaggerText text="What is Adversarial Robustness?" className="text-white" />
            </h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="text-white/40 max-w-xl mx-auto font-mono text-sm"
            >
              ∀ δ with ‖δ‖ ≤ ε : f(x + δ) = f(x)
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-6"
          >
            <ComparisonSlider />
            <p className="text-center text-white/20 text-xs mt-3">Drag to compare vulnerable vs. robust model accuracy under attack</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              { label: "Certified Robustness", value: "Provable ∀ δ", color: "#6366f1", desc: "Mathematically guaranteed correctness for any input within the bounded perturbation ball" },
              { label: "Empirical Robustness", value: "PGD / AutoAttack", color: "#a855f7", desc: "Tested against known strongest attacks — practical robustness measured on benchmarks" },
              { label: "Accuracy Tradeoff", value: "∼15–20% cost", color: "#06b6d4", desc: "Typical clean accuracy cost paid to achieve meaningful adversarial robustness" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.5 + i * 0.1 }}
                className="rounded-xl p-5"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
                <div className="text-xs text-white/35 mb-2">{item.label}</div>
                <div className="text-lg font-black mb-2 font-mono" style={{ color: item.color }}>{item.value}</div>
                <div className="text-white/35 text-xs leading-relaxed">{item.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* 6. DEFENSE TECHNIQUES */}
      <Section>
        <SectionSpeaker slideIndex={5} />
        <GlowOrb color="#22c55e" size={500} x="20%" y="50%" opacity={0.07} />
        <GlowOrb color="#6366f1" size={400} x="80%" y="30%" opacity={0.08} />
        <GridLines />

        <div className="relative z-10 max-w-5xl mx-auto px-6 w-full">
          <div className="text-center mb-12">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-xs uppercase tracking-widest text-green-400 font-semibold mb-4">
              Defense Arsenal
            </motion.div>
            <h2 className="text-5xl font-black">
              <StaggerText text="How We Fight Back" className="text-white" />
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <DefenseCard
                icon={<ShieldIcon size={18} />}
                title="Adversarial Training"
                description="Train on adversarial examples alongside clean data. The empirical robustness gold standard."
                color="#6366f1"
                delay={0}
                bullets={["PGD-based adversarial training (Madry et al.)", "TRADES: balances accuracy and robustness", "Free AT for computational efficiency", "Most effective empirical defense available"]}
              />
              <DefenseCard
                icon={<FilterIcon />}
                title="Input Preprocessing"
                description="Transform inputs before inference to strip adversarial perturbations."
                color="#22c55e"
                delay={0.1}
                bullets={["Gaussian smoothing & denoising autoencoders", "JPEG compression as low-cost defense", "Spatial smoothing and bit-depth reduction", "Neural purification networks"]}
              />
            </div>
            <div className="space-y-4">
              <DefenseCard
                icon={<LayersIcon />}
                title="Defensive Distillation"
                description="Train a second model on soft probabilities of the first to smooth decision boundaries."
                color="#a855f7"
                delay={0.2}
                bullets={["Reduces gradient magnitude for attackers", "Student-teacher training paradigm", "Softens output probability distributions", "Effective against gradient-based attacks"]}
              />
              <DefenseCard
                icon={<ZapIcon size={18} />}
                title="Certified Defenses"
                description="Provable robustness guarantees within a specified perturbation bound ε."
                color="#06b6d4"
                delay={0.3}
                bullets={["Randomized Smoothing (Cohen et al., 2019)", "Interval Bound Propagation (IBP)", "Semidefinite programming relaxations", "Lipschitz-constrained neural architectures"]}
              />
            </div>
          </div>
          <p className="text-center text-white/20 text-xs mt-5">Click any card to expand</p>
        </div>
      </Section>

      {/* 7. METRICS */}
      <Section>
        <SectionSpeaker slideIndex={6} />
        <GlowOrb color="#06b6d4" size={600} x="70%" y="40%" opacity={0.1} />
        <GridLines />
        <Particles count={20} color="rgba(6,182,212,0.4)" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 w-full">
          <div className="text-center mb-12">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-xs uppercase tracking-widest text-cyan-400 font-semibold mb-4">
              Metrics & Evaluation
            </motion.div>
            <h2 className="text-5xl font-black">
              <StaggerText text="Measuring Robustness" className="text-white" />
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="rounded-2xl p-7"
              style={{ background: "rgba(255,255,255,0.03)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <h3 className="text-base font-bold text-white mb-6">Accuracy Under Attack (ResNet-50, CIFAR-10)</h3>
              <AnimatedBar label="Clean accuracy (no attack)" value={94} color="#22c55e" delay={0.1} />
              <AnimatedBar label="Under FGSM (ε=8/255)" value={71} color="#6366f1" delay={0.2} />
              <AnimatedBar label="Under PGD-20 (ε=8/255)" value={58} color="#a855f7" delay={0.3} />
              <AnimatedBar label="Under AutoAttack" value={47} color="#f97316" delay={0.4} />
              <AnimatedBar label="Under C&W L∞ Attack" value={43} color="#ef4444" delay={0.5} />
            </motion.div>

            <div className="space-y-4">
              {[
                { label: "Robustness Score", val: 87, suffix: "/100", color: "#6366f1", desc: "Composite score from RobustBench leaderboard (higher is better)" },
                { label: "Certified Radius ℓ∞", val: 50, suffix: "‰", color: "#06b6d4", desc: "Perturbation radius with mathematically certified accuracy guarantee" },
                { label: "Attack Success Rate", val: 13, suffix: "%", color: "#22c55e", desc: "Against state-of-the-art adversarial training defense (lower is better)" },
              ].map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.15 }}
                  className="rounded-2xl p-5 flex items-center gap-5"
                  style={{ background: "rgba(255,255,255,0.03)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.07)" }}
                  whileHover={{ x: -4, transition: { duration: 0.2 } }}
                >
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 text-lg font-black" style={{ background: `${m.color}15`, color: m.color }}>
                    <Counter to={m.val} suffix={m.suffix} duration={1.8} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white mb-0.5">{m.label}</div>
                    <div className="text-xs text-white/35">{m.desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* 8. DEMO */}
      <Section>
        <SectionSpeaker slideIndex={7} />
        <GlowOrb color="#a855f7" size={600} x="50%" y="50%" opacity={0.1} />
        <GridLines />

        <div className="relative z-10 max-w-3xl mx-auto px-6 w-full">
          <div className="text-center mb-10">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-xs uppercase tracking-widest text-purple-400 font-semibold mb-4">
              Interactive Demo
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              <StaggerText text="See the Attack Live" className="text-white" />
            </h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="text-white/40 max-w-lg mx-auto text-sm"
            >
              An adversarial perturbation causes a model to misclassify a stop sign as a speed limit sign — with 91% confidence.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <PredictionDemo />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.7 }}
            className="mt-4 text-center text-[11px] text-white/20"
          >
            Select attack method · adjust ε · toggle defense · observe outcome
          </motion.div>
        </div>
      </Section>

      {/* 9. CONCLUSION */}
      <Section>
        <SectionSpeaker slideIndex={8} />
        <GlowOrb color="#6366f1" size={800} x="50%" y="50%" opacity={0.15} />
        <GlowOrb color="#a855f7" size={400} x="15%" y="25%" opacity={0.08} />
        <GlowOrb color="#06b6d4" size={400} x="85%" y="75%" opacity={0.08} />
        <Particles count={60} color="rgba(99,102,241,0.4)" />
        <GridLines />

        <div className="relative z-10 text-center max-w-4xl mx-auto px-6 w-full">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xs uppercase tracking-widest text-indigo-400 font-semibold mb-8"
          >
            The Future of AI Security
          </motion.div>

          <h2 className="font-black leading-tight mb-8" style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}>
            <StaggerText text="Security is not" className="text-white/40 block" />
            <StaggerText text="optional." className="text-white block" delay={0.2} />
            <span className="block" style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              <StaggerText text="Robustness" delay={0.4} />
            </span>
            <StaggerText text="is the future." className="text-white block" delay={0.6} />
          </h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-white/35 text-base max-w-xl mx-auto leading-relaxed mb-10"
          >
            Every model deployed in a security-critical system is a potential target. The question is not <em>if</em> an attack will occur — it's whether your model can withstand it.
          </motion.p>

          <motion.div
            className="flex flex-wrap gap-3 justify-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            {["Adversarial Training", "Certified Defenses", "Robustness Benchmarking", "Threat Modeling"].map((tag, i) => (
              <motion.span
                key={i}
                className="px-4 py-2 rounded-full text-sm text-indigo-300 font-medium"
                style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)", border: "1px solid rgba(99,102,241,0.2)" }}
                whileHover={{ scale: 1.05, borderColor: "rgba(99,102,241,0.5)" }}
                transition={{ duration: 0.2 }}
              >
                {tag}
              </motion.span>
            ))}
          </motion.div>

          <motion.div
            className="grid grid-cols-3 gap-4 max-w-lg mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            {[
              { val: 3200, suffix: "+", label: "Research Papers", color: "#6366f1" },
              { val: 47, suffix: "%", label: "Robustness Gain", color: "#a855f7" },
              { val: 98, suffix: "%", label: "Enterprises at Risk", color: "#ef4444" },
            ].map((s, i) => (
              <div key={i} className="rounded-xl p-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="text-2xl font-black mb-1" style={{ color: s.color }}>
                  <Counter to={s.val} suffix={s.suffix} duration={2.5} />
                </div>
                <div className="text-xs text-white/30">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </Section>
    </>
  );

  return (
    <PresentModeContext.Provider value={presentMode}>
      <div style={{ background: "#030712", color: "white" }}>

        {/* ── Present mode toggle button ───────────────────────────────── */}
        <AnimatePresence>
          {!presentMode && (
            <motion.button
              key="present-btn"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35 }}
              onClick={enterPresent}
              className="fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold"
              style={{
                background: "rgba(99,102,241,0.18)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(99,102,241,0.35)",
                color: "#a5b4fc",
                cursor: "pointer",
              }}
              whileHover={{ background: "rgba(99,102,241,0.32)", borderColor: "rgba(99,102,241,0.6)", scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              <PresentIcon />
              Present
            </motion.button>
          )}
        </AnimatePresence>

        {/* ── PRESENT MODE: fixed viewport, horizontal slider ─────────── */}
        <AnimatePresence>
          {presentMode && (
            <motion.div
              key="present-shell"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45 }}
              className="fixed inset-0 z-40"
              style={{ overflow: "hidden", background: "#030712" }}
            >
              {/* Slide label + speaker — top left */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide + "-lbl"}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.3 }}
                  className="absolute top-6 left-6 z-50 flex items-center gap-2 pointer-events-none"
                >
                  {/* Slide name */}
                  <div
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.35)" }}
                  >
                    <PresentIcon />
                    {SLIDE_LABELS[currentSlide]}
                  </div>
                  {/* Speaker pill */}
                  <SpeakerBadge slideIndex={currentSlide} animate />
                </motion.div>
              </AnimatePresence>

              {/* Exit button — top right */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute top-6 right-6 z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)", cursor: "pointer" }}
                whileHover={{ color: "rgba(255,255,255,0.85)", background: "rgba(255,255,255,0.11)" }}
                whileTap={{ scale: 0.95 }}
                onClick={exitPresent}
              >
                <ScrollIcon />
                Exit
              </motion.button>

              {/* Horizontal sliding rail */}
              <motion.div
                className="flex h-full"
                style={{ width: `${TOTAL * 100}vw` }}
                animate={{ x: `${-currentSlide * (100 / TOTAL)}%` }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                {sectionsContent}
              </motion.div>

              {/* Controls bar */}
              <PresentationControls
                current={currentSlide}
                total={TOTAL}
                onNext={goNext}
                onPrev={goPrev}
                onGoTo={goTo}
                onExit={exitPresent}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── SCROLL MODE ─────────────────────────────────────────────── */}
        {!presentMode && sectionsContent}

      </div>
    </PresentModeContext.Provider>
  );
}

