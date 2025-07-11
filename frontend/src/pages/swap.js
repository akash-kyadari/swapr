import { useEffect, useState, useRef } from "react";
import Head from "next/head";
import Button from "../components/Button";
import Input from "../components/Input";
import useUserStore from "../store/useUserStore";
import useToastStore from "../store/useToastStore";
import { apiFetch } from "../utils/api";
import TagInput from "../components/TagInput";
import ReactDOM from "react-dom";
import Avatar from "../components/Avatar";
import Loader from "../components/Loader";
import {
  XMarkIcon,
  PlusIcon,
  CalendarIcon,
  StarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  SparklesIcon,
  FireIcon,
  ClockIcon,
  ArrowRightIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/router";
import SwapCard from "../components/SwapCard";
import PendingSwapModal from "../components/PendingSwapModal";
import { initializeSocket, getSocket } from '../utils/socket';

function CreateSwapModal({ user, open, onClose, onSwapCreated }) {
  const { addToast } = useToastStore();
  const [offeredSkill, setOfferedSkill] = useState([]);
  const [requestedSkill, setRequestedSkill] = useState("");
  const [message, setMessage] = useState("");
  const [difficultyLevel, setDifficultyLevel] = useState("Intermediate");
  const [isUrgent, setIsUrgent] = useState(false);
  const [proposerDeadline, setProposerDeadline] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const hasOfferedSkills =
    user && Array.isArray(user.skillsOffered) && user.skillsOffered.length > 0;

  useEffect(() => {
    if (!open) {
      setOfferedSkill([]);
      setRequestedSkill("");
      setMessage("");
      setDifficultyLevel("Intermediate");
      setIsUrgent(false);
      setProposerDeadline("");
      setError("");
    }
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!offeredSkill.length || !requestedSkill.trim() || !proposerDeadline) {
      setError("Please fill in all required fields including deadline.");
      addToast({
        message: "Fill all required fields including deadline",
        type: "swap-warning",
      });
      return;
    }
    const selectedDate = new Date(proposerDeadline);
    const now = new Date();
    const minDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    if (selectedDate <= now) {
      setError("Deadline must be in the future");
      addToast({ message: "Deadline must be in the future", type: "swap-warning" });
      return;
    }
    if (selectedDate < minDate) {
      setError("Deadline must be at least 1 day from now");
      addToast({
        message: "Deadline must be at least 1 day from now",
        type: "swap-warning",
      });
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const newSwap = await apiFetch("/api/swaps", {
        method: "POST",
        body: JSON.stringify({
          offeredSkill,
          requestedSkill: requestedSkill.trim(),
          message: message.trim(),
          difficultyLevel,
          isUrgent,
          proposerDeadline,
        }),
      });
      onSwapCreated(newSwap);
      onClose();
      addToast({ message: "Swap created successfully!", type: "swap-success" });
    } catch (err) {
      setError("Failed to create swap. Please try again.");
      addToast({ message: "Failed to create swap", type: "swap-error" });
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;
  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 p-8 relative animate-fade-in border border-gray-200"
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: '90vh', overflowY: 'auto' }}
      >
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
          onClick={onClose}
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold mb-2 text-primary-900">
          Propose a Skill Swap
        </h2>
        <p className="mb-6 text-gray-600">
          Fill in the details to propose a new skill exchange.
        </p>
        {!hasOfferedSkills ? (
          <div className="text-center py-8">
            <p className="text-lg text-secondary-700 mb-4">
              You need to add skills you can offer before creating a swap.
            </p>
            <a
              href="/profile/edit"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold shadow hover:bg-primary-700 transition"
            >
              Go to Profile & Add Skills
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <TagInput
              label="Skills You're Offering"
              placeholder="Add skills you can teach (e.g., React, Design, Writing)"
              value={offeredSkill}
              onChange={setOfferedSkill}
              options={user.skillsOffered}
              required
            />
            <Input
              label="Skill You're Looking For"
              placeholder="What skill do you want to learn?"
              value={requestedSkill}
              onChange={(e) => setRequestedSkill(e.target.value)}
              required
            />
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                placeholder="Add a personal message about your exchange..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="block w-full text-secondary-900 placeholder-secondary-500 bg-white/80 border border-secondary-300/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200 input-focus resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Difficulty Level
                </label>
                <select
                  value={difficultyLevel}
                  onChange={(e) => setDifficultyLevel(e.target.value)}
                  className="block w-full text-secondary-900 bg-white border border-secondary-300/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200 input-focus px-4 py-3"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>
              <div className="flex items-center">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isUrgent}
                    onChange={(e) => setIsUrgent(e.target.checked)}
                    className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-secondary-700">
                    Mark as urgent
                  </span>
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                When do you want your requested part completed?{" "}
                <span className="text-error-600">*</span>
              </label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                <input
                  type="datetime-local"
                  value={proposerDeadline}
                  onChange={(e) => setProposerDeadline(e.target.value)}
                  min={new Date(Date.now() + 24 * 60 * 60 * 1000)
                    .toISOString()
                    .slice(0, 16)}
                  className="block w-full pl-10 pr-4 py-3 text-secondary-900 bg-white border border-secondary-300/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200 input-focus"
                  required
                />
              </div>
              <p className="text-xs text-secondary-500 mt-1">
                Set a deadline for when you want your requested part to be
                completed
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
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-800 text-white font-bold py-4 px-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating Exchange...
                </div>
              ) : (
                "Propose Swap"
              )}
            </button>
          </form>
        )}
      </div>
    </div>,
    typeof window !== "undefined" ? document.body : null
  );
}

function SwapModal({ swap, user, onClose }) {
  if (!swap) return null;

  const isProposer = user && swap.sender?._id === user._id;
  const isAcceptor = user && swap.receiver?._id === user._id;
  const isAccepted = swap.status === "accepted";

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleChat = () => {
    window.location.href = `/swap/${swap._id}`;
  };

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-lg animate-fade-in"
      onClick={handleBackdropClick}
      tabIndex={-1}
      aria-modal="true"
      role="dialog"
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white/90 dark:bg-secondary-900/95 rounded-3xl shadow-2xl border border-secondary-200 dark:border-secondary-700 animate-scale-in backdrop-blur-xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-8 text-white rounded-t-3xl flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Swap Details</h2>
            <p className="text-primary-100 mt-1 text-sm">
              Review your skill exchange
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Close modal"
          >
            <XMarkIcon className="w-7 h-7" />
          </button>
        </div>

        <div className="p-8 space-y-8">
          {/* Sender & Receiver Info */}
          <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-gradient-to-br from-secondary-50/80 to-primary-50/60 rounded-2xl shadow-inner">
            <div className="flex flex-col items-center gap-2 flex-1">
              <Avatar
                src={swap.sender?.avatar}
                name={swap.sender?.name}
                size={56}
              />
              <div className="font-bold text-lg text-secondary-900 dark:text-white">
                {isProposer ? "You (Proposer)" : swap.sender?.name || "Unknown"}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <StarIcon className="w-4 h-4 text-accent-500 fill-current" />
                <span className="text-xs text-secondary-600 dark:text-secondary-300">
                  4.8 (12 reviews)
                </span>
              </div>
              <span className="text-xs text-secondary-500 mt-1">Sender</span>
            </div>
            <div className="flex flex-col items-center gap-2 flex-1">
              {swap.receiver ? (
                <>
                  <Avatar
                    src={swap.receiver.avatar}
                    name={swap.receiver.name}
                    size={56}
                  />
                  <div className="font-bold text-lg text-success-800 dark:text-success-300">
                    {isAcceptor
                      ? "You (Receiver)"
                      : swap.receiver?.name || "Unknown"}
                  </div>
                  <span className="text-xs text-success-700 mt-1">
                    Receiver
                  </span>
                </>
              ) : (
                <div className="text-xs text-secondary-400 italic mt-8">
                  No receiver yet
                </div>
              )}
            </div>
          </div>

          {/* Skills Exchange */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-sm font-semibold text-secondary-700 mb-2 flex items-center gap-2">
                <div className="w-3 h-3 bg-success-500 rounded-full"></div>
                Offering Skills
              </div>
              <div className="flex flex-wrap gap-2">
                {(Array.isArray(swap.offeredSkill)
                  ? swap.offeredSkill
                  : [swap.offeredSkill]
                ).map((skill) => (
                  <span
                    key={skill}
                    className="bg-success-100 text-success-800 px-3 py-1.5 rounded-full text-sm font-medium border border-success-200 shadow-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold text-secondary-700 mb-2 flex items-center gap-2">
                <FireIcon className="w-4 h-4 text-warning-500" />
                Looking for
              </div>
              <div className="bg-primary-50 px-4 py-3 rounded-xl border border-primary-200 shadow-sm">
                <span className="text-primary-800 font-semibold text-lg">
                  {swap.requestedSkill}
                </span>
              </div>
            </div>
          </div>

          {/* Optional Message */}
          {swap.message && (
            <div>
              <div className="text-sm font-semibold text-secondary-700 mb-2">
                Message
              </div>
              <div className="bg-secondary-50 p-4 rounded-xl border border-secondary-200 shadow-sm">
                <p className="text-secondary-700 italic">"{swap.message}"</p>
              </div>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-secondary-50 p-3 rounded-lg shadow-inner">
              <div className="text-secondary-600 text-xs uppercase font-medium">
                Status
              </div>
              <div className="font-semibold text-secondary-900 capitalize mt-1">
                {swap.status}
              </div>
            </div>
            <div className="bg-secondary-50 p-3 rounded-lg shadow-inner">
              <div className="text-secondary-600 text-xs uppercase font-medium">
                Difficulty
              </div>
              <div
                className={`px-2 py-1 rounded-full text-xs font-semibold mt-1 inline-block ${
                  swap.difficultyLevel === "Beginner"
                    ? "bg-success-100 text-success-800"
                    : swap.difficultyLevel === "Intermediate"
                    ? "bg-warning-100 text-warning-800"
                    : swap.difficultyLevel === "Advanced"
                    ? "bg-error-100 text-error-800"
                    : "bg-secondary-100 text-secondary-800"
                }`}
              >
                {swap.difficultyLevel || "Intermediate"}
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="flex flex-col md:flex-row gap-4 text-xs text-secondary-500">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              Created:{" "}
              {swap.createdAt
                ? new Date(swap.createdAt).toLocaleString()
                : "N/A"}
            </div>
            <div className="flex items-center gap-2">
              <ClockIcon className="w-4 h-4" />
              Updated:{" "}
              {swap.updatedAt
                ? new Date(swap.updatedAt).toLocaleString()
                : "N/A"}
            </div>
          </div>

          {/* Urgent Indicator */}
          {swap.isUrgent && (
            <div className="flex items-center gap-3 p-3 bg-error-50 rounded-xl border border-error-200 shadow-sm">
              <ExclamationTriangleIcon className="w-5 h-5 text-error-600" />
              <span className="font-semibold text-error-800">
                This is an urgent request
              </span>
            </div>
          )}


        </div>
      </div>
    </div>,
    typeof window !== "undefined" ? document.body : null
  );
}
export function AcceptedSwapCard({ swap, unreadCount }) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/swap/${swap._id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="cursor-pointer bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 space-y-5 group relative"
    >
      {/* Unread Badge for Receiver */}
      {unreadCount > 0 && (
        <span className="absolute top-4 right-6 bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5 shadow-md z-10 border-2 border-white">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">Accepted Swap</h3>
          <p className="text-sm text-gray-500">ID: #{swap._id.slice(-6)}</p>
        </div>
        {swap.isUrgent && (
          <span className="bg-rose-100 text-rose-700 text-xs font-semibold px-3 py-1 rounded-full">
            Urgent
          </span>
        )}
      </div>

      {/* Participants */}
      <div className="grid grid-cols-2 gap-4">
        {[swap.sender, swap.receiver].map((user, i) => (
          <div
            key={user._id}
            className="flex flex-col items-center bg-blue-50/30 rounded-xl p-3"
          >
            <Avatar src={user.avatar} name={user.name} size={48} />
            <p className="mt-2 text-sm font-medium text-gray-800">
              {user.name}
            </p>
            <p className="text-xs text-gray-500">
              {i === 0 ? "Proposer" : "Acceptor"}
            </p>
          </div>
        ))}
      </div>

      {/* Skills */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-gray-500 mb-1">Offering</p>
          <div className="flex flex-nowrap gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
            {(Array.isArray(swap.offeredSkill)
              ? swap.offeredSkill
              : [swap.offeredSkill]
            )
              .slice(0, 3)
              .map((skill) => (
                <span
                  key={skill}
                  className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full font-medium truncate"
                >
                  {skill}
                </span>
              ))}
            {swap.offeredSkill.length > 3 && (
              <span className="text-gray-400 text-sm">...</span>
            )}
          </div>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">In Exchange</p>
          <div className="flex flex-nowrap gap-2 overflow-hidden whitespace-nowrap text-ellipsis">
            <span className="bg-indigo-100 text-indigo-700 text-sm px-3 py-1 rounded-full font-medium inline-block truncate">
              {swap.requestedSkill}
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="space-y-3">
        {/* Proposer Message */}
        {swap.message && (
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
            <p className="text-xs text-gray-500 mb-1 font-medium">Proposer's Message:</p>
            <p className="text-sm text-gray-700 italic">"{swap.message}"</p>
          </div>
        )}
        {/* Acceptor Message */}
        {swap.acceptorMessage && (
          <div className="bg-green-50 rounded-lg p-3 border border-green-100">
            <p className="text-xs text-green-600 mb-1 font-medium">Acceptor's Request:</p>
            <p className="text-sm text-green-700 italic">"{swap.acceptorMessage}"</p>
          </div>
        )}
      </div>

      {/* Status & Difficulty */}
      <div className="flex flex-col gap-1 text-sm text-gray-700">
        <p>
          <span className="font-semibold">Difficulty:</span>{" "}
          <span
            className={`font-bold ${
              swap.difficultyLevel === "Beginner"
                ? "text-lime-700"
                : swap.difficultyLevel === "Intermediate"
                ? "text-yellow-700"
                : "text-red-700"
            }`}
          >
            {swap.difficultyLevel}
          </span>
        </p>
        <p>
          <span className="font-semibold">Status:</span>{" "}
          <span className="capitalize font-[500]">{swap.status}</span>
        </p>
      </div>

      {/* Deadlines */}
      <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-gray-400" />
          <div>
            <div className="font-medium">Proposer's Deadline:</div>
            <div className="text-xs text-gray-500">Complete proposer's requested skill by:</div>
            <div className="font-semibold">
              {swap.proposerDeadline
                ? new Date(swap.proposerDeadline).toLocaleDateString()
                : "Not set"}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-gray-400" />
          <div>
            <div className="font-medium">Acceptor's Deadline:</div>
            <div className="text-xs text-gray-500">Complete acceptor's requested skill by:</div>
            <div className="font-semibold">
              {swap.acceptorDeadline
                ? new Date(swap.acceptorDeadline).toLocaleDateString()
                : "Not set"}
            </div>
          </div>
        </div>
      </div>

      {/* Timestamps */}
      <div className="flex flex-col sm:flex-row justify-between text-xs text-gray-400 border-t pt-3 mt-2 gap-2">
        <div className="flex items-center gap-1">
          <ClockIcon className="w-4 h-4" />
          Created: {new Date(swap.createdAt).toLocaleString()}
        </div>
        <div className="flex items-center gap-1">
          <ClockIcon className="w-4 h-4" />
          Accepted: {swap.receiver ? new Date(swap.updatedAt).toLocaleString() : "Not accepted yet"}
        </div>
      </div>
    </div>
  );
}

export function CompletedSwapCard({ swap }) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/swap/${swap._id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="cursor-pointer bg-white border border-green-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 space-y-5 group"
    >
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">Completed Swap</h3>
          <p className="text-sm text-gray-500">ID: #{swap._id.slice(-6)}</p>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircleIcon className="w-5 h-5 text-green-600" />
          <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
            Completed
          </span>
        </div>
      </div>

      {/* Participants */}
      <div className="grid grid-cols-2 gap-4">
        {[swap.sender, swap.receiver].map((user, i) => (
          <div
            key={user._id}
            className="flex flex-col items-center bg-green-50/30 rounded-xl p-3"
          >
            <Avatar src={user.avatar} name={user.name} size={48} />
            <p className="mt-2 text-sm font-medium text-gray-800">
              {user.name}
            </p>
            <p className="text-xs text-gray-500">
              {i === 0 ? "Proposer" : "Acceptor"}
            </p>
          </div>
        ))}
      </div>

      {/* Skills */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-gray-500 mb-1">Offered</p>
          <div className="flex flex-nowrap gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
            {(Array.isArray(swap.offeredSkill)
              ? swap.offeredSkill
              : [swap.offeredSkill]
            )
              .slice(0, 3)
              .map((skill) => (
                <span
                  key={skill}
                  className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full font-medium truncate"
                >
                  {skill}
                </span>
              ))}
            {swap.offeredSkill.length > 3 && (
              <span className="text-gray-400 text-sm">...</span>
            )}
          </div>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Received</p>
          <div className="flex flex-nowrap gap-2 overflow-hidden whitespace-nowrap text-ellipsis">
            <span className="bg-green-100 text-green-700 text-sm px-3 py-1 rounded-full font-medium inline-block truncate">
              {swap.requestedSkill}
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="space-y-3">
        {/* Proposer Message */}
        {swap.message && (
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
            <p className="text-xs text-gray-500 mb-1 font-medium">Proposer's Message:</p>
            <p className="text-sm text-gray-700 italic">"{swap.message}"</p>
          </div>
        )}
        {/* Acceptor Message */}
        {swap.acceptorMessage && (
          <div className="bg-green-50 rounded-lg p-3 border border-green-100">
            <p className="text-xs text-green-600 mb-1 font-medium">Acceptor's Request:</p>
            <p className="text-sm text-green-700 italic">"{swap.acceptorMessage}"</p>
          </div>
        )}
      </div>

      {/* Status & Difficulty */}
      <div className="flex flex-col gap-1 text-sm text-gray-700">
        <p>
          <span className="font-semibold">Difficulty:</span>{" "}
          <span
            className={`font-bold ${
              swap.difficultyLevel === "Beginner"
                ? "text-lime-700"
                : swap.difficultyLevel === "Intermediate"
                ? "text-yellow-700"
                : "text-red-700"
            }`}
          >
            {swap.difficultyLevel}
          </span>
        </p>
        <p>
          <span className="font-semibold">Status:</span>{" "}
          <span className="capitalize font-[500] text-green-600">Completed</span>
        </p>
      </div>

      {/* Completion Date */}
      <div className="flex items-center gap-2 text-sm text-green-600">
        <CheckCircleIcon className="w-4 h-4" />
        <span className="font-medium">Completed on {swap.completedAt ? new Date(swap.completedAt).toLocaleDateString() : new Date(swap.createdAt).toLocaleDateString()}</span>
      </div>

      {/* Timestamps */}
      <div className="flex flex-col sm:flex-row justify-between text-xs text-gray-400 border-t pt-3 mt-2 gap-2">
        <div className="flex items-center gap-1">
          <ClockIcon className="w-4 h-4" />
          Created: {new Date(swap.createdAt).toLocaleString()}
        </div>
        <div className="flex items-center gap-1">
          <CheckCircleIcon className="w-4 h-4" />
          Completed: {swap.completedAt ? new Date(swap.completedAt).toLocaleString() : "Not completed yet"}
        </div>
      </div>
    </div>
  );
}

export default function Swap() {
  const { user, loading: userLoading, fetchUser } = useUserStore();
  const { addToast } = useToastStore();
  const [swaps, setSwaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalSwap, setModalSwap] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [acceptedSwaps, setAcceptedSwaps] = useState([]);
  const [completedSwaps, setCompletedSwaps] = useState([]);
  const [pendingModalSwap, setPendingModalSwap] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({}); // { swapId: count }
  const router = useRouter();
  const socketRef = useRef(null);

  const fetchUnreadCounts = async () => {
    if (!user || !swaps.length) return;
    const counts = {};
    await Promise.all(
      swaps
        .filter(
          (swap) =>
            ["in_progress", "sender_completed", "receiver_completed", "both_completed"].includes(swap.status) &&
            (swap.sender?._id === user._id || swap.receiver?._id === user._id)
        )
        .map(async (swap) => {
          try {
            const res = await apiFetch(`/api/messages/${swap._id}/unread-count`);
            counts[swap._id] = res.unreadCount || 0;
          } catch {
            counts[swap._id] = 0;
          }
        })
    );
    setUnreadCounts(counts);
  };

  useEffect(() => {
    async function fetchSwaps() {
      setLoading(true);
      setError("");
      try {
        const data = await apiFetch("/api/swaps/user-swaps");
        const allSwaps = [
          ...(Array.isArray(data.openSwaps) ? data.openSwaps : []),
          ...(Array.isArray(data.activeSwaps) ? data.activeSwaps : []),
        ];
        setSwaps(allSwaps);
        setCompletedSwaps(data.completedSwaps || []);
      } catch (err) {
        setError("Failed to load your swaps.");
        addToast({ message: "Failed to load your swaps", type: "swap-error" });
      } finally {
        setLoading(false);
      }
    }
    fetchSwaps();
  }, [addToast]);

  useEffect(() => {
    fetchUnreadCounts();
  }, [user, swaps]);

  useEffect(() => {
    async function fetchAcceptedSwaps() {
      try {
        const data = await apiFetch("/api/swaps/user-swaps");
        setAcceptedSwaps(data.activeSwaps || []);
      } catch (err) {
        // handle error
      }
    }
    fetchAcceptedSwaps();
  }, []);

  const handleSwapCreated = (newSwap) => {
    // Ensure the sender data is populated with current user info
    const swapWithUserData = {
      ...newSwap,
      sender: {
        _id: user._id,
        name: user.name,
        avatar: user.avatar,
        rating: user.rating,
        completedSwapsCount: user.completedSwapsCount
      }
    };
    setSwaps((prev) => {
      if (prev.some((s) => s._id === swapWithUserData._id)) return prev;
      return [swapWithUserData, ...prev];
    });
  };

  // Split swaps into active and pending
  const activeSwaps = swaps.filter((swap) =>
    ["in_progress", "sender_completed", "receiver_completed", "both_completed"].includes(
      swap.status
    )
  );
  const pendingSwaps = swaps.filter((swap) => swap.status === "pending");

  // Socket setup for real-time unread badge updates and swap status
  useEffect(() => {
    if (!user) return;
    if (!socketRef.current) {
      socketRef.current = initializeSocket();
    }
    const socket = socketRef.current;
    // Join all active swap rooms where user is sender OR receiver
    const userActiveSwaps = swaps.filter(
      (swap) =>
        ["in_progress", "sender_completed", "receiver_completed", "both_completed"].includes(swap.status) &&
        (swap.sender?._id === user._id || swap.receiver?._id === user._id)
    );
    userActiveSwaps.forEach((swap) => {
      socket.emit('join_swap_room', { swapId: swap._id, userId: user._id });
    });
    // Handler to refresh unread counts
    const refreshUnreadCounts = () => {
      fetchUnreadCounts();
    };
    // Listen for new_message and messages_seen events
    socket.on('new_message', refreshUnreadCounts);
    socket.on('messages_seen', refreshUnreadCounts);

    // Real-time swap status updates
    const handleSwapAccepted = (swap) => {
      // If user is sender or receiver, add to activeSwaps and remove from pending
      if (swap.sender?._id === user._id || swap.receiver?._id === user._id) {
        setSwaps((prev) => {
          // Remove from pending if present, add to active if not present
          const filtered = prev.filter((s) => s._id !== swap._id);
          return [swap, ...filtered];
        });
      }
    };
    const handleSwapCompleted = (swap) => {
      // If user is sender or receiver, move to completedSwaps and remove from active
      if (swap.sender?._id === user._id || swap.receiver?._id === user._id) {
        setCompletedSwaps((prev) => {
          if (prev.some((s) => s._id === swap._id)) return prev;
          return [swap, ...prev];
        });
        setSwaps((prev) => prev.filter((s) => s._id !== swap._id));
        // Refresh user profile to update completedSwapsCount
        if (typeof fetchUser === 'function') fetchUser();
      }
    };
    // Optionally, listen for swap_created to update pending swaps if user is sender
    const handleSwapCreated = (swap) => {
      if (swap.sender?._id === user._id) {
        setSwaps((prev) => {
          if (prev.some((s) => s._id === swap._id)) return prev;
          return [swap, ...prev];
        });
      }
    };
    socket.on('swap_accepted', handleSwapAccepted);
    socket.on('swap_completed', handleSwapCompleted);
    socket.on('swap_created', handleSwapCreated);
    // Cleanup
    return () => {
      socket.off('new_message', refreshUnreadCounts);
      socket.off('messages_seen', refreshUnreadCounts);
      socket.off('swap_accepted', handleSwapAccepted);
      socket.off('swap_completed', handleSwapCompleted);
      socket.off('swap_created', handleSwapCreated);
      userActiveSwaps.forEach((swap) => {
        socket.emit('leave_swap_room', { swapId: swap._id, userId: user._id });
      });
    };
    // eslint-disable-next-line
  }, [user, swaps]);

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col">
      <div className="max-w-7xl w-full mx-auto flex-1 flex flex-col">
        {/* Header Row with Propose Swap Button top right */}
        <div className="flex items-center justify-between pt-8 px-4 sm:px-8 mb-2">
          <h1 className="text-2xl font-bold text-slate-900">Skill Swaps</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="scale-[0.9] px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-bold rounded-xl shadow-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
          >
            + Propose Swap
          </button>
        </div>
        {/* Active Swaps Section */}
        <div className="flex items-center justify-between px-8 py-3 border-t border-slate-200 bg-transparent">
          <h2 className="text-xl font-bold text-slate-900">
            Your Active Swaps ({activeSwaps.length})
          </h2>
        </div>
        <div className="relative w-full">
          {activeSwaps.length > 0 ? (
            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8 w-full px-8 pb-12">
              {activeSwaps.map((swap) => (
                <AcceptedSwapCard
                  key={swap._id}
                  swap={swap}
                  onClick={() => router.push(`/swap/${swap._id}`)}
                  unreadCount={unreadCounts[swap._id] || 0}
                />
              ))}
            </div>
          ) : (
            <div className="px-8 py-12">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <CheckCircleIcon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">No Active Swaps</h3>
                <p className="text-slate-500 mb-4">You don't have any active skill swaps at the moment.</p>
                <p className="text-sm text-slate-400">Create a new swap or wait for pending swaps to be accepted or accept the skill exchange from the swap listed in skills page.</p>
              </div>
            </div>
          )}
        </div>

        {/* Pending Swaps Section */}
        <div className="flex items-center justify-between px-8 py-3 border-t border-slate-200 bg-transparent">
          <h2 className="text-xl font-bold text-slate-900">
            Pending Swaps ({pendingSwaps.length})
          </h2>
        </div>
        <div className="relative w-full">
          {pendingSwaps.length > 0 ? (
            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8 w-full px-8 pb-12">
              {pendingSwaps.map((swap) => (
                <SwapCard
                  key={swap._id}
                  swap={swap}
                  onClick={() => setPendingModalSwap(swap)}
                />
              ))}
            </div>
          ) : (
            <div className="px-8 py-12">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
                  <ClockIcon className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">No Pending Swaps</h3>
                <p className="text-slate-500 mb-4">You don't have any pending skill swap requests.</p>
                <p className="text-sm text-slate-400">Create a new swap to start exchanging skills with others.</p>
              </div>
            </div>
          )}
        </div>

        {/* Completed Swaps Section */}
        <div className="flex items-center justify-between px-8 py-3 border-t border-slate-200 bg-transparent">
          <h2 className="text-xl font-bold text-slate-900">
            Completed Swaps ({completedSwaps.length})
          </h2>
        </div>
        <div className="relative w-full">
          {completedSwaps.length > 0 ? (
            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8 w-full px-8 pb-12">
              {completedSwaps.map((swap) => (
                <CompletedSwapCard
                  key={swap._id}
                  swap={swap}
                  onClick={() => router.push(`/swap/${swap._id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="px-8 py-12">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <CheckCircleIcon className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">No Completed Swaps</h3>
                <p className="text-slate-500 mb-4">You haven't completed any skill swaps yet.</p>
                <p className="text-sm text-slate-400">Complete your active swaps to see them here.</p>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Modals */}
      {showCreateModal && (
        <CreateSwapModal
          user={user}
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSwapCreated={handleSwapCreated}
        />
      )}
      {pendingModalSwap && (
        <PendingSwapModal
          swap={pendingModalSwap}
          onClose={() => setPendingModalSwap(null)}
        />
      )}
    </div>
  );
}
