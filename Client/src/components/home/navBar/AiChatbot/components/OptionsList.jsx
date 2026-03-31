import { motion } from "framer-motion";

export const OptionsList = ({ options, step, onOptionSelect }) => (
  <div className="mt-3 space-y-2">
    <div className="grid grid-cols-1 gap-2">
      {options.map((option, index) => (
        <motion.button
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onOptionSelect(option, step)}
          className="w-full px-4 py-3 text-left bg-[var(--bg-ter)] dark:bg-gray-800 border border-[var(--border)] dark:border-gray-700 rounded-xl hover:border-red-500 hover:bg-hover-red hover:text-txt-red transition-all duration-200 text-sm font-medium text-[var(--txt)]"
        >
          {option}
        </motion.button>
      ))}
    </div>
    <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
      Select an option to continue
    </p>
  </div>
);