import { getServerSession } from "next-auth/next";
import { authOptions } from "../pages/api/auth/[...nextauth]";
import { NextApiRequest, NextApiResponse } from 'next';

export const getSessionUser = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    res.status(401).json({ message: "認証されていません。" });
    return null;
  }
  return session.user;
};

export const checkAdminRole = (user: any) => {
  return user.role === 'ADMIN' || user.role === 'SHOP_ADMIN';
};

export const isAdmin = (user: any) => user.role === 'ADMIN';
export const isShopAdmin = (user: any) => user.role === 'SHOP_ADMIN';