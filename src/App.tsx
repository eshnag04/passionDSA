import React, { useEffect, useMemo, useState } from "react";
import BarsVisualizer from "./components/BarVisualizer";

const API_URL = import.meta.env.VITE_API_URL || "/api";

const INTERESTS = ["Dance", "Poetry", "Cooking", "Sports", "Gaming", "Music"] as const;
type Interest = typeof INTERESTS[number];

const CONCEPTS = ["Stack", "Queue", "Hash Map", "Binary Search", "Recursion", "Graph"] as const;
type Concept = typeof CONCEPTS[number];

type Explanation = { analogy: string; steps: string[]; code: string; source?: "ai" | "mock" | "local" };

function generateExplanation(interest: Interest, concept: Concept): Explanation {
  const flavor = {
    Dance: { item: "move", place: "routine", group: "dancers" },
    Poetry: { item: "line", place: "stanza", group: "poems" },
    Cooking: { item: "step", place: "recipe", group: "ingredients" },
    Sports: { item: "play", place: "playbook", group: "players" },
    Gaming: { item: "action", place: "combo", group: "NPCs" },
    Music: { item: "bar", place: "setlist", group: "musicians" },
  }[interest];

  switch (concept) {
    case "Stack":
      return {
        analogy: `A Stack is like building a ${flavor.place}: add each ${flavor.item} on top; the last added comes off first (LIFO).`,
        steps: [
          `Push: add a ${flavor.item} to the top.`,
          "Top points to the most recent item.",
          `Pop: remove the top ${flavor.item} first.`,
          "Great for undo/back navigation.",
        ],
        code: `const stack: string[] = [];
stack.push("${flavor.item} A");
stack.push("${flavor.item} B");
console.log(stack.pop()); // ${flavor.item} B
console.log(stack.pop()); // ${flavor.item} A`,
        source: "local",
      };
    case "Queue":
      return {
        analogy: `A Queue is like ${flavor.group} lining up: first in is first out (FIFO).`,
        steps: ["Enqueue to back", "Dequeue from front", "Used in scheduling/BFS"],
        code: `const q: string[] = [];
q.push("first");
q.push("second");
console.log(q.shift()); // first`,
        source: "local",
      };
    case "Hash Map":
      return {
        analogy: `Hash Map is labeled bins for your ${flavor.place}: find items by label fast.`,
        steps: ["Hash key → bucket index", "Handle collisions", "Avg O(1) get/set"],
        code: `const m = new Map<string, number>();
m.set("tempo", 120);
console.log(m.get("tempo")); // 120`,
        source: "local",
      };
    case "Binary Search":
      return {
        analogy: `Like guessing BPM by halving ranges: check middle, discard half.`,
        steps: ["Needs sorted array", "Pick middle & compare", "Keep the half that can contain target"],
        code: `function bsearch(a: number[], x: number) {
  let l = 0, r = a.length - 1;
  while (l <= r) {
    const mid = (l + r) >> 1;
    if (a[mid] === x) return mid;
    if (a[mid] < x) l = mid + 1; else r = mid - 1;
  }
  return -1;
}`,
        source: "local",
      };
    case "Recursion":
      return {
        analogy: `Recurring motif in a ${flavor.place}: each call solves a smaller version until base case.`,
        steps: ["Define base case", "Progress toward base", "Let recursion solve subproblems"],
        code: `function factorial(n: number): number {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}`,
        source: "local",
      };
    case "Graph":
      return {
        analogy: `Graph connects ${flavor.group} via edges; explore paths/communities.`,
        steps: ["Nodes + edges", "DFS vs BFS", "Used in maps/social/dependencies"],
        code: `const g: Record<string, string[]> = { A:["B","C"], B:["D"], C:["D"], D:[] };
function bfs(start: string) {
  const q = [start], seen = new Set([start]);
  while (q.length) {
    const v = q.shift()!;
    for (const n of g[v]) if (!seen.has(n)) { seen.add(n); q.push(n); }
  }
  return [...seen];
}`,
        source: "local",
      };
  }
}

export default function App() {
  const [interest, setInterest] = useState<Interest | null>(null);
  const [concept, setConcept] = useState<Concept | null>(null);

  const [exp, setExp] = useState<Explanation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [stack, setStack] = useState<string[]>([]);
  const [queue, setQueue] = useState<string[]>([]);
  const demoItems = useMemo(() => {
    if (!interest) return ["Item A", "Item B", "Item C", "Item D"];
    const map: Record<Interest, string> = {
      Dance: "Move", Poetry: "Line", Cooking: "Step", Sports: "Play", Gaming: "Action", Music: "Bar"
    };
    const base = map[interest];
    return [`${base} A`, `${base} B`, `${base} C`, `${base} D`];
  }, [interest]);

  const canVisualize = concept === "Stack" || concept === "Queue";

  // fetch from API when both selected
  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!interest || !concept) return;
      setLoading(true); setError(null); setExp(null);
      try {
        const res = await fetch(`${API_URL}/explain`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ interest, concept })
        });
        if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
        const data = (await res.json()) as Explanation;
        if (!cancelled) setExp(data); // server can set source: 'ai' or 'mock'
      } catch {
        if (!cancelled) {
          setExp(generateExplanation(interest, concept)); // local fallback
          setError("Using local explanation (AI unavailable).");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => { cancelled = true; };
  }, [interest, concept]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50">
      <header className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">PassionDSA</h1>
        <p className="text-gray-600">Explain CS concepts through what you love.</p>
      </header>

      <main className="max-w-6xl mx-auto px-4 pb-16">
        {/* Step 1 */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-2">1) Pick your interest</h2>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map((i) => (
              <button
                key={i}
                onClick={() => { setInterest(i); setConcept(null); setStack([]); setQueue([]); setExp(null); setError(null); }}
                className={`px-4 py-2 rounded-full border transition ${
                  interest === i ? "bg-pink-500 text-white border-pink-600"
                                  : "bg-white hover:bg-pink-50 border-pink-200 text-pink-700"
                }`}
              >
                {i}
              </button>
            ))}
          </div>
        </section>

        {/* Step 2 */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-2">2) Choose a concept</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {CONCEPTS.map((c) => (
              <button
                key={c}
                disabled={!interest}
                onClick={() => { setConcept(c); setStack([]); setQueue([]); setExp(null); setError(null); }}
                className={`px-3 py-2 rounded-lg text-sm border transition ${
                  concept === c ? "bg-blue-600 text-white border-blue-700"
                                : "bg-white hover:bg-blue-50 border-blue-200 text-blue-700"
                } ${!interest ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {c}
              </button>
            ))}
          </div>
        </section>

        {/* Content */}
        {interest && concept && (
          <div className="grid md:grid-cols-2 gap-6 items-start">
            {/* Explanation */}
            <div className="bg-white/80 rounded-2xl shadow p-5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-semibold">
                  {concept} explained for {interest.toLowerCase()}
                </h3>
                {exp && (
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs
                    ${exp.source === "ai" ? "bg-emerald-100 text-emerald-800"
                    : exp.source === "mock" ? "bg-amber-100 text-amber-800"
                    : "bg-gray-200 text-gray-700"}`}>
                    {exp.source === "ai" ? "AI" : exp.source === "mock" ? "AI (mock)" : "Local"}
                  </span>
                )}
              </div>

              {loading && <div className="text-sm text-gray-600">Generating a personalized explanation…</div>}
              {!loading && error && (
                <div className="mb-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-amber-800">
                  {error}
                </div>
              )}
              {!loading && exp && (
                <>
                  <p className="mb-3 leading-relaxed">{exp.analogy}</p>
                  <ul className="list-disc ml-6 mb-4 text-gray-700">
                    {exp.steps.map((s, idx) => <li key={idx}>{s}</li>)}
                  </ul>
                  <h4 className="font-medium mb-1">Code (TypeScript)</h4>
                  <pre className="bg-gray-100 p-3 rounded-lg overflow-auto text-sm">
                    <code>{exp.code}</code>
                  </pre>
                </>
              )}
            </div>

            {/* Visualizer */}
            <div className="bg-white/80 rounded-2xl shadow p-5">
              {canVisualize ? (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    {concept === "Stack" ? (
                      <>
                        <button
                          className="px-3 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600"
                          onClick={() => setStack(s => [...s, demoItems[s.length % demoItems.length]])}
                        >
                          Push
                        </button>
                        <button
                          className="px-3 py-2 rounded-lg bg-rose-500 text-white hover:bg-rose-600 disabled:opacity-50"
                          onClick={() => setStack(s => s.slice(0, -1))}
                          disabled={!stack.length}
                        >
                          Pop
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="px-3 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600"
                          onClick={() => setQueue(q => [...q, demoItems[q.length % demoItems.length]])}
                        >
                          Enqueue
                        </button>
                        <button
                          className="px-3 py-2 rounded-lg bg-rose-500 text-white hover:bg-rose-600 disabled:opacity-50"
                          onClick={() => setQueue(q => q.slice(1))}
                          disabled={!queue.length}
                        >
                          Dequeue
                        </button>
                      </>
                    )}
                    <button
                      className="ml-auto px-3 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                      onClick={() => { setStack([]); setQueue([]); }}
                    >
                      Reset
                    </button>
                  </div>
                  {concept === "Stack"
                    ? <BarsVisualizer items={stack} type="Stack" />
                    : <BarsVisualizer items={queue} type="Queue" />
                  }
                  <p className="mt-3 text-sm text-gray-600">
                    Try the buttons to see {concept === "Stack" ? "LIFO" : "FIFO"} in action.
                  </p>
                </>
              ) : (
                <div className="text-gray-700">Visual coming soon for <span className="font-medium">{concept}</span>.</div>
              )}
            </div>
          </div>
        )}

        {!interest && (
          <div className="rounded-2xl border border-dashed bg-white/70 p-6 text-gray-600">
            pick an interest to get a personalized explanation ✨
          </div>
        )}
      </main>

      <footer className="text-center text-xs text-gray-500 pb-6">
        built with react, typescript, tailwind, framer-motion
      </footer>
    </div>
  );
}
