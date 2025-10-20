import { prisma } from '@/lib/prisma/client';

/**
 * Clean up expired password reset tokens
 * Run this as a cron job or scheduled task
 * 
 * TODO: Set up a proper scheduler in your deployment environment
 * You can call this function:

        As a cron job (using node-cron or external cron)
        As a serverless function (Vercel Cron Jobs)
        In your application startup
        Manually via admin panel
 */
export async function cleanupExpiredTokens() {
  const deleted = await prisma.passwordResetToken.deleteMany({
    where: {
      expires: {
        lt: new Date(),
      },
    },
  });

  console.log(`Cleaned up ${deleted.count} expired reset tokens`);
  return deleted.count;
}