import { AnyColumn, InferInsertModel, InferSelectModel, Table } from "drizzle-orm"
import { z } from "zod"
import { extendZodWithOpenApi } from "zod-openapi"
import { TimestampMetaColumns, MetaColumns } from "@/lib/db/tables/users"
import { EnhancedOmit, titleCase, humanFileSize } from "@/lib/utils"
import { BuildInsertSchema, BuildSelectSchema } from "drizzle-zod"
import { SQLDefaults, sqlDefault } from "@/lib/db/utils"
import { TableWithColumns } from "@/lib/db/tables/utils"

extendZodWithOpenApi(z)

export const maxFileSize = 1 * 1024 * 1024
export const humanMaxFileSize = humanFileSize(maxFileSize)
export const maxFileCount = 50
export const maxTotalFileSize = 4 * 1024 * 1024
export const humanMaxTotalFileSize = humanFileSize(maxTotalFileSize)
export const fileSchema = z
  .custom<File>(x => x instanceof File, "Invalid file provided")
  .refine(x => x.size > 0, "File cannot be empty")
  .refine(x => x.size <= maxFileSize, `File cannot be greater than ${humanMaxFileSize} in size`)
export const fileListSchema = fileSchema.array()
  .refine(x => x.length > 0, "No files provided")
  .refine(x => x.length <= maxFileCount, `Maximum of ${maxFileCount} files are allowed`)
  .refine(x => x.reduce((a, x) => a + x.size, 0) < maxTotalFileSize, `Total size of all files cannot be greater than ${humanMaxTotalFileSize}`)

export const numericStringSchema = z.string().regex(/^d+$/, "Characters other than digits found in string").transform(x => parseInt(x, 10))

export const preprocessEmptyString = <T>(schema: z.ZodType<T>) => z.preprocess(x => (x === "" ? null : x), schema)

export const paginationSchema = z.object({
  page: z.number().int().min(1).openapi({ description: "The page number", example: 1 }).optional(),
})
export type PaginationParams = z.infer<typeof paginationSchema>

export const sortingSchema = z.object({
  sort: z.string().openapi({ description: "The field to sort by", example: "id:asc,name:desc" }).optional(),
})
export type SortingParams = z.infer<typeof sortingSchema>

export const fieldsSchema = z.object({
  fields: z.string().openapi({ description: "The fields to return", example: "id,name" }).optional(),
})
export type FieldsParams = z.infer<typeof fieldsSchema>

export const metaColumnMask = {
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  updatedBy: true,
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

export const zodModel = <T = never>(name: string) => (schemaShape: Implement<T>) => z.object(schemaShape)
  .openapi({ ref: titleCase(name), title: titleCase(name), description: `The data for a ${name}` })

type _DefaultMask<T extends Table> = OmitMeta<OmitId<{ [_ in { [K in keyof T["_"]["columns"]]: T["_"]["columns"][K] extends AnyColumn<{ notNull: true, hasDefault: true }> ? K : never }[keyof T["_"]["columns"]]]: true }>>
export type DefaultMask<T extends Table> = {} extends _DefaultMask<T> ? Record<string, never> : _DefaultMask<T>

const baseQuerySchemaShape = { ...paginationSchema.shape, ...sortingSchema.shape, ...fieldsSchema.shape }
type BaseQuerySchemaShape = typeof baseQuerySchemaShape
export const baseQuerySchema = z.object(baseQuerySchemaShape)

export const baseTableSchemas = <T extends TableWithColumns<TimestampMetaColumns> = never>(name: string) => {
  type TableMask = { [_ in keyof T["_"]["columns"]]?: true }
  type SchemaShape = BuildSelectSchema<T, {}>
  type Schema = z.ZodObject<SchemaShape>
  type InputSchemaShape = EnhancedOmit<SchemaShape, keyof TimestampMetaColumns>
  type PartialSchema = z.ZodObject<{ [K in keyof SchemaShape]: z.ZodOptional<SchemaShape[K]> }>
  type IdSchemaShape = SchemaShape extends { id: any } ? { id: SchemaShape["id"] } : {}
  type RequiredIdSchemaShape = SchemaShape extends { id: any } ? { id: z.deoptional<SchemaShape["id"]> } : {}
  type IdSchema = z.ZodObject<IdSchemaShape>
  type QueryIdSchemaShape = IdSchemaShape & typeof fieldsSchema.shape
  type QueryIdSchema = z.ZodObject<QueryIdSchemaShape>
  type QuerySchemaShape = { [K in keyof SchemaShape]: z.ZodOptional<SchemaShape[K] extends z.ZodNullable<infer U> ? U : SchemaShape[K]> }
  type QuerySchema = z.ZodObject<QuerySchemaShape & BaseQuerySchemaShape>
  type BaseInsertSchemaShape = BuildInsertSchema<T, {}>
  type InsertSchemaShape = EnhancedOmit<BaseInsertSchemaShape, keyof MetaColumns>
  type InsertSchema = z.ZodObject<InsertSchemaShape>
  type CreateSchemaShape = Omit<InsertSchemaShape, "id">
  type CreateSchema = z.ZodObject<CreateSchemaShape>
  type ReplaceSchemaShape = RequiredIdSchemaShape & CreateSchemaShape
  type ReplaceSchema = z.ZodObject<ReplaceSchemaShape>
  type SchemaWithoutId = Omit<SchemaShape, "id">
  type UpdateSchemaShape = RequiredIdSchemaShape & { [K in keyof SchemaWithoutId]: z.ZodOptional<SchemaWithoutId[K]> }
  type UpdateSchema = z.ZodObject<UpdateSchemaShape>
  type Defaults = SQLDefaults<z.infer<CreateSchema>>

  return <PublicMask extends TableMask>(schemaShape: InputSchemaShape, defaultMask: DefaultMask<T>, publicMask?: PublicMask) => {
    type PublicSchema = typeof publicMask extends undefined ? Schema :
      z.ZodObject<Pick<SchemaShape, Extract<keyof SchemaShape, keyof PublicMask>>>
    type PublicQuerySchema = typeof publicMask extends undefined ? QuerySchema :
      z.ZodObject<Pick<QuerySchemaShape, Extract<keyof QuerySchemaShape, keyof PublicMask>> & BaseQuerySchemaShape>

    const title = titleCase(name)
    const createdAt = z.coerce.date().openapi({ description: `The date the ${name} was created`, example: new Date(0) }) as z.ZodDate
    const updatedAt = z.coerce.date().openapi({ description: `The date the ${name} was last updated`, example: new Date(0) }) as z.ZodDate
    const baseSchemaShape = { ...schemaShape, createdAt, updatedAt } as SchemaShape
    const baseSchema = z.object(baseSchemaShape) as Schema
    const schema = baseSchema.openapi({ ref: title, title, description: `The data for a ${name}` }) as Schema
    const partialSchema = baseSchema.partial().openapi({ title, description: `The data for a ${name}` }) as PartialSchema
    const publicSchema = (publicMask === undefined ? baseSchema : baseSchema.pick(publicMask)).openapi({ title, description: `The public data for a ${name}` }) as PublicSchema
    const idSchema = z.object(("id" in schemaShape ? { id: (schemaShape.id as z.ZodTypeAny) } : {}) as any) as IdSchema
    const queryIdSchema = z.object({ ...idSchema.shape, ...fieldsSchema.shape } as any) as QueryIdSchema
    const insertSchema = z.object(Object.fromEntries(Object.entries(schemaShape as any)
      .filter(([k, _]) => !(k in metaColumnMask)).map(([k, v]) => (
        [k, v instanceof z.ZodNullable || k in defaultMask ? (v as z.ZodTypeAny).optional() : v]))) as any) as InsertSchema
    const querySchemaShape = Object.fromEntries(Object.entries(schema.shape as any)
      .map(([k, v]) => [k, (v instanceof z.ZodNullable ? v.unwrap() : v).optional()])) as QuerySchemaShape
    const querySchema = z.object({ ...querySchemaShape, ...baseQuerySchemaShape } as any) as QuerySchema
    const publicQuerySchema = (publicMask === undefined ? querySchema :
      z.object(querySchemaShape).pick(publicMask).extend(baseQuerySchemaShape)) as PublicQuerySchema
    const createSchema = insertSchema.omit({ id: true }).openapi({ title, description: `The data to create a new ${name} with` }) as CreateSchema
    const replaceSchema = insertSchema.required({ id: true }).openapi({ title, description: `The data to replace a ${name} with` }) as any as ReplaceSchema
    const updateSchema = insertSchema.required().partial().required({ id: true }).openapi({ title, description: `The data to update a ${name} with` }) as any as UpdateSchema
    const defaults = Object.fromEntries(Object.entries(insertSchema.shape as any)
      .flatMap(([k, v]) => (v instanceof z.ZodOptional ? [[k, sqlDefault]] : []))) as Defaults
    // eslint-disable-next-line max-len
    return { schema, partialSchema, publicSchema, idSchema, queryIdSchema, querySchema, publicQuerySchema, createSchema, replaceSchema, updateSchema, defaults }
  }
}

export const tableSchemas = <T extends TableWithColumns<MetaColumns> = never>(name: string) => <
  PublicMask extends { [_ in keyof T["_"]["columns"]]?: true },
>(schemaShape: EnhancedOmit<BuildSelectSchema<T, {}>, keyof MetaColumns>,
    defaultMask: DefaultMask<T>, publicMask?: PublicMask) => {
  const createdBy = z.string().openapi({ description: `The ID of the user the ${name} was created by`, example: "105b7lip5nqptbw" }) as z.ZodString
  const updatedBy = z.string().openapi({ description: `The ID of the user the ${name} was last updated by`, example: "105b7lip5nqptbw" }) as z.ZodString
  const createdBySchema = z.object({ createdBy })
  const updatedBySchema = z.object({ updatedBy })
  const res = baseTableSchemas<T>(name)<PublicMask>({ ...schemaShape, createdBy, updatedBy } as any, defaultMask, publicMask)
  return { createdBySchema, updatedBySchema, ...res }
}
