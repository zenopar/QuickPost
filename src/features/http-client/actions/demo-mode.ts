'use server';

import { cookies } from 'next/headers';
import crypto from 'crypto';

const DEMO_COOKIE_NAME = 'quickpost_demo_session';

function getExpectedToken(): string {
  const pass = process.env.PASS || '';
  return crypto.createHash('sha256').update(`quickpost-demo-salt:${pass}`).digest('hex');
}

export async function isDemoModeEnabled(): Promise<boolean> {
  return process.env.DEMO === 'true';
}

export async function isDemoUnlocked(): Promise<boolean> {
  if (process.env.DEMO !== 'true') {
    return true;
  }

  if (!process.env.PASS) {
    return false;
  }

  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(DEMO_COOKIE_NAME);
    if (!sessionCookie || !sessionCookie.value) {
      return false;
    }
    return sessionCookie.value === getExpectedToken();
  } catch {
    return false;
  }
}

export async function getDemoStatus(): Promise<{ isDemo: boolean; isUnlocked: boolean }> {
  const isDemo = process.env.DEMO === 'true';
  const isUnlocked = isDemo ? await isDemoUnlocked() : true;
  return { isDemo, isUnlocked };
}

export async function verifyDemoPassword(password: string): Promise<{ success: boolean; error?: string }> {
  if (process.env.DEMO !== 'true') {
    return { success: true };
  }

  const expectedPass = process.env.PASS;
  if (!expectedPass) {
    return { success: false, error: 'PASS is not configured on the server.' };
  }

  if (password !== expectedPass) {
    return { success: false, error: 'Incorrect password. Please try again.' };
  }

  try {
    const cookieStore = await cookies();
    cookieStore.set(DEMO_COOKIE_NAME, getExpectedToken(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to set authentication session.' };
  }
}

export async function lockDemoSession(): Promise<{ success: boolean }> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(DEMO_COOKIE_NAME);
  } catch {
    // Ignore in non-cookie environments
  }
  return { success: true };
}
