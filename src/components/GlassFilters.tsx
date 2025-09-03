import { GLASS_EFFECTS } from "../constants";

export default function GlassFilters() {
  return (
    <svg style={{ display: "none" }} aria-hidden="true">
      <filter id="glass-distortion">
        <feTurbulence
          type="turbulence"
          baseFrequency={GLASS_EFFECTS.BASE_FREQUENCY}
          numOctaves={GLASS_EFFECTS.NUM_OCTAVES}
          result="noise"
        />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale={GLASS_EFFECTS.SCALE} />
      </filter>
    </svg>
  );
}
