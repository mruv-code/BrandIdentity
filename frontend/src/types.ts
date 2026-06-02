export interface PlatformResult {
  platform: string;
  available: boolean | 'unknown';
  profileUrl: string;
  registerUrl: string;
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
}
