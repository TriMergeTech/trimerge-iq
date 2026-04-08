"use client";

import { useState } from "react";
import { BookOpen, Filter, RotateCcw, Search } from "lucide-react";

interface SearchResult {
  id: number;
  title: string;
  description: string;
  relevance: number;
  category: string;
  date: Date;
}

const MOCK_RESULTS: SearchResult[] = [
  {
    id: 1,
    title: "Q4 2025 Financial Analysis Report",
    description:
      "Comprehensive financial performance analysis including revenue trends, cost optimization opportunities, and market comparison data.",
    relevance: 95,
    category: "Finance",
    date: new Date("2025-03-15"),
  },
  {
    id: 2,
    title: "Digital Marketing Strategy Framework",
    description:
      "Complete guide to modern digital marketing approaches including SEO, content strategy, and social media engagement tactics.",
    relevance: 89,
    category: "Marketing",
    date: new Date("2025-03-10"),
  },
  {
    id: 3,
    title: "Operations Efficiency Playbook",
    description:
      "Best practices for streamlining operations, reducing waste, and implementing lean management principles across departments.",
    relevance: 87,
    category: "Operations",
    date: new Date("2025-03-08"),
  },
  {
    id: 4,
    title: "Cloud Migration Guidelines",
    description:
      "Step-by-step approach to planning and executing enterprise cloud migration with minimal disruption and maximum ROI.",
    relevance: 82,
    category: "Technology",
    date: new Date("2025-03-05"),
  },
  {
    id: 5,
    title: "Strategic Planning Template 2025",
    description:
      "Proven framework for developing comprehensive strategic plans aligned with organizational goals and market opportunities.",
    relevance: 78,
    category: "Strategy",
    date: new Date("2025-03-01"),
  },
];

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeView, setActiveView] = useState<"search" | "filter" | "explore">(
    "search",
  );
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("relevance");
  const [results, setResults] = useState<SearchResult[]>([]);

  const categories = [
    "All Categories",
    "Finance",
    "Marketing",
    "Operations",
    "Technology",
    "Strategy",
  ];

  const handleSearch = () => {
    if (searchQuery.trim()) {
      const filtered = MOCK_RESULTS.filter(
        (result) =>
          result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          result.description.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      setResults(filtered);
    } else {
      setResults([]);
    }
  };

  const handleRunQuery = () => {
    setResults([...MOCK_RESULTS]);
  };

  const filterByCategory = (category: string) => {
    setSelectedCategory(category);
    if (category === "all" || category === "All Categories") {
      setResults([...MOCK_RESULTS]);
    } else {
      setResults(MOCK_RESULTS.filter((result) => result.category === category));
    }
  };

  const sortResults = (sortType: string) => {
    setSortBy(sortType);
    const sorted = [...results];
    if (sortType === "relevance") {
      sorted.sort((a, b) => b.relevance - a.relevance);
    } else if (sortType === "date") {
      sorted.sort((a, b) => b.date.getTime() - a.date.getTime());
    }
    setResults(sorted);
  };

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      Finance: "#1e5ba8",
      Marketing: "#d4af37",
      Operations: "#808080",
      Technology: "#4a90e2",
      Strategy: "#2ecc71",
    };
    return colors[category] || "#808080";
  };

  return (
    <section className="page-shell min-h-[calc(100vh-80px)] bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 px-4 py-12">
      <div className="mx-auto max-w-[1500px]">
        <div className="page-section mb-12 text-center">
          <h1 className="text-4xl font-bold text-white">Search & Explore</h1>
          <p className="mt-4 text-lg text-blue-200">
            Query input and result exploration with filtering and ranked
            results
          </p>
        </div>

        <div className="page-section mb-8 flex justify-center gap-4 [animation-delay:90ms]">
          <button
            type="button"
            onClick={() => setActiveView("search")}
            className={`interactive-button flex items-center gap-2 rounded-lg px-8 py-3 font-semibold shadow-lg ${
              activeView === "search"
                ? "bg-[#1e5ba8] text-white"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            <Search className="h-5 w-5" />
            Search
          </button>
          <button
            type="button"
            onClick={() => setActiveView("filter")}
            className={`interactive-button flex items-center gap-2 rounded-lg px-8 py-3 font-semibold shadow-lg ${
              activeView === "filter"
                ? "bg-[#d4af37] text-gray-900"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            <Filter className="h-5 w-5" />
            Filter
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveView("explore");
              handleRunQuery();
            }}
            className={`interactive-button flex items-center gap-2 rounded-lg px-8 py-3 font-semibold shadow-lg ${
              activeView === "explore"
                ? "bg-[#808080] text-white"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            <BookOpen className="h-5 w-5" />
            Explore
          </button>
        </div>

        <div className="page-section rounded-2xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-lg [animation-delay:160ms]">
          {activeView === "search" && (
            <div className="max-w-[1100px]">
              <h2 className="mb-6 text-2xl font-bold text-white">Search Query</h2>
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    onKeyDown={(event) =>
                      event.key === "Enter" ? handleSearch() : undefined
                    }
                    placeholder="Enter your search query..."
                    className="interactive-input w-full rounded-xl border-2 border-white/20 bg-white/5 px-6 py-4 pr-32 text-lg text-white outline-none placeholder:text-blue-200 focus:ring-2 focus:ring-[#1e5ba8]"
                  />
                  <button
                    type="button"
                    onClick={handleSearch}
                    className="interactive-button absolute right-3 top-1/2 -translate-y-1/2 rounded-lg bg-[#1e5ba8] px-6 py-2 font-semibold text-white hover:bg-[#174a8f]"
                  >
                    Search
                  </button>
                </div>
                <p className="text-sm text-blue-200">
                  Press Enter or click Search to execute query
                </p>
              </div>
            </div>
          )}

          {activeView === "filter" && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <h2 className="mb-6 text-2xl font-bold text-white">
                  Filter Options
                </h2>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => filterByCategory(category)}
                      className={`interactive-button w-full rounded-lg px-4 py-3 text-left font-medium ${
                        selectedCategory === category.toLowerCase() ||
                        (category === "All Categories" && selectedCategory === "all")
                          ? "bg-[#1e5ba8] text-white"
                          : "bg-white/5 text-white hover:bg-white/10"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="mb-6 text-2xl font-bold text-white">Date Range</h2>
                <div className="space-y-3">
                  <input
                    type="date"
                    className="interactive-input w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-[#1e5ba8]"
                  />
                  <input
                    type="date"
                    className="interactive-input w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-[#1e5ba8]"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleRunQuery}
                  className="interactive-button mt-4 w-full rounded-lg bg-[#d4af37] px-6 py-3 font-bold text-gray-900 shadow-lg hover:bg-[#c19a2e]"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}

          {activeView === "explore" && (
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Explore Results</h2>
              <button
                type="button"
                onClick={handleRunQuery}
                className="interactive-button flex items-center gap-2 rounded-lg bg-[#808080] px-6 py-2 font-semibold text-white hover:bg-[#6b6b6b]"
              >
                <RotateCcw className="h-4 w-4" />
                Run Query
              </button>
            </div>
          )}

          {results.length > 0 && (
            <div className="mt-8 space-y-4">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">
                  Results ({results.length})
                </h3>
                <select
                  value={sortBy}
                  onChange={(event) => sortResults(event.target.value)}
                  className="interactive-input rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-white outline-none focus:ring-2 focus:ring-[#1e5ba8]"
                >
                  <option value="relevance">Sort by Relevance</option>
                  <option value="date">Sort by Date</option>
                </select>
              </div>

              {results.map((result, index) => (
                <div
                  key={result.id}
                  className="card-lift rounded-xl border border-white/20 bg-white/5 p-6 hover:bg-white/10"
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-[#d4af37]">
                        Result {index + 1}
                      </p>
                      <h4 className="text-lg font-semibold text-white">
                        {result.title}
                      </h4>
                    </div>
                    <span
                      className="rounded-full px-3 py-1 text-xs font-bold text-white"
                      style={{ backgroundColor: getCategoryColor(result.category) }}
                    >
                      {result.category}
                    </span>
                  </div>
                  <p className="mb-3 text-blue-200">{result.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-300">
                      {result.date.toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-32 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-[#d4af37]"
                          style={{ width: `${result.relevance}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-[#d4af37]">
                        {result.relevance}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
