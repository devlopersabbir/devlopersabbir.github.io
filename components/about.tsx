"use client";

import React from "react";
import SectionHeading from "./section-heading";
import { motion } from "framer-motion";
import { useSectionInView } from "@/lib/hooks";

export default function About() {
  const { ref } = useSectionInView("About");

  return (
    <motion.section
      ref={ref}
      className="mb-28 max-w-[45rem] text-center leading-8 sm:mb-40 scroll-mt-28"
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.175 }}
      id="about"
    >
      <SectionHeading>About me</SectionHeading>
      <p className="mb-3">
        Hi, this is Sabbir—a senior developer specializing in ReactJs, NodeJs,
        React-native, ElectronJs, NextJs, and Spring boot. I have been
        developing full-stack applications for more than 4 years. I am an expert
        in JavaScript because I love it so much.😍
      </p>

      <p>
        My core strengths include snappily learning new technologies, working
        singly or as part of a squad, and communicating effectively with
        specialized and non-technical people. I'm also proficient at
        troubleshooting bugs and chancing results to complex problems. Also, I'm
        a YouTube video creator. I publish tech / programming-related content on
        my YouTube channel{" "}
        <a
          href="https://youtube.com/c/stsabbir"
          target="_blank"
          className="italic font-bold"
        >
          "ST Sabbir"
        </a>{" "}
        to more than 400 subscribers.
      </p>
    </motion.section>
  );
}
