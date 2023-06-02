import {
	json,
	type DataFunctionArgs,
	type V2_MetaFunction,
} from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import invariant from 'tiny-invariant'
import { GeneralErrorBoundary } from '~/components/error-boundary.tsx'
import { Spacer } from '~/components/spacer.tsx'
import { prisma } from '~/utils/db.server.ts'
import { ButtonLink } from '~/utils/forms.tsx'
import { getUserImgSrc } from '~/utils/misc.ts'
import { useOptionalUser } from '~/utils/user.ts'

export async function loader({ params }: DataFunctionArgs) {
	invariant(params.username, 'Missing username')
	const user = await prisma.user.findUnique({
		where: { username: params.username },
		select: {
			id: true,
			username: true,
			name: true,
			imageId: true,
			createdAt: true,
			pantries: true
		},
	})
	if (!user) {
		throw new Response('not found', { status: 404 })
	}
	return json({ user, userJoinedDisplay: user.createdAt.toLocaleDateString() })
}

export default function UsernameIndex() {
	const data = useLoaderData<typeof loader>()
	const user = data.user
	const userDisplayName = user.name ?? user.username
	const loggedInUser = useOptionalUser()
	const isLoggedInUser = data.user.id === loggedInUser?.id

	return (
		<div className="container mx-auto mb-48 mt-36 flex flex-col items-center justify-center">
			<Spacer size="4xs" />

			<div className="container mx-auto flex flex-col items-center rounded-3xl bg-night-500 p-12">
				<div className="relative w-52">
					<div className="absolute -top-40">
						<div className="relative">
							<img
								src={getUserImgSrc(data.user.imageId)}
								alt={userDisplayName}
								className="h-52 w-52 rounded-full object-cover"
							/>
						</div>
					</div>
				</div>

				<Spacer size="sm" />

				<div className="flex flex-col items-center">
					<div className="flex flex-wrap items-center justify-center gap-4">
						<h1 className="text-center text-h2">{userDisplayName}</h1>
					</div>
					<p className="mt-2 text-center text-night-200">
						Joined {data.userJoinedDisplay}
					</p>
					<div className="mt-10 flex gap-4">
						{isLoggedInUser ? (
							<>
								<ButtonLink
									to="items"
									variant="primary"
									size="md"
									prefetch="intent"
								>
									My items
								</ButtonLink>
								<ButtonLink
									to="/settings/profile"
									variant="secondary"
									size="md"
									prefetch="intent"
								>
									Edit profile
								</ButtonLink>
							</>
						) : (
							<ButtonLink
								to="notes"
								variant="primary"
								size="md"
								prefetch="intent"
							>
								{userDisplayName}'s items
							</ButtonLink>
						)}
					</div>
				</div>
			</div>

			<Spacer size="sm" />
			<div className="grid grid-cols-2 gap-16 md:grid-cols-3">
				{user?.pantries?.map((pantry) => (

				<div key={pantry.id} className="grid items-center justify-items-center gap-4 rounded-3xl bg-night-500 p-12 text-center">
					<h4>{pantry.title}</h4>
					<ButtonLink size="xs" to={`pantries/${pantry.id}`} variant="primary">
						View items
					</ButtonLink>
				</div>))
				}

			</div>
		</div>
	)
}

export function ErrorBoundary() {
	return (
		<GeneralErrorBoundary
			statusHandlers={{
				404: ({ params }) => (
					<p>No user with the username "{params.username}" exists</p>
				),
			}}
		/>
	)
}

export const meta: V2_MetaFunction<typeof loader> = ({ data, params }) => {
	const displayName = data?.user.name ?? params.username
	return [{ title: `${displayName} | Foodventory` }]
}
