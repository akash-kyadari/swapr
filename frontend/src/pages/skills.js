"use client";
import { useEffect, useState } from "react";
import Head from "next/head";
import {
  FireIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  ChatBubbleLeftRightIcon,
  StarIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  SparklesIcon,
} from "@heroicons/react/24/solid";
import { MagnifyingGlassIcon as MagnifyingGlassOutline } from "@heroicons/react/24/outline";
import Input from "@/components/Input";
import Button from "@/components/Button";
import Card from "@/components/Card";
import Avatar from "@/components/Avatar";
import Loader from "@/components/Loader";
import useUserStore from "@/store/useUserStore";
import useToastStore from "@/store/useToastStore";
import { apiFetch } from "@/utils/api";

// --- Enhanced Modal (minimal, compact, professional, minimal color) ---
function SwapModal({ swap, user, onClose, handleAcceptSwap, acceptingId }) {
  if (!swap) return null;

  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") onClose();
    }
    function handleClick(e) {
      if (e.target.classList.contains("modal-overlay")) onClose();
    }
    window.addEventListener("keydown", handleKey);
    document.addEventListener("mousedown", handleClick);
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [onClose]);

  const isProposer = user && swap.sender?._id === user._id;
  const canChat = swap.status === "accepted" && !isProposer;

  const handleChat = () => {
    window.location.href = `/swap/${swap._id}`;
  };

  return (
    <div
      className="modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      tabIndex={-1}
      aria-modal="true"
      role="dialog"
    >
      {/* Increased modal width */}
      <div className="relative w-full max-w-lg md:max-w-xl mx-2 max-h-[95vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-slate-200 p-0">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100 bg-gradient-to-r from-blue-50 via-white to-slate-100 rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-extrabold text-blue-900 tracking-tight leading-tight">
              <span className="inline-block align-middle mr-2">
                <SparklesIcon className="w-7 h-7 text-blue-500" />
              </span>
              Skill Exchange Details
            </h2>
            <p className="text-slate-500 text-xs mt-1">
              All about this skill proposal
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-blue-600 transition-colors rounded-full p-1 focus:outline-none"
            aria-label="Close modal"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        {/* Modal Content */}
        <div className="p-7 space-y-6">
          {/* Proposer Info */}
          <div className="flex flex-col items-center">
            <Avatar
              src={swap.sender?.avatar}
              name={swap.sender?.name}
              size={56}
            />
            <div className="font-semibold text-slate-900 mt-2 text-base">
              {isProposer ? "You (Proposer)" : swap.sender?.name || "Unknown"}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <StarIcon className="w-4 h-4 text-yellow-400" />
              <span className="text-xs text-slate-600">4.8 (12)</span>
            </div>
          </div>
          {/* Skills Exchange */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="text-xs font-semibold text-blue-700 mb-1 flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Offering
              </div>
              <div className="flex flex-wrap gap-1">
                {(Array.isArray(swap.offeredSkill)
                  ? swap.offeredSkill
                  : [swap.offeredSkill]
                ).map((skill) => (
                  <span
                    key={skill}
                    className="bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-xs font-medium border border-blue-100"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex-1">
              <div className="text-xs font-semibold text-yellow-700 mb-1 flex items-center gap-1">
                <FireIcon className="w-4 h-4 text-orange-400" />
                Looking for
              </div>
              <div className="bg-yellow-50 px-3 py-2 rounded-lg border border-yellow-100">
                <span className="text-yellow-900 font-semibold text-sm">
                  {swap.requestedSkill}
                </span>
              </div>
            </div>
          </div>
          {/* Optional Message */}
          {swap.message && (
            <div>
              <div className="text-xs font-semibold text-slate-700 mb-1">
                Message
              </div>
              <div className="bg-slate-50 p-3 rounded border border-slate-200">
                <p className="text-slate-900 italic text-sm">
                  "{swap.message}"
                </p>
              </div>
            </div>
          )}
          {/* Details */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-50 p-2 rounded border border-slate-100">
              <div className="text-slate-500 uppercase font-medium">Status</div>
              <div className="font-semibold text-slate-900 capitalize">
                {swap.status}
              </div>
            </div>
            <div className="bg-slate-50 p-2 rounded border border-slate-100">
              <div className="text-slate-500 uppercase font-medium">
                Difficulty
              </div>
              <div
                className={`px-2 py-1 rounded-full text-xs font-semibold mt-1 inline-block ${
                  swap.difficultyLevel === "Beginner"
                    ? "bg-blue-50 text-blue-700"
                    : swap.difficultyLevel === "Intermediate"
                    ? "bg-yellow-50 text-yellow-700"
                    : swap.difficultyLevel === "Advanced"
                    ? "bg-red-50 text-red-700"
                    : "bg-slate-100 text-slate-800"
                }`}
              >
                {swap.difficultyLevel || "Intermediate"}
              </div>
            </div>
          </div>
          {/* Timestamps */}
          <div className="flex flex-col sm:flex-row gap-2 text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <CalendarIcon className="w-4 h-4" />
              Created:{" "}
              {swap.createdAt
                ? new Date(swap.createdAt).toLocaleString()
                : "N/A"}
            </div>
            <div className="flex items-center gap-1">
              <ClockIcon className="w-4 h-4" />
              Updated:{" "}
              {swap.updatedAt
                ? new Date(swap.updatedAt).toLocaleString()
                : "N/A"}
            </div>
          </div>
          {/* Urgent Indicator */}
          {swap.isUrgent && (
            <div className="flex items-center gap-2 p-2 bg-red-50 rounded border border-red-200">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
              <span className="font-semibold text-red-700 text-xs">
                Urgent request
              </span>
            </div>
          )}
          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            {!isProposer && swap.status === "pending" && user && (
              <Button
                onClick={handleAcceptSwap}
                className="w-full text-base font-semibold bg-green-600 hover:bg-green-700 text-white shadow"
                size="md"
                loading={acceptingId === swap._id}
                disabled={acceptingId === swap._id}
              >
                <CheckCircleIcon className="w-4 h-4 mr-1" />
                Accept Swap
              </Button>
            )}
            {/* Only show chat if not proposer */}
            {canChat && (
              <Button
                onClick={handleChat}
                variant="secondary"
                className="w-full text-base font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300"
                size="md"
              >
                <ChatBubbleLeftRightIcon className="w-4 h-4 mr-1" />
                Open Chat
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Main Skills Page Component ---
export default function SkillsPage() {
  const { user } = useUserStore();
  const { addToast } = useToastStore();
  const [openSwaps, setOpenSwaps] = useState([]);
  const [swapLoading, setSwapLoading] = useState(true);
  const [swapError, setSwapError] = useState("");
  const [acceptingId, setAcceptingId] = useState(null);
  const [modalSwap, setModalSwap] = useState(null);
  const [swapSearch, setSwapSearch] = useState("");
  const [swapOffered, setSwapOffered] = useState("");
  const [swapRequested, setSwapRequested] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Fetch open swaps
  useEffect(() => {
    async function fetchOpenSwaps() {
      setSwapLoading(true);
      setSwapError("");
      try {
        const data = await apiFetch("/api/swaps/marketplace");
        setOpenSwaps(data);
      } catch (err) {
        setSwapError("Failed to load open swaps. Please try again.");
        console.error("Error fetching swaps:", err);
        addToast({ message: "Failed to load skill exchanges", type: "error" });
      } finally {
        setSwapLoading(false);
      }
    }
    fetchOpenSwaps();
  }, []);

  const handleAcceptSwap = async () => {
    if (!modalSwap) return;

    setAcceptingId(modalSwap._id);
    try {
      await apiFetch(`/api/swaps/${modalSwap._id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status: "accepted" }),
      });

      // Update local state
      setOpenSwaps((prev) => prev.filter((swap) => swap._id !== modalSwap._id));
      setModalSwap(null);

      // Show success toast
      addToast({
        message: "Swap accepted! You can now chat with the user.",
        type: "success",
      });
    } catch (err) {
      console.error("Error accepting swap:", err);
      addToast({
        message: "Failed to accept swap. Please try again.",
        type: "error",
      });
    } finally {
      setAcceptingId(null);
    }
  };

  // Filter swaps based on search and filters
  const filteredSwaps = openSwaps.filter((swap) => {
    const matchesSearch =
      swapSearch === "" ||
      swap.requestedSkill.toLowerCase().includes(swapSearch.toLowerCase()) ||
      swap.message?.toLowerCase().includes(swapSearch.toLowerCase()) ||
      swap.sender?.name?.toLowerCase().includes(swapSearch.toLowerCase());

    const matchesOffered =
      swapOffered === "" ||
      (Array.isArray(swap.offeredSkill)
        ? swap.offeredSkill
        : [swap.offeredSkill]
      ).some((skill) =>
        skill.toLowerCase().includes(swapOffered.toLowerCase())
      );

    const matchesRequested =
      swapRequested === "" ||
      swap.requestedSkill.toLowerCase().includes(swapRequested.toLowerCase());

    return matchesSearch && matchesOffered && matchesRequested;
  });

  const clearFilters = () => {
    setSwapSearch("");
    setSwapOffered("");
    setSwapRequested("");
  };

  const hasActiveFilters = swapSearch || swapOffered || swapRequested;

  return (
    <>
      <Head>
        <title>SkillSwap - Connect and Exchange Skills</title>
        <meta
          name="description"
          content="Discover skill exchange opportunities and connect with talented professionals"
        />
      </Head>
      <div className="w-full min-h-screen flex flex-col items-center justify-start bg-slate-50">
        <div className="w-full flex flex-col flex-1">
          {/* Heading */}
          <div className="w-full px-4 md:px-12 pt-14 pb-10 bg-gradient-to-r from-blue-50 to-slate-100 border-b border-slate-200 shadow-sm">
            <div className="flex flex-col items-start md:items-center md:text-center gap-5 max-w-5xl mx-auto">
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center justify-center rounded-full bg-blue-100 p-3 shadow-md">
                  <SparklesIcon className="w-6 h-6 text-blue-600" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-blue-900 tracking-tight">
                  SkillSwap Marketplace
                </h1>
              </div>
              <p className="text-slate-600 text-lg max-w-2xl">
                Discover opportunities to exchange skills and connect with
                professionals globally.
              </p>
              <div className="w-20 h-1 bg-blue-200 rounded-full" />
            </div>
          </div>

          {/* Search & Filter Section */}
          <div className="w-full px-4 md:px-12 py-8 bg-white border-b border-slate-200 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-end gap-6 md:gap-8 max-w-5xl mx-auto w-full">
              {/* Search Field */}
              <div className="flex-1 min-w-[240px]">
                <label className="block text-sm font-semibold text-blue-800 mb-2 tracking-wide">
                  Search
                </label>
                <div className="relative">
                  <MagnifyingGlassOutline className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search skills, users, or messages"
                    value={swapSearch}
                    onChange={(e) => setSwapSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-blue-200 bg-blue-50 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-300 focus:border-blue-400 text-sm shadow-inner"
                  />
                </div>
              </div>

              {/* Offered Skill */}
              <div className="flex-1 min-w-[240px]">
                <label className="block text-sm font-semibold text-blue-800 mb-2 tracking-wide">
                  Offered Skill
                </label>
                <Input
                  placeholder="e.g., React, Design"
                  value={swapOffered}
                  onChange={(e) => setSwapOffered(e.target.value)}
                  className="bg-blue-50 border border-blue-200 text-sm focus:ring-blue-300"
                  inputClassName="bg-blue-50"
                />
              </div>

              {/* Requested Skill */}
              <div className="flex-1 min-w-[240px]">
                <label className="block text-sm font-semibold text-blue-800 mb-2 tracking-wide">
                  Requested Skill
                </label>
                <Input
                  placeholder="e.g., Python, Marketing"
                  value={swapRequested}
                  onChange={(e) => setSwapRequested(e.target.value)}
                  className="bg-blue-50 border border-blue-200 text-sm focus:ring-blue-300"
                  inputClassName="bg-blue-50"
                />
              </div>

              {/* Clear Filters Button */}
              {hasActiveFilters && (
                <div className="flex-shrink-0">
                  <Button
                    onClick={clearFilters}
                    variant="ghost"
                    size="sm"
                    className="text-blue-700 hover:text-blue-900 mt-1"
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Loading State */}
          {swapLoading && (
            <div className="flex flex-col items-center justify-center h-[40vh]">
              <Loader />
              <p className="text-slate-600 text-lg mt-4">
                Loading skill exchanges...
              </p>
            </div>
          )}
          {/* Error State */}
          {swapError && !swapLoading && (
            <div className="flex flex-col items-center justify-center h-[40vh]">
              <Card
                variant="error"
                className="w-full max-w-md text-center py-8"
              >
                <ExclamationTriangleIcon className="w-12 h-12 text-red-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-red-800 mb-2">
                  Failed to Load Swaps
                </h3>
                <p className="text-red-600 mb-4">{swapError}</p>
                <Button
                  onClick={() => window.location.reload()}
                  variant="error"
                >
                  Try Again
                </Button>
              </Card>
            </div>
          )}
          {/* Empty State */}
          {!swapLoading && !swapError && filteredSwaps.length === 0 && (
            <div className="flex flex-col items-center justify-center h-[60vh]">
              <Card
                variant={hasActiveFilters ? "warning" : "secondary"}
                className={`
                  w-full max-w-lg text-center py-14 px-6
                  rounded-2xl shadow-lg
                  ${
                    hasActiveFilters
                      ? "border-2 border-yellow-300 bg-yellow-50"
                      : "border-2 border-slate-200 bg-slate-50"
                  }
                `}
              >
                <div className="flex flex-col items-center">
                  <SparklesIcon
                    className={`w-20 h-20 mx-auto mb-6 ${
                      hasActiveFilters ? "text-yellow-400" : "text-slate-300"
                    }`}
                  />
                  <h3
                    className={`text-2xl font-bold mb-3 ${
                      hasActiveFilters ? "text-yellow-900" : "text-slate-900"
                    }`}
                  >
                    {hasActiveFilters
                      ? "No Results Found"
                      : "No Skill Exchanges Yet"}
                  </h3>
                  <p
                    className={`mb-8 text-base ${
                      hasActiveFilters ? "text-yellow-800" : "text-slate-600"
                    }`}
                  >
                    {hasActiveFilters
                      ? "We couldn't find any skill swaps matching your filters. Try changing your search or filter terms."
                      : "Be the first to create a skill exchange opportunity and connect with others!"}
                  </p>
                  {hasActiveFilters ? (
                    <Button
                      onClick={clearFilters}
                      variant="primary"
                      className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-semibold px-6 py-2 rounded-lg"
                    >
                      Clear Filters
                    </Button>
                  ) : (
                    <Button
                      as="a"
                      href="/swap"
                      variant="primary"
                      className="px-6 py-2 rounded-lg"
                    >
                      Create Skill Exchange
                    </Button>
                  )}
                </div>
              </Card>
            </div>
          )}
          {/* Results Grid */}
          {!swapLoading && !swapError && filteredSwaps.length > 0 && (
            <>
              <div className="flex items-center justify-between px-8 py-3">
                <h2 className="text-xl font-bold text-slate-900">
                  {filteredSwaps.length} Skill Exchange
                  {filteredSwaps.length !== 1 ? "s" : ""} Available
                </h2>
                {hasActiveFilters && (
                  <span className="text-xs text-slate-500">
                    Filtered results
                  </span>
                )}
              </div>
              <div className="relative w-full">
                <div
                  className="
                    relative z-10
                    grid
                    grid-cols-1
                    sm:grid-cols-2
                    md:grid-cols-3
                    xl:grid-cols-4
                    gap-8
                    w-full
                    px-8
                    pb-12
                  "
                  style={{ margin: 0 }}
                >
                  {filteredSwaps.map((swap) => (
                    <div
                      key={swap._id}
                      className="
    transition-all duration-200 hover:scale-[1.02]
    bg-white border border-slate-200 shadow-sm hover:shadow-lg
    rounded-2xl flex flex-col p-0
    group focus:ring-2 focus:ring-blue-400 outline-none
    justify-between overflow-hidden
  "
                      onClick={() => setModalSwap(swap)}
                      tabIndex={0}
                      role="button"
                      aria-label="Open skill details"
                    >
                      {/* Top User Info */}
                      <div className="flex items-center gap-3 mb-2 px-6 pt-6">
                        <Avatar
                          src={swap.sender?.avatar}
                          name={swap.sender?.name}
                          size={48}
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base text-slate-900 truncate">
                            {swap.sender?.name || "Anonymous"}
                          </h3>
                          <div className="flex items-center gap-1 mt-1">
                            <StarIcon className="w-4 h-4 text-yellow-400" />
                            <span className="text-xs text-slate-500">
                              4.8 (12)
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Skill Tags */}
                      <div className="space-y-2 mb-2 px-6">
                        <div>
                          <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
                            Offering
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {(Array.isArray(swap.offeredSkill)
                              ? swap.offeredSkill
                              : [swap.offeredSkill]
                            )
                              .slice(0, 3)
                              .map((skill) => (
                                <span
                                  key={skill}
                                  className="bg-blue-50 text-blue-800 text-xs px-2 py-1 rounded-full border border-blue-100 font-medium"
                                >
                                  {skill}
                                </span>
                              ))}
                            {(Array.isArray(swap.offeredSkill)
                              ? swap.offeredSkill
                              : [swap.offeredSkill]
                            ).length > 3 && (
                              <span className="text-xs text-slate-400">
                                +
                                {(Array.isArray(swap.offeredSkill)
                                  ? swap.offeredSkill
                                  : [swap.offeredSkill]
                                ).length - 3}{" "}
                                more
                              </span>
                            )}
                          </div>
                        </div>

                        <div>
                          <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
                            Looking for
                          </div>
                          <div className="bg-yellow-50 px-3 py-1 rounded-full inline-block border border-yellow-100">
                            <span className="text-yellow-800 font-medium text-xs">
                              {swap.requestedSkill}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Message */}
                      <div className="mb-2 px-6 text-slate-700 text-sm italic line-clamp-2">
                        {swap.message
                          ? `"${swap.message}"`
                          : "No message provided"}
                      </div>

                      {/* Meta Info */}
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-2 px-6">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="w-4 h-4" />
                          {new Date(swap.createdAt).toLocaleDateString()}
                        </div>
                        <div
                          className={`px-2 py-1 rounded-full font-semibold ${
                            swap.difficultyLevel === "Beginner"
                              ? "bg-blue-100 text-blue-700"
                              : swap.difficultyLevel === "Intermediate"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {swap.difficultyLevel || "Intermediate"}
                        </div>
                      </div>

                      {/* Urgent Flag */}
                      {/* Only show urgent here, not in both places */}
                      {!swap.isUrgent ? null : (
                        <div className="flex items-center gap-2 text-xs text-red-600 mb-2 px-6 font-medium">
                          <ExclamationTriangleIcon className="w-4 h-4" />
                          Urgent
                        </div>
                      )}

                      {/* Bottom Time */}
                      <div className="px-6 pb-4 text-xs text-slate-400 flex items-center gap-2">
                        {!swap.isUrgent ? (
                          <>
                            <ClockIcon className="w-4 h-4" />
                            {swap.createdAt &&
                              new Date(swap.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                          </>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
        {/* Swap Modal */}
        {modalSwap && (
          <SwapModal
            swap={modalSwap}
            user={user}
            onClose={() => setModalSwap(null)}
            handleAcceptSwap={handleAcceptSwap}
            acceptingId={acceptingId}
          />
        )}
      </div>
    </>
  );
}
