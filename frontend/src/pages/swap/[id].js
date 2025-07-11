import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Avatar from "../../components/Avatar";
import useUserStore from "../../store/useUserStore";
import useToastStore from "../../store/useToastStore";
import { apiFetch } from "../../utils/api";
import { io } from "socket.io-client";
import ReviewModal from "../../components/ReviewModal";
import {
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  StarIcon,
  ArrowLeftIcon,
  PaperAirplaneIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import {
  CheckCircleIcon as CheckCircleSolid,
  XCircleIcon as XCircleSolid,
} from "@heroicons/react/24/solid";
import { formatDate, formatTime } from '../../utils/dateUtils';

export default function SwapDetailPage() {
  // All hooks at the top, before any logic or returns
  const router = useRouter();
  const { id } = router.query;
  const { user, fetchUser } = useUserStore();
  const { addToast } = useToastStore();
  const [swap, setSwap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [completingTask, setCompletingTask] = useState(false);
  const [approvingTask, setApprovingTask] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [otherUser, setOtherUser] = useState(null);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [typingUser, setTypingUser] = useState(null);
  const [lastSeenBy, setLastSeenBy] = useState({});
  const typingTimeout = useRef();

  // --- Helper functions for chat date grouping ---
  const groupMessagesByDate = (messages) => {
    const groups = [];
    let lastDate = null;
    messages.forEach((msg) => {
      const msgDate = new Date(msg.createdAt);
      const dateKey = msgDate.toDateString();
      if (!lastDate || lastDate !== dateKey) {
        groups.push({ type: 'date', date: msgDate });
        lastDate = dateKey;
      }
      groups.push({ type: 'msg', message: msg });
    });
    return groups;
  };
  const getDateLabel = (date) => {
    const now = new Date();
    const msgDate = new Date(date);
    const diff = (now.setHours(0,0,0,0) - msgDate.setHours(0,0,0,0)) / 86400000;
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    return formatDate(date);
  };

  // --- Move all function definitions here ---
  const fetchSwapDetails = async () => {
    try {
      setLoading(true);
      const data = await apiFetch(`/api/swaps/${id}`);
      setSwap(data);
    } catch (err) {
      setError("Failed to load swap details");
      addToast({ message: "Failed to load swap details", type: "swap-error" });
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const data = await apiFetch(`/api/messages/${id}`);
      setMessages(data);
    } catch (err) {
      console.error("Failed to load messages:", err);
    }
  };

  const initializeSocket = () => {
    if (!id || !user) return;
    socketRef.current = io(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000', {
      withCredentials: true,
    });
    socketRef.current.on('connect', () => {
      socketRef.current.emit('join_swap_room', { swapId: id, userId: user._id });
    });
    socketRef.current.on('swap_updated', (updatedSwap) => {
      setSwap(updatedSwap);
    });
    socketRef.current.on('new_message', (message) => {
      setMessages(prev => {
        const messageExists = prev.some(msg => msg._id === message._id);
        if (messageExists) return prev;
        return [...prev, message];
      });
      scrollToBottom();
    });
    socketRef.current.on('disconnect', () => {});
    socketRef.current.on('error', (error) => {});
    socketRef.current.on('typing_start', (data) => {
      if (data.userId !== user._id) setTypingUser(data.userName || 'Partner');
    });
    socketRef.current.on('typing_stop', (data) => {
      if (data.userId !== user._id) setTypingUser(null);
    });
    socketRef.current.on('messages_seen', (data) => {
      fetchMessages();
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const markTaskComplete = async () => {
    if (!swap || completingTask) return;
    setCompletingTask(true);
    try {
      const updatedSwap = await apiFetch(`/api/swaps/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status: "task_completed" }),
      });
      setSwap(updatedSwap);
      addToast({ message: "Task marked as complete!", type: "swap-success" });
      if (socketRef.current) {
        socketRef.current.emit('task_completed', { swapId: id, userId: user._id });
      }
    } catch (err) {
      addToast({ message: "Failed to mark task as complete", type: "swap-error" });
    } finally {
      setCompletingTask(false);
    }
  };

  const approveTask = async () => {
    if (!swap || approvingTask) return;
    setApprovingTask(true);
    try {
      const updatedSwap = await apiFetch(`/api/swaps/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ approval: "approve" }),
      });
      setSwap(updatedSwap);
      addToast({ message: "Task approved!", type: "swap-success" });
      if (updatedSwap.status === 'completed') {
        // Refresh user profile to update completedSwapsCount
        if (typeof fetchUser === 'function') {
          fetchUser();
        }
        const isSender = String(updatedSwap.sender._id) === user._id;
        const canRate = isSender ? updatedSwap.senderCanRateReceiver : updatedSwap.receiverCanRateSender;
        if (canRate) {
          const otherUserData = isSender ? updatedSwap.receiver : updatedSwap.sender;
          setOtherUser(otherUserData);
          setShowReviewModal(true);
        }
      }
      if (socketRef.current) {
        socketRef.current.emit('task_approved', { swapId: id, userId: user._id });
      }
    } catch (err) {
      addToast({ message: "Failed to approve task", type: "swap-error" });
    } finally {
      setApprovingTask(false);
    }
  };

  const handleReviewSubmitted = () => {
    setShowReviewModal(false);
    addToast({ message: "Review submitted successfully!", type: "swap-success" });
    fetchSwapDetails();
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sendingMessage || !swap.receiver) return;
    setSendingMessage(true);
    try {
      const message = await apiFetch("/api/messages", {
        method: "POST",
        body: JSON.stringify({ swapId: id, content: newMessage.trim() }),
      });
      setNewMessage("");
      if (socketRef.current) {
        socketRef.current.emit('send_message', { swapId: id, message });
      }
    } catch (err) {
      addToast({ message: "Failed to send message", type: "swap-error" });
    } finally {
      setSendingMessage(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "text-yellow-600 bg-yellow-50";
      case "in_progress": return "text-blue-600 bg-blue-50";
      case "sender_completed": return "text-orange-600 bg-orange-50";
      case "receiver_completed": return "text-orange-600 bg-orange-50";
      case "both_completed": return "text-purple-600 bg-purple-50";
      case "completed": return "text-green-600 bg-green-50";
      case "incomplete": return "text-red-600 bg-red-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending": return <ClockIcon className="w-4 h-4" />;
      case "in_progress": return <ChatBubbleLeftRightIcon className="w-4 h-4" />;
      case "sender_completed": return <CheckCircleIcon className="w-4 h-4" />;
      case "receiver_completed": return <CheckCircleIcon className="w-4 h-4" />;
      case "both_completed": return <CheckCircleIcon className="w-4 h-4" />;
      case "completed": return <CheckCircleIcon className="w-4 h-4" />;
      case "incomplete": return <XCircleIcon className="w-4 h-4" />;
      default: return <ClockIcon className="w-4 h-4" />;
    }
  };

  // --- All useEffect hooks below ---
  useEffect(() => {
    if (id) {
      fetchSwapDetails();
      fetchMessages();
      initializeSocket();
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [id]);

  useEffect(() => {
    if (
      swap &&
      (!swap.sender || !swap.receiver) &&
      id
    ) {
      fetchSwapDetails();
    }
    // eslint-disable-next-line
  }, [swap, id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!id || !user) return;
    const markSeen = async () => {
      await apiFetch(`/api/messages/${id}/seen`, { method: 'PATCH' });
      if (socketRef.current) {
        socketRef.current.emit('messages_seen', { swapId: id, userId: user._id });
      }
    };
    markSeen();
  }, [id, user, messages.length]);

  // Remove the useEffect that auto-opens the review modal

  // Early return for loading/error state, after all hooks
  if (loading || !user || !swap) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading swap details...</p>
        </div>
      </div>
    );
  }

  // Robust ID extraction
  const getId = (obj) => {
    if (!obj) return null;
    if (typeof obj === 'string') return obj;
    if (typeof obj === 'object' && obj._id) return obj._id.toString();
    return null;
  };

  const userId = getId(user);
  const senderId = getId(swap?.sender);
  const receiverId = getId(swap?.receiver);

  const isSender = senderId && userId && senderId === userId;
  const isReceiver = receiverId && userId && receiverId === userId;
  const isUserInSwap = isSender || isReceiver;

  // Only show Access Denied if both sender and receiver are present and you are not a participant
  if (swap && swap.sender && swap.receiver && !isUserInSwap) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">You don't have access to this swap.</p>
          <button
            onClick={() => router.push("/swap")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Back to Swaps
          </button>
        </div>
      </div>
    );
  }

  // Typing event handlers
  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    if (socketRef.current) {
      socketRef.current.emit('typing_start', { swapId: id, userId: user._id, userName: user.name });
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => {
        socketRef.current.emit('typing_stop', { swapId: id, userId: user._id, userName: user.name });
      }, 1500);
    }
  };
  const handleInputBlur = () => {
    if (socketRef.current) {
      socketRef.current.emit('typing_stop', { swapId: id, userId: user._id, userName: user.name });
    }
  };

  return (
    <>
      <Head>
        <title>Swap Details - SkillSwap</title>
      </Head>
      
      <div className="h-screen flex flex-col bg-gray-50">
        {/* Header - Fixed */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/swap")}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Swap Details</h1>
                <p className="text-xs text-gray-500">ID: #{swap._id.slice(-8)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(swap.status)}`}>
                {getStatusIcon(swap.status)}
                <span className="capitalize">{swap.status.replace('_', ' ')}</span>
              </div>
              {/* Mobile Chat Toggle Button */}
              <button
                onClick={() => setShowMobileChat(true)}
                className="sm:hidden p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <ChatBubbleLeftRightIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content - Takes remaining height with proper overflow handling */}
        <div className="flex-1 flex min-h-0">
          {/* Left Sidebar - Swap Details (40% on sm+, full on mobile) */}
          <div className={`${showMobileChat ? 'hidden sm:flex' : 'flex'} w-full sm:w-2/5 bg-white border-r border-gray-200 flex-col min-h-0`}>
            <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4 lg:space-y-6">
              {/* Participants */}
              <div className="space-y-3 lg:space-y-4">
                <h2 className="text-base lg:text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <UserIcon className="w-4 h-4 lg:w-5 lg:h-5" />
                  Participants
                </h2>
                
                {/* Proposer */}
                <div className="bg-blue-50 rounded-lg p-3 lg:p-4 border border-blue-100">
                  <div className="flex items-center gap-3">
                    <Avatar src={swap.sender?.avatar} name={swap.sender?.name} size={40} />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm lg:text-base truncate">{swap.sender?.name || "Anonymous"}</h3>
                      
                      <p className="text-xs lg:text-sm text-gray-600">Proposer</p>
                    </div>
                    {isSender && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex-shrink-0">You</span>
                    )}
                  </div>
                </div>

                {/* Acceptor */}
                {swap.receiver && (
                  <div className="bg-green-50 rounded-lg p-3 lg:p-4 border border-green-100">
                    <div className="flex items-center gap-3">
                      <Avatar src={swap.receiver?.avatar} name={swap.receiver?.name} size={40} />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm lg:text-base truncate">{swap.receiver?.name || "Anonymous"}</h3>
                        
                        <p className="text-xs lg:text-sm text-gray-600">Acceptor</p>
                      </div>
                      {isReceiver && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex-shrink-0">You</span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Skills Exchange */}
              <div className="space-y-3 lg:space-y-4">
                <h2 className="text-base lg:text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <StarIcon className="w-4 h-4 lg:w-5 lg:h-5" />
                  Skills Exchange
                </h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
                  {/* Offered Skills */}
                  <div className="bg-blue-50 rounded-lg p-3 lg:p-4 border border-blue-100">
                    <h4 className="font-medium text-blue-900 mb-2 text-sm lg:text-base">Offering</h4>
                    <div className="flex flex-wrap gap-1 lg:gap-2">
                      {(Array.isArray(swap.offeredSkill) ? swap.offeredSkill : [swap.offeredSkill]).map((skill) => (
                        <span key={skill} className="bg-blue-100 text-blue-800 text-xs lg:text-sm px-2 py-1 rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Requested Skill */}
                  <div className="bg-yellow-50 rounded-lg p-3 lg:p-4 border border-yellow-100">
                    <h4 className="font-medium text-yellow-900 mb-2 text-sm lg:text-base">Looking For</h4>
                    <span className="bg-yellow-100 text-yellow-800 text-xs lg:text-sm px-2 lg:px-3 py-1 rounded-full">
                      {swap.requestedSkill}
                    </span>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="space-y-3 lg:space-y-4">
                <h2 className="text-base lg:text-lg font-semibold text-gray-900">Messages</h2>
                
                {/* Proposer Message */}
                {swap.message && (
                  <div className="bg-gray-50 rounded-lg p-3 lg:p-4 border border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-2 text-sm lg:text-base">Proposer's Message</h4>
                    <p className="text-gray-700 italic text-sm lg:text-base">"{swap.message}"</p>
                  </div>
                )}

                {/* Acceptor Message */}
                {swap.acceptorMessage && (
                  <div className="bg-green-50 rounded-lg p-3 lg:p-4 border border-green-200">
                    <h4 className="font-medium text-green-900 mb-2 text-sm lg:text-base">Acceptor's Request</h4>
                    <p className="text-green-700 italic text-sm lg:text-base">"{swap.acceptorMessage}"</p>
                  </div>
                )}
              </div>

              {/* Deadlines */}
              <div className="space-y-3 lg:space-y-4">
                <h2 className="text-base lg:text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 lg:w-5 lg:h-5" />
                  Deadlines
                </h2>
                
                <div className="space-y-3">
                  {/* Proposer's Deadline */}
                  {swap.proposerDeadline && (
                    <div className="bg-blue-50 rounded-lg p-3 lg:p-4 border border-blue-100">
                      <h4 className="font-medium text-blue-900 mb-1 text-sm lg:text-base">Proposer's Deadline</h4>
                      <p className="text-xs lg:text-sm text-blue-700 mb-2">Complete proposer's requested skill by:</p>
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-blue-600" />
                        <span className="font-semibold text-blue-900 text-sm lg:text-base">
                          {new Date(swap.proposerDeadline).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Acceptor's Deadline */}
                  {swap.acceptorDeadline && (
                    <div className="bg-green-50 rounded-lg p-3 lg:p-4 border border-green-100">
                      <h4 className="font-medium text-green-900 mb-1 text-sm lg:text-base">Acceptor's Deadline</h4>
                      <p className="text-xs lg:text-sm text-green-700 mb-2">Complete acceptor's requested skill by:</p>
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-green-600" />
                        <span className="font-semibold text-green-900 text-sm lg:text-base">
                          {new Date(swap.acceptorDeadline).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Completion Status */}
              <div className="space-y-3 lg:space-y-4">
                <h2 className="text-base lg:text-lg font-semibold text-gray-900">Completion Status</h2>
                
                <div className="space-y-3">
                  {/* Proposer Completion (Sender) */}
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar src={swap.sender?.avatar} name={swap.sender?.name} size={32} />
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 text-sm lg:text-base truncate">{swap.sender?.name}</p>
                          <p className="text-xs lg:text-sm text-gray-600">Proposer</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {swap.senderTaskCompleted ? (
                          <>
                            <CheckCircleSolid className="w-4 h-4 lg:w-5 lg:h-5 text-green-600" />
                            <span className="text-xs lg:text-sm font-medium text-green-600">Completed</span>
                          </>
                        ) : (
                          <>
                            <ClockIcon className="w-4 h-4 lg:w-5 lg:h-5 text-yellow-600" />
                            <span className="text-xs lg:text-sm font-medium text-yellow-600">Pending</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {/* Mark as complete button for sender */}
                    {isSender && !swap.senderTaskCompleted && (
                      <button
                        onClick={markTaskComplete}
                        disabled={completingTask}
                        className="w-full bg-green-600 text-white py-2 px-3 lg:px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition text-xs lg:text-sm font-medium"
                      >
                        {completingTask ? "Marking Complete..." : "Mark My Task Complete"}
                      </button>
                    )}
                    
                    {/* Approve sender's work (for receiver) */}
                    {isReceiver && swap.senderTaskCompleted && !swap.senderApproved && (
                      <button
                        onClick={approveTask}
                        disabled={approvingTask}
                        className="w-full bg-blue-600 text-white py-2 px-3 lg:px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition text-xs lg:text-sm font-medium"
                      >
                        {approvingTask ? "Approving..." : "Approve Proposer's Work"}
                      </button>
                    )}
                    
                    {swap.senderTaskCompleted && !swap.senderApproved && (
                      <div className="text-yellow-600 text-xs lg:text-sm">
                        <span>✓ Completed - Waiting for approval</span>
                      </div>
                    )}
                    
                    {swap.senderApproved && (
                      <div className="flex items-center gap-2 text-green-600 text-xs lg:text-sm">
                        <CheckCircleSolid className="w-3 h-3 lg:w-4 lg:h-4" />
                        <span>✓ Approved by {isReceiver ? "you" : swap.receiver?.name}</span>
                      </div>
                    )}
                  </div>

                  {/* Acceptor Completion (Receiver) */}
                  {swap.receiver && (
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Avatar src={swap.receiver?.avatar} name={swap.receiver?.name} size={32} />
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 text-sm lg:text-base truncate">{swap.receiver?.name}</p>
                            <p className="text-xs lg:text-sm text-gray-600">Acceptor</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {swap.receiverTaskCompleted ? (
                            <>
                              <CheckCircleSolid className="w-4 h-4 lg:w-5 lg:h-5 text-green-600" />
                              <span className="text-xs lg:text-sm font-medium text-green-600">Completed</span>
                            </>
                          ) : (
                            <>
                              <ClockIcon className="w-4 h-4 lg:w-5 lg:h-5 text-yellow-600" />
                              <span className="text-xs lg:text-sm font-medium text-yellow-600">Pending</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {/* Mark as complete button for receiver */}
                      {isReceiver && !swap.receiverTaskCompleted && (
                        <button
                          onClick={markTaskComplete}
                          disabled={completingTask}
                          className="w-full bg-green-600 text-white py-2 px-3 lg:px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition text-xs lg:text-sm font-medium"
                        >
                          {completingTask ? "Marking Complete..." : "Mark My Task Complete"}
                        </button>
                      )}
                      
                      {/* Approve receiver's work (for sender) */}
                      {isSender && swap.receiverTaskCompleted && !swap.receiverApproved && (
                        <button
                          onClick={approveTask}
                          disabled={approvingTask}
                          className="w-full bg-blue-600 text-white py-2 px-3 lg:px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition text-xs lg:text-sm font-medium"
                        >
                          {approvingTask ? "Approving..." : "Approve Acceptor's Work"}
                        </button>
                      )}
                      
                      {swap.receiverTaskCompleted && !swap.receiverApproved && (
                        <div className="text-yellow-600 text-xs lg:text-sm">
                          <span>✓ Completed - Waiting for approval</span>
                        </div>
                      )}
                      
                      {swap.receiverApproved && (
                        <div className="flex items-center gap-2 text-green-600 text-xs lg:text-sm">
                          <CheckCircleSolid className="w-3 h-3 lg:w-4 lg:h-4" />
                          <span>✓ Approved by {isSender ? "you" : swap.sender?.name}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Overall Swap Status */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 lg:p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 text-sm lg:text-base">Current Status</h3>
                  <div className="space-y-2 text-xs lg:text-sm">
                    <div className="flex items-center justify-between">
                      <span>Proposer's Task:</span>
                      <span className={`font-medium ${
                        swap.senderTaskCompleted ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        {swap.senderTaskCompleted ? 'Completed' : 'Pending'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Acceptor's Task:</span>
                      <span className={`font-medium ${
                        swap.receiverTaskCompleted ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        {swap.receiverTaskCompleted ? 'Completed' : 'Pending'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Proposer's Work Approved:</span>
                      <span className={`font-medium ${
                        swap.senderApproved ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        {swap.senderApproved ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Acceptor's Work Approved:</span>
                      <span className={`font-medium ${
                        swap.receiverApproved ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        {swap.receiverApproved ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                  
                  {swap.status === "completed" && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center gap-2">
                        <CheckCircleSolid className="w-4 h-4 lg:w-5 lg:h-5 text-green-600" />
                        <span className="font-semibold text-green-900 text-sm lg:text-base">Swap Completed!</span>
                      </div>
                      <p className="text-xs lg:text-sm text-green-700 mt-1">
                        Both parties have completed and approved their tasks.
                      </p>
                      {/* Show rating button only if user can rate */}
                      {(() => {
                        const isSender = String(swap.sender._id) === user._id;
                        const canRate = isSender ? swap.senderCanRateReceiver : swap.receiverCanRateSender;
                        
                        console.log('Swap Detail Rating Debug:', {
                          swapId: swap._id,
                          userId: user._id,
                          senderId: swap.sender._id,
                          receiverId: swap.receiver._id,
                          isSender,
                          senderCanRateReceiver: swap.senderCanRateReceiver,
                          receiverCanRateSender: swap.receiverCanRateSender,
                          canRate,
                          swapStatus: swap.status
                        });
                        
                        if (canRate) {
                          return (
                            <button
                              onClick={() => {
                                const otherUserData = isSender ? swap.receiver : swap.sender;
                                setOtherUser(otherUserData);
                                setShowReviewModal(true);
                              }}
                              className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                            >
                              Rate Your Experience
                            </button>
                          );
                        } else {
                          return (
                            <div className="mt-3 text-sm text-gray-600">
                              {swap.status === 'completed' ? 
                                'You have already rated this swap or rating is not available.' : 
                                'Approve their completed work to enable rating.'
                              }
                            </div>
                          );
                        }
                      })()}
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Info */}
              <div className="space-y-3 lg:space-y-4">
                <h2 className="text-base lg:text-lg font-semibold text-gray-900">Additional Info</h2>
               
                <div className="space-y-3">
                  {/* Difficulty Level */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="font-medium text-gray-900 text-sm lg:text-base">Difficulty Level</span>
                    <span className={`px-2 lg:px-3 py-1 rounded-full text-xs lg:text-sm font-medium ${
                      swap.difficultyLevel === "Beginner" ? "bg-blue-100 text-blue-700" :
                      swap.difficultyLevel === "Intermediate" ? "bg-yellow-100 text-yellow-700" :
                      swap.difficultyLevel === "Advanced" ? "bg-red-100 text-red-700" :
                      "bg-gray-100 text-gray-700"
                    }`}>
                      {swap.difficultyLevel}
                    </span>
                  </div>

                  {/* Urgent Flag */}
                  {swap.isUrgent && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
                      <ExclamationTriangleIcon className="w-4 h-4 lg:w-5 lg:h-5 text-red-600" />
                      <span className="font-medium text-red-700 text-sm lg:text-base">Urgent Request</span>
                    </div>
                  )}

                  {/* Timestamps */}
                  <div className="space-y-2 text-xs lg:text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <ClockIcon className="w-3 h-3 lg:w-4 lg:h-4" />
                      <span>Created: {new Date(swap.createdAt).toLocaleString()}</span>
                    </div>
                    {swap.receiver && (
                      <div className="flex items-center gap-2">
                        <CheckCircleIcon className="w-3 h-3 lg:w-4 lg:h-4" />
                        <span>Accepted: {new Date(swap.updatedAt).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Chat (60% on sm+, hidden on mobile) */}
          <div className={`${showMobileChat ? 'flex' : 'hidden'} sm:flex sm:w-3/5 flex-col bg-white min-h-0 ${showMobileChat ? 'fixed inset-0 z-50' : ''}`}>
            {/* Chat Header - Fixed */}
            <div className="border-b border-gray-200 p-4 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Chat</h2>
                  <p className="text-sm text-gray-500">
                    {swap.receiver && (swap.status === 'in_progress' || swap.status === 'sender_completed' || swap.status === 'receiver_completed' || swap.status === 'both_completed' || swap.status === 'completed') ? "Chat with your swap partner" : "Chat will be available once swap is accepted"}
                  </p>
                  {/* Typing Indicator - moved here under chat heading */}
                  {typingUser && (
                    <div className="text-xs text-blue-500 mt-1 font-medium animate-pulse">{typingUser} is typing...</div>
                  )}
                </div>
                {/* Mobile Back Button */}
                <button
                  onClick={() => setShowMobileChat(false)}
                  className="sm:hidden p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Chat Messages - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
              {!swap.receiver || (swap.status !== 'in_progress' && swap.status !== 'sender_completed' && swap.status !== 'receiver_completed' && swap.status !== 'both_completed' && swap.status !== 'completed') ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <ChatBubbleLeftRightIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Chat will be available once the swap is accepted</p>
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <ChatBubbleLeftRightIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No messages yet. Start the conversation!</p>
                  </div>
                </div>
              ) : (
                // Group messages by date
                groupMessagesByDate(messages).map((item, idx) => {
                  if (item.type === 'date') {
                    return (
                      <div key={'date-' + item.date} className="flex justify-center my-2">
                        <span className="bg-gray-200 text-gray-700 text-xs px-3 py-1 rounded-full shadow-sm">{getDateLabel(item.date)}</span>
                      </div>
                    );
                  }
                  const message = item.message;
                  const isOwnMessage = message.sender?._id === user?._id;
                  const seenByOther = message.seenBy && message.seenBy.some(uid => uid !== user._id);
                  return (
                    <div key={message._id} className={`flex flex-col items-${isOwnMessage ? 'end' : 'start'} mb-1`}>
                      <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                        <div className={`relative max-w-xs lg:max-w-md px-4 py-2 rounded-lg flex flex-col ${
                          isOwnMessage 
                            ? 'bg-blue-600 text-white items-end' 
                            : 'bg-gray-100 text-gray-900 items-start'
                        }`}>
                          <div className="flex items-center gap-2 mb-1">
                            <Avatar src={message.sender?.avatar} name={message.sender?.name} size={24} />
                            <span className="text-sm font-medium">
                              {isOwnMessage ? 'You' : message.sender?.name}
                            </span>
                          </div>
                          <p className="text-sm break-words whitespace-pre-line">{message.content}</p>
                        </div>
                      </div>
                      {/* Time and status icon outside the bubble */}
                      <div className={`flex items-center gap-1 mt-1 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                        <span className={'text-xs text-gray-600'}>{formatTime(message.createdAt)}</span>
                        {isOwnMessage && (
                          <span className="inline-flex items-center align-bottom ml-1">
                            {!seenByOther ? (
                              <PaperAirplaneIcon className="w-4 h-4 text-green-800" title="Sent" />
                            ) : (
                              <div className="relative w-5 h-4">
                              <CheckIcon className="absolute w-4 h-4 text-green-800" title="Seen" />
                              <CheckIcon className="absolute w-4 h-4 text-green-800 left-1" title="Seen" />
                            </div>
                            
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input - Fixed at bottom */}
            {swap.receiver && (swap.status === 'in_progress' || swap.status === 'sender_completed' || swap.status === 'receiver_completed' || swap.status === 'both_completed' || swap.status === 'completed') && (
              <div className="border-t border-gray-200 p-4 flex-shrink-0 bg-gray-50">
                <form onSubmit={sendMessage} className="flex gap-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={sendingMessage}
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sendingMessage}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                  >
                    {sendingMessage ? 'Sending...' : 'Send'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && otherUser && (
        <ReviewModal
          swap={swap}
          otherUser={otherUser}
          onClose={() => setShowReviewModal(false)}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}
    </>
  );
}
