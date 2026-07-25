// services/matchingEngine.js
// ─────────────────────────────────────────────────────────────────
// MATCHING ALGORITHM — Graph-based skill barter matching
//
// How it works (explainable for a viva):
//
// 1. GRAPH CONSTRUCTION:
//    - Every user is a NODE in a directed graph.
//    - We draw an EDGE from User A → User B if:
//      User A offers at least one skill that User B wants.
//    - We store the matching skill pair as edge "weight" metadata.
//
// 2. DIRECT (2-PARTY) MATCHES:
//    - A direct match exists when there's a 2-cycle: A→B AND B→A.
//    - This means A can give B something B wants, AND B can give A something A wants.
//
// 3. CHAIN (3+ PARTY) MATCHES:
//    - We use DFS (depth-first search) to find longer cycles.
//    - Example 3-cycle: A→B→C→A (A helps B, B helps C, C helps A).
//    - We cap the search at MAX_CYCLE_LENGTH to keep it fast.
//
// 4. RANKING:
//    - Matches are scored by: proficiency of the offer + urgency of the want.
//    - Higher score = better match.
// ─────────────────────────────────────────────────────────────────

const User = require('../models/User');

const MAX_CYCLE_LENGTH = 4; // Max participants in a chain match

// ── Skill similarity check ──────────────────────────────────────
// Returns true if skillA (offered) satisfies skillB (wanted).
// Uses case-insensitive substring matching — good enough for a demo.
// In production you'd use embeddings or a taxonomy.
const skillsMatch = (offeredSkill, wantedSkill) => {
  const a = offeredSkill.skillName.toLowerCase();
  const b = wantedSkill.skillName.toLowerCase();
  return a.includes(b) || b.includes(a);
};

// ── Score a single edge ─────────────────────────────────────────
// Higher proficiency + higher urgency = higher score (0-10)
const scoreEdge = (offeredSkill, wantedSkill) => {
  const proficiencyScore = { Beginner: 1, Intermediate: 2, Expert: 3 };
  const urgencyScore     = { Low: 1, Medium: 2, High: 3 };
  return (
    (proficiencyScore[offeredSkill.proficiency] || 1) +
    (urgencyScore[wantedSkill.urgency] || 1)
  );
};

// ── Build the directed graph ────────────────────────────────────
// Returns: Map<userId, Array<{ toId, gives: skillName, gets: skillName, score }>>
const buildGraph = (users) => {
  const graph = new Map();

  // Initialize all nodes
  for (const user of users) {
    graph.set(user._id.toString(), []);
  }

  // Build edges
  for (const userA of users) {
    for (const userB of users) {
      if (userA._id.equals(userB._id)) continue; // skip self

      // Check if A offers something B wants
      for (const offered of userA.skillsOffered) {
        for (const wanted of userB.skillsWanted) {
          if (skillsMatch(offered, wanted)) {
            graph.get(userA._id.toString()).push({
              toId:  userB._id.toString(),
              gives: offered.skillName, // what A gives to B
              gets:  wanted.skillName,  // what B gets from A
              score: scoreEdge(offered, wanted),
            });
          }
        }
      }
    }
  }

  return graph;
};

// ── Find 2-party (direct) matches ──────────────────────────────
const findDirectMatches = (graph, users) => {
  const matches = [];
  const seen = new Set(); // avoid duplicate pairs

  const userMap = new Map(users.map((u) => [u._id.toString(), u]));

  for (const [aId, edges] of graph.entries()) {
    for (const edge of edges) {
      const bId = edge.toId;
      const pairKey = [aId, bId].sort().join('-');
      if (seen.has(pairKey)) continue;

      // Check if there's also an edge B → A (mutual exchange)
      const reverseEdge = (graph.get(bId) || []).find((e) => e.toId === aId);
      if (reverseEdge) {
        seen.add(pairKey);
        matches.push({
          matchType:    'direct',
          participants: [userMap.get(aId), userMap.get(bId)],
          score:        edge.score + reverseEdge.score,
          exchangeSummary: [
            { userId: aId, gives: edge.gives,        gets: reverseEdge.gives },
            { userId: bId, gives: reverseEdge.gives,  gets: edge.gives       },
          ],
        });
      }
    }
  }

  // Sort best matches first
  return matches.sort((a, b) => b.score - a.score);
};

// ── DFS for cycle detection (chain matches) ─────────────────────
// Finds all cycles of length 3 to MAX_CYCLE_LENGTH starting from startId
const dfsFindCycles = (graph, startId, currentPath, visited, cycles) => {
  const currentId = currentPath[currentPath.length - 1];

  if (currentPath.length > MAX_CYCLE_LENGTH) return; // depth limit

  const edges = graph.get(currentId) || [];
  for (const edge of edges) {
    // If we've come back to the start and path is at least 3 nodes → cycle found
    if (edge.toId === startId && currentPath.length >= 3) {
      cycles.push([...currentPath, startId]); // close the cycle
      continue;
    }

    // Only visit nodes not already in the current path
    if (!visited.has(edge.toId) && edge.toId > startId) {
      // The `edge.toId > startId` condition avoids reporting the same cycle multiple times
      visited.add(edge.toId);
      currentPath.push(edge.toId);
      dfsFindCycles(graph, startId, currentPath, visited, cycles);
      currentPath.pop();
      visited.delete(edge.toId);
    }
  }
};

// ── Find 3+ party (chain) matches ──────────────────────────────
const findChainMatches = (graph, users) => {
  const userMap = new Map(users.map((u) => [u._id.toString(), u]));
  const cycles  = [];

  for (const startId of graph.keys()) {
    const visited = new Set([startId]);
    dfsFindCycles(graph, startId, [startId], visited, cycles);
  }

  // Convert raw cycles to match objects
  return cycles.map((cycle) => {
    const participantIds = cycle.slice(0, -1); // remove the closing startId
    const score = participantIds.reduce((sum, id, i) => {
      const nextId   = cycle[i + 1];
      const edgeData = (graph.get(id) || []).find((e) => e.toId === nextId);
      return sum + (edgeData ? edgeData.score : 0);
    }, 0);

    const exchangeSummary = participantIds.map((id, i) => {
      const nextId   = cycle[i + 1];
      const edgeData = (graph.get(id) || []).find((e) => e.toId === nextId);
      return {
        userId: id,
        gives:  edgeData ? edgeData.gives : '?',
        gets:   edgeData ? edgeData.gets  : '?',
      };
    });

    return {
      matchType:    'chain',
      participants: participantIds.map((id) => userMap.get(id)).filter(Boolean),
      score,
      exchangeSummary,
    };
  }).sort((a, b) => b.score - a.score);
};

// ── Main exported function ──────────────────────────────────────
// Runs the full matching algorithm for a given user.
// Returns { directMatches, chainMatches } where each match contains
// participant objects and an exchangeSummary.
const findMatches = async (currentUserId) => {
  // Load all users who have both skills offered AND wanted
  const users = await User.find({
    skillsOffered: { $not: { $size: 0 } },
    skillsWanted:  { $not: { $size: 0 } },
  });

  if (users.length < 2) {
    return { directMatches: [], chainMatches: [] };
  }

  const graph = buildGraph(users);

  const directMatches = findDirectMatches(graph, users);
  const chainMatches  = findChainMatches(graph, users);

  // Filter to only matches involving the current user
  const forUser = (matches) =>
    matches.filter((m) =>
      m.participants.some((p) => p._id.toString() === currentUserId)
    );

  return {
    directMatches: forUser(directMatches),
    chainMatches:  forUser(chainMatches),
  };
};

module.exports = { findMatches, buildGraph, findDirectMatches, findChainMatches };
