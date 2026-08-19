const TEAM_ALIASES: Record<string, string> = {
  "paris saint germain": "paris-sg",
  "paris sg": "paris-sg",
  psg: "paris-sg",

  "rc lens": "rc-lens",
  lens: "rc-lens",

  "olympique de marseille": "olympique-marseille",
  marseille: "olympique-marseille",

  "olympique lyonnais": "olympique-lyonnais",
  lyon: "olympique-lyonnais",

  "as monaco": "as-monaco",
  monaco: "as-monaco",

  "lille osc": "losc",
  "losc lille": "losc",
  lille: "losc",
  losc: "losc",

  "stade rennais": "stade-rennais",
  "stade rennais fc": "stade-rennais",
  rennes: "stade-rennais",

  "ogc nice": "ogc-nice",
  nice: "ogc-nice",

  "rc strasbourg": "rc-strasbourg",
  "rc strasbourg alsace": "rc-strasbourg",
  strasbourg: "rc-strasbourg",

  "toulouse fc": "toulouse-fc",
  toulouse: "toulouse-fc",

  "stade brestois 29": "stade-brestois",
  "stade brestois": "stade-brestois",
  brest: "stade-brestois",

  "fc lorient": "fc-lorient",
  lorient: "fc-lorient",

  "angers sco": "angers-sco",
  angers: "angers-sco",

  "le havre ac": "le-havre",
  "le havre": "le-havre",

  "paris fc": "paris-fc",

  "aj auxerre": "aj-auxerre",
  auxerre: "aj-auxerre",

  "le mans fc": "le-mans",
  "le mans": "le-mans",

  "estac troyes": "estac-troyes",
  troyes: "estac-troyes",
}

export function normalizeTeamName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
}

export function getTeamSlugForProviderName(
  providerName: string,
): string | null {
  const normalized = normalizeTeamName(providerName)

  return TEAM_ALIASES[normalized] ?? null
}
