import { z } from 'zod';

export const userSchema = z.object({
  name: z.string().min(1, "名前は必須です").max(50, "名前は50文字以内で入力してください"),
  email: z.string().email("有効なメールアドレスを入力してください"),
  password: z.string().min(8, "パスワードは8文字以上である必要があります").max(100, "パスワードは100文字以内で入力してください"),
  role: z.enum(['USER', 'SHOP_ADMIN', 'ADMIN'], {
    errorMap: () => ({ message: "有効な役割を選択してください" })
  }),
  shopId: z.string().optional(),
});

export const carSchema = z.object({
  name: z.string().min(1, "車両名は必須です").max(100, "車両名は100文字以内で入力してください"),
  model: z.string().min(1, "モデルは必須です").max(100, "モデルは100文字以内で入力してください"),
  licensePlate: z.string().min(1, "ナンバープレートは必須です").max(20, "ナンバープレートは20文字以内で入力してください"),
  shopId: z.string().min(1, "店舗IDは必須です"),
});

export const shopSchema = z.object({
  name: z.string().min(1, "店舗名は必須です").max(100, "店舗名は100文字以内で入力してください"),
  address: z.string().min(1, "住所は必須です").max(200, "住所は200文字以内で入力してください"),
});

export const reservationSchema = z.object({
  carId: z.string().min(1, "車両IDは必須です"),
  userId: z.string().min(1, "ユーザーIDは必須です"),
  startTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "有効な開始時間を入力してください",
  }),
  endTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "有効な終了時間を入力してください",
  }),
  status: z.enum(['PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED'], {
    errorMap: () => ({ message: "有効なステータスを選択してください" })
  }),
});

export const maintenanceSchema = z.object({
  carId: z.string().min(1, "車両IDは必須です"),
  startTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "有効な開始時間を入力してください",
  }),
  endTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "有効な終了時間を入力してください",
  }),
  description: z.string().min(1, "説明は必須です").max(500, "説明は500文字以内で入力してください"),
});

export const mileageSchema = z.object({
  startMileage: z.number().min(0, "開始時の走行距離は0以上である必要があります"),
  endMileage: z.number().min(0, "終了時の走行距離は0以上である必要があります"),
}).refine(data => data.endMileage > data.startMileage, {
  message: "終了時の走行距離は開始時の走行距離より大きい必要があります",
  path: ["endMileage"],
});