import { json, type DataFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { ItemEditor } from '~/routes/resources+/item-editor.tsx'
import { prisma } from '~/utils/db.server.ts'

export async function loader({ params }: DataFunctionArgs) {
	const item = await prisma.item.findUnique({
		where: {
			id: params.noteId,
		},
	})
	if (!item) {
		throw new Response('Not found', { status: 404 })
	}
	return json({ item: item })
}

export default function NoteEdit() {
	const data = useLoaderData<typeof loader>()

	return <ItemEditor item={data.item} />
}
