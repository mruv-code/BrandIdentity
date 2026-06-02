import express from 'express';
import path from 'path';
import fs from 'fs';
import dns from 'dns';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Shared Gemini AI client (lazy-initialized)
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    console.warn('GEMINI_API_KEY is not set or using placeholder, Brand suggestions will use offline backup generators.');
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build-brandsync',
        },
      },
    });
  }
  return aiClient;
}

interface PlatformConfig {
  name: string;
  validate: (u: string) => boolean;
  getUrl: (u: string) => string;
  registerUrl: string;
}

// Validation rules and endpoint configurations
const platforms: Record<string, PlatformConfig> = {
  Instagram: {
    name: 'Instagram',
    validate: (u) => /^[a-z0-9_.-]{1,30}$/i.test(u),
    getUrl: (u) => `https://www.instagram.com/${u}/`,
    registerUrl: 'https://www.instagram.com/accounts/emailsignup/',
  },
  TikTok: {
    name: 'TikTok',
    validate: (u) => /^[a-z0-9_.-]{2,24}$/i.test(u),
    getUrl: (u) => `https://www.tiktok.com/@${u}`,
    registerUrl: 'https://www.tiktok.com/signup',
  },
  X: {
    name: 'X',
    validate: (u) => /^[a-z0-9_]{4,15}$/i.test(u),
    getUrl: (u) => `https://x.com/${u}`,
    registerUrl: 'https://x.com/i/flow/signup',
  },
  YouTube: {
    name: 'YouTube',
    validate: (u) => /^[a-z0-9_.-]{3,30}$/i.test(u),
    getUrl: (u) => `https://www.youtube.com/@${u}`,
    registerUrl: 'https://www.youtube.com/',
  },
  Facebook: {
    name: 'Facebook',
    validate: (u) => /^[a-z0-9.]{5,50}$/i.test(u),
    getUrl: (u) => `https://www.facebook.com/${u}`,
    registerUrl: 'https://www.facebook.com/r.php',
  },
  LinkedIn: {
    name: 'LinkedIn',
    validate: (u) => /^[a-z0-9-]{3,100}$/i.test(u),
    getUrl: (u) => `https://www.linkedin.com/in/${u}/`,
    registerUrl: 'https://www.linkedin.com/signup',
  },
  GitHub: {
    name: 'GitHub',
    validate: (u) => /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i.test(u),
    getUrl: (u) => `https://github.com/${u}`,
    registerUrl: 'https://github.com/signup',
  },
  Reddit: {
    name: 'Reddit',
    validate: (u) => /^[a-z0-9_-]{3,20}$/i.test(u),
    getUrl: (u) => `https://www.reddit.com/user/${u}`,
    registerUrl: 'https://www.reddit.com/register',
  },
  Telegram: {
    name: 'Telegram',
    validate: (u) => /^[a-z0-9_]{5,32}$/i.test(u),
    getUrl: (u) => `https://t.me/${u}`,
    registerUrl: 'https://telegram.org/',
  },
  Twitch: {
    name: 'Twitch',
    validate: (u) => /^[a-z0-9_]{4,25}$/i.test(u),
    getUrl: (u) => `https://www.twitch.tv/${u}`,
    registerUrl: 'https://www.twitch.tv/',
  },
  Pinterest: {
    name: 'Pinterest',
    validate: (u) => /^[a-z0-9_]{3,30}$/i.test(u),
    getUrl: (u) => `https://www.pinterest.com/${u}/`,
    registerUrl: 'https://www.pinterest.com/',
  },
  Medium: {
    name: 'Medium',
    validate: (u) => /^[a-z0-9_.-]{3,30}$/i.test(u),
    getUrl: (u) => `https://medium.com/@${u}`,
    registerUrl: 'https://medium.com/m/signin',
  },
  Snapchat: {
    name: 'Snapchat',
    validate: (u) => /^[a-z0-9._-]{3,15}$/i.test(u),
    getUrl: (u) => `https://www.snapchat.com/add/${u}`,
    registerUrl: 'https://accounts.snapchat.com/',
  },
  Spotify: {
    name: 'Spotify',
    validate: (u) => /^[a-z0-9_.-]{2,30}$/i.test(u),
    getUrl: (u) => `https://open.spotify.com/user/${u}`,
    registerUrl: 'https://www.spotify.com/signup',
  },
  Behance: {
    name: 'Behance',
    validate: (u) => /^[a-z0-9_.-]{3,30}$/i.test(u),
    getUrl: (u) => `https://www.behance.net/${u}`,
    registerUrl: 'https://www.behance.net/signup',
  },
  Dribbble: {
    name: 'Dribbble',
    validate: (u) => /^[a-z0-9_.-]{3,30}$/i.test(u),
    getUrl: (u) => `https://dribbble.com/${u}`,
    registerUrl: 'https://dribbble.com/session/new',
  },
  Patreon: {
    name: 'Patreon',
    validate: (u) => /^[a-z0-9_.-]{3,30}$/i.test(u),
    getUrl: (u) => `https://www.patreon.com/${u}`,
    registerUrl: 'https://www.patreon.com/signup',
  },
  Substack: {
    name: 'Substack',
    validate: (u) => /^[a-z0-9_.-]{2,30}$/i.test(u),
    getUrl: (u) => `https://${u}.substack.com`,
    registerUrl: 'https://substack.com/signup',
  },
  DevTo: {
    name: 'Dev.to',
    validate: (u) => /^[a-z0-9_.-]{2,30}$/i.test(u),
    getUrl: (u) => `https://dev.to/${u}`,
    registerUrl: 'https://dev.to/enter',
  }
};

async function checkPlatform(key: string, username: string) {
  const config = platforms[key];
  if (!config) return null;

  const url = config.getUrl(username);
  const registerUrl = config.registerUrl;

  if (!config.validate(username)) {
    return {
      platform: config.name,
      available: 'unknown',
      profileUrl: url,
      registerUrl,
      error: 'Username does not conform to rules.',
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6500);

  try {
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    clearTimeout(timeout);

    if (response.status === 404) {
      return {
        platform: config.name,
        available: true,
        profileUrl: url,
        registerUrl,
        error: null,
      };
    } else if (response.status === 200) {
      return {
        platform: config.name,
        available: false,
        profileUrl: url,
        registerUrl,
        error: null,
      };
    } else {
      return {
        platform: config.name,
        available: 'unknown',
        profileUrl: url,
        registerUrl,
        error: `Flashed state: HTTP ${response.status}`,
      };
    }
  } catch (err: any) {
    clearTimeout(timeout);
    return {
      platform: config.name,
      available: 'unknown',
      profileUrl: url,
      registerUrl,
      error: `Network error: ${err.message || 'Aborted'}`,
    };
  }
}

// ------------------- API ENDPOINTS -------------------

// GET /api/health
app.get('/api/health', (req, res) => {
  res.json({ success: true });
});

// POST /api/check-username
app.post('/api/check-username', async (req, res) => {
  const { username } = req.body;
  if (!username || typeof username !== 'string') {
    return res.status(400).json({ error: 'Username must be a valid string.' });
  }

  const cleanUsername = username.trim().toLowerCase();
  if (cleanUsername.length < 1) {
    return res.status(400).json({ error: 'Username is too short.' });
  }

  const keys = Object.keys(platforms);
  const checkPromises = keys.map((key) => checkPlatform(key, cleanUsername));

  try {
    const results = await Promise.all(checkPromises);
    const validResults = results.filter(Boolean);

    res.json({
      username: cleanUsername,
      availableOnCount: validResults.filter((r: any) => r.available === true).length,
      totalCount: validResults.length,
      results: validResults,
    });
  } catch (err: any) {
    console.error('Error checking usernames:', err);
    res.status(500).json({ error: 'Failed to fully execute verification.' });
  }
});

// POST /api/check-domains
app.post('/api/check-domains', async (req, res) => {
  const { domainName } = req.body;
  if (!domainName || typeof domainName !== 'string') {
    return res.status(400).json({ error: 'Domain name prefix is required.' });
  }

  const cleanInput = domainName.trim().toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '');
  const baseName = cleanInput.split('.')[0];

  if (!baseName) {
    return res.status(400).json({ error: 'Invalid domain name structure.' });
  }

  const tlds = ['.com', '.net', '.org', '.io', '.co'];

  const dnsPromises = tlds.map(async (tld) => {
    const fullDomain = `${baseName}${tld}`;
    try {
      await dns.promises.lookup(fullDomain);
      return {
        tld,
        domain: fullDomain,
        available: false,
        registerUrl: `https://www.namecheap.com/domains/registration/results/?domain=${fullDomain}`,
      };
    } catch (err: any) {
      if (err.code === 'ENOTFOUND' || err.code === 'ENODATA') {
        return {
          tld,
          domain: fullDomain,
          available: true,
          registerUrl: `https://www.namecheap.com/domains/registration/results/?domain=${fullDomain}`,
        };
      }
      return {
        tld,
        domain: fullDomain,
        available: 'unknown' as const,
        registerUrl: `https://www.godaddy.com/domainsearch/find?domainToCheck=${fullDomain}`,
      };
    }
  });

  try {
    const results = await Promise.all(dnsPromises);
    res.json({
      baseName,
      domains: results,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to verify domain names.' });
  }
});

// Resilient Offline Fallback Brand Suggestions
const getOfflineSuggestions = (cleanUsername: string) => {
  const suffixList = [
    'hq', 'hub', 'app', 'ai', 'co', 'official', 'studio', 'labs', 'pro', 'inc', 'flow', 'io'
  ];
  return suffixList.map((suffix) => {
    const generated = `${cleanUsername}${suffix}`;
    const reason = `A neat, highly punchy brand variation incorporating the premium standard text modifier '${suffix}'.`;
    return { username: generated, reason };
  });
};

// Generative AI brand suggestions handler
const handleBrandSuggestions = async (req: any, res: any) => {
  const { username, industry = 'General Tech', keywords = '' } = req.body;
  if (!username || typeof username !== 'string') {
    return res.status(400).json({ error: 'Please submit a matching baseline brand word.' });
  }

  const cleanUsername = username.trim().toLowerCase();
  const client = getGeminiClient();

  if (!client) {
    return res.json({
      username: cleanUsername,
      suggestions: getOfflineSuggestions(cleanUsername),
    });
  }

  const prompt = `Generate exactly 18 unique, premium brand alternative username variations for the root label "${cleanUsername}".
  The industry is "${industry}" with accessory keywords "${keywords}".
  Align suggestions to feel modern, high-tier, and easy to memorize (including labs, flow, hq, or app modifiers).
  
  Provide the output in this strict JSON schema:
  {
    "suggestions": [
      { "username": "string", "reason": "string explaining why this trade name fits" }
    ]
  }`;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  username: { type: Type.STRING },
                  reason: { type: Type.STRING },
                },
                required: ['username', 'reason'],
              },
            },
          },
          required: ['suggestions'],
        },
      },
    });

    const parsedData = JSON.parse(response.text || '{}');
    res.json({
      username: cleanUsername,
      suggestions: parsedData.suggestions || getOfflineSuggestions(cleanUsername),
    });
  } catch (err: any) {
    console.error('Gemini Suggestion Engine fail, returning offline generators:', err);
    res.json({
      username: cleanUsername,
      suggestions: getOfflineSuggestions(cleanUsername),
    });
  }
};

// POST /api/brand-suggestions
app.post('/api/brand-suggestions', handleBrandSuggestions);

// Support fallback route to keep everything robustly compatible
app.post('/api/generate-suggestions', handleBrandSuggestions);

// Dynamic SEO metadata rendering helper
function injectMetadata(urlPath: string, templateHtml: string): string {
  let title = 'BrandSync - Unified Username & Domain Availability Engine';
  let description = 'Instantly check social media usernames and domain names across dozens of platforms concurrently. Claim your brand name everywhere free, with zero signup.';
  let dynamicHeading = 'Check Username & Domain Availability Everywhere';
  let dynamicSubheading = 'Instantly check social media usernames and domain names across dozens of platforms.';

  if (urlPath.includes('/username-checker')) {
    title = 'Username Availability Checker - BrandSync';
    description = 'Check if handles are free or claimed on Instagram, TikTok, X, Reddit, and GitHub instantly.';
  } else if (urlPath.includes('/domain-checker')) {
    title = 'Standard Domain Status Resolver - BrandSync';
    description = 'Verify registration status for top level domains such as .com, .net, .org, .co, and .io instantly.';
  } else if (urlPath.includes('/about')) {
    title = 'Mission & Engineering Stack - BrandSync';
    description = 'Discover BrandSync\'s standalone, non-custodial, and zero database logging commitments.';
  }

  let modifiedHtml = templateHtml
    .replace('<title>My Google AI Studio App</title>', `<title>${title}</title>`)
    .replace('<title>BrandClaim</title>', `<title>${title}</title>`)
    .replace('<title>BrandSync</title>', `<title>${title}</title>`);

  const metaTags = `
    <meta name="description" content="${description}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
  `;

  modifiedHtml = modifiedHtml.replace('</head>', `${metaTags}\n</head>`);
  return modifiedHtml;
}

// Robots.txt Handler
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(`User-agent: *
Allow: /`);
});

// Start integration server serving Vite resources
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });

    app.use(vite.middlewares);

    app.get('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        const html = injectMetadata(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      } catch (err) {
        next(err);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));

    app.get('*', (req, res) => {
      const url = req.originalUrl;
      try {
        const template = fs.readFileSync(path.join(distPath, 'index.html'), 'utf-8');
        const html = injectMetadata(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      } catch (err) {
        res.sendFile(path.join(distPath, 'index.html'));
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BrandSync container running at http://localhost:${PORT}`);
  });
}

startServer();
