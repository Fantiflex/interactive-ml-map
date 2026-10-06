import { motion } from "motion/react";
import { useRef } from "react";

export default function MomentumDemo() {
  const noMomentumTrack = useRef<HTMLDivElement>(null);
  const momentumTrack = useRef<HTMLDivElement>(null);

  return (
    <div className="space-y-10 py-8">
      <div>
        <h3 className="text-lg font-semibold">
          What does momentum do?
        </h3>

        <p className="mt-2 text-sm text-gray-500">
          Give both objects a quick push and release them.
        </p>
      </div>

      {/* WITHOUT MOMENTUM */}

      <div>
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-medium">
            Without momentum
          </span>

          <span className="text-xs text-gray-400">
            stops when released
          </span>
        </div>

        <div
          ref={noMomentumTrack}
          className="relative h-20 overflow-hidden border-b border-gray-300"
        >
          <motion.div
            drag="x"
            dragConstraints={noMomentumTrack}
            dragElastic={0}
            dragMomentum={false}
            whileDrag={{
              scale: 1.1,
            }}
            className="
              absolute
              bottom-3
              left-0
              h-10
              w-10
              cursor-grab
              rounded-full
              border-2
              border-black
              bg-white
            "
          />
        </div>
      </div>

      {/* WITH MOMENTUM */}

      <div>
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-medium">
            With momentum
          </span>

          <span className="text-xs text-gray-400">
            keeps moving
          </span>
        </div>

        <div
          ref={momentumTrack}
          className="relative h-20 overflow-hidden border-b border-gray-300"
        >
          <motion.div
            drag="x"
            dragConstraints={momentumTrack}
            dragElastic={0}
            dragMomentum={true}
            dragTransition={{
              power: 0.8,
              timeConstant: 700,
            }}
            whileDrag={{
              scale: 1.1,
            }}
            className="
              absolute
              bottom-3
              left-0
              h-10
              w-10
              cursor-grab
              rounded-full
              bg-black
            "
          />
        </div>
      </div>
    </div>
  );
}