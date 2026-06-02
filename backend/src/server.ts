import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import dns from 'dns';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 10000);

// Enable CORS allowing custom frontend origins or fallback to wildcards
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:5173'
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.length === 0) {
      callback(null, true);
    } else {
      // In production, enforce standard origin whitelist or allow all safe reads
      callback(null, true);
    }
  },
  credentials: true
}));

app.use(express.json());

// Initialize Gemini Client Lazily/Safely
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'brandsync-backend',
        }
      }
    });
  }
  return aiClient;
}

// Platforms Config Mapping
interface PlatformConfig {
  name: string;
  validate: (u: string) => boolean;
  getUrl: (u: string) => string;
  registerUrl: string;
}

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

// Async probe function
async function checkPlatform(key: string, username: string) {
  const config = platforms[key];
  if (!config) {
    return {
      platform: key,
      available: 'unknown',
      profileUrl: '',
      registerUrl: '',
      error: 'Invalid platform configuration.'
    };
  }

  const url = config.getUrl(username);
  const registerUrl = config.registerUrl;

  if (!config.validate(username)) {
    return {
      platform: config.name,
      available: 'unknown',
      profileUrl: url,
      registerUrl,
      error: 'Username does not match rules.'
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6500);

  try {
    const response = await fetch(url, {
      method: "GET",
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
        error: `HTTP Status Code: ${response.status}`,
      };
    }
  } catch (err: any) {
    clearTimeout(timeout);
    return {
      platform: config.name,
      available: 'unknown',
      profileUrl: url,
      registerUrl,
      error: `Connection error or rate limit: ${err.message || 'Aborted'}`,
    };
  }
}

// ---------------- API ENDPOINTS ----------------

// GET /api/health
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ success: true });
});

// POST /api/check-username
app.post('/api/check-username', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username } = req.body;
    if (!username || typeof username !== 'string') {
      res.status(400).json({ error: 'Username must be a valid string.' });
      return;
    }

    const cleanUsername = username.trim().toLowerCase();
    if (cleanUsername.length < 1) {
      res.status(400).json({ error: 'Username must be at least 1 character.' });
      return;
    }

    const keys = Object.keys(platforms);
    const checks = keys.map(key => checkPlatform(key, cleanUsername));
    const results = await Promise.all(checks);

    res.json({
      username: cleanUsername,
      availableOnCount: results.filter(r => r.available === true).length,
      totalCount: results.length,
      results
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/check-domains
app.post('/api/check-domains', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { domainName } = req.body;
    if (!domainName || typeof domainName !== 'string') {
      res.status(400).json({ error: 'Domain name prefix is required.' });
      return;
    }

    const cleanInput = domainName.trim().toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '');
    const baseName = cleanInput.split('.')[0];

    if (!baseName) {
      res.status(400).json({ error: 'Invalid domain name structure.' });
      return;
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
          registerUrl: `https://www.namecheap.com/domains/registration/results/?domain=${fullDomain}`
        };
      } catch (err: any) {
        if (err.code === 'ENOTFOUND' || err.code === 'ENODATA') {
          return {
            tld,
            domain: fullDomain,
            available: true,
            registerUrl: `https://www.namecheap.com/domains/registration/results/?domain=${fullDomain}`
          };
        }
        return {
          tld,
          domain: fullDomain,
          available: 'unknown',
          registerUrl: `https://www.godaddy.com/domainsearch/find?domainToCheck=${fullDomain}`
        };
      }
    });

    const results = await Promise.all(dnsPromises);
    res.json({
      baseName,
      domains: results
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/brand-suggestions
app.post('/api/brand-suggestions', async (req: Request, res: Response, next: NextFunction) => {
  const { username, industry = 'General Tech', keywords = '' } = req.body;
  if (!username || typeof username !== 'string') {
    res.status(400).json({ error: 'Please submit a matching baseline brand word.' });
    return;
  }

  const cleanUsername = username.trim().toLowerCase();
  const client = getGeminiClient();

  const getOfflineSuggestions = () => {
    const suffixes = ['hq', 'hub', 'app', 'ai', 'co', 'official', 'studio', 'labs', 'pro', 'inc', 'flow', 'io'];
    return suffixes.map(suffix => ({
      username: `${cleanUsername}${suffix}`,
      reason: `A premium brand upgrade featuring the trendsetting digital modifier '${suffix}'`
    }));
  };

  if (!client) {
    res.json({
      username: cleanUsername,
      suggestions: getOfflineSuggestions()
    });
    return;
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
                  reason: { type: Type.STRING }
                },
                required: ['username', 'reason']
              }
            }
          },
          required: ['suggestions']
        }
      }
    });

    const data = JSON.parse(response.text || '{}');
    res.json({
      username: cleanUsername,
      suggestions: data.suggestions || getOfflineSuggestions()
    });
  } catch (err) {
    res.json({
      username: cleanUsername,
      suggestions: getOfflineSuggestions()
    });
  }
});

// Express global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled Server Exception:', err);
  res.status(500).json({
    error: 'A serious backend operations failure occurred.',
    message: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`BrandSync production server listening on port ${PORT}`);
});
