import ChatPage from "./Chatpage";
import Navbar from "../components/Navbar";

export default function ChatRoutePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <ChatPage />
    </div>
  );
}
