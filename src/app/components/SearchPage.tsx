"use client";

import { useMemo, useState } from "react";
import { BookOpen, Filter, RotateCcw, Search } from "lucide-react";

interface SearchResult {
  id: number;
  title: string;
  description: string;
  relevance: number;
  category: string;
  date: Date;
}

type SearchMode = "search" | "filter" | "explore";

const MOCK_RESULTS: SearchResult[] = [
  {
    id: 1,
    title: "Q4 2025 Financial Analysis Report",
    description:
      "Comprehensive financial performance analysis including revenue trends, cost optimization opportunities, and market comparison data.",
    relevance: 95,
    category: "Finance",
    date: new Date("2025-03-14"),
  },
  {
    id: 2,
    title: "Digital Marketing Strategy Framework",
    description:
      "Complete guide to modern digital marketing approaches including SEO, content strategy, and social media engagement tactics.",
    relevance: 89,
    category: "Marketing",
    date: new Date("2025-03-09"),
  },
  {
    id: 3,
    title: "Operations Efficiency Playbook",
    description:
      "Best practices for streamlining operations, reducing waste, and implementing lean management principles across departments.",
    relevance: 87,
    category: "Operations",
    date: new Date("2025-03-07"),
  },
  {
    id: 4,
    title: "Cloud Migration Guidelines",
    description:
      "Step-by-step approach to planning and executing enterprise cloud migration with minimal disruption and maximum ROI.",
    relevance: 82,
    category: "Technology",
    date: new Date("2025-03-04"),
  },
  {
    id: 5,
    title: "Strategic Planning Template 2025",
    description:
      "Proven framework for developing comprehensive strategic plans aligned with organizational goals and market opportunities.",
    relevance: 78,
    category: "Strategy",
    date: new Date("2025-02-28"),
  },
];

const categories = [
  "All Categories",
  "Finance",
  "Marketing",
  "Operations",
  "Technology",
  "Strategy",
];

const modeOptions = [
  { key: "search", label: "Search", icon: Search },
  { key: "filter", label: "Filter", icon: Filter },
  { key: "explore", label: "Explore", icon: BookOpen },
] satisfies Array<{ key: SearchMode; label: string; icon: typeof Search }>;

const categoryStyles: Record<string, string> = {
  Finance: "border-[#74c2ff]/35 bg-[#2b89d9]/18 text-[#74c2ff]",
  Marketing: "border-[#ffd773]/35 bg-[#efb01a]/18 text-[#ffd773]",
  Operations: "border-[#ffae87]/35 bg-[#d97c57]/18 text-[#ffae87]",
  Technology: "border-[#c8b6ff]/35 bg-[#7c5cff]/18 text-[#c8b6ff]",
  Strategy: "border-[#6fe6b3]/35 bg-[#2bc48a]/18 text-[#6fe6b3]",
};

const waveDots = {
  left: makeDotWave({ rows: 20, cols: 18, dx: 18, dy: 16, amp: 30, freq: 2, phase: 0 }),
  right: makeDotWave({ rows: 18, cols: 28, dx: 18, dy: 16, amp: 36, freq: 2.4, phase: 1 }),
};

const twinkles = Array.from({ length: 60 }, (_, index) => ({
  id: index,
  left: `${(index * 37) % 101}%`,
  top: `${(index * 53) % 101}%`,
  delay: `${((index * 17) % 30) / 10}s`,
  duration: `${2 + ((index * 19) % 30) / 10}s`,
}));

function makeDotWave({
  rows,
  cols,
  dx,
  dy,
  amp,
  freq,
  phase,
}: {
  rows: number;
  cols: number;
  dx: number;
  dy: number;
  amp: number;
  freq: number;
  phase: number;
}) {
  return Array.from({ length: rows * cols }, (_, index) => {
    const row = Math.floor(index / cols);
    const col = index % cols;
    return {
      id: index,
      x: col * dx,
      y: row * dy + Math.sin((col / cols) * Math.PI * freq + phase) * amp,
      opacity: 0.9 * (0.4 + 0.6 * (1 - row / rows)),
    };
  });
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  });
}

function sortSearchResults(results: SearchResult[], sortType: string) {
  const sorted = [...results];

  if (sortType === "date") {
    return sorted.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  if (sortType === "category") {
    return sorted.sort((a, b) => a.category.localeCompare(b.category));
  }

  return sorted.sort((a, b) => b.relevance - a.relevance);
}

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeView, setActiveView] = useState<SearchMode>("search");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [sortBy, setSortBy] = useState("relevance");
  const [results, setResults] = useState<SearchResult[]>(MOCK_RESULTS);

  const sortedResults = useMemo(() => sortSearchResults(results, sortBy), [results, sortBy]);

  const handleSearch = () => {
    const query = searchQuery.trim().toLowerCase();
    const filtered = query
      ? MOCK_RESULTS.filter(
          (result) =>
            result.title.toLowerCase().includes(query) ||
            result.description.toLowerCase().includes(query) ||
            result.category.toLowerCase().includes(query),
        )
      : MOCK_RESULTS;

    setResults(filtered);
    setActiveView("explore");
  };

  const handleRunQuery = () => {
    setResults([...MOCK_RESULTS]);
    setActiveView("explore");
  };

  const filterByCategory = (category: string) => {
    setSelectedCategory(category);
    if (category === "All Categories") {
      setResults([...MOCK_RESULTS]);
      return;
    }

    setResults(MOCK_RESULTS.filter((result) => result.category === category));
  };

  return (
    <>
      <section className="relative overflow-hidden bg-[radial-gradient(ellipse_80%_60%_at_50%_100%,#131b6a_0%,transparent_60%),radial-gradient(ellipse_100%_80%_at_0%_0%,#1a1166_0%,transparent_55%),linear-gradient(180deg,#060a36_0%,#050829_100%)] px-5 py-20 text-center text-white sm:px-6 lg:py-24">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-90">
          <svg className="absolute left-[-40px] top-[110px] w-[380px] opacity-90" viewBox="0 0 380 380" fill="none">
            {waveDots.left.map((dot) => (
              <circle
                key={dot.id}
                cx={dot.x}
                cy={dot.y}
                r="1.6"
                fill="#a78bfa"
                opacity={dot.opacity}
              />
            ))}
          </svg>
          <svg className="absolute bottom-10 right-[-40px] w-[520px] opacity-90" viewBox="0 0 520 380" fill="none">
            {waveDots.right.map((dot) => (
              <circle
                key={dot.id}
                cx={dot.x}
                cy={dot.y}
                r="1.6"
                fill="#6b8eff"
                opacity={dot.opacity}
              />
            ))}
          </svg>
        </div>

        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          {twinkles.map((twinkle) => (
            <span
              key={twinkle.id}
              className="twinkle"
              style={{
                left: twinkle.left,
                top: twinkle.top,
                animationDelay: twinkle.delay,
                animationDuration: twinkle.duration,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 mx-auto max-w-[1320px]">
          <h1 className="font-display m-0 text-[42px] font-bold leading-[1.08] text-white sm:text-[60px]">
            Search &amp;{" "}
            <span className="bg-gradient-to-r from-[#7c5cff] via-[#4f7bff] to-[#2bc5ff] bg-clip-text text-transparent">
              Explore
            </span>
          </h1>
          <p className="mx-auto mb-10 mt-6 max-w-[680px] font-sans text-[17px] leading-7 text-[#c8cdee]">
            Query input and result exploration with filtering and ranked results across your entire TriMerge knowledge layer.
          </p>

          <div className="mb-14 flex flex-wrap justify-center gap-3.5" role="tablist" aria-label="Search mode">
            {modeOptions.map(({ key, label, icon: Icon }) => {
              const isActive = activeView === key;

              return (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => {
                    setActiveView(key);
                    if (key === "explore" && results.length === 0) {
                      handleRunQuery();
                    }
                  }}
                  className={`interactive-button inline-flex items-center gap-2.5 rounded-[10px] border px-7 py-3.5 font-display text-base font-medium text-white backdrop-blur-md transition ${
                    isActive
                      ? "border-[#2e2bff] bg-[#2e2bff] shadow-[0_10px_30px_rgba(46,43,255,0.45)]"
                      : "border-white/20 bg-white/[0.06] hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/[0.12]"
                  }`}
                >
                  <Icon className="h-[18px] w-[18px]" />
                  {label}
                </button>
              );
            })}
          </div>

          {activeView === "search" ? (
            <div className="mx-auto max-w-[980px] rounded-[18px] border border-white/15 bg-white/[0.06] p-6 text-left shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-lg sm:p-8">
              <h2 className="font-display mb-[18px] text-[22px] font-bold text-white">Search Query</h2>
              <form
                className="flex flex-col overflow-hidden rounded-xl border border-white/20 bg-white/[0.08] transition focus-within:border-[#7c5cff]/70 focus-within:bg-white/[0.10] focus-within:shadow-[0_0_0_4px_rgba(124,92,255,0.18)] sm:flex-row"
                onSubmit={(event) => {
                  event.preventDefault();
                  handleSearch();
                }}
              >
                <label className="flex min-w-0 flex-1 items-center gap-4 px-[18px]">
                  <Search className="h-[18px] w-[18px] shrink-0 text-[#b8c0e8]" />
                  <input
                    autoFocus
                    type="text"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Enter your search query..."
                    className="min-h-[58px] min-w-0 flex-1 border-0 bg-transparent py-4 font-sans text-base text-white outline-none placeholder:text-[#8a93bf]"
                  />
                </label>
                <button
                  type="submit"
                  className="interactive-button bg-[#2e2bff] px-8 py-3 font-display text-base font-medium text-white hover:bg-[#2120e0]"
                >
                  Search
                </button>
              </form>
              <div className="mx-0.5 mt-3.5 font-sans text-[13.5px] text-[#9aa3c8]">
                Press Enter or click Search to execute query
              </div>
            </div>
          ) : null}

          {activeView === "filter" ? (
            <div className="mx-auto max-w-[1320px] rounded-[18px] border border-white/15 bg-white/[0.06] p-6 text-left shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-lg sm:p-8">
              <div className="grid gap-10 md:grid-cols-2">
                <div>
                  <h2 className="font-display mb-[18px] text-[22px] font-bold text-white">Filter Options</h2>
                  <div className="flex flex-col gap-2.5">
                    {categories.map((category) => {
                      const isActive = selectedCategory === category;

                      return (
                        <button
                          key={category}
                          type="button"
                          onClick={() => filterByCategory(category)}
                          className={`interactive-button w-full rounded-[10px] border px-[18px] py-3.5 text-left font-display text-[15px] font-medium text-white transition ${
                            isActive
                              ? "border-[#7c5cff]/55 bg-gradient-to-r from-[#2e2bff]/85 to-[#7c5cff]/70 shadow-[0_8px_22px_rgba(46,43,255,0.35)]"
                              : "border-white/15 bg-white/[0.06] hover:border-white/30 hover:bg-white/[0.12]"
                          }`}
                        >
                          {category}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h2 className="font-display mb-[18px] text-[22px] font-bold text-white">Date Range</h2>
                  <div className="space-y-3">
                    <input
                      type="date"
                      className="interactive-input w-full rounded-[10px] border border-white/20 bg-white/[0.08] px-[18px] py-3.5 font-sans text-[15px] text-white outline-none [color-scheme:dark] focus:border-[#7c5cff]/70 focus:bg-white/[0.10] focus:shadow-[0_0_0_4px_rgba(124,92,255,0.18)]"
                    />
                    <input
                      type="date"
                      className="interactive-input w-full rounded-[10px] border border-white/20 bg-white/[0.08] px-[18px] py-3.5 font-sans text-[15px] text-white outline-none [color-scheme:dark] focus:border-[#7c5cff]/70 focus:bg-white/[0.10] focus:shadow-[0_0_0_4px_rgba(124,92,255,0.18)]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleRunQuery}
                    className="interactive-button mt-4 w-full rounded-[10px] bg-gradient-to-r from-[#f3b81a] to-[#efb01a] px-5 py-3.5 font-display text-[15px] font-semibold text-[#1f1607] shadow-[0_10px_26px_rgba(239,176,26,0.35)] hover:brightness-105"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {activeView === "explore" ? (
            <div className="mx-auto max-w-[1320px] rounded-[18px] border border-white/15 bg-white/[0.06] p-6 text-left shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-lg sm:p-8">
              <div className="mb-[18px] flex flex-wrap items-center justify-between gap-4">
                <h2 className="font-display text-[22px] font-bold text-white">Explore Results</h2>
                <button
                  type="button"
                  onClick={handleRunQuery}
                  className="interactive-button inline-flex items-center gap-2 rounded-[10px] border border-white/20 bg-white/[0.06] px-[18px] py-2.5 font-display text-[14.5px] font-medium text-white hover:border-white/30 hover:bg-white/[0.12]"
                >
                  <RotateCcw className="h-[15px] w-[15px]" />
                  Run Query
                </button>
              </div>

              <div className="mb-3.5 flex flex-wrap items-center justify-between gap-3">
                <div className="font-display text-[15px] font-semibold text-white">
                  Results ({sortedResults.length})
                </div>
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  className="interactive-input rounded-lg border border-white/20 bg-white/[0.06] px-3.5 py-2 font-sans text-[13.5px] text-white outline-none [color-scheme:dark] focus:border-[#7c5cff]/70"
                >
                  <option value="relevance">Sort by Relevance</option>
                  <option value="date">Sort by Date</option>
                  <option value="category">Sort by Category</option>
                </select>
              </div>

              <ol className="flex list-none flex-col gap-3.5 p-0">
                {sortedResults.map((result, index) => (
                  <li
                    key={result.id}
                    className="card-lift relative rounded-[14px] border border-white/15 bg-white/[0.05] px-5 py-4 transition hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/[0.09] sm:px-[22px]"
                  >
                    <div className="mb-1 font-sans text-[11px] font-semibold uppercase tracking-[1.4px] text-[#9aa3c8]">
                      Result {index + 1}
                    </div>
                    <span
                      className={`mb-3 inline-flex rounded-full border px-2.5 py-1 font-sans text-[11.5px] font-semibold sm:absolute sm:right-[18px] sm:top-[18px] sm:mb-0 ${
                        categoryStyles[result.category] ?? "border-white/20 bg-white/10 text-white"
                      }`}
                    >
                      {result.category}
                    </span>
                    <h3 className="font-display mb-1.5 text-lg font-bold text-white sm:pr-28">
                      {result.title}
                    </h3>
                    <p className="mb-3.5 font-sans text-[13.5px] leading-6 text-[#c8cdee] sm:pr-28">
                      {result.description}
                    </p>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <span className="font-sans text-[12.5px] text-[#9aa3c8]">
                        {formatDate(result.date)}
                      </span>
                      <div className="flex min-w-[220px] items-center gap-2.5">
                        <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                          <span
                            className="block h-full rounded-full bg-gradient-to-r from-[#f3b81a] to-[#ffd773]"
                            style={{ width: `${result.relevance}%` }}
                          />
                        </span>
                        <span className="min-w-9 text-right font-sans text-[12.5px] font-semibold text-[#ffd773]">
                          {result.relevance}%
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          ) : null}
        </div>
      </section>

      <section className="bg-gradient-to-b from-[#f4f4fc] to-[#ecedf8] px-5 py-14">
        <div className="mx-auto grid max-w-[1180px] gap-6 lg:grid-cols-3">
          <InfoCard
            icon={<Search className="h-6 w-6" />}
            title="Unified search"
            text="Query across decks, projects, playbooks, and client records from one input."
            tone="bg-[#efeaff] text-[#6b4eff]"
          />
          <InfoCard
            icon={<Filter className="h-6 w-6" />}
            title="Smart filters"
            text="Narrow by source, owner, date, or permission scope to find what matters."
            tone="bg-[#e6f4fd] text-[#2b89d9]"
          />
          <InfoCard
            icon={<BookOpen className="h-6 w-6" />}
            title="Ranked results"
            text="Permission-aware ranking surfaces the most relevant, accessible answers first."
            tone="bg-[#ece8ff] text-[#6b4eff]"
          />
        </div>
      </section>

      <footer className="flex flex-col items-center justify-between gap-3 bg-[#050828] px-6 py-7 text-center font-sans text-sm text-[#c0c5e2] sm:flex-row sm:px-14 sm:text-left">
        <div>Copyright 2026 TriMerge Consulting Group. All rights reserved.</div>
        <div className="flex flex-wrap justify-center gap-5 sm:gap-9">
          <a className="interactive-base hover:text-white" href="#">
            Privacy Policy
          </a>
          <a className="interactive-base hover:text-white" href="#">
            Terms of Service
          </a>
          <a className="interactive-base hover:text-white" href="#">
            Contact
          </a>
        </div>
      </footer>
    </>
  );
}

function InfoCard({
  icon,
  title,
  text,
  tone,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  tone: string;
}) {
  return (
    <article className="flex items-start gap-[18px] rounded-2xl border border-[#e6e8f1] bg-white p-7 text-left">
      <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${tone}`}>{icon}</div>
      <div>
        <h3 className="font-display mb-1.5 text-[17px] font-bold text-[#0b1340]">{title}</h3>
        <p className="m-0 font-sans text-sm leading-6 text-[#5b6079]">{text}</p>
      </div>
    </article>
  );
}
