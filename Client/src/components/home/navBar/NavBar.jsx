import { useState, useEffect } from "react";
import { LayoutDashboard, Radio, MessageCircle, StickyNote, Users, Settings, LogIn } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import AiChatbot from "./AiChatbot";
import OnlineUsers from "./OnlineUsers.jsx";
import Calculator from "./Calculator.jsx";
import { useUserStore } from "@/stores/userStore.js";
import NotificationIndicator from "../../NotificationIndicator";
import { useToast } from "@/contexts/ToastContext";

function NavBar() {
  const { toast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [, setSelectedId] = useState(""); // for AI, do not remove
  const { user, isBasicInfoComplete, isEduSkillsComplete } = useUserStore();
  const location = useLocation();

  const isProfileIncomplete = user
    ? !isBasicInfoComplete() || !isEduSkillsComplete()
    : true;

  useEffect(() => {
    setIsLoggedIn(!!user);
  }, [user]);

  const handleDisabledClick = (e) => {
    if (!isLoggedIn) {
      e.preventDefault();
      toast.info(
        "You are not logged in. To access your profile, make friends, join session rooms, view your stats, and more, please log in to your account."
      );
    }
  };

  const navLinks = [
    { to: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
    { to: "/session", label: "Session", Icon: Radio },
    { to: "/chat", label: "Chat", Icon: MessageCircle },
    { to: "/notes", label: "Notes", Icon: StickyNote },
    { to: "/friends", label: "Friends", Icon: Users, hasNotification: true },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-primary border-b border-[var(--border)] z-50 flex items-center px-4 md:px-8">
      <div className="flex items-center gap-8 w-full max-w-7xl mx-auto">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img src="/Logo.svg" alt="Studia" className="h-8 w-8 logo-filter" />
          <span className="font-bold text-xl hidden md:block">Studia</span>
        </Link>

        <nav className="flex items-center gap-1 md:gap-4 flex-1">
          {navLinks.map(({ to, label, Icon, hasNotification }) => (
            <Link
              key={to}
              to={isLoggedIn ? to : "#"}
              onClick={handleDisabledClick}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors relative group ${
                location.pathname.startsWith(to)
                  ? "bg-active-red txt-red"
                  : "txt-dim hover:bg-hover-red hover:txt-red"
              } ${!isLoggedIn ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <Icon className="size-5" />
              <span className="text-sm font-medium hidden lg:block">{label}</span>
              {hasNotification && label === "Friends" && isLoggedIn && (
                <span className="absolute top-2 right-2">
                  <NotificationIndicator size={2} visibility={false} />
                </span>
              )}
              {isLoggedIn && location.pathname.startsWith(to) && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--btn)]" />
              )}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          {isLoggedIn && (
            <>
              <OnlineUsers />
              <AiChatbot onShowId={setSelectedId} />
              <Calculator />
            </>
          )}
          
          <div className="h-6 w-px bg-[var(--border)] mx-1" />
          
          {isLoggedIn ? (
            <Link
              to="/settings"
              className={`p-2 rounded-lg transition-colors relative ${
                location.pathname === "/settings" ? "bg-active-red txt-red" : "txt-dim hover:bg-hover-red hover:txt-red"
              }`}
            >
              <Settings className="size-5" />
              {isProfileIncomplete && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full border-2 border-primary" />
              )}
            </Link>
          ) : (
            <>
              <button
                onClick={handleDisabledClick}
                className="p-2 rounded-lg transition-colors relative txt-dim hover:bg-hover-red hover:txt-red opacity-50 cursor-not-allowed"
              >
                <Settings className="size-5" />
              </button>
              <Link
                className="bg-[var(--btn)] hover:bg-[var(--btn-hover)] text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
                to="/auth/login"
              >
                <LogIn className="w-4 h-4" />
                Login
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default NavBar;
