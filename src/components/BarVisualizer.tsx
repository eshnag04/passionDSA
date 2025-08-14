import { motion, AnimatePresence } from "framer-motion";

export default function BarsVisualizer({
  items,
  type,
}: {
  items: string[];
  type: "Stack" | "Queue";
}) {
  return (
    <div className="relative h-64 rounded-xl border border-dashed bg-white/70 p-3">
      <div className="absolute left-3 top-2 text-xs text-gray-500">
        {type === "Stack" ? "Top →" : "Front →"}
      </div>
      <div className="absolute right-3 top-2 text-xs text-gray-500">
        size: {items.length}
      </div>
      <div className="h-full flex items-end justify-center gap-2">
        <AnimatePresence initial={false}>
          {items.map((label, i) => (
            <motion.div
              key={label + i}
              initial={{ y: 40, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 40, opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="w-28 rounded-xl border border-amber-300 bg-gradient-to-r from-yellow-200 to-amber-200 px-3 py-2 text-center shadow"
            >
              {label}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
