import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  createManualSession 
} from "@/api/timerApi";
import { 
  X, 
  Plus, 
  AlertCircle,
  Calendar as CalendarIcon,
  Clock,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

const ManualSessionModal = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [hours, setHours] = useState("");

  const createMutation = useMutation({
    mutationFn: createManualSession,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["timer"] });
      queryClient.invalidateQueries({ queryKey: ["manual-sessions"] });
      const message = variables.action === "remove" 
        ? `Removed ${variables.hours} hours` 
        : (parseFloat(variables.hours) === 0 ? "Study hours cleared" : "Study hours logged successfully");
      toast.success(message);
      setHours("");
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || "Failed to process request");
    }
  });

  const handleSubmit = (action = "add") => {
    if (!date || hours === "") return;
    createMutation.mutate({ date, hours: parseFloat(hours), action });
  };

  const today = new Date().toISOString().split("T")[0];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative bg-[var(--bg-sec)] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-white/10"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Clock className="w-5 h-5 text-txt-red" />
              Manual Study Log
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-hover-red hover:text-txt-red rounded-xl transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--txt-dim)] px-1">Date</label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="date"
                    max={today}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-[var(--bg-ter)] border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-red-500 text-white"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--txt-dim)] px-1">Hours</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="24"
                    placeholder="0.0"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    className="w-full bg-[var(--bg-ter)] border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-red-500 text-white"
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-4">
              <Button 
                onClick={() => handleSubmit("add")}
                className="flex-1 rounded-xl py-6 font-semibold"
                disabled={createMutation.isPending}
              >
                <Plus className="w-4 h-4 mr-2" />
                Log Hours
              </Button>
              <Button 
                onClick={() => handleSubmit("remove")}
                variant="destructive"
                className="flex-1 rounded-xl py-6 font-semibold bg-red-500 hover:bg-red-600"
                disabled={createMutation.isPending || hours === "" || parseFloat(hours) === 0}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Remove Hours
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-amber-500/10 p-4 border-t border-amber-500/20">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
            <p className="text-[10px] leading-relaxed text-amber-200/70">
              Manual entries directly impact your rank and streaks. Total study time (auto + manual) is capped at 24 hours per day. To remove hours for a day, log 0 hours.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ManualSessionModal;
