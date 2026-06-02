/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { FAQItem } from '../types';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      question: 'How does the free username availability checker work?',
      answer: 'BrandClaim queries the public availability profiles and servers of 12+ social networks and checks domain extension DNS registries in real time. We execute these network checks concurrently via our high-speed secure server, circumventing browser restrictions so you get true statuses instantly.',
    },
    {
      question: 'Is it completely safe to check brands or usernames here?',
      answer: "Absolutely. Unlike traditional squatting registries, BrandClaim has a strict, zero-logging and zero-squatting privacy policy. We do not register your searched handles, nor do we sell search logs to domain brokers. Your searches are 100% private and confidential.",
    },
    {
      question: 'Why do some platforms display "Review Required"?',
      answer: 'Extremely protected platforms like LinkedIn, Instagram, and TikTok aggressively rate-limit or redirect automated server-side requests through login walls. Simply click on the linked profile card to manually confirm if the original page is active or blank.',
    },
    {
      question: 'Can I check custom domain name extensions like .io or .co?',
      answer: 'Yes! We support five of the most valuable top-level domain extensions (.com, .net, .org, .co, and .io). The checker runs live DNS resolution tests and offers rapid direct affiliate links to secure and register your domains immediately via Namecheap and GoDaddy.',
    },
    {
      question: 'How does the Gemini AI brand suggestion engine build alternatives?',
      answer: 'When your exact handle is taken, BrandClaim feeds your desired name, related business industry, and key branding descriptors to Gemini 3.5 AI. The model parses synonyms, phonetic blends, and industry-standard suffixes to generate over 20 creative, available brand alternatives with distinct explanations of their market appeal.',
    },
    {
      question: 'How do I claim a username once I find it is available?',
      answer: 'Simply click on the platform card badge or use the affiliate links to proceed. We highly recommend immediately creating a basic profile on all 12 key visual and developer networks to prevent secondary registration.',
    },
    {
      question: 'What are the premium features available in BrandClaim Pro?',
      answer: 'BrandClaim Premium releases unlimited bulk checking, unlocks an extra 40 niche social networks, offers API endpoint credentials for developers, and delivers automated real-time alerts whenever a previously taken name becomes free.',
    },
    {
      question: 'Why is securing a unified handle across social networks important?',
      answer: 'A unified digital footprint enhances your search engine ranking, establishes professional credibility, and protects searchers from landing on duplicate profiles. Brand consolidation reduces brand dilution and ensures influencers, customers, and readers easily locate your genuine channels.',
    },
    {
      question: 'What characters and lengths are validated on usernames?',
      answer: 'Each framework uses specific regex checks fitting the native system. For example, GitHub allows up to 39 characters with single hyphens, while X allows up to 15 alphanumeric characters. Invalid characters are filtered out before sending network validation requests.',
    },
    {
      question: 'Do you charge transaction fees for domain registration?',
      answer: 'Zero. We provide direct integration buttons supporting major official registrars. If you choose to register a domain using our links, we may receive a small affiliate commission at absolutely no additional cost to you, which funds our server hosting.',
    },
  ];

  return (
    <section id="faq" className="py-20 border-t border-gray-900 bg-neutral-950/70">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-950/40 border border-blue-900/50 rounded-full text-xs text-blue-400 font-mono mb-4">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>SEO Reference Directory</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-sans font-medium tracking-tight text-white mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-400 text-sm max-w-xl mx-auto">
            Everything you need to know about locking down social media handles, claiming domain names, and preserving your visual identity.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="bg-neutral-900/40 border border-gray-900 rounded-xl overflow-hidden transition-colors duration-200 hover:border-gray-800"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between p-5 text-left text-white select-none gap-4"
                  id={`faq-btn-${index}`}
                >
                  <span className="font-medium text-sm sm:text-base leading-tight">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-500 shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 text-blue-400' : ''
                    }`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                    >
                      <div className="px-5 pb-5 pt-1 text-gray-400 text-xs sm:text-sm leading-relaxed border-t border-gray-950 bg-neutral-950/30">
                        {faq.answer.trim()}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
