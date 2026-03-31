import { useEffect, useState } from "react";
import OtherRoom from "../components/session/OtherRooms.jsx";
import OnlineFriends from "../components/session/friendsSection/OnlineFriends.jsx";
import YourRooms from "@/components/session/YourRooms.jsx";
import SessionRooms from "@/components/session/SessionRooms.jsx";
import NotLogedInPage from "@/components/NotLoggedInPage.jsx";
import PendingRequestsSection from "@/components/session/PendingRequestsSection.jsx";
import axiosInstance from "@/utils/axios";
import { useUserStore } from "@/stores/userStore.js";

function Session() {
  const { user } = useUserStore();
  const [myRooms, setMyRooms] = useState([]);
  const [otherRooms, setOtherRooms] = useState([]);
  const [joinedRooms, setJoinedRooms] = useState([]);

  const handleRoomLeft = (roomId) => {
    setJoinedRooms((prevRooms) =>
      prevRooms.filter((room) => room._id !== roomId)
    );
  };

  const handleRequestHandled = (roomId, targetUserId, action) => {
    setMyRooms((prev) =>
      prev.map((room) =>
        room._id === roomId
          ? {
              ...room,
              pendingRequests: room.pendingRequests.filter(
                (user) => user._id !== targetUserId
              ),
              members:
                action === "approve"
                  ? [...room.members, targetUserId]
                  : room.members,
            }
          : room
      )
    );
  };

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const { data } = await axiosInstance.get("/session-room");
        setMyRooms(data.myRooms);
        setOtherRooms(data.otherRooms);
        setJoinedRooms(data.joinedRooms || []);
      } catch (err) {
        console.error("Failed to fetch rooms:", err);
      }
    };

    fetchRooms();
  }, [user]);

  if (!user) return <NotLogedInPage />;

  return (
    <div className="h-[100vh] w-[calc(100vw-70px)] pb-0 flex ">
      <div className="w-[80%] overflow-x-hidden p-3 2xl:p-6 space-y-6">
        <YourRooms myRooms={myRooms} />
        <SessionRooms joinedRooms={joinedRooms} onRoomLeft={handleRoomLeft} />
        <OtherRoom otherRooms={otherRooms} />
      </div>
      <aside className="w-[20%] overflow-scroll min-w-72 space-y-3 2xl:space-y-6 overflow-x-hidden p-3 2xl:p-6 border-l border-[var(--bg-ter)]">
        <OnlineFriends />
        <PendingRequestsSection
          myRooms={myRooms}
          onRequestHandled={handleRequestHandled}
        />
      </aside>
    </div>
  );
}
export default Session;
