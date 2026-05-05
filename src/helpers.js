// ============================================================================
// HELPERS — formatters, benchmark/comparison utilities, category lookup
// ============================================================================

import { CATEGORIES, DRILLS } from "./drills.js";

export function getCategoryLabel(categoryId) {
  return CATEGORIES.find((c) => c.id === categoryId)?.label || categoryId;
}

// ============================================================================

// Get the user's measured value for benchmark comparison from a session.
export function getSessionBenchmarkValue(drill, session) {
  if (drill.benchmarkMetric === "misses-to-win") {
    return session.finalMisses;
  }
  if (drill.benchmarkMetric === "fall-line-error") {
    return session.errorInches;
  }
  // default: holes-to-win
  return session.finalHoles;
}

export function getBenchmarkMatch(drill, session) {
  const won = session.won;
  const value = getSessionBenchmarkValue(drill, session);

  // Fall-line drill has no published benchmarks — the summary uses a
  // self-comparison (vs personal history) instead of a tier match.
  if (drill.benchmarkMetric === "fall-line-error") {
    return {
      label: null,
      detail: null,
      groupIndex: null,
      group: null,
      noBenchmark: true,
    };
  }

  if (!won) {
    const noWinDetail =
      drill.benchmarkMetric === "misses-to-win"
        ? "You ended this session before sinking five in a row."
        : `Your score dropped to ${drill.loseThreshold} before reaching ${drill.winThreshold} points.`;
    return {
      label: "Did not finish",
      detail: noWinDetail,
      groupIndex: null,
      group: null,
    };
  }

  const ranked = drill.benchmarks.filter((b) => b.value !== null);
  let bestMatch = null;
  for (const b of ranked) {
    if (value <= b.value) {
      bestMatch = b;
      break;
    }
  }

  if (bestMatch) {
    const unit = drill.benchmarkMetric === "misses-to-win" ? "misses" : "holes";
    const verb = drill.benchmarkMetric === "misses-to-win" ? "win with" : "win in";
    const detail =
      bestMatch.value === 0 && drill.benchmarkMetric === "misses-to-win"
        ? `${bestMatch.group}s typically win with no misses. You won with ${value} miss${value === 1 ? "" : "es"}.`
        : `${bestMatch.group}s typically ${verb} ${bestMatch.value} ${unit}. You finished with ${value}.`;
    return {
      label: `You scored like ${addArticle(bestMatch.group.toLowerCase())} today`,
      detail,
      groupIndex: drill.benchmarks.indexOf(bestMatch),
      group: bestMatch,
    };
  }

  // Worse than the worst ranked group
  const worst = ranked[ranked.length - 1];
  const unit = drill.benchmarkMetric === "misses-to-win" ? "misses" : "holes";
  return {
    label: `Finished with ${value} ${unit}`,
    detail: `Most amateurs in this range struggle here. ${worst.group}s typically finish with ${worst.value} ${unit}.`,
    groupIndex: null,
    group: null,
  };
}

export function addArticle(s) {
  return /^[aeiou]/i.test(s) ? `an ${s}` : `a ${s}`;
}

export function compareToHistory(currentSession, pastSessions) {
  const drill = DRILLS[currentSession.drillId];
  const wonPast = pastSessions.filter(
    (s) =>
      s.drillId === currentSession.drillId &&
      s.won &&
      s.id !== currentSession.id,
  );
  if (!currentSession.won) {
    if (wonPast.length === 0) return null;
    const tip =
      drill?.benchmarkMetric === "misses-to-win"
        ? "Sink the short ones first to build a streak."
        : drill?.benchmarkMetric === "fall-line-error"
          ? "Walk a circle around the hole to feel the high point."
          : "Distance control is the key.";
    return { type: "loss", message: `Keep at it — ${tip}` };
  }
  if (wonPast.length === 0) {
    return { type: "first", message: "First completed session for this drill." };
  }

  const currentValue = getSessionBenchmarkValue(drill, currentSession);
  const pastValues = wonPast.map((s) => getSessionBenchmarkValue(drill, s));
  const bestEver = Math.min(...pastValues);
  const fmtUnit = (v) => {
    if (drill?.benchmarkMetric === "misses-to-win") return `${v} miss${v === 1 ? "" : "es"}`;
    if (drill?.benchmarkMetric === "fall-line-error") return `${v} inch${v === 1 ? "" : "es"}`;
    return `${v} hole${v === 1 ? "" : "s"}`;
  };

  if (currentValue < bestEver) {
    return {
      type: "best",
      message: `Beat your previous best of ${fmtUnit(bestEver)}.`,
    };
  }
  if (currentValue === bestEver) {
    return { type: "tied", message: "Matched your personal best." };
  }
  const last5 = pastValues.slice(0, 5);
  const avg = last5.reduce((a, v) => a + v, 0) / last5.length;
  if (currentValue < avg) {
    return {
      type: "above",
      message: `Better than your last ${last5.length}-session average (${fmtUnit(avg.toFixed(1))}).`,
    };
  }
  if (currentValue > avg) {
    return {
      type: "below",
      message: `Slower than your last ${last5.length}-session average (${fmtUnit(avg.toFixed(1))}).`,
    };
  }
  return { type: "average", message: "Right on your recent average." };
}

// Get a user-readable display string for a session's primary metric.
// Returns e.g. "12 holes" or "3 misses" or "Did not finish".
export function getSessionDisplayMetric(session) {
  const drill = DRILLS[session.drillId];
  if (!drill) return "";
  if (!session.won) return "Did not finish";
  if (drill.benchmarkMetric === "misses-to-win") {
    return `${session.finalMisses} miss${session.finalMisses === 1 ? "" : "es"}`;
  }
  if (drill.benchmarkMetric === "fall-line-error") {
    return `${session.errorInches}″ off`;
  }
  return `${session.finalHoles} hole${session.finalHoles === 1 ? "" : "s"}`;
}

// ============================================================================
// FORMAT HELPERS
// ============================================================================

export function formatDate(timestamp) {
  const d = new Date(timestamp);
  const now = new Date();
  const diffMs = now - d;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) {
    return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  }
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function formatDateLong(timestamp) {
  const d = new Date(timestamp);
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
