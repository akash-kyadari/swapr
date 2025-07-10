import Avatar from "./Avatar";
import {
  CalendarIcon,
  StarIcon,
  ExclamationTriangleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

export default function SwapCard({ swap, onClick }) {
  return (
    <div
      className="transition-all duration-200 hover:scale-[1.02] bg-white border border-slate-200 shadow-sm hover:shadow-lg rounded-2xl flex flex-col p-0 group focus:ring-2 focus:ring-blue-400 outline-none justify-between overflow-hidden cursor-pointer"
      onClick={onClick}
      tabIndex={0}
      role="button"
      aria-label="Open swap details"
    >
      {/* Top User Info */}
      <div className="flex items-center gap-3 mb-2 px-6 pt-6">
        <Avatar src={swap.sender?.avatar} name={swap.sender?.name} size={48} />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base text-slate-900 truncate">
            {swap.sender?.name || "Anonymous"}
          </h3>
          <div className="flex items-center gap-1 mt-1">
            <StarIcon className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-slate-500">
              {swap.sender?.rating ? `${swap.sender.rating.toFixed(1)}` : '0.0'} ({swap.sender?.completedSwapsCount || 0})
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
      {/* Messages */}
      <div className="mb-2 px-6 space-y-2">
        {/* Proposer Message */}
        {swap.message && (
          <div className="text-slate-700 text-sm italic line-clamp-2">
            <span className="font-medium text-slate-600">Proposer:</span> "{swap.message}"
          </div>
        )}
        {/* Acceptor Message */}
        {swap.acceptorMessage && (
          <div className="text-green-700 text-sm italic line-clamp-2">
            <span className="font-medium text-green-600">Acceptor:</span> "{swap.acceptorMessage}"
          </div>
        )}
        {/* No messages */}
        {!swap.message && !swap.acceptorMessage && (
          <div className="text-slate-500 text-sm italic">
            No messages provided
          </div>
        )}
      </div>
      {/* Meta Info */}
      <div className="flex items-center justify-between text-xs text-slate-500 mb-2 px-6">
        <div className="flex items-center gap-1">
          <CalendarIcon className="w-4 h-4" />
          {swap.createdAt ? new Date(swap.createdAt).toLocaleDateString() : ""}
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
      {swap.isUrgent && (
        <div className="flex items-center gap-2 text-xs text-red-600 mb-2 px-6 font-medium">
          <ExclamationTriangleIcon className="w-4 h-4" />
          Urgent
        </div>
      )}
      {/* Bottom Time */}
      <div className="px-6 pb-4 text-xs text-slate-400 flex items-center gap-2">
        <ClockIcon className="w-4 h-4" />
        {swap.createdAt &&
          new Date(swap.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
      </div>
    </div>
  );
}
