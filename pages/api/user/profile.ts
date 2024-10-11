import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import bcrypt from "bcryptjs";
import { handleApiError, validateMethod } from '../../../lib/api-helpers';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!validateMethod(req, res, ['PUT'])) return;

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: "認証されていません。" });
  }

  try {
    const { name, email, currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return res.status(404).json({ message: "ユーザーが見つかりません。" });
    }

    let updateData: any = { name, email };

    if (currentPassword && newPassword) {
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: "現在のパスワードが正しくありません。" });
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updateData.password = hashedPassword;
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
    });

    res.status(200).json({ message: "プロフィールが正常に更新されました。" });
  } catch (error) {
    handleApiError(res, error);
  }
}