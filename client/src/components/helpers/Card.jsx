import { useState } from "react";
import { motion } from "framer-motion";
import CardPopup from "./CardPopup";

export default function Card({ item }) {
  const [popupOpen, setPopupOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <>
      <motion.div
        className="group relative overflow-hidden rounded-xl  backdrop-blur-sm shadow-lg hover:shadow-2xl cursor-pointer   transition-all duration-300"
        onClick={() => setPopupOpen(true)}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{ y: -8, scale: 1.02 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* IMAGE CONTAINER */}
        <div className="relative aspect-[2/3] overflow-hidden">
          <motion.img
            src={item.image || "https://via.placeholder.com/300x450?text=No+Image"}
            alt={item.title}
            className="w-full h-full object-cover"
            animate={{ scale: isHovered ? 1.1 : 1 }}
            transition={{ duration: 0.4 }}
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/300x450?text=No+Image";
            }}
          />
          

          {/* DARK OVERLAY ON HOVER */}
          <motion.div
            className="absolute inset-0  bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          />

          {/* SCORE BADGE */}
          {item.score > 0 && (
            <motion.div
              className="absolute bottom-3 right-3 bg-gradient-to-br from-emerald-500 to-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              ★ {item.score}
            </motion.div>
          )}

          {/* TYPE BADGE */}
          <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-white/20">
            {item.type.toUpperCase()}
          </div>
        </div>

        {/* INFO SECTION */}
        <div className="p-4 ">
          <h3 className="font-semibold text-base text-gray-400 line-clamp-2 mb-2 group-hover:text-green-400 transition-colors duration-300">
            {item.title}
          </h3>
<div className="flex flex-wrap items-center gap-2 text-zinc-400 text-xs">
            {item.year && (
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                {item.year}
              </span>
            )}
            
            {item.count && (
              <span className="flex items-center gap-1 bg-zinc-800/80 px-2 py-1 rounded-md">
                {item.type === "anime" && (
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                  </svg>
                )}
                {item.count}{" "}
                {item.type === "anime"
                  ? "eps"
                  : item.type === "manga" || item.type === "manhwa"
                  ? "ch"
                  : item.type === "show"
                  ? "eps"
                  : ""}
              </span>
            )}
          </div>
        
        </div>

        {/* HOVER INDICATOR */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 via-emerald-500 to-green-500"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>

      {/* POPUP */}
      <CardPopup
        item={item}
        isOpen={popupOpen}
        onClose={() => setPopupOpen(false)}
      />
    </>
  );
}