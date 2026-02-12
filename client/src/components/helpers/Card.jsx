import { useState } from "react";
import { motion } from "framer-motion";
import CardPopup from "./CardPopup";

export default function Card({ item }) {
  const [popupOpen, setPopupOpen] = useState(false);

  const handleAddFavorite = (item) => {
    console.log("Add to Favorites:", item.title);
  };

  const handleAddWatchLater = (item) => {
    console.log("Watch Later:", item.title);
  };

  return (
    <>
      <motion.div
        className="card group relative overflow-hidden rounded-2xl bg-zinc-900 shadow-md hover:shadow-2xl cursor-pointer"
        onClick={() => setPopupOpen(true)}
      >
        {/* IMAGE */}
        <motion.img
          src={item.image}
          alt={item.title}
          className="w-full h-80 object-cover"
        />

        {/* OVERLAY */}
        <motion.div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4">
          <div className="font-bold text-lg text-white line-clamp-2">
            {item.title}
          </div>

          <div className="text-zinc-400 text-sm mt-1 flex flex-wrap items-center gap-2">
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
            {item.genres?.slice(0, 2).map((g) => (
              <span
                key={g}
                className="bg-white/10 px-2 py-0.5 rounded text-xs"
              >
                {g}
              </span>
            ))}
          </div>
        </motion.div>

        {/* SCORE */}
        {item.score && (
          <motion.div className="absolute top-3 right-3 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">
            {item.score}%
          </motion.div>
        )}
      </motion.div>

      {/* POPUP */}
      <CardPopup
        item={item}
        isOpen={popupOpen}
        onClose={() => setPopupOpen(false)}
        onAddFavorite={handleAddFavorite}
        onAddWatchLater={handleAddWatchLater}
      />
    </>
  );
}
