"use client";

import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How does Gigmint work?",
    answer:
      "Gigmint connects clients with verified freelancers. Clients post projects, freelancers submit proposals, and once both parties agree, work begins with secure escrow payments protecting both sides.",
  },
  {
    question: "What are the fees?",
    answer:
      "Gigmint charges a 5% service fee to freelancers and a 3% processing fee to clients. There are no hidden charges, and premium features are available for power users.",
  },
  {
    question: "How are freelancers verified?",
    answer:
      "Every freelancer goes through a multi-step verification process including identity verification, skills assessment, and portfolio review. Top-rated freelancers receive a Verified badge.",
  },
  {
    question: "How do payments work?",
    answer:
      "Payments are held in escrow until work is approved. Clients can set milestone-based payments for larger projects. We support all major payment methods and process payouts weekly.",
  },
  {
    question: "Can I switch between client and freelancer?",
    answer:
      "Yes! You can switch your role at any time from your account settings. Many users are both clients and freelancers on the platform.",
  },
  {
    question: "What happens if I'm not satisfied?",
    answer:
      "We have a dispute resolution system. If you're not satisfied with the work, you can request revisions or open a dispute. Our mediation team ensures fair outcomes for both parties.",
  },
];

export function FAQ() {
  return (
    <section className="py-24 relative">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Everything you need to know about Gigmint
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border border-border rounded-xl px-6 bg-secondary/50"
              >
                <AccordionTrigger className="text-left hover:no-underline py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
