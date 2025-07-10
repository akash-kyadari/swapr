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
  const [deadline, setDeadline] = useState("");
  const [acceptorMessage, setAcceptorMessage] = useState("");
  const [error, setError] = useState("");

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
  const canChat =
    swap.status === "in_progress" ||
    swap.status === "sender_completed" ||
    swap.status === "receiver_completed";

  const handleChat = () => {
    window.location.href = `/swap/${swap._id}`;
  };

  const handleAcceptWithDeadline = async (e) => {
    e.preventDefault();

    if (!deadline) {
      setError("Please select a deadline");
      return;
    }

    if (!acceptorMessage || !acceptorMessage.trim()) {
      setError("Please provide a description of what you need");
      return;
    }

    const selectedDate = new Date(deadline);
    const now = new Date();

    // Ensure deadline is at least 1 day in the future
    const minDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    if (selectedDate <= now) {
      setError("Deadline must be in the future");
      return;
    }

    if (selectedDate < minDate) {
      setError("Deadline must be at least 1 day from now");
      return;
    }

    handleAcceptSwap(deadline, acceptorMessage.trim());
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center z-50 p-4 modal-overlay">
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative border border-secondary-200 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <h2 className="text-xl font-semibold text-slate-900">Swap Details</h2>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 transition-colors"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>
  
      {/* Content */}
      <div className="pt-4 space-y-4">
        {/* User Info */}
        <div className="flex items-center gap-4">
          <Avatar
            src={swap.sender?.avatar}
            name={swap.sender?.name}
            size={56}
          />
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              {swap.sender?.name || "Anonymous"}
            </h3>
            <div className="flex items-center gap-1 mt-1">
              <StarIcon className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-slate-600">
                {swap.sender?.rating ? `${swap.sender.rating.toFixed(1)}` : '0.0'} ({swap.sender?.completedSwapsCount || 0})
              </span>
            </div>
            <p className="text-slate-600 text-sm">
              {swap.sender?.email || "No email provided"}
            </p>
          </div>
        </div>
  
        {/* Skills Exchange */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <SparklesIcon className="w-4 h-4" />
              Offering
            </h4>
            <div className="flex flex-wrap gap-2">
              {(Array.isArray(swap.offeredSkill)
                ? swap.offeredSkill
                : [swap.offeredSkill]
              ).map((skill) => (
                <span
                  key={skill}
                  className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
  
          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
            <h4 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
              <StarIcon className="w-4 h-4" />
              Looking For
            </h4>
            <div className="bg-yellow-100 px-3 py-2 rounded-lg inline-block">
              <span className="text-yellow-800 font-medium">
                {swap.requestedSkill}
              </span>
            </div>
          </div>
        </div>
  
        {/* Messages */}
        <div className="space-y-3">
          {/* Proposer Message */}
          {swap.message && (
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <h4 className="font-semibold text-slate-900 mb-2">Proposer's Message</h4>
              <p className="text-slate-700 italic">"{swap.message}"</p>
            </div>
          )}
          {/* Acceptor Message */}
          {swap.acceptorMessage && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-900 mb-2">Acceptor's Request</h4>
              <p className="text-green-700 italic">"{swap.acceptorMessage}"</p>
            </div>
          )}
        </div>
  
        {/* Status & Difficulty */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-50 p-2 rounded border border-slate-100">
            <div className="text-slate-500 uppercase font-medium">Status</div>
            <div className="font-semibold text-slate-900 capitalize">
              {swap.status}
            </div>
          </div>
          <div className="bg-slate-50 p-2 rounded border border-slate-100">
            <div className="text-slate-500 uppercase font-medium">Difficulty</div>
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
  
        {/* Accept Swap Section */}
        {swap.status === "pending" && !isProposer && (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200 space-y-4">
            <h4 className="font-semibold text-green-900">
              Accept This Swap
            </h4>
            
            {/* Acceptor Message Input */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Describe what you need
              </label>
              <textarea
                placeholder="Explain what you need help with, your goals, or any specific requirements..."
                value={acceptorMessage}
                onChange={(e) => {
                  setAcceptorMessage(e.target.value);
                  setError("");
                }}
                rows={3}
                className="block w-full text-secondary-900 placeholder-secondary-500 bg-white border border-secondary-300/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200 resize-none p-3"
                required
              />
              <p className="text-xs text-secondary-500 mt-1">
                Provide details about what you need help with
              </p>
            </div>

            {/* Deadline Input */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                When do you need your requested skill completed?
              </label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                <input
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => {
                    setDeadline(e.target.value);
                    setError("");
                  }}
                  min={new Date(Date.now() + 24 * 60 * 60 * 1000)
                    .toISOString()
                    .slice(0, 16)}
                  className="block w-full pl-10 pr-4 py-3 text-secondary-900 bg-white border border-secondary-300/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200"
                  required
                />
              </div>
              <p className="text-xs text-secondary-500 mt-1">
                Set when you need the proposer to complete your requested skill
              </p>
            </div>
            
            {error && (
              <div className="text-sm text-error-600 bg-error-50 border border-error-200 rounded-lg p-3 animate-slide-up">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-error-500 rounded-full mr-2"></div>
                  {error}
                </div>
              </div>
            )}
          </div>
        )}
  
        {/* Existing Deadlines */}
        {(swap.proposerDeadline || swap.acceptorDeadline) && (
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h4 className="font-semibold text-slate-900 mb-3">Deadlines</h4>
            <div className="space-y-3 text-sm">
              {swap.proposerDeadline && (
                <div className="flex items-start gap-2">
                  <CalendarIcon className="w-4 h-4 text-slate-400 mt-0.5" />
                  <div>
                    <div className="text-slate-600 font-medium">Proposer's Deadline:</div>
                    <div className="text-xs text-slate-500">Complete proposer's requested skill by:</div>
                    <div className="font-semibold text-slate-900">
                      {new Date(swap.proposerDeadline).toLocaleString()}
                    </div>
                  </div>
                </div>
              )}
              {swap.acceptorDeadline && (
                <div className="flex items-start gap-2">
                  <CalendarIcon className="w-4 h-4 text-slate-400 mt-0.5" />
                  <div>
                    <div className="text-slate-600 font-medium">Acceptor's Deadline:</div>
                    <div className="text-xs text-slate-500">Complete acceptor's requested skill by:</div>
                    <div className="font-semibold text-slate-900">
                      {new Date(swap.acceptorDeadline).toLocaleString()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
  
        {/* Timestamps */}
        <div className="flex flex-col sm:flex-row gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <CalendarIcon className="w-4 h-4" />
            Created: {new Date(swap.createdAt).toLocaleString()}
          </div>
          <div className="flex items-center gap-1">
            <ClockIcon className="w-4 h-4" />
            Updated: {new Date(swap.updatedAt).toLocaleString()}
          </div>
        </div>
  
        {/* Urgent */}
        {swap.isUrgent && (
          <div className="flex items-center gap-2 p-2 bg-red-50 rounded border border-red-200">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
            <span className="font-semibold text-red-700 text-xs">
              Urgent request
            </span>
          </div>
        )}
  
        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          {!isProposer && swap.status === "pending" && user && (
            <button
              onClick={handleAcceptWithDeadline}
              disabled={acceptingId === swap._id || !deadline}
              className={`w-full text-base font-semibold px-4 py-3 rounded-xl text-white transition shadow
                ${acceptingId === swap._id || !deadline
                  ? 'bg-green-300 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'}
              `}
            >
              <CheckCircleIcon className="w-4 h-4 inline-block mr-2" />
              Accept Swap
            </button>
          )}
  
          {canChat && (
            <button
              onClick={handleChat}
              className="w-full text-base font-semibold px-4 py-3 rounded-xl text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300"
            >
              <ChatBubbleLeftRightIcon className="w-4 h-4 inline-block mr-2" />
              Open Chat
            </button>
          )}
        </div>
      </div>
    </div>
  </div>
  
  );
}

export default function SkillsPage() {
  const { user } = useUserStore();
  const { addToast } = useToastStore();
  const [openSwaps, setOpenSwaps] = useState([]);
  const [swapLoading, setSwapLoading] = useState(true);
  const [swapError, setSwapError] = useState("");
  const [modalSwap, setModalSwap] = useState(null);
  const [acceptingId, setAcceptingId] = useState(null);
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
        setSwapError("Failed to load skill exchanges.");
        addToast({ message: "Failed to load skill exchanges", type: "skill-error" });
        console.error("Error fetching swaps:", err);
      } finally {
        setSwapLoading(false);
      }
    }
    fetchOpenSwaps();
  }, []);

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

  const handleAcceptSwap = async (deadline, message) => {
    if (!modalSwap) return;
    setAcceptingId(modalSwap._id);
    try {
      await apiFetch(`/api/swaps/${modalSwap._id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status: "accepted", deadline, acceptorMessage: message }),
        headers: { "Content-Type": "application/json" },
      });
      setOpenSwaps((prev) => prev.filter((s) => s._id !== modalSwap._id));
      setModalSwap(null);
      addToast({ message: "Swap accepted!", type: "skill-success" });
    } catch (err) {
      let message = "Failed to accept swap";
      if (err && err.message) {
        try {
          const parsed = JSON.parse(err.message);
          if (parsed && parsed.message) message = parsed.message;
        } catch {}
      }
      addToast({ message, type: "skill-error" });
    } finally {
      setAcceptingId(null);
    }
  };

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
    <div
      className={`w-full max-w-xl text-center px-6 py-12 rounded-2xl shadow-md border 
        ${hasActiveFilters
          ? 'border-yellow-300 bg-yellow-50/40'
          : 'border-slate-300 bg-slate-50/40'
        }`}
    >
      {hasActiveFilters ? (
        <>
          <ExclamationTriangleIcon className="w-14 h-14 text-yellow-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-yellow-800 mb-2">No Matches Found</h3>
          <p className="text-yellow-700 mb-6 text-base">
            Try changing or clearing your filters to see more results.
          </p>
          <button
            onClick={clearFilters}
            className="inline-block text-yellow-800 border border-yellow-400 hover:bg-yellow-100 px-5 py-2 rounded-xl transition font-medium"
          >
            Clear All Filters
          </button>
        </>
      ) : (
        <>
          <SparklesIcon className="w-14 h-14 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-700 mb-2">No Skill Exchanges Yet</h3>
          <p className="text-slate-600 mb-6 text-base">
            Be the first to start a skill exchange and connect with others!
          </p>
          <a
            href="/swap"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl transition font-medium"
          >
            Create Skill Exchange
          </a>
        </>
      )}
    </div>
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
