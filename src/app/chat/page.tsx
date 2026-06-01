import type { Metadata } from "next";
import ChatPage from "../components/ChatPage";
import Navbar from "../components/Navbar";

export const metadata: Metadata = {
  title: "Chat",
};

export default function ChatRoutePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <ChatPage />
    </div>
  );
}
