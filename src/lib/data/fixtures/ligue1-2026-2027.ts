export type Ligue1FixtureDefinition = {
  round: number
  homeSlug: string
  awaySlug: string
}

function fixture(
  round: number,
  homeSlug: string,
  awaySlug: string,
): Ligue1FixtureDefinition {
  return {
    round,
    homeSlug,
    awaySlug,
  }
}

export const LIGUE1_2026_2027_FIXTURES: Ligue1FixtureDefinition[] = [
  // Journée 1
  fixture(1, "angers-sco", "losc"),
  fixture(1, "le-havre", "as-monaco"),
  fixture(1, "le-mans", "stade-brestois"),
  fixture(1, "rc-lens", "aj-auxerre"),
  fixture(1, "olympique-marseille", "rc-strasbourg"),
  fixture(1, "ogc-nice", "fc-lorient"),
  fixture(1, "paris-sg", "stade-rennais"),
  fixture(1, "toulouse-fc", "olympique-lyonnais"),
  fixture(1, "estac-troyes", "paris-fc"),

  // Journée 2
  fixture(2, "aj-auxerre", "angers-sco"),
  fixture(2, "stade-brestois", "toulouse-fc"),
  fixture(2, "losc", "paris-sg"),
  fixture(2, "fc-lorient", "estac-troyes"),
  fixture(2, "olympique-lyonnais", "le-havre"),
  fixture(2, "as-monaco", "olympique-marseille"),
  fixture(2, "paris-fc", "ogc-nice"),
  fixture(2, "stade-rennais", "le-mans"),
  fixture(2, "rc-strasbourg", "rc-lens"),

  // Journée 3
  fixture(3, "angers-sco", "stade-rennais"),
  fixture(3, "le-havre", "stade-brestois"),
  fixture(3, "rc-lens", "fc-lorient"),
  fixture(3, "olympique-lyonnais", "aj-auxerre"),
  fixture(3, "olympique-marseille", "paris-fc"),
  fixture(3, "ogc-nice", "le-mans"),
  fixture(3, "paris-sg", "as-monaco"),
  fixture(3, "toulouse-fc", "losc"),
  fixture(3, "estac-troyes", "rc-strasbourg"),

  // Journée 4
  fixture(4, "aj-auxerre", "ogc-nice"),
  fixture(4, "stade-brestois", "paris-sg"),
  fixture(4, "le-havre", "angers-sco"),
  fixture(4, "le-mans", "rc-lens"),
  fixture(4, "losc", "estac-troyes"),
  fixture(4, "fc-lorient", "toulouse-fc"),
  fixture(4, "paris-fc", "olympique-lyonnais"),
  fixture(4, "stade-rennais", "olympique-marseille"),
  fixture(4, "rc-strasbourg", "as-monaco"),

  // Journée 5
  fixture(5, "angers-sco", "estac-troyes"),
  fixture(5, "aj-auxerre", "stade-brestois"),
  fixture(5, "le-mans", "fc-lorient"),
  fixture(5, "olympique-lyonnais", "stade-rennais"),
  fixture(5, "olympique-marseille", "paris-sg"),
  fixture(5, "as-monaco", "rc-lens"),
  fixture(5, "ogc-nice", "losc"),
  fixture(5, "paris-fc", "rc-strasbourg"),
  fixture(5, "toulouse-fc", "le-havre"),

  // Journée 6
  fixture(6, "stade-brestois", "angers-sco"),
  fixture(6, "rc-lens", "olympique-lyonnais"),
  fixture(6, "losc", "le-havre"),
  fixture(6, "fc-lorient", "paris-fc"),
  fixture(6, "as-monaco", "toulouse-fc"),
  fixture(6, "ogc-nice", "rc-strasbourg"),
  fixture(6, "paris-sg", "le-mans"),
  fixture(6, "stade-rennais", "aj-auxerre"),
  fixture(6, "estac-troyes", "olympique-marseille"),

  // Journée 7
  fixture(7, "angers-sco", "olympique-marseille"),
  fixture(7, "le-havre", "aj-auxerre"),
  fixture(7, "le-mans", "toulouse-fc"),
  fixture(7, "losc", "stade-brestois"),
  fixture(7, "fc-lorient", "as-monaco"),
  fixture(7, "olympique-lyonnais", "ogc-nice"),
  fixture(7, "paris-fc", "stade-rennais"),
  fixture(7, "rc-strasbourg", "paris-sg"),
  fixture(7, "estac-troyes", "rc-lens"),

  // Journée 8
  fixture(8, "angers-sco", "fc-lorient"),
  fixture(8, "aj-auxerre", "le-mans"),
  fixture(8, "stade-brestois", "ogc-nice"),
  fixture(8, "rc-lens", "paris-fc"),
  fixture(8, "olympique-marseille", "le-havre"),
  fixture(8, "as-monaco", "losc"),
  fixture(8, "paris-sg", "olympique-lyonnais"),
  fixture(8, "stade-rennais", "rc-strasbourg"),
  fixture(8, "toulouse-fc", "estac-troyes"),

  // Journée 9
  fixture(9, "le-havre", "paris-sg"),
  fixture(9, "losc", "rc-lens"),
  fixture(9, "fc-lorient", "stade-brestois"),
  fixture(9, "olympique-lyonnais", "angers-sco"),
  fixture(9, "olympique-marseille", "toulouse-fc"),
  fixture(9, "ogc-nice", "stade-rennais"),
  fixture(9, "paris-fc", "as-monaco"),
  fixture(9, "rc-strasbourg", "aj-auxerre"),
  fixture(9, "estac-troyes", "le-mans"),

  // Journée 10
  fixture(10, "angers-sco", "ogc-nice"),
  fixture(10, "aj-auxerre", "paris-fc"),
  fixture(10, "stade-brestois", "olympique-lyonnais"),
  fixture(10, "le-havre", "fc-lorient"),
  fixture(10, "le-mans", "as-monaco"),
  fixture(10, "rc-lens", "olympique-marseille"),
  fixture(10, "paris-sg", "estac-troyes"),
  fixture(10, "stade-rennais", "losc"),
  fixture(10, "toulouse-fc", "rc-strasbourg"),

  // Journée 11
  fixture(11, "rc-lens", "toulouse-fc"),
  fixture(11, "losc", "olympique-lyonnais"),
  fixture(11, "fc-lorient", "stade-rennais"),
  fixture(11, "olympique-marseille", "le-mans"),
  fixture(11, "as-monaco", "aj-auxerre"),
  fixture(11, "ogc-nice", "paris-sg"),
  fixture(11, "paris-fc", "angers-sco"),
  fixture(11, "rc-strasbourg", "stade-brestois"),
  fixture(11, "estac-troyes", "le-havre"),

  // Journée 12
  fixture(12, "angers-sco", "rc-lens"),
  fixture(12, "aj-auxerre", "olympique-marseille"),
  fixture(12, "stade-brestois", "paris-fc"),
  fixture(12, "le-havre", "rc-strasbourg"),
  fixture(12, "le-mans", "losc"),
  fixture(12, "olympique-lyonnais", "as-monaco"),
  fixture(12, "ogc-nice", "estac-troyes"),
  fixture(12, "paris-sg", "fc-lorient"),
  fixture(12, "toulouse-fc", "stade-rennais"),

  // Journée 13
  fixture(13, "rc-lens", "le-havre"),
  fixture(13, "losc", "aj-auxerre"),
  fixture(13, "olympique-marseille", "ogc-nice"),
  fixture(13, "as-monaco", "angers-sco"),
  fixture(13, "paris-fc", "le-mans"),
  fixture(13, "stade-rennais", "stade-brestois"),
  fixture(13, "rc-strasbourg", "fc-lorient"),
  fixture(13, "toulouse-fc", "paris-sg"),
  fixture(13, "estac-troyes", "olympique-lyonnais"),

  // Journée 14
  fixture(14, "angers-sco", "rc-strasbourg"),
  fixture(14, "aj-auxerre", "toulouse-fc"),
  fixture(14, "stade-brestois", "estac-troyes"),
  fixture(14, "le-havre", "le-mans"),
  fixture(14, "fc-lorient", "losc"),
  fixture(14, "olympique-lyonnais", "olympique-marseille"),
  fixture(14, "ogc-nice", "rc-lens"),
  fixture(14, "paris-sg", "paris-fc"),
  fixture(14, "stade-rennais", "as-monaco"),

  // Journée 15
  fixture(15, "stade-brestois", "olympique-marseille"),
  fixture(15, "le-mans", "olympique-lyonnais"),
  fixture(15, "rc-lens", "paris-sg"),
  fixture(15, "losc", "rc-strasbourg"),
  fixture(15, "fc-lorient", "aj-auxerre"),
  fixture(15, "as-monaco", "ogc-nice"),
  fixture(15, "paris-fc", "le-havre"),
  fixture(15, "toulouse-fc", "angers-sco"),
  fixture(15, "estac-troyes", "stade-rennais"),

  // Journée 16
  fixture(16, "angers-sco", "paris-sg"),
  fixture(16, "aj-auxerre", "estac-troyes"),
  fixture(16, "olympique-lyonnais", "fc-lorient"),
  fixture(16, "olympique-marseille", "losc"),
  fixture(16, "as-monaco", "stade-brestois"),
  fixture(16, "ogc-nice", "le-havre"),
  fixture(16, "paris-fc", "toulouse-fc"),
  fixture(16, "stade-rennais", "rc-lens"),
  fixture(16, "rc-strasbourg", "le-mans"),

  // Journée 17
  fixture(17, "le-havre", "stade-rennais"),
  fixture(17, "le-mans", "angers-sco"),
  fixture(17, "rc-lens", "stade-brestois"),
  fixture(17, "losc", "paris-fc"),
  fixture(17, "fc-lorient", "olympique-marseille"),
  fixture(17, "paris-sg", "aj-auxerre"),
  fixture(17, "rc-strasbourg", "olympique-lyonnais"),
  fixture(17, "toulouse-fc", "ogc-nice"),
  fixture(17, "estac-troyes", "as-monaco"),

  // Journée 18
  fixture(18, "angers-sco", "le-havre"),
  fixture(18, "stade-brestois", "rc-strasbourg"),
  fixture(18, "le-mans", "ogc-nice"),
  fixture(18, "olympique-lyonnais", "losc"),
  fixture(18, "olympique-marseille", "estac-troyes"),
  fixture(18, "as-monaco", "paris-sg"),
  fixture(18, "paris-fc", "aj-auxerre"),
  fixture(18, "stade-rennais", "fc-lorient"),
  fixture(18, "toulouse-fc", "rc-lens"),

  // Journée 19
  fixture(19, "aj-auxerre", "as-monaco"),
  fixture(19, "le-havre", "toulouse-fc"),
  fixture(19, "rc-lens", "angers-sco"),
  fixture(19, "fc-lorient", "le-mans"),
  fixture(19, "ogc-nice", "stade-brestois"),
  fixture(19, "paris-sg", "olympique-marseille"),
  fixture(19, "stade-rennais", "olympique-lyonnais"),
  fixture(19, "rc-strasbourg", "paris-fc"),
  fixture(19, "estac-troyes", "losc"),

  // Journée 20
  fixture(20, "aj-auxerre", "rc-strasbourg"),
  fixture(20, "stade-brestois", "stade-rennais"),
  fixture(20, "le-mans", "paris-sg"),
  fixture(20, "losc", "ogc-nice"),
  fixture(20, "fc-lorient", "le-havre"),
  fixture(20, "olympique-lyonnais", "rc-lens"),
  fixture(20, "olympique-marseille", "angers-sco"),
  fixture(20, "paris-fc", "estac-troyes"),
  fixture(20, "toulouse-fc", "as-monaco"),

  // Journée 21
  fixture(21, "angers-sco", "paris-fc"),
  fixture(21, "le-havre", "olympique-lyonnais"),
  fixture(21, "rc-lens", "estac-troyes"),
  fixture(21, "losc", "fc-lorient"),
  fixture(21, "as-monaco", "le-mans"),
  fixture(21, "ogc-nice", "aj-auxerre"),
  fixture(21, "paris-sg", "stade-brestois"),
  fixture(21, "stade-rennais", "toulouse-fc"),
  fixture(21, "rc-strasbourg", "olympique-marseille"),

  // Journée 22
  fixture(22, "aj-auxerre", "losc"),
  fixture(22, "stade-brestois", "as-monaco"),
  fixture(22, "le-mans", "paris-fc"),
  fixture(22, "fc-lorient", "angers-sco"),
  fixture(22, "olympique-lyonnais", "toulouse-fc"),
  fixture(22, "olympique-marseille", "stade-rennais"),
  fixture(22, "paris-sg", "rc-lens"),
  fixture(22, "rc-strasbourg", "le-havre"),
  fixture(22, "estac-troyes", "ogc-nice"),

  // Journée 23
  fixture(23, "angers-sco", "aj-auxerre"),
  fixture(23, "le-havre", "ogc-nice"),
  fixture(23, "rc-lens", "rc-strasbourg"),
  fixture(23, "losc", "olympique-marseille"),
  fixture(23, "as-monaco", "olympique-lyonnais"),
  fixture(23, "paris-fc", "stade-brestois"),
  fixture(23, "stade-rennais", "paris-sg"),
  fixture(23, "toulouse-fc", "le-mans"),
  fixture(23, "estac-troyes", "fc-lorient"),

  // Journée 24
  fixture(24, "aj-auxerre", "paris-sg"),
  fixture(24, "stade-brestois", "losc"),
  fixture(24, "le-havre", "rc-lens"),
  fixture(24, "le-mans", "stade-rennais"),
  fixture(24, "olympique-lyonnais", "estac-troyes"),
  fixture(24, "olympique-marseille", "as-monaco"),
  fixture(24, "ogc-nice", "toulouse-fc"),
  fixture(24, "paris-fc", "fc-lorient"),
  fixture(24, "rc-strasbourg", "angers-sco"),

  // Journée 25
  fixture(25, "angers-sco", "le-mans"),
  fixture(25, "rc-lens", "losc"),
  fixture(25, "fc-lorient", "ogc-nice"),
  fixture(25, "olympique-marseille", "olympique-lyonnais"),
  fixture(25, "as-monaco", "le-havre"),
  fixture(25, "paris-sg", "rc-strasbourg"),
  fixture(25, "stade-rennais", "paris-fc"),
  fixture(25, "toulouse-fc", "stade-brestois"),
  fixture(25, "estac-troyes", "aj-auxerre"),

  // Journée 26
  fixture(26, "angers-sco", "as-monaco"),
  fixture(26, "aj-auxerre", "rc-lens"),
  fixture(26, "stade-brestois", "fc-lorient"),
  fixture(26, "le-havre", "estac-troyes"),
  fixture(26, "le-mans", "olympique-marseille"),
  fixture(26, "losc", "stade-rennais"),
  fixture(26, "ogc-nice", "olympique-lyonnais"),
  fixture(26, "paris-fc", "paris-sg"),
  fixture(26, "rc-strasbourg", "toulouse-fc"),

  // Journée 27
  fixture(27, "le-mans", "aj-auxerre"),
  fixture(27, "losc", "toulouse-fc"),
  fixture(27, "fc-lorient", "rc-lens"),
  fixture(27, "olympique-lyonnais", "rc-strasbourg"),
  fixture(27, "olympique-marseille", "stade-brestois"),
  fixture(27, "as-monaco", "stade-rennais"),
  fixture(27, "ogc-nice", "paris-fc"),
  fixture(27, "paris-sg", "le-havre"),
  fixture(27, "estac-troyes", "angers-sco"),

  // Journée 28
  fixture(28, "angers-sco", "olympique-lyonnais"),
  fixture(28, "aj-auxerre", "fc-lorient"),
  fixture(28, "stade-brestois", "le-mans"),
  fixture(28, "le-havre", "olympique-marseille"),
  fixture(28, "rc-lens", "ogc-nice"),
  fixture(28, "as-monaco", "rc-strasbourg"),
  fixture(28, "paris-sg", "losc"),
  fixture(28, "stade-rennais", "estac-troyes"),
  fixture(28, "toulouse-fc", "paris-fc"),

  // Journée 29
  fixture(29, "le-mans", "le-havre"),
  fixture(29, "losc", "as-monaco"),
  fixture(29, "fc-lorient", "paris-sg"),
  fixture(29, "olympique-lyonnais", "stade-brestois"),
  fixture(29, "olympique-marseille", "aj-auxerre"),
  fixture(29, "ogc-nice", "angers-sco"),
  fixture(29, "paris-fc", "rc-lens"),
  fixture(29, "rc-strasbourg", "stade-rennais"),
  fixture(29, "estac-troyes", "toulouse-fc"),

  // Journée 30
  fixture(30, "aj-auxerre", "olympique-lyonnais"),
  fixture(30, "le-havre", "paris-fc"),
  fixture(30, "rc-lens", "le-mans"),
  fixture(30, "as-monaco", "fc-lorient"),
  fixture(30, "paris-sg", "angers-sco"),
  fixture(30, "stade-rennais", "ogc-nice"),
  fixture(30, "rc-strasbourg", "losc"),
  fixture(30, "toulouse-fc", "olympique-marseille"),
  fixture(30, "estac-troyes", "stade-brestois"),

  // Journée 31
  fixture(31, "angers-sco", "toulouse-fc"),
  fixture(31, "stade-brestois", "aj-auxerre"),
  fixture(31, "le-mans", "estac-troyes"),
  fixture(31, "rc-lens", "as-monaco"),
  fixture(31, "fc-lorient", "rc-strasbourg"),
  fixture(31, "olympique-lyonnais", "paris-sg"),
  fixture(31, "ogc-nice", "olympique-marseille"),
  fixture(31, "paris-fc", "losc"),
  fixture(31, "stade-rennais", "le-havre"),

  // Journée 32
  fixture(32, "aj-auxerre", "stade-rennais"),
  fixture(32, "stade-brestois", "le-havre"),
  fixture(32, "losc", "angers-sco"),
  fixture(32, "olympique-lyonnais", "le-mans"),
  fixture(32, "olympique-marseille", "rc-lens"),
  fixture(32, "as-monaco", "paris-fc"),
  fixture(32, "paris-sg", "ogc-nice"),
  fixture(32, "rc-strasbourg", "estac-troyes"),
  fixture(32, "toulouse-fc", "fc-lorient"),

  // Journée 33
  fixture(33, "angers-sco", "stade-brestois"),
  fixture(33, "le-havre", "losc"),
  fixture(33, "le-mans", "rc-strasbourg"),
  fixture(33, "rc-lens", "stade-rennais"),
  fixture(33, "fc-lorient", "olympique-lyonnais"),
  fixture(33, "ogc-nice", "as-monaco"),
  fixture(33, "paris-fc", "olympique-marseille"),
  fixture(33, "toulouse-fc", "aj-auxerre"),
  fixture(33, "estac-troyes", "paris-sg"),

  // Journée 34
  fixture(34, "aj-auxerre", "le-havre"),
  fixture(34, "stade-brestois", "rc-lens"),
  fixture(34, "losc", "le-mans"),
  fixture(34, "olympique-lyonnais", "paris-fc"),
  fixture(34, "olympique-marseille", "fc-lorient"),
  fixture(34, "as-monaco", "estac-troyes"),
  fixture(34, "paris-sg", "toulouse-fc"),
  fixture(34, "stade-rennais", "angers-sco"),
  fixture(34, "rc-strasbourg", "ogc-nice"),
]
