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
              className="absolute top-3 right-3 bg-gradient-to-br from-emerald-500 to-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm"
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
          <h3 className="font-bold text-base text-white line-clamp-2 mb-2 group-hover:text-green-400 transition-colors duration-300">
            {item.title}
          </h3>

        
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