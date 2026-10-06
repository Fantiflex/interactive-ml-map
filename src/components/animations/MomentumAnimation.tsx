import { motion } from "motion/react";

export default function MomentumDemo() {
  return (
    <div className="w-full py-8">
      <p className="mb-6 text-sm text-gray-500">
        Drag the ball quickly and release it.
      </p>

      <div className="relative h-24 w-full overflow-hidden border-b border-gray-300">
        <motion.div
          drag="x"
          dragConstraints={{
            left: 0,
            right: 400,
          }}
          dragMomentum={true}
          dragElastic={0}
          whileDrag={{
            scale: 1.1,
          }}
          className="absolute bottom-4 left-0 h-12 w-12 cursor-grab rounded-full bg-black active:cursor-grabbing"
        />
      </div>
    </div>
  );
}