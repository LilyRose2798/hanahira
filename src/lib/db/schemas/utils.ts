import { AnyColumn, InferInsertModel, InferSelectModel, Table } from "drizzle-orm"
import { z } from "zod"
import { extendZodWithOpenApi } from "zod-openapi"
import { UserMetaColumns, TimestampMetaColumns, MetaColumns, TableWithTimestampMeta, TableWithMeta } from "@/lib/db/tables/utils"
import { EnhancedOmit, titleCase } from "@/lib/utils"
import { BuildInsertSchema } from "drizzle-zod"
import { SQLDefaults, sqlDefault } from "@/lib/db/utils"

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

type OmitMeta<T> = EnhancedOmit<T, keyof MetaColumns>
type OmitId<T> = EnhancedOmit<T, "id">
type RequireId<T> = T extends { id: any } ? T : T extends { id?: any } ? { id: T["id"] & {} } & T : T

export type Model<T extends Table> = InferSelectModel<T>
export type QueryParams<T extends Table> = { [K in keyof Model<T>]?: Exclude<Model<T>[K], null> } & PaginationParams & SortingParams
export type CreateParams<T extends Table> = OmitMeta<OmitId<InferInsertModel<T>>>
export type ReplaceParams<T extends Table> = OmitMeta<RequireId<InferInsertModel<T>>>
export type UpdateParams<T extends Table> = OmitMeta<RequireId<Partial<InferInsertModel<T>>>>

type Implement<Model> = {
  [key in keyof Model]-?: undefined extends Model[key]
    ? null extends Model[key]
      ? z.ZodOptionalType<z.ZodNullableType<z.ZodType<Model[key]>>>
      | z.ZodNullableType<z.ZodOptionalType<z.ZodType<Model[key]>>>
      : z.ZodOptionalType<z.ZodType<Model[key]>>
    : null extends Model[key]
    ? z.ZodNullableType<z.ZodType<Model[key]>>
    : z.ZodType<Model[key]>
}

export const zodModel = <T = never>(name: string) => <Schema extends Implement<T> & { [_ in Exclude<keyof Schema, keyof T>]: never }>(
  schemaShape: Implement<T>) => z.object(schemaShape).openapi({ ref: titleCase(name), title: titleCase(name), description: `The data for a ${name}` })

export type DefaultMask<T extends Table> = OmitMeta<OmitId<{ [_ in { [K in keyof T["_"]["columns"]]: T["_"]["columns"][K] extends AnyColumn<{ notNull: true, hasDefault: true }> ? K : never }[keyof T["_"]["columns"]]]: true }>>

type QueryParamsOfSchema<T extends z.ZodRawShape> = z.ZodObject<{ [K in keyof T]: T[K] extends z.ZodNullable<infer U> ? U : T[K] }
  & typeof paginationSchema.shape & typeof sortingSchema.shape>

export const userTableSchemas = <T extends TableWithTimestampMeta = never>(name: string = "user") => <
  Schema extends Implement<OmitMeta<Model<T>>> & { [_ in Exclude<keyof Schema, keyof OmitMeta<Model<T>>>]: never },
  Mask extends DefaultMask<T> & { [_ in Exclude<keyof Mask, keyof DefaultMask<T>>]: never }
>(schemaShape: Implement<OmitMeta<Model<T>>>, defaultMask: DefaultMask<T>) => {
  const title = titleCase(name)
  const timestampMetaColumns = {
    createdAt: z.date().openapi({ description: `The date the ${name} was created`, example: new Date(0) }),
    modifiedAt: z.date().openapi({ description: `The date the ${name} was last modified`, example: new Date(0) }),
  }
  const schema = z.object({ ...schemaShape, ...timestampMetaColumns }).openapi({ ref: title, title, description: `The data for a ${name}` })
  const idSchema = z.object(("id" in schemaShape ? { id: (schemaShape.id as z.ZodTypeAny) } : {}) as typeof schemaShape extends { id: any } ? { id: typeof schemaShape["id"] } : {})
  const insertSchema = z.object(Object.fromEntries(Object.entries(schemaShape).map(([k, v]) => (
    [k, v instanceof z.ZodNullable || k in defaultMask ? (v as z.ZodTypeAny).optional() : v]))) as OmitMeta<BuildInsertSchema<T, {}>>)
  const querySchema = (z.object({
    ...(Object.fromEntries(Object.entries(schema.shape as any)
      .map(([k, v]) => [k, v instanceof z.ZodNullable ? v.unwrap() : v]))) as any,
    ...paginationSchema.shape,
    ...sortingSchema.shape,
  }) as QueryParamsOfSchema<typeof schema.shape>).partial()
  const createSchema = insertSchema.omit({ id: true }).openapi({ title, description: `The data to create a new ${name} with` })
  const replaceSchema = insertSchema.required({ id: true }).openapi({ title, description: `The data to replace a ${name} with` })
  const updateSchema = insertSchema.required().partial().required({ id: true }).openapi({ title, description: `The data to update a ${name} with` })
  const defaults = Object.fromEntries(Object.entries(insertSchema.shape)
    .flatMap(([k, v]) => (v instanceof z.ZodOptional ? [[k, sqlDefault]] : []))) as SQLDefaults<z.infer<typeof createSchema>>
  return { schema, idSchema, querySchema, createSchema, replaceSchema, updateSchema, defaults }
}

export const tableSchemas = <T extends TableWithMeta = never>(name: string) => <
  Schema extends Implement<OmitMeta<Model<T>>> & { [_ in Exclude<keyof Schema, keyof OmitMeta<Model<T>>>]: never },
  Mask extends DefaultMask<T> & { [_ in Exclude<keyof Mask, keyof DefaultMask<T>>]: never }
>(schemaShape: Implement<OmitMeta<Model<T>>>, defaultMask: DefaultMask<T>) => {
  const { schema: _schema, idSchema, querySchema: _querySchema, createSchema, replaceSchema, updateSchema, defaults } =
    userTableSchemas<T>(name)(schemaShape, defaultMask)
  const userMetaColumns = {
    createdBy: z.string().openapi({ description: `The ID of the user the ${name} was created by`, example: "105b7lip5nqptbw" }),
    modifiedBy: z.string().openapi({ description: `The ID of the user the ${name} was last modified by`, example: "105b7lip5nqptbw" }),
  }
  const schema = z.object({ ..._schema.shape, ...userMetaColumns }).openapi(_schema._def.openapi as any)
  const createdBySchema = z.object({ createdBy: userMetaColumns.createdBy })
  const modifiedBySchema = z.object({ modifiedBy: userMetaColumns.modifiedBy })
  const querySchema = z.object({ ..._querySchema.shape, ...z.object(userMetaColumns).partial().shape })
  return { schema, idSchema, createdBySchema, modifiedBySchema, querySchema, createSchema, replaceSchema, updateSchema, defaults }
}
