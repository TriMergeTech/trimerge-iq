import type { Metadata } from "next";
import Navbar from "../components/Navbar";
import SearchPage from "../components/SearchPage";

export const metadata: Metadata = {
  title: "Search",
};

export default function SearchRoutePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <SearchPage />
    </div>
  );
}
