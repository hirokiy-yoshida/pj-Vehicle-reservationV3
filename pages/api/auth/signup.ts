import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { userSchema } from '../../../lib/validation';
import { handleApiError, validateMethod } from '../../../lib/api-helpers';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!validateMethod(req, res, ['POST'])) return;

  try {
    const { name, email, password } = req.body;

    try {
      userSchema.parse({ name, email, password, role: 'USER' });
    } catch (error) {
      return res.status(400).json({ message: '入力データが無効です', errors: error.errors });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'このメールアドレスは既に使用されています。' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role: 'USER' },
    });

    res.status(201).json({ message: 'ユーザーが正常に作成されました。', userId: user.id });
  } catch (error) {
    handleApiError(res, error);
  }
}