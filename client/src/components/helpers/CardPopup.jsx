import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext"; // adjust path if needed
import axios from "axios";
import { NODE_API } from "../../../api"; // your api config file
import { useState } from "react";

export default function CardPopup({
  item,
  isOpen,
  onClose,
}) {
  const { user, isAuthenticated } = useAuth();
  const [isAddingFav, setIsAddingFav] = useState(false);
  const [isAddingWatch, setIsAddingWatch] = useState(false);
  const [message, setMessage] = useState(null);

  if (!item) return null;

  const handleAddToFavorites = async () => {
    if (!isAuthenticated) {
      setMessage("Please login to add to favorites");
      return;
    }

    setIsAddingFav(true);
    setMessage(null);

    try {
      const response = await axios.post(
        `${NODE_API}/list/wishlist`,
        {
          mediaId: item.id,
          mediaType: item.type,
        },
        {
          headers: { "x-user-id": user.userId },
        }
      );

      if (response.data.message?.includes("Already")) {
        setMessage("Already in your favorites!");
      } else {
        setMessage("Added to favorites!");
      }
    } catch (error) {
      setMessage("Failed to add to favorites");
      console.error(error);
    } finally {
      setIsAddingFav(false);
    }
  };

  const handleAddToWatchLater = async () => {
    if (!isAuthenticated) {
      setMessage("Please login to add to watch later");
      return;
    }

    setIsAddingWatch(true);
    setMessage(null);

    try {
      const response = await axios.post(
        `${NODE_API}/list/watched`,
        {
          mediaId: item.id,
          mediaType: item.type,
        },
        {
          headers: { "x-user-id": user.userId },
        }
      );

      if (response.data.message?.includes("Already")) {
        setMessage("Already in your watch list!");
      } else {
        setMessage("Added to watch later!");
      }
    } catch (error) {
      setMessage("Failed to add to watch later");
      console.error(error);
    } finally {
      setIsAddingWatch(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-zinc-900 w-11/12 md:w-3/4 lg:w-2/3 xl:w-3/5 h-[85vh] md:h-4/5 rounded-2xl overflow-hidden flex flex-col md:flex-row relative shadow-2xl border border-zinc-700"
            initial={{ y: 60, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 60, opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* LEFT - IMAGE */}
            <div className="md:w-2/5 w-full h-80 md:h-auto relative">
              <img
                src={item.image || "https://via.placeholder.com/400x600?text=No+Image"}
                alt={item.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/400x600?text=No+Image";
                }}
              />
            </div>

            {/* RIGHT - INFO */}
            <div className="md:w-3/5 w-full p-6 md:p-8 flex flex-col">
              {/* Header & Meta */}
              <div className="flex-1 overflow-y-auto">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                  {item.title}
                </h2>

                <div className="flex flex-wrap items-center gap-3 text-zinc-400 mb-5 text-sm md:text-base">
                  {item.year && <span>{item.year}</span>}
                  {item.count && (
                    <span>
                      {item.count}{" "}
                      {item.type === "anime"
                        ? "episodes"
                        : item.type === "manga" || item.type === "manhwa"
                        ? "chapters"
                        : item.type === "book"
                        ? "pages"
                        : ""}
                    </span>
                  )}
                  {item.genres?.slice(0, 5).map((g) => (
                    <span
                      key={g}
                      className="bg-zinc-800 px-2.5 py-1 rounded-full text-xs"
                    >
                      {g}
                    </span>
                  ))}
                </div>

                {item.score && (
                  <div className="inline-flex items-center bg-emerald-600/20 text-emerald-400 px-4 py-1.5 rounded-full mb-6">
                    <span className="font-bold mr-1.5">{item.score}</span>
                    <span className="text-xs opacity-90">/10</span>
                  </div>
                )}

                {item.description && (
                  <p className="text-zinc-300 leading-relaxed text-sm md:text-base whitespace-pre-line">
                    {item.description}
                  </p>
                )}
              </div>

              {/* Feedback message */}
              {message && (
                <div className="mt-4 p-3 bg-zinc-800 rounded-lg text-center text-sm text-emerald-400">
                  {message}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <button
                  onClick={handleAddToFavorites}
                  disabled={isAddingFav}
                  className={`flex-1 py-3 px-5 rounded-xl font-semibold transition-all ${
                    isAddingFav
                      ? "bg-emerald-700/50 cursor-wait"
                      : "bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700"
                  } text-white shadow-lg shadow-emerald-900/30`}
                >
                  {isAddingFav ? "Adding..." : "Add to Favorites"}
                </button>

                <button
                  onClick={handleAddToWatchLater}
                  disabled={isAddingWatch}
                  className={`flex-1 py-3 px-5 rounded-xl font-semibold transition-all ${
                    isAddingWatch
                      ? "bg-blue-700/50 cursor-wait"
                      : "bg-blue-600 hover:bg-blue-500 active:bg-blue-700"
                  } text-white shadow-lg shadow-blue-900/30`}
                >
                  {isAddingWatch ? "Adding..." : "Add to Watch Later"}
                </button>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-2xl text-zinc-400 hover:text-white transition-colors bg-zinc-800/70 hover:bg-zinc-700 p-2 rounded-full"
              aria-label="Close"
            >
              ✕
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}