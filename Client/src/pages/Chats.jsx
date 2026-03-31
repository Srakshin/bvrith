import UserList from "../components/chats/userlist";
import ChatWindow from "../components/chats/chatwindow";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { useState } from "react";


const dummyUsers = [
  {
    id: 1,
    name: "Srinivas",
    avatar: null,
    lastMessage: "Hey, are you ready for the session?",
    timestamp: "2 min ago",
    isOnline: true,
    unreadCount: 2,
  },
  {
    id: 2,
    name: "Zubair",
    avatar: null,
    lastMessage: "Could you share the UI notes?",
    timestamp: "15 min ago",
    isOnline: true,
    unreadCount: 0,
  },
  {
    id: 3,
    name: "Dwarak",
    avatar: null,
    lastMessage: "Can you join our meeting?",
    timestamp: "1 hour ago",
    isOnline: false,
    unreadCount: 1,
  },
  {
    id: 4,
    name: "Hemanth",
    avatar: null,
    lastMessage: "Where are the lab keys?",
    timestamp: "3 hours ago",
    isOnline: false,
    unreadCount: 0,
  },
];

function Chats() {
  const [selectedUser, setSelectedUser] = useState(null);

  return (
    <div className="flex h-screen bg-primary">
      <PanelGroup autoSaveId="chat-panel" direction="horizontal">
       
        <Panel minSize={40}>
          <ChatWindow selectedUser={selectedUser} />
        </Panel>

     
        <PanelResizeHandle className="w-[1px] bg-[var(--border)] hover:bg-[var(--txt-disabled)] cursor-col-resize transition-colors" />

    
        <Panel
          minSize={15}
          defaultSize={25}
          maxSize={40}
          className="border-l border-[var(--border)]"
        >
          <UserList
            users={dummyUsers}
            selectedUser={selectedUser}
            onSelectUser={setSelectedUser}
          />
        </Panel>
      </PanelGroup>
    </div>
  );
}

export default Chats;
