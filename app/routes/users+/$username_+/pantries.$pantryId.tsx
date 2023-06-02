import { json, type DataFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import invariant from 'tiny-invariant'
import { GeneralErrorBoundary } from '~/components/error-boundary.tsx'
import { DeleteNote } from '~/routes/resources+/delete-note.tsx'
import { getUserId } from '~/utils/auth.server.ts'
import { prisma } from '~/utils/db.server.ts'
import { ButtonLink } from '~/utils/forms.tsx'

export async function loader({ request, params }: DataFunctionArgs) {
	const userId = await getUserId(request)
	invariant(params.pantryId, 'Missing pantryId')
	const pantry = await prisma.pantry.findUnique({
		where: {
			id: params.pantryId,
		},
		select: {
			id: true,
			title: true,
			items: true,
			ownerId: true,
		},
	})
	if (!pantry) {
		throw new Response('Not found', { status: 404 })
	}
	return json({ pantry, isOwner: userId === pantry.ownerId })
}

export default function NoteRoute() {
	const { pantry, isOwner } = useLoaderData<typeof loader>()

	return (
		<div className="flex h-full flex-col">
			<div className="flex-grow">
				<h2 className="mb-2 text-h2 lg:mb-6">
					{pantry.title} - {pantry.items.length} items
				</h2>
				<ul>
					{pantry.items.map(item => (
						<li key={item.id}>
							{item.title} - {item.quantity}
							{item.quantityUnit}
						</li>
					))}
				</ul>
			</div>
			{/* {isOwner ? (
				<div className="flex justify-end gap-4">
					<DeleteNote id={.item.id} />
					<ButtonLink size="md" variant="primary" to="edit">
						Edit
					</ButtonLink>
				</div>
			) : null} */}
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
