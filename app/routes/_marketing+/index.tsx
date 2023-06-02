import type { V2_MetaFunction } from '@remix-run/node'
import { pantry } from './logos/logos.ts'
export const meta: V2_MetaFunction = () => [{ title: 'Epic Notes' }]

export default function Index() {
	return (
		<main className="relative min-h-screen sm:flex sm:items-center sm:justify-center">
			<div className="relative sm:pb-16 sm:pt-8">
				<div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
					<div className="relative shadow-xl sm:overflow-hidden sm:rounded-2xl">
						<div className="absolute inset-0">
							<img className="h-full w-full object-cover" src={pantry} alt="" />
							<div className="absolute inset-0 bg-[color:rgba(30,23,38,0.75)] mix-blend-multiply" />
						</div>
						<div className="lg:pt-18 relative px-4 pb-8 pt-8 sm:px-6 sm:pb-14 sm:pt-16 lg:px-8 lg:pb-20">
							<h1 className="text-center text-3xl font-extrabold uppercase tracking-tight  sm:text-8xl ">
								<span className="block text-mega capitalize text-accent-yellow">
									Effortlessly Track your freezer and pantry items
								</span>
							</h1>
							<p className='text-center '>
								Never waste food again. Stay organized and plan meals with ease
							</p>
						</div>
					</div>
				</div>
			</div>
		</main>
	)
}
