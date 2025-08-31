/* 
  Author  : Mochammad Hairullah
  Path    : /app/schemas/users/schema.ts
*/

import { z } from "zod";

export const userCreateSchema = z.object({
  // unique
  name: z.string().min(2).max(100).refine((val) => {
    if (!val) return false;
    return val.length >= 2 && val.length <= 100;
  }, {
    message: "Name must be between 2 and 100 characters",
  }),
  email: z.email({ message: "Invalid email address" }),
  password: z.string().min(6).max(100).refine((val) => {
    if (!val) return false;
    return val.length >= 6 && val.length <= 100;
  }, {
    message: "Password must be between 6 and 100 characters",
  }),
});

export const userUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.email({ message: "Invalid email address" }).optional(),
  password: z.string().min(6).max(100).optional(),
});
