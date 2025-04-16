"use client";
import React, { useEffect, useRef, useState } from "react";
import { useScroll, useTransform, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

const HeroScrollDemo = () => {
  return (
    <div className="flex flex-col items-center justify-center bg-black text-white">
      <ContainerScroll
        titleComponent={
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-center"
          >
            <h1 className="text-3xl md:text-5xl font-semibold mb-4">
              Unleash the power of <br />
              <span className="text-5xl md:text-7xl font-bold leading-tight text-white">
                CodeGenAI
              </span>
            </h1>
            <p className="text-gray-300 mt-4">
              Solve Codeing Problems in minutes.
            </p>
          </motion.div>
        }
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1 }}
          className="h-full"
        >
         <Image
  src="/hero.png"
  alt="hero"
  width={1200}
  height={600}
  className="mx-auto rounded-2xl object-cover h-full object-top"
  draggable={false}
/>

        </motion.div>
      </ContainerScroll>

      <motion.div
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="mt-10 mb-20"
      >
        <Link
          href="/codegenai"
          className="px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition"
        >
          Explore CodeGen AI
        </Link>
      </motion.div>
    </div>
  );
};

const ContainerScroll = ({ titleComponent, children }) => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const rotate = useTransform(scrollYProgress, [0, 1], [25, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], isMobile ? [0.9, 1] : [1.1, 0.95]);
  const translateY = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const shadow = useTransform(
    scrollYProgress,
    [0, 1],
    [
      "0 30px 80px rgba(255,255,255,0.1)",
      "0 5px 10px rgba(0,0,0,0.4)",
    ]
  );

  return (
    <div
      className="h-[36rem] md:h-[50rem] w-full flex items-center justify-center px-4 md:px-10"
      ref={containerRef}
    >
      <div className="w-full" style={{ perspective: "1200px" }}>
        <motion.div
          style={{ y: translateY }}
          className="max-w-5xl mx-auto text-center mb-6"
        >
          {titleComponent}
        </motion.div>

        <motion.div
          style={{
            rotateX: rotate,
            scale,
            boxShadow: shadow,
          }}
          className="max-w-5xl mx-auto h-[24rem] md:h-[30rem] w-full border border-gray-600 bg-[#222] p-4 rounded-[28px]"
        >
          <div className="h-full w-full overflow-hidden rounded-2xl bg-gray-100 dark:bg-zinc-900">
            {children}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HeroScrollDemo;
