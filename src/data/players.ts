import type { Player, Position, ProjectionSource, StatLine } from '../types'

/**
 * Best-effort Startdatensatz für die Saison 2026, Stand Wissensstand des Modells.
 * Die Projections sind KEINE live gescrapten Zahlen von echten Anbietern (das ist
 * ohne API-Zugriff nicht zuverlässig möglich), sondern ein aus Depth-Chart-Tiers
 * abgeleiteter Platzhalter-Konsens über 5 synthetische Quellen (mit realistischem
 * Streubereich je Quelle). Namen/Teams/Tiers stammen aus allgemeinem Fantasy-Football
 * Wissen und können durch Roster-Änderungen inzwischen veraltet sein.
 * -> Über den CSV-Import in den Draft-Einstellungen können echte, aktuelle
 *    Projections (z.B. Exporte aus FantasyPros, ESPN, Yahoo, NFL.com, Sleeper)
 *    nachgeladen werden und überschreiben/ergänzen diese Startdaten.
 */

type Tier = 1 | 2 | 3 | 4
type RawEntry = [name: string, team: string, tier: Tier]

const SOURCE_NAMES = ['Schätzung A', 'Schätzung B', 'Schätzung C', 'Schätzung D', 'Schätzung E']

function hash01(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0
  }
  return (h % 1000) / 1000
}

function jitter(base: number, seed: string, sourceIndex: number): number {
  if (!base) return 0
  const factor = 0.88 + hash01(`${seed}-${sourceIndex}`) * 0.24 // 0.88 .. 1.12
  return Math.round(base * factor * 10) / 10
}

const QB_TIER_BASE: Record<Tier, StatLine> = {
  1: { passYards: 4200, passTD: 30, passTwoPt: 1, rushYards: 500, rushTD: 4, rushTwoPt: 1 },
  2: { passYards: 3850, passTD: 26, passTwoPt: 0, rushYards: 280, rushTD: 3, rushTwoPt: 0 },
  3: { passYards: 3450, passTD: 21, passTwoPt: 0, rushYards: 160, rushTD: 2, rushTwoPt: 0 },
  4: { passYards: 2800, passTD: 15, passTwoPt: 0, rushYards: 100, rushTD: 1, rushTwoPt: 0 },
}

const RB_TIER_BASE: Record<Tier, StatLine> = {
  1: { rushYards: 1300, rushTD: 10, rushTwoPt: 1 },
  2: { rushYards: 1000, rushTD: 7, rushTwoPt: 0 },
  3: { rushYards: 700, rushTD: 4, rushTwoPt: 0 },
  4: { rushYards: 400, rushTD: 2, rushTwoPt: 0 },
}

const WR_TIER_BASE: Record<Tier, StatLine> = {
  1: { receptions: 95, recYards: 1300, recTD: 10, recTwoPt: 1 },
  2: { receptions: 80, recYards: 1050, recTD: 7, recTwoPt: 0 },
  3: { receptions: 65, recYards: 800, recTD: 5, recTwoPt: 0 },
  4: { receptions: 45, recYards: 550, recTD: 3, recTwoPt: 0 },
}

const TE_TIER_BASE: Record<Tier, StatLine> = {
  1: { receptions: 75, recYards: 900, recTD: 7, recTwoPt: 0 },
  2: { receptions: 60, recYards: 700, recTD: 5, recTwoPt: 0 },
  3: { receptions: 45, recYards: 500, recTD: 3, recTwoPt: 0 },
  4: { receptions: 30, recYards: 300, recTD: 2, recTwoPt: 0 },
}

const K_BASE: StatLine = {
  patMade: 33,
  fg0_19: 1,
  fg20_29: 5,
  fg30_39: 6,
  fg40_49: 5,
  fg50_59: 2,
  fg60plus: 0.2,
}

function buildProjections(base: StatLine, seed: string): ProjectionSource[] {
  return SOURCE_NAMES.map((source, i) => {
    const stats: StatLine = {}
    for (const [key, value] of Object.entries(base)) {
      ;(stats as Record<string, number>)[key] = jitter(value as number, seed, i)
    }
    return { source, stats }
  })
}

function makeId(name: string, position: string): string {
  return `${position.toLowerCase()}-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
}

function buildSkillPlayers(
  entries: RawEntry[],
  position: Position,
  tierBase: Record<Tier, StatLine>,
): Player[] {
  return entries.map(([name, team, tier]) => ({
    id: makeId(name, position),
    name,
    nflTeam: team,
    position,
    projections: buildProjections(tierBase[tier], `${name}-${position}`),
  }))
}

const QBS: RawEntry[] = [
  ['Josh Allen', 'BUF', 1],
  ['Lamar Jackson', 'BAL', 1],
  ['Jalen Hurts', 'PHI', 1],
  ['Patrick Mahomes', 'KC', 1],
  ['Joe Burrow', 'CIN', 1],
  ['Jayden Daniels', 'WAS', 1],
  ['C.J. Stroud', 'HOU', 2],
  ['Justin Herbert', 'LAC', 2],
  ['Jordan Love', 'GB', 2],
  ['Brock Purdy', 'SF', 2],
  ['Kyler Murray', 'ARI', 2],
  ['Dak Prescott', 'DAL', 2],
  ['Baker Mayfield', 'TB', 2],
  ['Matthew Stafford', 'LAR', 2],
  ['Jared Goff', 'DET', 2],
  ['Trevor Lawrence', 'JAX', 3],
  ['Tua Tagovailoa', 'MIA', 3],
  ['Bo Nix', 'DEN', 3],
  ['Caleb Williams', 'CHI', 3],
  ['Sam Darnold', 'SEA', 3],
  ['Geno Smith', 'LV', 3],
  ['Drake Maye', 'NE', 3],
  ['J.J. McCarthy', 'MIN', 3],
  ['Michael Penix Jr.', 'ATL', 3],
  ['Cam Ward', 'TEN', 3],
  ['Aaron Rodgers', 'PIT', 4],
  ['Daniel Jones', 'IND', 4],
  ['Bryce Young', 'CAR', 4],
  ['Russell Wilson', 'NYG', 4],
  ['Justin Fields', 'NYJ', 4],
  ['Tyler Shough', 'NO', 4],
  ['Dillon Gabriel', 'CLE', 4],
]

const RBS: RawEntry[] = [
  ['Saquon Barkley', 'PHI', 1],
  ['Bijan Robinson', 'ATL', 1],
  ['Jahmyr Gibbs', 'DET', 1],
  ['Derrick Henry', 'BAL', 1],
  ['Christian McCaffrey', 'SF', 1],
  ['Ashton Jeanty', 'LV', 1],
  ['Jonathan Taylor', 'IND', 2],
  ["De'Von Achane", 'MIA', 2],
  ['Kyren Williams', 'LAR', 2],
  ['James Cook', 'BUF', 2],
  ['Josh Jacobs', 'GB', 2],
  ['Chase Brown', 'CIN', 2],
  ['Breece Hall', 'NYJ', 2],
  ['Alvin Kamara', 'NO', 2],
  ['Kenneth Walker III', 'SEA', 2],
  ['Omarion Hampton', 'LAC', 2],
  ['TreVeyon Henderson', 'NE', 2],
  ['RJ Harvey', 'DEN', 2],
  ['Tony Pollard', 'TEN', 3],
  ['David Montgomery', 'DET', 3],
  ['Aaron Jones', 'MIN', 3],
  ['Rachaad White', 'TB', 3],
  ['Javonte Williams', 'DAL', 3],
  ['Chuba Hubbard', 'CAR', 3],
  ['Zach Charbonnet', 'SEA', 3],
  ['Tyrone Tracy Jr.', 'NYG', 3],
  ['Isiah Pacheco', 'KC', 3],
  ['Rhamondre Stevenson', 'NE', 3],
  ['Brian Robinson Jr.', 'WAS', 3],
  ['Najee Harris', 'LAC', 3],
  ['Jaylen Warren', 'PIT', 3],
  ['Bucky Irving', 'TB', 3],
  ['Tyjae Spears', 'TEN', 3],
  ['Zamir White', 'LV', 4],
  ['Justice Hill', 'BAL', 4],
  ['Ray Davis', 'BUF', 4],
  ['Jerome Ford', 'CLE', 4],
  ['Braelon Allen', 'NYJ', 4],
  ['Devin Singletary', 'NYG', 4],
  ['Jaylen Wright', 'MIA', 4],
  ['Roschon Johnson', 'CHI', 4],
  ['Emanuel Wilson', 'GB', 4],
  ['Ty Chandler', 'MIN', 4],
  ['Zack Moss', 'CIN', 4],
  ['MarShawn Lloyd', 'GB', 4],
]

const WRS: RawEntry[] = [
  ["Ja'Marr Chase", 'CIN', 1],
  ['CeeDee Lamb', 'DAL', 1],
  ['Justin Jefferson', 'MIN', 1],
  ['Amon-Ra St. Brown', 'DET', 1],
  ['Malik Nabers', 'NYG', 1],
  ['Puka Nacua', 'LAR', 1],
  ['Nico Collins', 'HOU', 1],
  ['Brian Thomas Jr.', 'JAX', 1],
  ['A.J. Brown', 'PHI', 2],
  ['Garrett Wilson', 'NYJ', 2],
  ['Drake London', 'ATL', 2],
  ['DK Metcalf', 'PIT', 2],
  ['Tee Higgins', 'CIN', 2],
  ['DJ Moore', 'CHI', 2],
  ['Terry McLaurin', 'WAS', 2],
  ['Mike Evans', 'TB', 2],
  ['Chris Godwin', 'TB', 2],
  ['Davante Adams', 'LAR', 2],
  ['Jaxon Smith-Njigba', 'SEA', 2],
  ['Zay Flowers', 'BAL', 2],
  ['Rome Odunze', 'CHI', 2],
  ['Marvin Harrison Jr.', 'ARI', 2],
  ['Ladd McConkey', 'LAC', 2],
  ['Xavier Worthy', 'KC', 2],
  ['Jameson Williams', 'DET', 2],
  ['Courtland Sutton', 'DEN', 2],
  ['Jerry Jeudy', 'CLE', 3],
  ['Tyler Lockett', 'SEA', 3],
  ['Khalil Shakir', 'BUF', 3],
  ['Jakobi Meyers', 'LV', 3],
  ['Keenan Allen', 'LAC', 3],
  ['Josh Downs', 'IND', 3],
  ['Michael Pittman Jr.', 'IND', 3],
  ['Christian Kirk', 'HOU', 3],
  ['Calvin Ridley', 'TEN', 3],
  ['Diontae Johnson', 'BAL', 3],
  ['Adam Thielen', 'CAR', 3],
  ['Jauan Jennings', 'SF', 3],
  ['Deebo Samuel', 'WAS', 3],
  ['Rashee Rice', 'KC', 3],
  ['Jayden Reed', 'GB', 3],
  ['Romeo Doubs', 'GB', 3],
  ['Tank Dell', 'HOU', 3],
  ['Wan’Dale Robinson', 'NYG', 3],
  ['Darnell Mooney', 'ATL', 3],
  ['Ricky Pearsall', 'SF', 3],
  ['Jordan Addison', 'MIN', 3],
  ['Rashid Shaheed', 'NO', 3],
  ['Tutu Atwell', 'LAR', 3],
  ['Curtis Samuel', 'BUF', 4],
  ['Kendrick Bourne', 'NE', 4],
  ['Demario Douglas', 'NE', 4],
  ['Nelson Agholor', 'BAL', 4],
  ['Marquise Brown', 'KC', 4],
  ['Elijah Moore', 'CLE', 4],
  ['Andrei Iosivas', 'CIN', 4],
  ['Xavier Legette', 'CAR', 4],
  ['Cedric Tillman', 'CLE', 4],
  ['Josh Palmer', 'LAC', 4],
  ['Quentin Johnston', 'LAC', 4],
  ['Malik Washington', 'MIA', 4],
  ['Jalen McMillan', 'TB', 4],
  ['Luther Burden III', 'CHI', 4],
  ['Tetairoa McMillan', 'CAR', 3],
  ['Emeka Egbuka', 'TB', 3],
  ['Travis Hunter', 'JAX', 3],
]

const TES: RawEntry[] = [
  ['Trey McBride', 'ARI', 1],
  ['Brock Bowers', 'LV', 1],
  ['Sam LaPorta', 'DET', 1],
  ['George Kittle', 'SF', 1],
  ['Travis Kelce', 'KC', 1],
  ['Mark Andrews', 'BAL', 1],
  ['Evan Engram', 'DEN', 2],
  ['David Njoku', 'CLE', 2],
  ['Dalton Kincaid', 'BUF', 2],
  ['Jake Ferguson', 'DAL', 2],
  ['T.J. Hockenson', 'MIN', 2],
  ['Kyle Pitts', 'ATL', 2],
  ['Colston Loveland', 'CHI', 2],
  ['Tucker Kraft', 'GB', 2],
  ['Dallas Goedert', 'PHI', 3],
  ['Cole Kmet', 'CHI', 3],
  ['Pat Freiermuth', 'PIT', 3],
  ['Hunter Henry', 'NE', 3],
  ['Cade Otton', 'TB', 3],
  ['Jonnu Smith', 'PIT', 3],
  ['Isaiah Likely', 'BAL', 3],
  ['Zach Ertz', 'WAS', 3],
  ['Juwan Johnson', 'NO', 3],
  ['Noah Fant', 'CIN', 3],
  ['Dalton Schultz', 'HOU', 3],
  ['Tyler Conklin', 'NYJ', 3],
  ['Chig Okonkwo', 'TEN', 4],
  ['Luke Musgrave', 'GB', 4],
  ['Ben Sinnott', 'WAS', 4],
  ['Michael Mayer', 'LV', 4],
  ['Brenton Strange', 'JAX', 4],
  ['Theo Johnson', 'NYG', 4],
]

const KS: [string, string][] = [
  ['Chad Ryland', 'ARI'],
  ['Younghoe Koo', 'ATL'],
  ['Tyler Loop', 'BAL'],
  ['Tyler Bass', 'BUF'],
  ['Ryan Fitzgerald', 'CAR'],
  ['Cairo Santos', 'CHI'],
  ['Evan McPherson', 'CIN'],
  ['Dustin Hopkins', 'CLE'],
  ['Brandon Aubrey', 'DAL'],
  ['Wil Lutz', 'DEN'],
  ['Jake Bates', 'DET'],
  ['Brandon McManus', 'GB'],
  ["Ka'imi Fairbairn", 'HOU'],
  ['Spencer Shrader', 'IND'],
  ['Cam Little', 'JAX'],
  ['Harrison Butker', 'KC'],
  ['Cameron Dicker', 'LAC'],
  ['Joshua Karty', 'LAR'],
  ['Daniel Carlson', 'LV'],
  ['Jason Sanders', 'MIA'],
  ['Will Reichard', 'MIN'],
  ['Andy Borregales', 'NE'],
  ['Blake Grupe', 'NO'],
  ['Jude McAtamney', 'NYG'],
  ['Nick Folk', 'NYJ'],
  ['Jake Elliott', 'PHI'],
  ['Chris Boswell', 'PIT'],
  ['Jason Myers', 'SEA'],
  ['Jake Moody', 'SF'],
  ['Chase McLaughlin', 'TB'],
  ['Joey Slye', 'TEN'],
  ['Matt Gay', 'WAS'],
]

const NFL_TEAMS: [abbr: string, fullName: string][] = [
  ['ARI', 'Arizona Cardinals'],
  ['ATL', 'Atlanta Falcons'],
  ['BAL', 'Baltimore Ravens'],
  ['BUF', 'Buffalo Bills'],
  ['CAR', 'Carolina Panthers'],
  ['CHI', 'Chicago Bears'],
  ['CIN', 'Cincinnati Bengals'],
  ['CLE', 'Cleveland Browns'],
  ['DAL', 'Dallas Cowboys'],
  ['DEN', 'Denver Broncos'],
  ['DET', 'Detroit Lions'],
  ['GB', 'Green Bay Packers'],
  ['HOU', 'Houston Texans'],
  ['IND', 'Indianapolis Colts'],
  ['JAX', 'Jacksonville Jaguars'],
  ['KC', 'Kansas City Chiefs'],
  ['LAC', 'Los Angeles Chargers'],
  ['LAR', 'Los Angeles Rams'],
  ['LV', 'Las Vegas Raiders'],
  ['MIA', 'Miami Dolphins'],
  ['MIN', 'Minnesota Vikings'],
  ['NE', 'New England Patriots'],
  ['NO', 'New Orleans Saints'],
  ['NYG', 'New York Giants'],
  ['NYJ', 'New York Jets'],
  ['PHI', 'Philadelphia Eagles'],
  ['PIT', 'Pittsburgh Steelers'],
  ['SEA', 'Seattle Seahawks'],
  ['SF', 'San Francisco 49ers'],
  ['TB', 'Tampa Bay Buccaneers'],
  ['TEN', 'Tennessee Titans'],
  ['WAS', 'Washington Commanders'],
]

const kickers: Player[] = KS.map(([name, team]) => ({
  id: makeId(name, 'K'),
  name,
  nflTeam: team,
  position: 'K',
  projections: buildProjections(K_BASE, `${name}-K`),
}))

const defenses: Player[] = NFL_TEAMS.map(([abbr, fullName]) => ({
  id: makeId(abbr, 'DST'),
  name: `${fullName} D/ST`,
  nflTeam: abbr,
  position: 'DST',
  projections: [],
}))

export const SEED_PLAYERS: Player[] = [
  ...buildSkillPlayers(QBS, 'QB', QB_TIER_BASE),
  ...buildSkillPlayers(RBS, 'RB', RB_TIER_BASE),
  ...buildSkillPlayers(WRS, 'WR', WR_TIER_BASE),
  ...buildSkillPlayers(TES, 'TE', TE_TIER_BASE),
  ...kickers,
  ...defenses,
]
