import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { userSchema } from '../../../../lib/validation';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return res.status(403).json({ message: "この操作を行う権限がありません。" });
  }

  if (req.method === 'POST') {
    try {
      const validatedData = userSchema.parse(req.body);

      const hashedPassword = await bcrypt.hash(validatedData.password, 10);

      const user = await prisma.user.create({
        data: {
          ...validatedData,
          password: hashedPassword,
        },
      });

      res.status(201).json(user);
    } catch (error) {
      if (error.name === 'ZodError') {
        res.status(400).json({ message: "入力データが無効です", errors: error.errors });
      } else {
        res.status(500).json({ message: "ユーザーの作成中にエラーが発生しました。" });
      }
    }
  } else if (req.method === 'GET') {
    try {
      const users = await prisma.user.findMany({
        include: {
          shop: true,
        },
      });

      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ message: "ユーザーの取得中にエラーが発生しました。" });
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}