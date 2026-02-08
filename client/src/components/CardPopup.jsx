import { motion, AnimatePresence } from "framer-motion";

export default function CardPopup({
  item,
  isOpen,
  onClose,
  onAddFavorite,
  onAddWatchLater,
}) {
  if (!item) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-zinc-900 w-11/12 md:w-3/4 lg:w-2/3 h-3/4 rounded-2xl overflow-hidden flex flex-col md:flex-row relative shadow-2xl"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
          >
            {/* IMAGE */}
            <div className="md:w-1/2 w-full h-64 md:h-auto">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* INFO */}
            <div className="md:w-1/2 w-full p-6 flex flex-col justify-between">
              <div className="overflow-y-auto max-h-full">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  {item.title}
                </h2>

                {/* META */}
                <div className="text-zinc-400 mb-4 flex flex-wrap items-center gap-2">
                  {item.year && <span>{item.year}</span>}
                  {item.count && (
                    <span>
                      {item.count}{" "}
                      {item.type === "anime"
                        ? "eps"
                        : item.type === "manga"
                        ? "ch"
                        : ""}
                    </span>
                  )}
                  {item.genres?.map((g) => (
                    <span
                      key={g}
                      className="bg-white/10 px-2 py-0.5 rounded text-xs"
                    >
                      {g}
                    </span>
                  ))}
                </div>

                {/* SCORE */}
                {item.score && (
                  <div className="inline-block bg-emerald-500 text-white text-sm font-bold px-3 py-1 rounded-full mb-4">
                    {item.score}%
                  </div>
                )}

                {/* DESCRIPTION */}
                {item.description && (
                  <p className="text-zinc-300 text-sm md:text-base whitespace-pre-line">
                    {item.description}
                  </p>
                )}
              </div>

              {/* BUTTONS */}
              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => onAddFavorite(item)}
                  className="flex-1 py-2 px-4 rounded-lg bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition"
                >
                  Add to Favorites
                </button>
                <button
                  onClick={() => onAddWatchLater(item)}
                  className="flex-1 py-2 px-4 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 transition"
                >
                  Watch Later
                </button>
              </div>
            </div>

            {/* CLOSE BUTTON */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white text-xl font-bold hover:text-red-500 transition"
            >
              ×
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
