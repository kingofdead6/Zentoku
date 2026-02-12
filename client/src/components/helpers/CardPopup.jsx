import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { NODE_API } from "../../../api";
import { useState, useEffect } from "react";

export default function CardPopup({ item, isOpen, onClose }) {
  const { user, isAuthenticated } = useAuth();
  const [isAddingFav, setIsAddingFav] = useState(false);
  const [isAddingWatch, setIsAddingWatch] = useState(false);
  const [message, setMessage] = useState(null);
  
  // Track if item is in favorites/watched
  const [isInFavorites, setIsInFavorites] = useState(false);
  const [isInWatched, setIsInWatched] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  if (!item) return null;

  useEffect(() => {
    if (!isOpen || !isAuthenticated || !user?.userId) {
      setCheckingStatus(false);
      return;
    }

    const checkStatus = async () => {
      setCheckingStatus(true);
      try {
        const [favRes, watchRes] = await Promise.all([
          axios.get(`${NODE_API}/list/wishlist`, {
            headers: { "x-user-id": user.userId },
          }),
          axios.get(`${NODE_API}/list/watched`, {
            headers: { "x-user-id": user.userId },
          }),
        ]);

        const wishlist = favRes.data.wishlist || [];
        const watched = watchRes.data.watched || [];

        // Check if current item is in the lists
        const inFav = wishlist.some(
          (listItem) =>
            String(listItem.mediaId) === String(item.id) &&
            listItem.mediaType === item.type
        );

        const inWatch = watched.some(
          (listItem) =>
            String(listItem.mediaId) === String(item.id) &&
            listItem.mediaType === item.type
        );

        setIsInFavorites(inFav);
        setIsInWatched(inWatch);
      } catch (error) {
        console.error("Error checking status:", error);
      } finally {
        setCheckingStatus(false);
      }
    };

    checkStatus();
  }, [isOpen, isAuthenticated, user, item]);

  const handleToggleFavorites = async () => {
    if (!isAuthenticated) {
      setMessage({ type: "error", text: "Please login to add to favorites" });
      return;
    }

    setIsAddingFav(true);
    setMessage(null);

    try {
      if (isInFavorites) {
        // Remove from favorites
        await axios.delete(`${NODE_API}/list/wishlist`, {
          headers: { "x-user-id": user.userId },
          data: {
            mediaId: item.id,
            mediaType: item.type,
          },
        });
        setIsInFavorites(false);
        setMessage({ type: "success", text: "Removed from favorites" });
      } else {
        // Add to favorites
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
          setIsInFavorites(true);
          setMessage({ type: "info", text: "Already in your favorites!" });
        } else {
          setIsInFavorites(true);
          setMessage({ type: "success", text: "Added to favorites! ❤️" });
        }
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to update favorites" });
      console.error(error);
    } finally {
      setIsAddingFav(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleToggleWatched = async () => {
    if (!isAuthenticated) {
      setMessage({ type: "error", text: "Please login to add to watch later" });
      return;
    }

    setIsAddingWatch(true);
    setMessage(null);

    try {
      if (isInWatched) {
        // Remove from watched
        await axios.delete(`${NODE_API}/list/watched`, {
          headers: { "x-user-id": user.userId },
          data: {
            mediaId: item.id,
            mediaType: item.type,
          },
        });
        setIsInWatched(false);
        setMessage({ type: "success", text: "Removed from watched" });
      } else {
        // Add to watched
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
          setIsInWatched(true);
          setMessage({ type: "info", text: "Already in your watch list!" });
        } else {
          setIsInWatched(true);
          setMessage({ type: "success", text: "Added to watched! ✓" });
        }
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to update watched list" });
      console.error(error);
    } finally {
      setIsAddingWatch(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 w-full max-w-5xl max-h-[90vh] h-full rounded-2xl overflow-hidden flex flex-col md:flex-row relative shadow-2xl border border-zinc-700/50"
            initial={{ y: 100, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* LEFT - IMAGE */}
            <div className="md:w-2/5 w-full h-64 md:h-auto relative overflow-hidden">
              <motion.img
                src={item.image || "https://via.placeholder.com/400x600?text=No+Image"}
                alt={item.title}
                className="w-full h-full object-cover"
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/400x600?text=No+Image";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-zinc-900" />
            </div>

            {/* RIGHT - INFO */}
            <div className="md:w-3/5 w-full p-6 md:p-8 flex flex-col relative h-full overflow-hidden">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 text-zinc-400 hover:text-white transition-all bg-zinc-800/80 hover:bg-zinc-700 p-2.5 rounded-full backdrop-blur-sm border border-zinc-700/50 hover:scale-110"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Header & Meta */}
              <div className="flex-1 min-h-0 overflow-y-auto pr-2 custom-scrollbar">
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 pr-12">
                    {item.title}
                  </h2>

                  <div className="flex flex-wrap items-center gap-3 text-zinc-400 mb-5 text-sm">
                    <span className="bg-zinc-800/80 px-3 py-1.5 rounded-lg font-semibold text-green-400 border border-zinc-700/50">
                      {item.type.toUpperCase()}
                    </span>
                    
                    {item.year && (
                      <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        {item.year}
                      </span>
                    )}
                    
                    {item.count && (
                      <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                        </svg>
                        {item.count}{" "}
                        {item.type === "anime"
                          ? "episodes"
                          : item.type === "manga" || item.type === "manhwa"
                          ? "chapters"
                          : item.type === "show"
                          ? "episodes"
                          : ""}
                      </span>
                    )}
                  </div>

                  {/* Genres */}
                  {item.genres && item.genres.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-5">
                      {item.genres.slice(0, 5).map((genre) => (
                        <span
                          key={genre}
                          className="bg-zinc-800/60 border border-zinc-700/50 px-3 py-1.5 rounded-full text-xs text-zinc-300 font-medium hover:bg-zinc-700/60 transition-colors"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Score */}
                  {item.score > 0 && (
                    <div className="inline-flex items-center bg-gradient-to-r from-emerald-600/20 to-green-600/20 border border-emerald-500/30 text-emerald-400 px-5 py-2 rounded-xl mb-6">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="font-bold text-lg mr-1">{item.score}</span>
                      <span className="text-sm opacity-75">/10</span>
                    </div>
                  )}

                  {/* Description */}
                  {item.description && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        Synopsis
                      </h3>
                      <p className="text-zinc-300 leading-relaxed text-sm md:text-base whitespace-pre-line">
                        {item.description}
                      </p>
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Feedback message */}
              <AnimatePresence>
                {message && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`mt-4 p-4 rounded-xl text-center text-sm font-medium border ${
                      message.type === "success"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : message.type === "error"
                        ? "bg-red-500/10 text-red-400 border-red-500/30"
                        : "bg-blue-500/10 text-blue-400 border-blue-500/30"
                    }`}
                  >
                    {message.text}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <motion.button
                  onClick={handleToggleFavorites}
                  disabled={isAddingFav || checkingStatus}
                  whileHover={{ scale: checkingStatus ? 1 : 1.03 }}
                  whileTap={{ scale: checkingStatus ? 1 : 0.97 }}
                  className={`flex-1 py-3.5 px-6 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                    checkingStatus
                      ? "bg-zinc-700/50 cursor-wait"
                      : isAddingFav
                      ? "bg-pink-700/50 cursor-wait"
                      : isInFavorites
                      ? "bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 border-2 border-pink-400/50"
                      : "bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 active:from-pink-700 active:to-rose-700"
                  } text-white shadow-lg shadow-pink-900/40 border border-pink-500/20`}
                >
                  {checkingStatus ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Checking...
                    </>
                  ) : isAddingFav ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      {isInFavorites ? "Removing..." : "Adding..."}
                    </>
                  ) : isInFavorites ? (
                    <>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      In Favorites
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                      </svg>
                      Add to Favorites
                    </>
                  )}
                </motion.button>

                <motion.button
                  onClick={handleToggleWatched}
                  disabled={isAddingWatch || checkingStatus}
                  whileHover={{ scale: checkingStatus ? 1 : 1.03 }}
                  whileTap={{ scale: checkingStatus ? 1 : 0.97 }}
                  className={`flex-1 py-3.5 px-6 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                    checkingStatus
                      ? "bg-zinc-700/50 cursor-wait"
                      : isAddingWatch
                      ? "bg-blue-700/50 cursor-wait"
                      : isInWatched
                      ? "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 border-2 border-cyan-400/50"
                      : "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 active:from-blue-700 active:to-cyan-700"
                  } text-white shadow-lg shadow-blue-900/40 border border-blue-500/20`}
                >
                  {checkingStatus ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Checking...
                    </>
                  ) : isAddingWatch ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      {isInWatched ? "Removing..." : "Adding..."}
                    </>
                  ) : isInWatched ? (
                    <>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      In Watched
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                      Add to Watched
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}