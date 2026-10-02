import { clerkMiddleware, getAuth, createClerkClient } from '@clerk/express';
import { fail } from './validation.js';
export function clerkAuth(config) {
  const client = createClerkClient({ secretKey: config.secretKey, publishableKey: config.publishableKey });
  return {
    middleware: clerkMiddleware({ secretKey: config.secretKey, publishableKey: config.publishableKey, authorizedParties: config.origins }),
    requireUser(req, res, next) {
      const { userId } = getAuth(req);
      if (!userId) return res.status(401).json({ success: false, message: "Vui lòng đăng nhập" });
      req.userId = userId;
      next();
    },
    async profile(req) {
      const user = await client.users.getUser(req.userId);
      return { _id: user.id, name: [user.firstName, user.lastName].filter(Boolean).join(' '), email: user.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress, role: user.publicMetadata.role === 'seller' ? 'seller' : 'customer' };
    },
    async requireSeller(req, res, next) {
      const user = await client.users.getUser(req.userId);
      if (user.publicMetadata.role !== 'seller') fail(403, "Bạn cần quyền người bán");
      next();
    },
  };
}
