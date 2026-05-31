// Workout session phase definitions for Séance Maison V-Shape
// Each phase: { id, type: 'work'|'rest', label, target (seconds for work) or duration (for rest), tutorial, image, nextLabel?, nextImage? }

const IMG = {
  warmup:
    "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80",
  pushup:
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80",
  plank:
    "https://images.unsplash.com/photo-1566241142559-40e1dab266c6?auto=format&fit=crop&w=800&q=80",
};

const PUSH_TARGET = 60;
const PUSH_REST = 60;
const PLANK_TARGET = 60;
const PLANK_REST = 45;

const work = (id, label, target, tutorial, image, sub) => ({
  id,
  type: "work",
  label,
  target,
  tutorial,
  image,
  sub,
});

const rest = (id, duration, nextLabel, nextImage, nextDetail) => ({
  id,
  type: "rest",
  label: "Repos",
  duration,
  nextLabel,
  nextImage,
  nextDetail,
});

export const SESSION_PHASES = [
  work(
    "warmup",
    "Chauffe",
    60,
    "Rotations des bras (10 avant / 10 arrière) puis rotations des poignets. Amplitude complète.",
    IMG.warmup,
    "Activation articulaire"
  ),
  rest("warmup-to-push", 30, "Pompes — Série 1/4", IMG.pushup, "Jusqu'à l'échec, bonne forme."),
  work("pushups-1", "Pompes — Série 1/4", PUSH_TARGET, "Jusqu'à l'échec. Dos droit, descente contrôlée. Coudes proches du corps.", IMG.pushup, "Maximum reps en bonne forme"),
  rest("rest-p1", PUSH_REST, "Pompes — Série 2/4", IMG.pushup, "1 minute de repos strict."),
  work("pushups-2", "Pompes — Série 2/4", PUSH_TARGET, "Jusqu'à l'échec. Reste rigide, gainage actif.", IMG.pushup, "Maximum reps en bonne forme"),
  rest("rest-p2", PUSH_REST, "Pompes — Série 3/4", IMG.pushup, "1 minute de repos strict."),
  work("pushups-3", "Pompes — Série 3/4", PUSH_TARGET, "Jusqu'à l'échec. Souffle régulier, ne triche pas l'amplitude.", IMG.pushup, "Maximum reps en bonne forme"),
  rest("rest-p3", PUSH_REST, "Pompes — Série 4/4", IMG.pushup, "Dernière série de pompes."),
  work("pushups-4", "Pompes — Série 4/4", PUSH_TARGET, "Jusqu'à l'échec — donne tout. Forme avant ego.", IMG.pushup, "Maximum reps en bonne forme"),
  rest("rest-transition", PUSH_REST, "Gainage — Série 1/4", IMG.plank, "Transition vers le gainage."),
  work("plank-1", "Gainage — Série 1/4", PLANK_TARGET, "Planche sur avant-bras. Dos droit, abdos serrés, fessiers contractés. Ne pas cambrer.", IMG.plank, "1 minute en planche"),
  rest("rest-pl1", PLANK_REST, "Gainage — Série 2/4", IMG.plank, "45 secondes de repos strict."),
  work("plank-2", "Gainage — Série 2/4", PLANK_TARGET, "Garde la ligne épaules-bassin-talons. Respire.", IMG.plank, "1 minute en planche"),
  rest("rest-pl2", PLANK_REST, "Gainage — Série 3/4", IMG.plank, "45 secondes de repos strict."),
  work("plank-3", "Gainage — Série 3/4", PLANK_TARGET, "Tiens la tension. Mental d'acier.", IMG.plank, "1 minute en planche"),
  rest("rest-pl3", PLANK_REST, "Gainage — Série 4/4", IMG.plank, "Dernier repos. Dernière série."),
  work("plank-4", "Gainage — Série 4/4", PLANK_TARGET, "Dernière planche. Tout donner — c'est la finition.", IMG.plank, "1 minute en planche"),
];

export const formatTime = (s) => {
  const sign = s < 0 ? "-" : "";
  const abs = Math.abs(Math.floor(s));
  const m = Math.floor(abs / 60);
  const sec = abs % 60;
  return `${sign}${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
};
