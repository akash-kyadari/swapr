import Navigation from "./Navigation";
import { useRouter } from "next/router";
import useUserStore from "../store/useUserStore";
import LoginPrompt from "./LoginPrompt";

export default function Layout({ children }) {
  const router = useRouter();
  const { user, loading: userLoading } = useUserStore();
  const isMessagesPage = router.pathname === "/messages";
  const isSkillsPage = router.pathname === "/skills";
  const isSwapPage = router.pathname === "/swap";
  const isLoginPromptPage =
    !userLoading &&
    !user &&
    (router.pathname === "/swap" || router.pathname === "/messages");

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
      ) : isSkillsPage || isSwapPage ? (
        // Remove all side/top/bottom padding for /skills and /swap page, let the page handle its own spacing
        <main className="flex-1 w-full max-w-none m-0 p-0">{children}</main>
      ) : (
        <main className="flex-1 max-w-[98vw] mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      )}

      {/* Footer */}
      {!isMessagesPage && !isLoginPromptPage && (
        <footer className="flex-shrink-0 bg-white/80 backdrop-blur-md border-t border-slate-200/60 mt-1">
          <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="text-center text-sm text-slate-500">
              <p>
                &copy; {new Date().getFullYear()} SkillSwap. Connect, learn, and
                grow together.
              </p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
