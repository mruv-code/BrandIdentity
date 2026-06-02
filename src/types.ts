/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PlatformResult {
  platform: string;
  available: boolean | 'unknown';
  profileUrl: string;
  registerUrl?: string;
  error: string | null;
}

export interface DomainResult {
  tld: string;
  domain: string;
  available: boolean | 'unknown';
  registerUrl: string;
}

export interface SuggestionResult {
  username: string;
  reason?: string;
  available?: boolean | 'unknown';
}

export interface BlogArticle {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  readTime: string;
  date: string;
  author: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface SearchAnalytics {
  query: string;
  timestamp: string;
  platformsAvailableCount: number;
  domainsAvailableCount: number;
}
