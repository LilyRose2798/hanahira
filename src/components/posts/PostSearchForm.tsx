"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { SearchIcon } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect } from "react"

export const PostSearchForm = () => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const schema = z.object({ search: z.string() })
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      search: searchParams.get("search") ?? "",
    },
  })

  useEffect(() => {
    form.setValue("search", searchParams.get("search") ?? "")
  }, [form, searchParams])

  const setSearch = useCallback((search: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (search === "") params.delete("search")
    else params.set("search", search)
    router.push(`${pathname}?${params.toString()}`)
  }, [searchParams, pathname, router])

  return (<>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(({ search }) => setSearch(search))} className="flex space-x-4 my-6">
        <FormField control={form.control} name="search" render={({ field }) => (
          <FormItem className="flex-grow">
            <FormControl>
              <Input placeholder="Search" {...field} value={field.value ?? undefined} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}/>
        <Button type="submit" className="mr-2">
          <SearchIcon />
        </Button>
      </form>
    </Form>
  </>)
}

export default PostSearchForm
