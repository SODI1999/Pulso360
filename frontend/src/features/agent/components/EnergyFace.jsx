// src/features/agent/components/EnergyFace.jsx
// Emojis animados de Microsoft Fluent (los de Teams), almacenados localmente
// en public/assets/emoji y verificados como APNG animado. Se animan de forma
// nativa en el navegador (como un GIF), sin reproductor ni dependencias.
// Con prefers-reduced-motion se muestra la versión estática 3D (licencia MIT
// del set Fluent Emoji de microsoft/fluentui-emoji).

const ENERGY_EMOJIS = {
  1: { animated: '/assets/emoji/disappointed_face.png', still: '/assets/emoji/disappointed_face_3d.png' },
  2: { animated: '/assets/emoji/confused_face.png', still: '/assets/emoji/confused_face_3d.png' },
  3: { animated: '/assets/emoji/neutral_face.png', still: '/assets/emoji/neutral_face_3d.png' },
  4: {
    animated: '/assets/emoji/slightly_smiling_face.png',
    still: '/assets/emoji/slightly_smiling_face_3d.png'
  },
  5: {
    animated: '/assets/emoji/grinning_face_with_smiling_eyes.png',
    still: '/assets/emoji/grinning_face_with_smiling_eyes_3d.png'
  }
};

/**
 * Animated/static expressive avatar face representing affective and energy state on a 1-5 scale.
 * Respects 'prefers-reduced-motion' by switching to static 3D renderings.
 *
 * @param {Object} props - Component properties.
 * @param {number|string} [props.value=3] - Perceived score from 1 to 5.
 * @returns {import('react').JSX.Element} Visual emoji image.
 */
export function EnergyFace({ value = 3 }) {
  const level = Math.min(5, Math.max(1, Math.round(Number(value) || 3)));
  const asset = ENERGY_EMOJIS[level];

  const prefersReducedMotion =
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  return (
    <img
      className="energy-face"
      src={prefersReducedMotion ? asset.still : asset.animated}
      alt=""
      draggable="false"
      decoding="async"
      loading="lazy"
    />
  );
}
