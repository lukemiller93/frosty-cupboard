import { Link, NavLink, Outlet, useLoaderData } from "@remix-run/react"
import {json, type DataFunctionArgs } from "@remix-run/server-runtime"
import {clsx} from "clsx"
import { requireUserId } from "~/utils/auth.server.ts"
import { prisma } from "~/utils/db.server.ts"

export async function loader({ params, request }: DataFunctionArgs) {
	await requireUserId(request, { redirectTo: null })
	const owner = await prisma.user.findUnique({
		where: {
			username: params.username,
		},
		select: {
			id: true,
			username: true,
			name: true,
			imageId: true,
		},
	})
	if (!owner) {
		throw new Response('Not found', { status: 404 })
	}
	const pantries = await prisma.pantry.findMany({
		where: {
			ownerId: owner.id,
		},
		select: {
			id: true,
			title: true,
			items: true,
		},
	})
	return json({ owner, items: pantries })
}

export default function PantriesRoute() {
	const {items} = useLoaderData<typeof loader>()
	const navLinkDefaultClassName =
		'line-clamp-2 block rounded-l-full py-2 pl-8 pr-6 text-base lg:text-xl'
	return (
		<div className="flex h-full pb-12">
			<div className="mx-auto grid w-full flex-grow bg-night-500 pl-2 [grid-auto-rows:max-content] md:container md:grid-cols-4 md:rounded-3xl md:[grid-auto-rows:auto]">
				<div className="col-span-1 py-12">

					<ul>
						<li>
							<NavLink
								to="new"
								className={({ isActive }) =>
									clsx(navLinkDefaultClassName, {
										'bg-night-400': isActive,
									})
								}
							>
								+ New Pantry
							</NavLink>
						</li>
						{items.map(item => (
							<li key={item.id}>
								<NavLink
									to={item.id}
									className={({ isActive }) =>
										clsx(navLinkDefaultClassName, {
											'bg-night-400': isActive,
										})
									}
								>
									{item.title} - {item.items.length} items
								</NavLink>
							</li>
						))}
					</ul>
				</div>
				<main className="bg-night-400 px-10 py-12 md:col-span-3 md:rounded-r-3xl">
					<Outlet />
				</main>
			</div>
		</div>
	)
}
