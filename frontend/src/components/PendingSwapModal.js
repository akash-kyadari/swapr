import React from "react";
import Avatar from "./Avatar";
import {
  CalendarIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

export default function PendingSwapModal({ swap, onClose }) {
  if (!swap) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 relative animate-fade-in border border-secondary-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
          onClick={onClose}
        >
          <span className="sr-only">Close</span>
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <h2 className="text-2xl font-bold mb-2 text-primary-900">
          Pending Swap Details
        </h2>
        <div className="space-y-4 mt-4">
          <div className="flex items-center gap-3">
            <Avatar
              src={swap.sender?.avatar}
              name={swap.sender?.name}
              size={48}
            />
            <div>
              <div className="font-semibold text-base text-slate-900">
                {swap.sender?.name || "Anonymous"}
              </div>
              <div className="text-xs text-slate-500">{swap.sender?.email}</div>
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
              Offering
            </div>
            <div className="flex flex-wrap gap-2">
              {(Array.isArray(swap.offeredSkill)
                ? swap.offeredSkill
                : [swap.offeredSkill]
              ).map((skill) => (
                <span
                  key={skill}
                  className="bg-blue-50 text-blue-800 text-xs px-2 py-1 rounded-full border border-blue-100 font-medium"
                >
                  {skill}
                </span>
              ))}
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
          <div className="text-slate-700 text-sm italic">
            {swap.message ? `"${swap.message}"` : "No message provided"}
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <CalendarIcon className="w-4 h-4" />
            {swap.createdAt && new Date(swap.createdAt).toLocaleDateString()}
          </div>
          <div
            className={`px-2 py-1 rounded-full font-semibold text-xs mt-2 ${
              swap.difficultyLevel === "Beginner"
                ? "bg-blue-100 text-blue-700"
                : swap.difficultyLevel === "Intermediate"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {swap.difficultyLevel || "Intermediate"}
          </div>
          {swap.isUrgent && (
            <div className="flex items-center gap-2 text-xs text-red-600 font-medium mt-2">
              <ExclamationTriangleIcon className="w-4 h-4" />
              Urgent
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
