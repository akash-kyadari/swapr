import Navigation from "./Navigation";
import Footer from "./Footer";
import { useRouter } from "next/router";
import useUserStore from "../store/useUserStore";
import LoginPrompt from "./LoginPrompt";
import { useEffect, useRef } from "react";
import { initializeSocket } from "../utils/socket";

export default function Layout({ children }) {
  const router = useRouter();
  const { user, loading: userLoading, fetchUser } = useUserStore();
  const socketRef = useRef(null);
  const isMessagesPage = router.pathname === "/messages";
  const isSkillsPage = router.pathname === "/skills";
  const isSwapPage = router.pathname === "/swap";
  const isSwapDetailPage = router.pathname.startsWith("/swap/");
  const isLoginPromptPage =
    !userLoading &&
    !user &&
    (router.pathname === "/swap" || router.pathname === "/messages");

  useEffect(() => {
    if (!user) return;
    if (!socketRef.current) {
      socketRef.current = initializeSocket();
    }
    const socket = socketRef.current;
    // Listen for swap_completed event globally
    const handleSwapCompleted = () => {
      if (typeof fetchUser === 'function') fetchUser();
    };
    socket.on('swap_completed', handleSwapCompleted);
    // Also listen for swap_completed in case backend emits swap_completed instead of swap_completed
    socket.on('swap_completed', handleSwapCompleted);
    // Cleanup
    return () => {
      socket.off('swap_completed', handleSwapCompleted);
    };
  }, [user, fetchUser]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col">
      {/* Navigation - Fixed position */}
      <div className="flex-shrink-0 sticky top-0 z-50">
        <Navigation />
      </div>

      {/* Main Content */}
      {isMessagesPage ? (
        <main className="flex-1 overflow-hidden">{children}</main>
      ) : isLoginPromptPage ? (
        <main className="flex-1 flex items-center justify-center px-4 py-8">
          <LoginPrompt
            title={
              router.pathname === "/swap"
                ? "Login to Access Swaps"
                : "Login to Access Messages"
            }
            message={
              router.pathname === "/swap"
                ? "Join our community to start swapping skills with other members. Create skill exchanges and find the perfect match for your learning journey."
                : "Connect with other members through our messaging system. Start conversations and coordinate your skill swaps."
            }
          />
        </main>
      ) : isSkillsPage || isSwapPage || isSwapDetailPage ? (
        // Remove all side/top/bottom padding for /skills, /swap, and /swap/[id] pages
        <main className="flex-1 w-full max-w-none m-0 p-0">{children}</main>
      ) : (
        <main className="flex-1 max-w-[98vw] mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {children}</main>
      )}

      {/* Footer */}
      {!isMessagesPage && !isLoginPromptPage && !isSwapDetailPage && <Footer />}
    </div>
  );
}
