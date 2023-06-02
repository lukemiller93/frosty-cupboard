import { Item } from '@radix-ui/react-dropdown-menu'
import { json, type DataFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { GeneralErrorBoundary } from '~/components/error-boundary.tsx'
import { DeleteNote } from '~/routes/resources+/delete-note.tsx'
import { getUserId } from '~/utils/auth.server.ts'
import { prisma } from '~/utils/db.server.ts'
import { ButtonLink } from '~/utils/forms.tsx'

export async function loader({ request, params }: DataFunctionArgs) {
	const userId = await getUserId(request)
	const item = await prisma.item.findUnique({
		where: {
			id: params.noteId,
		},
		select: {
			id: true,
			title: true,
			content: true,
			ownerId: true,
			quantity: true,
			quantityUnit: true,
			pantryId: true,
		},
	})
	if (!item) {
		throw new Response('Not found', { status: 404 })
	}
	return json({ item: item, isOwner: userId === item.ownerId })
}

export default function NoteRoute() {
	const data = useLoaderData<typeof loader>()

	return (
		<div className="flex h-full flex-col">
			<div className="flex-grow">
				<h2 className="mb-2 text-h2 lg:mb-6">{data.item.title} - {data.item.quantity}{data.item.quantityUnit}</h2>
				<p className="text-sm md:text-lg">{data.item.content}</p>
				<p><strong>pantry id</strong>{data.item.pantryId }</p>
			</div>
			{data.isOwner ? (
				<div className="flex justify-end gap-4">
					<DeleteNote id={data.item.id} />
					<ButtonLink size="md" variant="primary" to="edit">
						Edit
					</ButtonLink>
				</div>
			) : null}
		</div>
	)
}

export function ErrorBoundary() {
	return (
		<GeneralErrorBoundary
			statusHandlers={{
				404: () => <p>Note not found</p>,
			}}
		/>
	)
}
