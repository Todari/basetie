/**
 * API 관련 상수
 */

export const API_ENDPOINTS = {
  BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8090',
  GAMES: '/v1/games',
  TICKETS: '/v1/tickets',
  AUTH: '/v1/auth',
  TEAMS: '/v1/teams',
  PROFILE: '/v1/auth/me',
  OAUTH_GOOGLE: '/v1/auth/oauth/google',
} as const;

export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8090',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;

export const QUERY_KEYS = {
  GAMES: 'games',
  TICKETS: 'tickets',
  TEAMS: 'teams',
  PROFILE: 'profile',
  ME: 'me',
  LISTINGS: 'listings',
} as const;
