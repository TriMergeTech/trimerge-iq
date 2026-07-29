import type { Metadata } from "next";
import HomePage from "./_components/HomePage";

export const metadata: Metadata = {
  title: "Home",
};

export default function Page() {
  return <HomePage />;
}
