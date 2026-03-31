import { Button as UIButton } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/utils/axios";

export default function PendingRequestsSection({ myRooms, onRequestHandled }) {
  const navigate = useNavigate();

  const OpenProfile = (user) => {
    if (user._id) {
      navigate(`/user/${user._id}`, { replace: true });
    }
  };

  const handleRequest = async (roomId, targetUserId, action) => {
    try {
      await axiosInstance.post(`/session-room/${roomId}/handle-request`, {
        targetUserId,
        action,
      });

      // Notify parent to update roomd
      if (onRequestHandled) {
        onRequestHandled(roomId, targetUserId, action);
      }
    } catch (err) {
      alert(err.response?.data?.error || "Failed to handle request");
    }
  };

  // Filter rooms with pending requests
  const roomsWithRequests = myRooms.filter(
    (room) =>
      room.isPrivate && room.pendingRequests && room.pendingRequests.length > 0
  );

  if (roomsWithRequests.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold txt">Pending Join Requests</h2>

      {roomsWithRequests.map((room) => (
        <div
          key={room._id}
          className="rounded-xl border border-[var(--bg-ter)] bg-[var(--bg-secondary)] p-3 space-y-3"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm txt truncate">{room.name}</h3>
            <span className="text-xs text-[var(--txt-dim)] bg-[var(--bg-ter)] px-2 py-1 rounded-full">
              {room.pendingRequests.length}{" "}
              {room.pendingRequests.length === 1 ? "request" : "requests"}
            </span>
          </div>

          <div className="space-y-2">
            {room.pendingRequests.map((user) => (
              <div
                key={user._id}
                className="rounded-lg border border-[var(--bg-ter)] bg-[var(--bg-primary)] p-2.5 space-y-2"
              >
                <div
                  onClick={() => OpenProfile(user)}
                  className="flex items-start gap-2.5 cursor-pointer"
                >
                  <img
                    src={
                      user.ProfilePicture ||
                      "https://api.dicebear.com/9.x/initials/svg?seed=" +
                        user.Username
                    }
                    alt={user.Username}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="font-medium txt block text-sm">
                      {user.Username}
                    </span>
                    <p className="text-xs text-[var(--txt-dim)] line-clamp-2 mt-0.5">
                      {user.Bio || "No bio provided"}
                    </p>
                  </div>
                </div>

                {user.OtherDetails?.skills && (
                  <div>
                    <p className="text-xs font-medium text-[var(--txt-dim)] mb-1.5">
                      Skills
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {user.OtherDetails.skills
                        .split(",")
                        .slice(0, 3)
                        .map((s, i) => (
                          <span
                            key={`skill-${i}`}
                            className="inline-flex items-center px-2 py-0.5 bg-amber-900/40 text-amber-300 text-[10px] rounded-full whitespace-nowrap border border-amber-700/30"
                          >
                            {s.trim()}
                          </span>
                        ))}
                      {user.OtherDetails.skills.split(",").length > 3 && (
                        <span className="text-[var(--txt-disabled)] text-[10px] px-2 py-0.5">
                          +{user.OtherDetails.skills.split(",").length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {user.OtherDetails?.interests && (
                  <div>
                    <p className="text-xs font-medium text-[var(--txt-dim)] mb-1.5">
                      Interests
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {user.OtherDetails.interests
                        .split(",")
                        .slice(0, 3)
                        .map((i, idx) => (
                          <span
                            key={`interest-${idx}`}
                            className="inline-flex items-center px-2 py-0.5 bg-cyan-900/40 text-cyan-300 text-[10px] rounded-full whitespace-nowrap border border-cyan-700/30"
                          >
                            {i.trim()}
                          </span>
                        ))}
                      {user.OtherDetails.interests.split(",").length > 3 && (
                        <span className="text-[var(--txt-disabled)] text-[10px] px-2 py-0.5">
                          +{user.OtherDetails.interests.split(",").length - 3}{" "}
                          more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 w-full pt-1">
                  <UIButton
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white flex-1 h-8 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRequest(room._id, user._id, "approve");
                    }}
                  >
                    Approve
                  </UIButton>
                  <UIButton
                    size="sm"
                    variant="destructive"
                    className="flex-1 h-8 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRequest(room._id, user._id, "reject");
                    }}
                  >
                    Reject
                  </UIButton>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
