import { Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import NavBar from "./home/navBar/NavBar";
import UseSocketContext from "@/contexts/SocketContext.jsx";

function Layout() {
  const location = useLocation();
  UseSocketContext();
  
  return (
    <div className="flex flex-col min-h-screen bg-primary txt !transition-colors !duration-500">
      <NavBar />

      <main className="flex-1 mt-16 overflow-x-hidden">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="w-full h-full"
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
}

export default Layout;
