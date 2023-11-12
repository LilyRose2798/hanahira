import { z } from "zod"
import { extendZodWithOpenApi } from "zod-openapi"

extendZodWithOpenApi(z)

export const fileListSchema = z
  .custom<File>(x => x instanceof File, "Invalid file provided").array()
  .refine(x => x.length > 0, "No files provided")
  .refine(x => x.length <= 512, "Maximum of 512 files are allowed")
  .refine(x => x.every(x => x.size > 0), "No file can be empty")
  .refine(x => x.every(x => x.size <= 100 * 1024 * 1024), "Size of each file must be 100MB or lower")
  .refine(x => x.reduce((a, x) => a + x.size, 0) < 100 * 1024 * 1024, "Total size of all files must be 100MB or lower")

export const numericStringSchema = z.string().regex(/^d+$/, "Characters other than digits found in string").transform(x => parseInt(x, 10))

export const preprocessEmptyString = <T>(schema: z.ZodType<T>) => z.preprocess(x => (x === "" ? null : x), schema)
