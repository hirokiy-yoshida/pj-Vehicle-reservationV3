import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return res.status(403).json({ message: "この操作を行う権限がありません。" });
  }

  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const user = await prisma.user.findUnique({
        where: { id: String(id) },
        include: {
          shop: true,
        },
      });

      if (!user) {
        return res.status(404).json({ message: "ユーザーが見つかりません。" });
      }

      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: "ユーザーの取得中にエラーが発生しました。" });
    }
  } else if (req.method === 'PUT') {
    try {
      const { name, email, password, role, shopId } = req.body;

      let updateData: any = {
        name,
        email,
        role,
        shopId: shopId || null,
      };

      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        updateData.password = hashedPassword;
      }

      const user = await prisma.user.update({
        where: { id: String(id) },
        data: updateData,
      });

      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: "ユーザーの更新中にエラーが発生しました。" });
    }
  } else if (req.method === 'DELETE') {
    try {
      await prisma.user.delete({
        where: { id: String(id) },
      });

      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "ユーザーの削除中にエラーが発生しました。" });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}