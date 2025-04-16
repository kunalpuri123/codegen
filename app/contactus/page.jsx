"use client";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/button";

const faqItems = [
  {
    question: "What is Codegen AI+?",
    answer:
      "Codegen AI+ is an all-in-one AI interview prep platform offering voice-based mock interviews, live feedback, and smart coding assistance.",
  },
  {
    question: "How does real-time analysis work?",
    answer:
      "During mock interviews, your audio and webcam are analyzed to evaluate fluency, posture, confidence, and grammar in real time.",
  },
  {
    question: "Can I generate coding solutions using Codegen AI+?",
    answer:
      "Yes! Enter any coding problem and Codegen AI+ will provide brute force, better, and optimal solutions with clear explanations and visual guides.",
  },
  {
    question: "What topics are covered in the learning roadmap?",
    answer:
      "We offer structured learning for DSA, OS, DBMS, CN, and System Design with curated notes, visuals, and MCQs.",
  },
  {
    question: "Can I receive follow-up questions during interviews?",
    answer:
      "Yes, our AI simulates real interviews by asking smart counter-questions based on your responses.",
  },
  {
    question: "Is this suitable for freshers?",
    answer:
      "Absolutely! Whether you're preparing for your first job or upskilling, Codegen AI+ adapts to your level.",
  },
  {
    question: "How do I get support or report a bug?",
    answer:
      "You can contact us directly on WhatsApp using the button below or reach out via email.",
  },
];

export default function FaqPage() {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleAccordion = (index) => {
    setActiveIndex(index === activeIndex ? null : index);
  };

  return (
    <section className="py-32 bg-black text-white">
      <div className="container space-y-16">
        <div className="mx-auto flex max-w-3xl flex-col text-left md:text-center">
          <h2 className="mb-3 text-3xl font-semibold md:mb-4 lg:mb-6 lg:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-400 lg:text-lg">
            Learn more about how Codegen AI+ works and how it can level up your interview preparation journey.
          </p>
        </div>

        <div className="mx-auto w-full lg:max-w-3xl space-y-4">
          {faqItems.map((item, index) => (
            <div
              key={index}
              className="border border-gray-700 rounded-lg p-4 transition-all duration-300 bg-gray-900"
            >
              <button
                className="flex justify-between items-center w-full font-medium text-left text-lg text-white"
                onClick={() => toggleAccordion(index)}
              >
                {item.question}
                <span className="text-xl">{activeIndex === index ? "−" : "+"}</span>
              </button>
              {activeIndex === index && (
                <div className="mt-2 text-gray-400">{item.answer}</div>
              )}
            </div>
          ))}
        </div>

       <div className="mx-auto flex max-w-4xl flex-col items-center rounded-lg bg-gray-800 p-4 text-center md:rounded-xl md:p-6 lg:p-8">
          {/* Single Centered Avatar */}
          <div className="mb-6 flex justify-center">
            <Avatar className="size-24 border-2 border-white shadow-lg">
              <AvatarImage src="https://shadcnblocks.com/images/block/avatar-1.webp" />
              <AvatarFallback>AI</AvatarFallback>
            </Avatar>
          </div>


          <h3 className="mb-2 max-w-3xl font-semibold lg:text-lg">
            Still have questions?
          </h3>
          <p className="mb-8 max-w-3xl text-gray-400 lg:text-lg">
            Can’t find the answer you’re looking for? Our support team is here to help on WhatsApp.
          </p>

          <div className="flex w-full flex-col justify-center gap-2 sm:flex-row">
            <Button className="w-full sm:w-auto bg-green-600 hover:bg-green-700" asChild>
              <a
                href="https://wa.me/919284690148"
                target="_blank"
                rel="noopener noreferrer"
              >
                Message on WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
