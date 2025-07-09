import { useState, useEffect } from 'react';
import { 
  ClockIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  CalendarIcon,
  UserIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';
import { formatDistanceToNow, format } from 'date-fns';

export default function SwapStatus({ swap, currentUser, onComplete, onApprove, onReport }) {
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isOverdue, setIsOverdue] = useState(false);

  const isSender = currentUser?._id === swap.sender?._id;
  const isReceiver = currentUser?._id === swap.receiver?._id;
  const userRole = isSender ? 'sender' : 'receiver';
  const otherRole = isSender ? 'receiver' : 'sender';
  
  const userDeadline = isSender ? swap.proposerDeadline : swap.acceptorDeadline;
  const otherDeadline = isSender ? swap.acceptorDeadline : swap.proposerDeadline;
  const userCompleted = isSender ? swap.senderTaskCompleted : swap.receiverTaskCompleted;
  const otherCompleted = isSender ? swap.receiverTaskCompleted : swap.senderTaskCompleted;
  const userApproved = isSender ? swap.senderApproved : swap.receiverApproved;
  const otherApproved = isSender ? swap.receiverApproved : swap.senderApproved;

  // Calculate time remaining
  useEffect(() => {
    if (!userDeadline || userCompleted) {
      setTimeRemaining(null);
      return;
    }

    const updateTime = () => {
      const now = new Date();
      const deadline = new Date(userDeadline);
      const remaining = deadline - now;
      
      if (remaining <= 0) {
        setIsOverdue(true);
        setTimeRemaining(0);
      } else {
        setIsOverdue(false);
        setTimeRemaining(remaining);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [userDeadline, userCompleted]);

  const getStatusColor = () => {
    switch (swap.status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'sender_completed':
      case 'receiver_completed': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'incomplete': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = () => {
    switch (swap.status) {
      case 'pending': return 'Pending Acceptance';
      case 'in_progress': return 'In Progress';
      case 'sender_completed': return 'Sender Completed';
      case 'receiver_completed': return 'Receiver Completed';
      case 'completed': return 'Completed';
      case 'incomplete': return 'Incomplete';
      default: return swap.status;
    }
  };

  const formatTimeRemaining = (ms) => {
    if (ms <= 0) return 'Overdue';
    
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
  };

  return (
    <div className="space-y-4">
      {/* Status Badge */}
      <div className="flex items-center justify-between">
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}>
          {swap.status === 'completed' && <CheckBadgeIcon className="w-4 h-4 mr-1" />}
          {swap.status === 'incomplete' && <ExclamationTriangleIcon className="w-4 h-4 mr-1" />}
          {getStatusText()}
        </div>
        
        {swap.completedAt && (
          <div className="text-sm text-gray-500">
            Completed {formatDistanceToNow(new Date(swap.completedAt), { addSuffix: true })}
          </div>
        )}
      </div>

      {/* Deadlines */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Your Deadline */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-900 flex items-center">
              <UserIcon className="w-4 h-4 mr-2" />
              {isSender ? 'When you want your requested part completed' : 'When you will complete their requested part'}
            </h4>
            {userCompleted && (
              <CheckCircleIcon className="w-5 h-5 text-green-500" />
            )}
          </div>
          
          {userDeadline ? (
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <CalendarIcon className="w-4 h-4 mr-2 text-gray-400" />
                {format(new Date(userDeadline), 'MMM dd, yyyy')}
              </div>
              
              {!userCompleted && (
                <div className={`flex items-center text-sm ${
                  isOverdue ? 'text-red-600' : timeRemaining < 24 * 60 * 60 * 1000 ? 'text-orange-600' : 'text-gray-600'
                }`}>
                  <ClockIcon className="w-4 h-4 mr-2" />
                  {formatTimeRemaining(timeRemaining)}
                </div>
              )}
              
              {userCompleted && (
                <div className="text-sm text-green-600">
                  Completed {formatDistanceToNow(new Date(isSender ? swap.senderCompletedAt : swap.receiverCompletedAt), { addSuffix: true })}
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-gray-500">No deadline set</div>
          )}
        </div>

        {/* Partner's Deadline */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-900 flex items-center">
              <UserIcon className="w-4 h-4 mr-2" />
              {isSender ? 'When they will complete your requested part' : 'When they want their requested part completed'}
            </h4>
            {otherCompleted && (
              <CheckCircleIcon className="w-5 h-5 text-green-500" />
            )}
          </div>
          
          {otherDeadline ? (
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <CalendarIcon className="w-4 h-4 mr-2 text-gray-400" />
                {format(new Date(otherDeadline), 'MMM dd, yyyy')}
              </div>
              
              {otherCompleted && (
                <div className="text-sm text-green-600">
                  Completed {formatDistanceToNow(new Date(isSender ? swap.receiverCompletedAt : swap.senderCompletedAt), { addSuffix: true })}
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-gray-500">No deadline set</div>
          )}
        </div>
      </div>

      {/* Progress Indicators */}
      {(swap.status === 'in_progress' || swap.status === 'sender_completed' || swap.status === 'receiver_completed') && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Progress</h4>
          <div className="space-y-3">
            {/* Your Task */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Your task</span>
              <div className="flex items-center space-x-2">
                {userCompleted ? (
                  <div className="flex items-center text-green-600">
                    <CheckCircleIcon className="w-4 h-4 mr-1" />
                    <span className="text-sm">Completed</span>
                  </div>
                ) : (
                  <div className="flex items-center text-gray-500">
                    <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                    <span className="text-sm">Pending</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Partner's Task */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Partner's task</span>
              <div className="flex items-center space-x-2">
                {otherCompleted ? (
                  <div className="flex items-center text-green-600">
                    <CheckCircleIcon className="w-4 h-4 mr-1" />
                    <span className="text-sm">Completed</span>
                  </div>
                ) : (
                  <div className="flex items-center text-gray-500">
                    <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                    <span className="text-sm">Pending</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approval Status */}
      {(swap.status === 'sender_completed' || swap.status === 'receiver_completed') && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Approval Status</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Your approval</span>
              <div className="flex items-center space-x-2">
                {userApproved ? (
                  <div className="flex items-center text-green-600">
                    <CheckBadgeIcon className="w-4 h-4 mr-1" />
                    <span className="text-sm">Approved</span>
                  </div>
                ) : otherCompleted ? (
                  <button
                    onClick={() => onApprove()}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                  >
                    Approve
                  </button>
                ) : (
                  <div className="flex items-center text-gray-500">
                    <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                    <span className="text-sm">Waiting</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Partner's approval</span>
              <div className="flex items-center space-x-2">
                {otherApproved ? (
                  <div className="flex items-center text-green-600">
                    <CheckBadgeIcon className="w-4 h-4 mr-1" />
                    <span className="text-sm">Approved</span>
                  </div>
                ) : (
                  <div className="flex items-center text-gray-500">
                    <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                    <span className="text-sm">Pending</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        {!userCompleted && swap.status === 'in_progress' && (
          <button
            onClick={() => onComplete()}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <CheckCircleIcon className="w-4 h-4 mr-2" />
            Mark Task Complete
          </button>
        )}
        
        {isOverdue && !userCompleted && (
          <button
            onClick={() => onReport('deadline_missed')}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
          >
            <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
            Report Issue
          </button>
        )}
      </div>
    </div>
  );
} 