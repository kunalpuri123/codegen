import React from "react";
import Navbar from "@/components/ui/Navbar";
import { AnimatedText } from "../book/_components/AnimatedText";

const Aboutus = () => {
  return (
    <>

      <AnimatedText 
        text="About Us" 
        textClassName="text-[4rem] md:text-[6rem] font-bold text-white"
      />
      <div className="max-w-5xl mx-auto px-8 mt-6">
        <p className="text-white text-lg leading-relaxed">
          <span className="font-semibold">Codegen AI+</span> is an advanced, all-in-one AI-based interview preparation platform that empowers students and professionals to confidently tackle technical interviews. Built with cutting-edge technology, it brings together the power of artificial intelligence, code generation, real-time analysis, and structured learning into a single seamless experience.
          <br /><br />
          Our platform offers <span className="font-semibold">real-time mock interviews</span> with voice-based interaction, intelligent follow-up questions, and AI-generated feedback. During each session, the system evaluates your <span className="font-semibold">communication skills, body posture, confidence level, fluency, and grammar</span> using live webcam and audio analysis. This gives you a realistic simulation of actual interviews while helping you improve in key areas with personalized suggestions.
          <br /><br />
          At the heart of our platform is the powerful <span className="font-semibold">Codegen AI</span>, which allows users to input any coding problem statement and receive a <span className="font-semibold">step-by-step breakdown</span> of brute force, better, and optimal solutions. Not just that, it also provides <span className="font-semibold">detailed explanations, notes, visual guides</span>, and even practice questions related to the topic — just like having your personal AI coding mentor.
          <br /><br />
          For long-term learning, we’ve integrated expertly curated <span className="font-semibold">core subject roadmaps</span> that guide learners through topics like Data Structures, Algorithms, Operating Systems, DBMS, and more. Each roadmap is tailored to help you master interview-relevant concepts with clarity and confidence.
          <br /><br />
          Whether you're preparing for your first job, switching careers, or aiming for top tech companies, <span className="font-semibold">Codegen AI+</span> is your intelligent companion in the journey. With a perfect blend of AI precision and human-like interaction, we’re redefining how technical interview preparation should feel — smarter, sharper, and more personal.
        </p>
      </div>
    </>
  );
};

export default Aboutus;
