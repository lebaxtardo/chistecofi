export const LOCALES = ['en', 'es', 'fr', 'nl'] as const
export type Locale = (typeof LOCALES)[number]

export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  nl: 'Nederlands',
}

const en = {
  title: 'Needle in a Haystack',
  proverb: 'Finding a needle in a haystack',
  tagline:
    'One silver needle is hidden in a mountain of straw. Drag the straw aside. When you spot the needle, drag it.',
  howToTitle: 'How to play',
  howToPan: 'Drag empty ground to pan. Arrow keys or WASD also pan. Scroll to zoom.',
  howToStraw: 'Zoom in, then drag a straw to move it. Double-click to scatter a handful.',
  howToNeedle: 'The needle is a thin silver sliver. Drag it away from its nest to win.',
  howToZoom: 'On larger stacks, zoom out to see the mountain and zoom in to tell straw from needle.',
  howToProximity: 'The warmth meter rises as the center of your view nears the needle.',
  play: 'Play',
  easy: 'Easy',
  medium: 'Medium',
  expert: 'Expert',
  easyHint: 'Look closely. The whole pile can sit on screen.',
  mediumHint: 'Zoom, pan, and follow the warmth.',
  expertHint: 'A proverb made literal. Trust the meter, then look for silver.',
  hayCount: '{count} straws · 1 needle',
  back: 'Back',
  youFoundIt: 'You found it!',
  winBody: 'You pulled the needle from the haystack.',
  playAgain: 'Play again',
  changeLevel: 'Change level',
  strawsMoved: 'Moved {count}',
  zoom: 'Zoom {value}×',
  proximity: 'Warmth',
  language: 'Language',
  draggingStraw: 'Straw',
  draggingNeedle: 'Needle',
  controlsHint: 'Scroll to zoom · Drag to move · Double-click to scatter',
  time: 'Time',
  needleInView: 'Silver is in view — look carefully',
  zoomInToPick: 'Zoom in to pick up straw and the needle',
  footer: 'A proverb, made playable.',
  selectLevel: 'Choose a difficulty',
}

export type MessageKey = keyof typeof en

export const MESSAGES: Record<Locale, Record<MessageKey, string>> = {
  en,
  es: {
    title: 'Una aguja en un pajar',
    proverb: 'Encontrar una aguja en un pajar',
    tagline:
      'Una aguja de plata está escondida en una montaña de paja. Arrastra la paja. Cuando la veas, arrastra la aguja.',
    howToTitle: 'Cómo jugar',
    howToPan: 'Arrastra el suelo vacío para moverte. Flechas o WASD también. Rueda para zoom.',
    howToStraw: 'Acércate y arrastra una paja para apartarla. Doble clic para esparcir un puñado.',
    howToNeedle: 'La aguja es una astilla plateada y fina. Arrástrala para ganar.',
    howToZoom: 'En pajares grandes, aléjate para ver la montaña y acércate para distinguir paja y aguja.',
    howToProximity: 'El medidor de calor sube cuando el centro de la vista se acerca a la aguja.',
    play: 'Jugar',
    easy: 'Fácil',
    medium: 'Medio',
    expert: 'Experto',
    easyHint: 'Mira con atención. El pajar cabe en pantalla.',
    mediumHint: 'Zoom, recorre y sigue el calor.',
    expertHint: 'El dicho, al pie de la letra. Confía en el medidor y busca el plata.',
    hayCount: '{count} pajitas · 1 aguja',
    back: 'Volver',
    youFoundIt: '¡La encontraste!',
    winBody: 'Sacaste la aguja del pajar.',
    playAgain: 'Jugar de nuevo',
    changeLevel: 'Cambiar nivel',
    strawsMoved: 'Movidas {count}',
    zoom: 'Zoom {value}×',
    proximity: 'Calor',
    language: 'Idioma',
    draggingStraw: 'Paja',
    draggingNeedle: 'Aguja',
    controlsHint: 'Rueda para zoom · Arrastra para mover · Doble clic para esparcir',
    time: 'Tiempo',
    needleInView: 'Hay plata a la vista — mira con cuidado',
    zoomInToPick: 'Acércate para recoger paja y la aguja',
    footer: 'Un dicho, hecho juego.',
    selectLevel: 'Elige una dificultad',
  },
  fr: {
    title: 'Une aiguille dans une botte de foin',
    proverb: 'Chercher une aiguille dans une botte de foin',
    tagline:
      "Une aiguille d'argent est cachée dans une montagne de paille. Glissez la paille. Quand vous la voyez, glissez l'aiguille.",
    howToTitle: 'Comment jouer',
    howToPan: 'Glissez le sol vide pour vous déplacer. Flèches ou WASD aussi. Molette pour zoomer.',
    howToStraw: 'Zoomez, puis glissez un brin pour l’écarter. Double-clic pour disperser une poignée.',
    howToNeedle: 'L’aiguille est une fine lueur d’argent. Glissez-la pour gagner.',
    howToZoom: 'Sur les grands tas, dézoomez pour voir la montagne, zoomez pour distinguer paille et aiguille.',
    howToProximity: 'Le thermomètre monte quand le centre de la vue s’approche de l’aiguille.',
    play: 'Jouer',
    easy: 'Facile',
    medium: 'Moyen',
    expert: 'Expert',
    easyHint: 'Regardez bien. Tout le tas tient à l’écran.',
    mediumHint: 'Zoomez, parcourez, suivez la chaleur.',
    expertHint: 'Le proverbe, au premier degré. Fiez-vous au thermomètre, puis à l’argent.',
    hayCount: '{count} brins · 1 aiguille',
    back: 'Retour',
    youFoundIt: 'Vous l’avez trouvée !',
    winBody: 'Vous avez tiré l’aiguille hors de la botte de foin.',
    playAgain: 'Rejouer',
    changeLevel: 'Changer de niveau',
    strawsMoved: 'Déplacés {count}',
    zoom: 'Zoom {value}×',
    proximity: 'Chaleur',
    language: 'Langue',
    draggingStraw: 'Paille',
    draggingNeedle: 'Aiguille',
    controlsHint: 'Molette zoom · Glisser pour déplacer · Double-clic pour disperser',
    time: 'Temps',
    needleInView: 'L’argent est visible — ouvrez l’œil',
    zoomInToPick: 'Zoomez pour saisir la paille et l’aiguille',
    footer: 'Un proverbe, devenu jeu.',
    selectLevel: 'Choisissez une difficulté',
  },
  nl: {
    title: 'Een naald in een hooiberg',
    proverb: 'Een naald in een hooiberg zoeken',
    tagline:
      'Eén zilveren naald zit verstopt in een berg stro. Sleep het stro opzij. Als je de naald ziet, sleep hem.',
    howToTitle: 'Hoe te spelen',
    howToPan: 'Sleep lege grond om te pannen. Pijltjes of WASD ook. Scroll om te zoomen.',
    howToStraw: 'Zoom in en sleep een strootje weg. Dubbelklik om een handvol te verspreiden.',
    howToNeedle: 'De naald is een dun zilveren sliertje. Sleep hem om te winnen.',
    howToZoom: 'Bij grote bergen zoom je uit voor de berg en in om stro van naald te onderscheiden.',
    howToProximity: 'De warmtemeter stijgt als het midden van je beeld dichter bij de naald komt.',
    play: 'Spelen',
    easy: 'Makkelijk',
    medium: 'Gemiddeld',
    expert: 'Expert',
    easyHint: 'Kijk goed. De hele berg past op het scherm.',
    mediumHint: 'Zoom, pan en volg de warmte.',
    expertHint: 'Het gezegde, letterlijk. Vertrouw de meter, zoek dan zilver.',
    hayCount: '{count} strootjes · 1 naald',
    back: 'Terug',
    youFoundIt: 'Je hebt hem gevonden!',
    winBody: 'Je hebt de naald uit de hooiberg gehaald.',
    playAgain: 'Opnieuw spelen',
    changeLevel: 'Ander niveau',
    strawsMoved: 'Verplaatst {count}',
    zoom: 'Zoom {value}×',
    proximity: 'Warmte',
    language: 'Taal',
    draggingStraw: 'Stro',
    draggingNeedle: 'Naald',
    controlsHint: 'Scroll zoom · Sleep om te verplaatsen · Dubbelklik om te strooien',
    time: 'Tijd',
    needleInView: 'Zilver is in beeld — kijk goed',
    zoomInToPick: 'Zoom in om stro en de naald te pakken',
    footer: 'Een gezegde, speelbaar gemaakt.',
    selectLevel: 'Kies een moeilijkheid',
  },
}

export function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? ''))
}

export function detectLocale(): Locale {
  const stored = safeStoredLocale()
  if (stored) return stored

  const candidates = [navigator.language, ...(navigator.languages ?? [])]
  for (const candidate of candidates) {
    const code = candidate.slice(0, 2).toLowerCase()
    if (isLocale(code)) return code
  }
  return 'en'
}

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value)
}

function safeStoredLocale(): Locale | null {
  try {
    const value = localStorage.getItem('chistecofi.locale')
    return value && isLocale(value) ? value : null
  } catch {
    return null
  }
}

export function persistLocale(locale: Locale): void {
  try {
    localStorage.setItem('chistecofi.locale', locale)
  } catch {
    /* private mode */
  }
}
