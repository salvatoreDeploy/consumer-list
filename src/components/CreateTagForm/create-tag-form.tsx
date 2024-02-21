import { Check, Loader2, X } from "lucide-react";
import { Button } from "../ui/button";
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from "zod";
import * as Dialog from '@radix-ui/react-dialog'
import { useMutation, useQueryClient } from "@tanstack/react-query";

const createTagSchema = z.object({
  title: z.string().min(3, { message: 'Minimun 3 caracteres' }),
})

type CreateTagSchemaData = z.infer<typeof createTagSchema>

function getSlugFromString(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, '-');
}

export default function CreateTagForm() {

  const queryClient = useQueryClient()

  const { register, handleSubmit, watch, formState } = useForm<CreateTagSchemaData>({
    resolver: zodResolver(createTagSchema)
  })

  async function createTag({ title }: CreateTagSchemaData) {
    /*  await fetch('http://localhost:3333/tags', {
       method: 'POST',
       body: JSON.stringify({
         title,
         slug,
         amountOfVideos: 0
       })
     }) */

    await mutateAsync({ title })
  }

  const slug = watch('title') ? getSlugFromString(watch('title')) : ''

  const { mutateAsync } = useMutation({
    mutationFn: async ({ title }: CreateTagSchemaData) => {
      await fetch('http://localhost:3333/tags', {
        method: 'POST',
        body: JSON.stringify({
          title,
          slug,
          amountOfVideos: 0
        })
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['get-tags']
      })
    }
  })

  return (
    <form onSubmit={handleSubmit(createTag)} className="w-full space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium block" htmlFor="name">Tag Name</label>
        <input
          {...register('title')}
          className="border border-zinc-800 rounded-lg px-3 py-3 bg-zinc-800/50 w-full text-sm outline-none focus:border-teal-400"
          type="text"
          id="name"
        />
        {formState.errors.title && <p className="text-sm text-red-400">{formState.errors.title.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium block" htmlFor="slug">Slug</label>
        <input
          value={slug}
          className="border border-zinc-800 rounded-lg px-3 py-3 bg-zinc-800/50 w-full outline-none  text-sm"
          type="text"
          readOnly
          id="slug"
        />
      </div>

      <div className="flex items-center justify-end gap-2">
        <Dialog.Close asChild>
          <Button>
            <X className="size-3" />
            Cancel
          </Button>
        </Dialog.Close>
        <Button disabled={formState.isSubmitting} type="submit" className="bg-teal-400 text-teal-950">
          {formState.isSubmitting ? <Loader2 className="size-3 animate-spin" /> : <Check className="size-3" />}
          Save
        </Button>
      </div>
    </form>
  )
}