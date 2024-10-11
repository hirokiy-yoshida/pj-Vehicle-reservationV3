import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from "@prisma/client";
import { handleApiError, validateMethod } from '../../../lib/api-helpers';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!validateMethod(req, res, ['POST'])) return;

  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'ユーザーが見つかりません。' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpiry },
    });

    // Send email with reset link
    const transporter = nodemailer.createTransport({
      // Configure your email service here
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: 'パスワードリセットリンク',
      html: `
        <p>パスワードリセットのリンクです：</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}">
          パスワードをリセット
        </a>
        <p>このリンクは1時間後に無効になります。</p>
      `,
    });

    res.status(200).json({ message: 'パスワードリセットリンクを送信しました。' });
  } catch (error) {
    handleApiError(res, error);
  }
}