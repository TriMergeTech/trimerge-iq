"use client";

import { useState } from "react";
import { BookOpen, Filter, RotateCcw, Search } from "lucide-react";
import styles from "./SearchPage.module.css";

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
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
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
    if (category === "All Categories") {
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

  const getCategoryTagClass = (category: string): string => {
    const map: Record<string, string> = {
      Finance: styles.tagFinance,
      Marketing: styles.tagMarketing,
      Operations: styles.tagOperations,
      Technology: styles.tagTechnology,
      Strategy: styles.tagStrategy,
    };
    return map[category] ?? styles.tagDefault;
  };

  const twinkles = Array.from({ length: 44 }, (_, index) => ({
    id: index,
    left: `${(index * 9.37) % 100}%`,
    top: `${(index * 5.83) % 100}%`,
    delay: `${(index % 7) * 0.45}s`,
    duration: `${2.2 + (index % 5) * 0.5}s`,
  }));

  const renderDotWave = (
    rows: number,
    cols: number,
    dx: number,
    dy: number,
    amp: number,
    freq: number,
    phase: number,
    color: string,
  ) => {
    const points: JSX.Element[] = [];
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        const x = col * dx;
        const y =
          row * dy + Math.sin((col / cols) * Math.PI * freq + phase) * amp;
        const opacity = 0.4 + 0.6 * (1 - row / rows);
        points.push(
          <circle
            key={`${row}-${col}`}
            cx={x.toFixed(1)}
            cy={y.toFixed(1)}
            r="1.6"
            fill={color}
            opacity={opacity.toFixed(2)}
          />,
        );
      }
    }
    return points;
  };

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.wave} aria-hidden="true">
          <svg className={styles.waveLeft} viewBox="0 0 380 380" fill="none">
            {renderDotWave(20, 18, 18, 16, 30, 2, 0, "#a78bfa")}
          </svg>
          <svg className={styles.waveRight} viewBox="0 0 520 380" fill="none">
            {renderDotWave(18, 28, 18, 16, 36, 2.4, 1, "#6b8eff")}
          </svg>
        </div>
        <div className={styles.sky} aria-hidden="true">
          {twinkles.map((twinkle) => (
            <span
              key={twinkle.id}
              className={styles.twinkle}
              style={{
                left: twinkle.left,
                top: twinkle.top,
                animationDelay: twinkle.delay,
                animationDuration: twinkle.duration,
              }}
            />
          ))}
        </div>

        <div className={styles.heroInner}>
          <h1 className={styles.heroTitle}>
            Search{" "}
            <span className={styles.accent}>Organizational Knowledge</span>
          </h1>
          <p className={styles.lede}>
            Search opportunities, projects, clients, staff expertise, past
            performance, documents, templates, policies, and organizational
            knowledge from a single platform.
          </p>

          <div className={styles.modeRow} role="tablist" aria-label="Mode">
            <button
              type="button"
              onClick={() => setActiveView("search")}
              role="tab"
              aria-selected={activeView === "search"}
              className={`${styles.modeButton} ${
                activeView === "search" ? styles.modeButtonActive : ""
              }`}
            >
              <Search className={styles.modeIcon} />
              Search
            </button>
            <button
              type="button"
              onClick={() => setActiveView("filter")}
              role="tab"
              aria-selected={activeView === "filter"}
              className={`${styles.modeButton} ${
                activeView === "filter" ? styles.modeButtonActive : ""
              }`}
            >
              <Filter className={styles.modeIcon} />
              Filter
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveView("explore");
                handleRunQuery();
              }}
              role="tab"
              aria-selected={activeView === "explore"}
              className={`${styles.modeButton} ${
                activeView === "explore" ? styles.modeButtonActive : ""
              }`}
            >
              <BookOpen className={styles.modeIcon} />
              Explore
            </button>
          </div>

          <div
            className={`${styles.searchCard} ${
              activeView === "filter" ? styles.searchCardFilter : ""
            }`}
          >
            {activeView === "search" && (
              <div>
                <h2 className={styles.panelTitle}>Search Query</h2>
                <div>
                  <div className={styles.inputWrap}>
                    <span className={styles.inputLead}>
                      <Search className={styles.searchIcon} />
                    </span>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      onKeyDown={(event) =>
                        event.key === "Enter" ? handleSearch() : undefined
                      }
                      ref={(el) => {
                        const suggestions = [
                          "Show all FEMA projects",
                          "Find CPA resumes with grant experience",
                          "Search grant compliance templates",
                          "Find active opportunities",
                          "Search past performance for local government clients",
                          "Find SOPs related to financial management",
                          "Search project deliverables",
                          "Find partners with cybersecurity experience",
                        ];

                        if (!el) {
                          // when ref is cleared, try to clear any running interval stored on window
                          const id = (window as any)
                            .__searchPlaceholderInterval;
                          if (id) {
                            clearInterval(id);
                            delete (window as any).__searchPlaceholderInterval;
                            delete (window as any).__searchPlaceholderEl;
                          }
                          return;
                        }

                        // avoid double-init on remounts
                        if ((window as any).__searchPlaceholderEl === el)
                          return;

                        // clear previous interval if a different input was initialized
                        if ((window as any).__searchPlaceholderInterval) {
                          clearInterval(
                            (window as any).__searchPlaceholderInterval,
                          );
                          delete (window as any).__searchPlaceholderInterval;
                          delete (window as any).__searchPlaceholderEl;
                        }

                        (window as any).__searchPlaceholderEl = el;
                        let idx = 0;
                        const update = () => {
                          // don't change placeholder while user is typing / input is focused
                          if (document.activeElement === el) return;
                          el.placeholder = suggestions[idx];
                          idx = (idx + 1) % suggestions.length;
                        };

                        // seed immediately and then rotate
                        update();
                        (window as any).__searchPlaceholderInterval =
                          window.setInterval(update, 3000);

                        // clear placeholder while focused, resume on blur
                        const onFocus = () => {
                          el.placeholder = "";
                        };
                        const onBlur = () => {
                          // ensure a visible suggestion shows right after blur
                          update();
                        };
                        el.addEventListener("focus", onFocus);
                        el.addEventListener("blur", onBlur);

                        // best-effort cleanup if element is removed from the DOM
                        const mo = new MutationObserver(() => {
                          if (!document.body.contains(el)) {
                            if ((window as any).__searchPlaceholderInterval) {
                              clearInterval(
                                (window as any).__searchPlaceholderInterval,
                              );
                              delete (window as any)
                                .__searchPlaceholderInterval;
                              delete (window as any).__searchPlaceholderEl;
                            }
                            mo.disconnect();
                          }
                        });
                        mo.observe(document, {
                          childList: true,
                          subtree: true,
                        });
                      }}
                      placeholder="Enter your search query..."
                      className={styles.searchInput}
                    />
                    <button
                      type="button"
                      onClick={handleSearch}
                      className={styles.submitButton}
                    >
                      Search
                    </button>
                  </div>
                  <p className={styles.hint}>
                    Press Enter or click Search to execute query
                  </p>
                </div>

                <div className={styles.categoriesSection}>
                  <h3 className={styles.categoriesTitle}>
                    Search Across Organizational Knowledge
                  </h3>

                  <p className={styles.categoriesDescription}>
                    Access opportunities, clients, projects, staff expertise,
                    documents, templates, SOPs, and historical organizational
                    knowledge from a single platform.
                  </p>

                  <div className={styles.categoriesGrid}>
                    {[
                      "Opportunities",
                      "Clients",
                      "Projects",
                      "Staff",
                      "Partners",
                      "Documents",
                      "SOPs",
                      "Templates",
                      "Past Performance",
                    ].map((category) => (
                      <div key={category} className={styles.categoryCard}>
                        {category}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeView === "filter" && (
              <div className={styles.filterGrid}>
                <div>
                  <h2 className={styles.panelTitle}>Filter Options</h2>
                  <div className={styles.filterList}>
                    {categories.map((category) => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => filterByCategory(category)}
                        className={`${styles.filterOption} ${
                          selectedCategory === category
                            ? styles.filterOptionActive
                            : ""
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className={styles.panelTitle}>Date Range</h2>
                  <div>
                    <input type="date" className={styles.dateInput} />
                    <input type="date" className={styles.dateInput} />
                  </div>
                  <button
                    type="button"
                    onClick={handleRunQuery}
                    className={styles.applyButton}
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            )}

            {activeView === "explore" && (
              <div className={styles.exploreHead}>
                <h2 className={styles.panelTitle}>Explore Results</h2>
                <button
                  type="button"
                  onClick={handleRunQuery}
                  className={styles.runButton}
                >
                  <RotateCcw className={styles.runIcon} />
                  Run Query
                </button>
              </div>
            )}

            {results.length > 0 && (
              <div>
                <div className={styles.resultsBar}>
                  <h3 className={styles.resultsCount}>
                    Results ({results.length})
                  </h3>
                  <select
                    value={sortBy}
                    onChange={(event) => sortResults(event.target.value)}
                    className={styles.sortSelect}
                  >
                    <option value="relevance">Sort by Relevance</option>
                    <option value="date">Sort by Date</option>
                  </select>
                </div>

                <ol className={styles.resultList}>
                  {results.map((result, index) => (
                    <li key={result.id} className={styles.resultCard}>
                      <div className={styles.resultRank}>
                        Result {index + 1}
                      </div>
                      <div
                        className={`${styles.resultTag} ${getCategoryTagClass(result.category)}`}
                      >
                        {result.category}
                      </div>
                      <div>
                        <h4 className={styles.resultTitle}>{result.title}</h4>
                      </div>
                      <p className={styles.resultDescription}>
                        {result.description}
                      </p>
                      <div className={styles.resultFoot}>
                        <span className={styles.resultDate}>
                          {result.date.toLocaleDateString()}
                        </span>
                        <div className={styles.scoreWrap}>
                          <div className={styles.scoreBar}>
                            <div
                              className={styles.scoreFill}
                              style={{ width: `${result.relevance}%` }}
                            />
                          </div>
                          <span className={styles.scorePct}>
                            {result.relevance}%
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className={styles.infoStrip}>
        <div className={styles.infoGrid}>
          <article className={styles.infoCard}>
            <div className={`${styles.infoIcon} ${styles.infoIconViolet}`}>
              <Search className={styles.infoIconSvg} />
            </div>
            <div>
              <h3>Search Across Organizational Knowledge</h3>
              <p>
                Search opportunities, projects, documents, SOPs, templates,
                staff profiles, partners, and historical records.
              </p>
            </div>
          </article>
          <article className={styles.infoCard}>
            <div className={`${styles.infoIcon} ${styles.infoIconSky}`}>
              <Filter className={styles.infoIconSvg} />
            </div>
            <div>
              <h3>Filter and Refine Results</h3>
              <p>
                Filter by client, project, service area, staff member, date,
                document type, or category.
              </p>
            </div>
          </article>
          <article className={styles.infoCard}>
            <div className={`${styles.infoIcon} ${styles.infoIconLilac}`}>
              <BookOpen className={styles.infoIconSvg} />
            </div>
            <div>
              <h3>Relevant and Secure Results</h3>
              <p>
                Results are ranked by relevance while respecting user
                permissions and access levels.
              </p>
            </div>
          </article>
        </div>
      </section>

      <footer className={styles.footer}>
        <div>© 2026 TriMerge Consulting Group. All rights reserved.</div>
        <div className={styles.footerLinks}>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Contact</a>
        </div>
      </footer>
    </>
  );
}
