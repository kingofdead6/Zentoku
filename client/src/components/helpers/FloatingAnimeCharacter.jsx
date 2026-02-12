import { motion, useAnimation } from "framer-motion";
import { useEffect, useState } from "react";
import Anime from "../../assets/gifmiku1-ezgif.com-gif-maker.gif";
import Anime2 from "../../assets/download-ezgif.com-gif-maker.gif";

export default function FloatingAnimeCharacter() {
  const controls1 = useAnimation();
  const controls2 = useAnimation();

  const [direction1, setDirection1] = useState(1);
  const [direction2, setDirection2] = useState(1);

  useEffect(() => {
    const moveCharacter = (controls, direction, setDirection) => {
      const screenWidth = window.innerWidth;
      const distance = screenWidth - 120; 

      controls.start({
        x: direction === 1 ? distance : 0,
        transition: {
          duration: 20,
          ease: "linear",
        },
      }).then(() => {
        setDirection(direction * -1);
      });
    };

    moveCharacter(controls1, direction1, setDirection1);
  }, [direction1]);

  useEffect(() => {
    const moveCharacter = (controls, direction, setDirection) => {
      const screenWidth = window.innerWidth;
      const distance = screenWidth - 120; 

      controls.start({
        x: direction === 1 ? distance : 0,
        transition: {
          duration: 20,
          ease: "linear",
        },
      }).then(() => {
        setDirection(direction * -1);
      });
    };

    moveCharacter(controls2, direction2, setDirection2);
  }, [direction2]);

  return (
    <>
      {/* Character 1 */}
      <motion.img
        src={Anime}
        alt="anime character"
        animate={controls1}
        initial={{ x: 0 }}
        className="fixed bottom-0 w-24 pointer-events-none z-150"
      />

      {/* Character 2 */}
      <motion.img
        src={Anime2}
        alt="anime character 2"
        animate={controls2}
        initial={{ x: window.innerWidth - 120 }}
        className="fixed bottom-0 w-20 pointer-events-none z-150 "
      />
    </>
  );
}
