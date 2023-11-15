import { InferInsertModel, InferSelectModel, Table } from "drizzle-orm"
import { z } from "zod"
import { extendZodWithOpenApi } from "zod-openapi"
import { UserMetaColumns, TimestampMetaColumns, MetaColumns } from "@/lib/db/tables/utils"

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

export const paginationSchema = z.object({
  page: z.number().int().min(1).openapi({ description: "The page number", example: 1 }).optional(),
})
export type PaginationParams = z.infer<typeof paginationSchema>

export const sortingSchema = z.object({
  sort: z.string().openapi({ description: "The field to sort by", example: "id" }).optional(),
})
export type SortingParams = z.infer<typeof sortingSchema>

export const timestampMetaColumnMask = {
  createdAt: true,
  modifiedAt: true,
} satisfies { [K in keyof TimestampMetaColumns]: true }

export const userMetaColumnMask = {
  createdBy: true,
  modifiedBy: true,
} satisfies { [K in keyof UserMetaColumns]: true }

export const metaColumnMask = {
  ...timestampMetaColumnMask,
  ...userMetaColumnMask,
} satisfies { [K in keyof MetaColumns]: true }

type OmitMeta<T> = Omit<T, keyof MetaColumns>
type OmitOptionalId<T> = T extends { id: any } ? T : Omit<T, "id">
type RequireId<T> = T extends { id: any } ? T : T extends { id?: any } ? { id: T["id"] & {} } & T : T

export type Model<T extends Table> = InferSelectModel<T>
export type QueryParams<T extends Table> =
  Partial<{ [K in keyof Model<T>]: Exclude<Model<T>[K], null> } & Required<PaginationParams> & Required<SortingParams>>
export type CreateParams<T extends Table> = OmitMeta<OmitOptionalId<InferInsertModel<T>>> // add userId here to populate createdBy/modifiedBy?
export type ReplaceParams<T extends Table> = OmitMeta<RequireId<InferInsertModel<T>>>
export type UpdateParams<T extends Table> = OmitMeta<RequireId<Partial<InferInsertModel<T>>>>

type Implement<Model> = {
  [key in keyof Model]-?: undefined extends Model[key]
    ? null extends Model[key]
      ? z.ZodNullableType<z.ZodOptionalType<z.ZodType<Model[key]>>>
      : z.ZodOptionalType<z.ZodType<Model[key]>>
    : null extends Model[key]
    ? z.ZodNullableType<z.ZodType<Model[key]>>
    : z.ZodType<Model[key]>
}
export type ZodModel<Model> = z.ZodObject<Implement<Model>>

export const zodModel = <Model = never>() => <
  Schema extends Implement<Model> & { [_ in Exclude<keyof Schema, keyof Model>]: never }
>(schema: z.ZodObject<Schema> | Schema) => (schema instanceof z.ZodObject ? schema : z.object(schema))

// export const createSchema = <T extends z.ZodRawShape>(schema: z.ZodObject<T>) => (
//   z.object(Object.fromEntries(Object.entries(schema.shape).map(([k, v]) => [k, v.isNullable() ? v.optional() : v])))) as any
// z.object({}).partial({})
