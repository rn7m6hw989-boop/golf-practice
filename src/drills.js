// ============================================================================
// CATEGORIES — top-level grouping for drills. Used by the filter row on the
// Drills page. Order here is the display order in the filter pills.
// ============================================================================

export const CATEGORIES = [
  { id: "putting", label: "Putting" },
  { id: "short-game", label: "Short" },
  { id: "approach", label: "Approach" },
  { id: "driving", label: "Driving" },
];

// ============================================================================
// DRILL DEFINITIONS
//
// Each drill has a `sessionType` that determines which session component
// renders during practice:
//   - "scoring": tap an outcome per hole, accumulate points (10/5/15-foot games)
//   - "spiral": make/miss putts in spiral order, reset on miss, win on 5-in-a-row
//
// Each drill also has a `benchmarkMetric` describing what the benchmark values
// represent: "holes-to-win" (lower is better), "misses-to-win" (lower is
// better). This lets the benchmark/comparison UI work generically.
// ============================================================================

// Shared scoring outcomes for the 5-, 10-, 15-foot games (same point system)
export const PUTTING_OUTCOMES = [
  { id: "one-putt", label: "One-putt", short: "1-putt", points: 2, tone: "win" },
  { id: "two-long", label: "Two-putt", sub: "first putt long", short: "2-putt long", points: 0, tone: "neutral" },
  { id: "two-short", label: "Two-putt", sub: "first putt short", short: "2-putt short", points: -1, tone: "warn" },
  { id: "three-plus", label: "Three+ putts", short: "3+ putts", points: -3, tone: "loss" },
];

export const PUTTING_SCORING_TABLE = [
  { outcome: "One-putt", points: 2 },
  { outcome: "Two putts, first putt long", points: 0 },
  { outcome: "Two putts, first putt short", points: -1 },
  { outcome: "Three or more putts", points: -3 },
];

// Shared scoring outcomes for the 20-, 30-, 40-foot games. At longer range
// the focus shifts from aggression to distance control: one-putts are highly
// rewarded, two-putts that finish within 3 feet earn a point, and three-putts
// carry a steep penalty. There is no penalty for leaving putts short here.
export const LONG_PUTTING_OUTCOMES = [
  { id: "one-putt", label: "One-putt", short: "1-putt", points: 5, tone: "win" },
  { id: "two-close", label: "Two-putt", sub: "first within 3 ft", short: "2-putt close", points: 1, tone: "win" },
  { id: "two-far", label: "Two-putt", sub: "first outside 3 ft", short: "2-putt far", points: 0, tone: "neutral" },
  { id: "three-plus", label: "Three+ putts", short: "3+ putts", points: -3, tone: "loss" },
];

export const LONG_PUTTING_SCORING_TABLE = [
  { outcome: "One-putt", points: 5 },
  { outcome: "Two putts, first within 3 feet", points: 1 },
  { outcome: "Two putts, first outside 3 feet", points: 0 },
  { outcome: "Three or more putts", points: -3 },
];

export const DRILLS = {
  "5-foot-15-point": {
    id: "5-foot-15-point",
    name: "5-foot 15-point",
    category: "putting",
    skill: "Speed control",
    distance: "5 ft",
    distanceFeet: 5,
    sessionType: "scoring",
    shortDescription: "Race to 15 points from short range.",
    goal: "Win by getting to 15 points in the fewest holes possible.",
    rules: [
      "Drop a ball between 4 and 6 feet from the hole.",
      "Putt until you hole out.",
      "Move to a different hole each round.",
      "Vary your starting position around the clock face — uphill, downhill, and sidehill.",
      "Read the green once, then putt — don't hit twice from the same place.",
    ],
    scoring: PUTTING_SCORING_TABLE,
    outcomes: PUTTING_OUTCOMES,
    winThreshold: 15,
    loseThreshold: -15,
    benchmarkMetric: "holes-to-win",
    benchmarks: [
      { group: "Best tour putter", short: "Best tour", value: 10, tier: 6 },
      { group: "Average tour putter", short: "Avg tour", value: 10, tier: 5 },
      { group: "Worst tour putter", short: "Worst tour", value: 11, tier: 4 },
      { group: "80-golfer", short: "80-golfer", value: 13, tier: 3 },
      { group: "90-golfer", short: "90-golfer", value: 14, tier: 2 },
      { group: "100-golfer", short: "100-golfer", value: 18, tier: 1 },
      { group: "110-golfer", short: "110-golfer", value: 23, tier: 0 },
    ],
    benchmarkUnit: "median holes to win",
    notes:
      "Pro results are based on actual tournament play on difficult courses. Amateur results are based on play on regular courses, not on practice greens.",
  },

  "10-foot-10-point": {
    id: "10-foot-10-point",
    name: "10-foot 10-point",
    category: "putting",
    skill: "Speed control",
    distance: "10 ft",
    distanceFeet: 10,
    sessionType: "scoring",
    shortDescription: "Race to 10 points from 10-footers.",
    goal: "Win by getting to 10 points in the fewest holes possible.",
    rules: [
      "Drop a ball between 9 and 11 feet from the hole.",
      "Putt until you hole out.",
      "Move to a different hole each round.",
      "Vary your starting position around the clock face — uphill, downhill, and sidehill.",
      "Read the green once, then putt — don't hit twice from the same place.",
    ],
    scoring: PUTTING_SCORING_TABLE,
    outcomes: PUTTING_OUTCOMES,
    winThreshold: 10,
    loseThreshold: -10,
    benchmarkMetric: "holes-to-win",
    benchmarks: [
      { group: "Best tour putter", short: "Best tour", value: 11, tier: 6 },
      { group: "Average tour putter", short: "Avg tour", value: 14, tier: 5 },
      { group: "Worst tour putter", short: "Worst tour", value: 17, tier: 4 },
      { group: "80-golfer", short: "80-golfer", value: 24, tier: 3 },
      { group: "90-golfer", short: "90-golfer", value: 43, tier: 2 },
      { group: "100-golfer", short: "100-golfer", value: null, note: "loses more often than wins", tier: 1 },
      { group: "110-golfer", short: "110-golfer", value: null, note: "loses more often than wins", tier: 0 },
    ],
    benchmarkUnit: "median holes to win",
    notes:
      "Pro results are based on actual tournament play on difficult courses. Amateur results are based on play on regular courses, not on practice greens.",
  },

  "15-foot-5-point": {
    id: "15-foot-5-point",
    name: "15-foot 5-point",
    category: "putting",
    skill: "Speed control",
    distance: "15 ft",
    distanceFeet: 15,
    sessionType: "scoring",
    shortDescription: "Race to 5 points from longer range.",
    goal: "Win by getting to 5 points in the fewest holes possible.",
    rules: [
      "Drop a ball between 14 and 16 feet from the hole.",
      "Putt until you hole out.",
      "Move to a different hole each round.",
      "Vary your starting position around the clock face — uphill, downhill, and sidehill.",
      "Read the green once, then putt — don't hit twice from the same place.",
    ],
    scoring: PUTTING_SCORING_TABLE,
    outcomes: PUTTING_OUTCOMES,
    winThreshold: 5,
    loseThreshold: -5,
    benchmarkMetric: "holes-to-win",
    benchmarks: [
      { group: "Best tour putter", short: "Best tour", value: 11, tier: 6 },
      { group: "Average tour putter", short: "Avg tour", value: 14, tier: 5 },
      { group: "Worst tour putter", short: "Worst tour", value: 18, tier: 4 },
      { group: "80-golfer", short: "80-golfer", value: 21, tier: 3 },
      { group: "90-golfer", short: "90-golfer", value: null, note: "loses more often than wins", tier: 2 },
      { group: "100-golfer", short: "100-golfer", value: null, note: "loses more often than wins", tier: 1 },
      { group: "110-golfer", short: "110-golfer", value: null, note: "loses more often than wins", tier: 0 },
    ],
    benchmarkUnit: "median holes to win",
    notes:
      "From 15 feet, getting to 10 points takes too long, so the game is played to just 5 points. Pro results are based on tournament play; amateur results are based on regular course play.",
  },

  "20-foot-15-point": {
    id: "20-foot-15-point",
    name: "20-foot 15-point",
    category: "putting",
    skill: "Speed control",
    distance: "20 ft",
    distanceFeet: 20,
    sessionType: "scoring",
    shortDescription: "Distance control from 20 feet — reward one-putts, avoid three-putts.",
    goal: "Win by getting to 15 points in the fewest holes possible.",
    rules: [
      "Drop a ball between 15 and 25 feet from the hole.",
      "Putt until you hole out.",
      "Move to a different hole each round.",
      "Vary your starting position around the clock face — uphill, downhill, and sidehill.",
      "Read the green once, then putt — don't hit twice from the same place.",
    ],
    scoring: LONG_PUTTING_SCORING_TABLE,
    outcomes: LONG_PUTTING_OUTCOMES,
    winThreshold: 15,
    loseThreshold: -15,
    benchmarkMetric: "holes-to-win",
    benchmarks: [
      { group: "Best tour putter", short: "Best tour", value: 10, tier: 6 },
      { group: "Average tour putter", short: "Avg tour", value: 11, tier: 5 },
      { group: "Worst tour putter", short: "Worst tour", value: 12, tier: 4 },
      { group: "80-golfer", short: "80-golfer", value: 15, tier: 3 },
      { group: "90-golfer", short: "90-golfer", value: 20, tier: 2 },
      { group: "100-golfer", short: "100-golfer", value: 35, tier: 1 },
      { group: "110-golfer", short: "110-golfer", value: 42, tier: 0 },
    ],
    benchmarkUnit: "median holes to win",
    notes:
      "At longer range, avoiding three-putts becomes increasingly important. There's no penalty for leaving putts short — instead, one-putts get the largest reward and three-putts lose points.",
  },

  "30-foot-10-point": {
    id: "30-foot-10-point",
    name: "30-foot 10-point",
    category: "putting",
    skill: "Speed control",
    distance: "30 ft",
    distanceFeet: 30,
    sessionType: "scoring",
    shortDescription: "Lag-putting from 30 feet — get close, avoid the three-putt.",
    goal: "Win by getting to 10 points in the fewest holes possible.",
    rules: [
      "Drop a ball between 25 and 35 feet from the hole.",
      "Putt until you hole out.",
      "Move to a different hole each round.",
      "Vary your starting position around the clock face — uphill, downhill, and sidehill.",
      "Read the green once, then putt — don't hit twice from the same place.",
    ],
    scoring: LONG_PUTTING_SCORING_TABLE,
    outcomes: LONG_PUTTING_OUTCOMES,
    winThreshold: 10,
    loseThreshold: -10,
    benchmarkMetric: "holes-to-win",
    benchmarks: [
      { group: "Best tour putter", short: "Best tour", value: 11, tier: 6 },
      { group: "Average tour putter", short: "Avg tour", value: 12, tier: 5 },
      { group: "Worst tour putter", short: "Worst tour", value: 14, tier: 4 },
      { group: "80-golfer", short: "80-golfer", value: 18, tier: 3 },
      { group: "90-golfer", short: "90-golfer", value: 29, tier: 2 },
      { group: "100-golfer", short: "100-golfer", value: null, note: "loses more often than wins", tier: 1 },
      { group: "110-golfer", short: "110-golfer", value: null, note: "loses more often than wins", tier: 0 },
    ],
    benchmarkUnit: "median holes to win",
    notes:
      "The point system rewards getting your first putt close to the hole. At this range, lag-putting accuracy and avoiding three-putts both matter.",
  },

  "40-foot-5-point": {
    id: "40-foot-5-point",
    name: "40-foot 5-point",
    category: "putting",
    skill: "Speed control",
    distance: "40 ft",
    distanceFeet: 40,
    sessionType: "scoring",
    shortDescription: "Long-range lag putting — getting to 5 points takes patience.",
    goal: "Win by getting to 5 points in the fewest holes possible.",
    rules: [
      "Drop a ball between 35 and 45 feet from the hole.",
      "Putt until you hole out.",
      "Move to a different hole each round.",
      "Vary your starting position around the clock face — uphill, downhill, and sidehill.",
      "Read the green once, then putt — don't hit twice from the same place.",
    ],
    scoring: LONG_PUTTING_SCORING_TABLE,
    outcomes: LONG_PUTTING_OUTCOMES,
    winThreshold: 5,
    loseThreshold: -5,
    benchmarkMetric: "holes-to-win",
    benchmarks: [
      { group: "Best tour putter", short: "Best tour", value: 7, tier: 6 },
      { group: "Average tour putter", short: "Avg tour", value: 8, tier: 5 },
      { group: "Worst tour putter", short: "Worst tour", value: 10, tier: 4 },
      { group: "80-golfer", short: "80-golfer", value: null, note: "loses more often than wins", tier: 3 },
      { group: "90-golfer", short: "90-golfer", value: null, note: "loses more often than wins", tier: 2 },
      { group: "100-golfer", short: "100-golfer", value: null, note: "loses more often than wins", tier: 1 },
      { group: "110-golfer", short: "110-golfer", value: null, note: "loses more often than wins", tier: 0 },
    ],
    benchmarkUnit: "median holes to win",
    notes:
      "From 40 feet, even tour pros need 7+ holes to reach 5 points. Most amateurs lose more often than they win — this game is about discipline and lag-putting feel.",
  },

  "fall-line": {
    id: "fall-line",
    name: "Fall line",
    category: "putting",
    skill: "Green reading",
    distance: "6 ft",
    distanceFeet: 6,
    sessionType: "fallLine",
    shortDescription: "Estimate the fall line. Measure how far off you were.",
    goal: "Reduce your fall-line error — the distance between where you think the fall line is and where it actually is.",
    rules: [
      "Pick a hole on a practice green or on the course.",
      "Before watching any putts, read the green and estimate where a 6-foot putt would roll straight downhill into the hole.",
      "Place a coin to mark your estimated fall line, six feet from the hole.",
      "Stroke a putt from just in front of the coin straight at the hole.",
      "If the putt rolls in on a straight line, you're done — your error is zero.",
      "If the putt breaks, putt from a slightly different starting position until you locate the true fall line.",
      "Measure the distance between your coin and the true fall line — that's your error.",
    ],
    benchmarkMetric: "fall-line-error",
    // No published benchmarks for this drill in Every Shot Counts. We track
    // user progress against their own history instead.
    benchmarks: [],
    benchmarkUnit: "inches of error",
    notes:
      "There is no published benchmark for this drill — track your own progress over time. Error decreases with practice. Small slopes are harder to read accurately than steep ones, so record the slope severity to compare apples to apples.",
  },

  "spiral-2-to-6": {
    id: "spiral-2-to-6",
    name: "Spiral game",
    category: "putting",
    skill: "Pressure",
    distance: "2–6 ft",
    distanceFeet: 6,
    sessionType: "spiral",
    shortDescription: "Sink five putts in a row from spiraling distances.",
    goal: "Sink five putts in a row from 2, 3, 4, 5, and 6 feet around the hole.",
    rules: [
      "Place five balls in a clockwise spiral around a hole — 2, 3, 4, 5, then 6 feet.",
      "Each ball goes at a different clock-face position.",
      "Try to sink all five in a row.",
      "If you miss, reset all five balls around a different hole, going counterclockwise this time.",
      "Keep track of how many putts you miss until you make all five in a row.",
    ],
    spiralConfig: {
      distances: [2, 3, 4, 5, 6],
      // Five clock positions, evenly spaced (~144° apart for variety)
      clockPositions: ["3:00", "5:30", "8:00", "10:30", "1:00"],
      reversedClockPositions: ["8:00", "5:30", "3:00", "12:30", "10:00"],
    },
    winCondition: "Five putts in a row",
    benchmarkMetric: "misses-to-win",
    benchmarks: [
      { group: "Best tour putter", short: "Best tour", value: 0, tier: 6 },
      { group: "Average tour putter", short: "Avg tour", value: 0, tier: 5 },
      { group: "Worst tour putter", short: "Worst tour", value: 0, tier: 4 },
      { group: "80-golfer", short: "80-golfer", value: 1, tier: 3 },
      { group: "90-golfer", short: "90-golfer", value: 2, tier: 2 },
      { group: "100-golfer", short: "100-golfer", value: 3, tier: 1 },
      { group: "110-golfer", short: "110-golfer", value: 4, tier: 0 },
    ],
    benchmarkUnit: "median misses until win",
    notes:
      "Half of the time, a 100-golfer will have three or fewer misses before winning. More than half of the time, a pro golfer has zero misses. Source: David Orr.",
  },
};
