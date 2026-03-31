import { motion, AnimatePresence } from "framer-motion";
import { Outlet, useLocation } from "react-router-dom";

const containerVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

const formVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.3 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

export default function AuthLayout() {
  const location = useLocation();

  return (
    <div className="flex justify-center items-center min-h-screen w-full bg-[#fafafa] dark:bg-[#1a1a1a] p-6 text-[#262626] dark:text-[#eff2f6]">
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="w-full max-w-[400px] p-8 bg-white dark:bg-[#282828] rounded-lg shadow-sm border border-[#eeeeee] dark:border-[#333333]"
      >
        <div className="flex flex-col items-center w-full mb-8">
          <img src="/Logo.svg" alt="Logo" className="size-12 mb-2" />
          <h3 className="font-bold text-2xl tracking-tight">Studia</h3>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            variants={formVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
