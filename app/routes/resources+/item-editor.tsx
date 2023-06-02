import { conform, useForm } from '@conform-to/react'
import { getFieldsetConstraint, parse } from '@conform-to/zod'
import { json, redirect, type DataFunctionArgs } from '@remix-run/node'
import { useFetcher } from '@remix-run/react'
import { z } from 'zod'
import { requireUserId } from '~/utils/auth.server.ts'
import { prisma } from '~/utils/db.server.ts'
import { Button, ErrorList, Field, SelectField, TextareaField } from '~/utils/forms.tsx'
import { quantityUnits } from '~/utils/unitQuantitys.ts'

export const ItemEditorSchema = z.object({
	id: z.string().optional(),
	title: z.string().min(1),
	content: z.string().nullish(),
	quantity: z.string().refine(value => !isNaN(Number(value))),
	quantityUnit: z.enum(quantityUnits),
})

export async function action({ request }: DataFunctionArgs) {
	const userId = await requireUserId(request)
	const formData = await request.formData()
	const submission = parse(formData, {
		schema: ItemEditorSchema,
		acceptMultipleErrors: () => true,
	})
	if (submission.intent !== 'submit') {
		return json({ status: 'idle', submission } as const)
	}
	if (!submission.value) {
		return json(
			{
				status: 'error',
				submission,
			} as const,
			{ status: 400 },
		)
	}
	let item: { id: string; owner: { username: string } }

	const { title, content, id } = submission.value

	const data = {
		ownerId: userId,
		title: title,
		content: content,
		quantity: 1,
		quantityUnit: 'count',
	}

	const select = {
		id: true,
		owner: {
			select: {
				username: true,
			},
		},
	}
	if (id) {
		const existingItem = await prisma.item.findFirst({
			where: { id, ownerId: userId },
			select: { id: true },
		})
		if (!existingItem) {
			return json(
				{
					status: 'error',
					submission,
				} as const,
				{ status: 404 },
			)
		}
		item = await prisma.item.update({
			where: { id },
			data,
			select,
		})
	} else {
		item = await prisma.item.create({ data, select })
	}
	return redirect(`/users/${item.owner.username}/items/${item.id}`)
}

export function ItemEditor({
	item,
}: {
	item?: { id: string; title: string; content?: string; quantity: number; quantityUnit: string }
}) {
	const itemEditorFetcher = useFetcher<typeof action>()

	const [form, fields] = useForm({
		id: 'item-editor',
		constraint: getFieldsetConstraint(ItemEditorSchema),
		lastSubmission: itemEditorFetcher.data?.submission,
		onValidate({ formData }) {

			return parse(formData, { schema: ItemEditorSchema.refine(data => console.log(data))  })
		},
		defaultValue: {
			title: item?.title,
			content: item?.content,
			quantity: item?.quantity,
			quantityUnit: item?.quantityUnit,
		},
		shouldRevalidate: 'onBlur',
	})

	return (
		<itemEditorFetcher.Form
			method="post"
			action="/resources/item-editor"
			{...form.props}
		>
			<input name="id" type="hidden" value={item?.id} />
			<Field
				labelProps={{ htmlFor: fields.title.id, children: 'Title' }}
				inputProps={{
					...conform.input(fields.title),
					autoComplete: 'title',
				}}
				errors={fields.title.errors}
			/>
			<TextareaField
				labelProps={{ htmlFor: fields.content.id, children: 'Content' }}
				textareaProps={{
					...conform.textarea(fields.content),
					autoComplete: 'content',
				}}
				errors={fields.content.errors}
			/>
				<Field
					labelProps={{ htmlFor: fields.quantity.id, children: 'Quantity' }}
					inputProps={{
						...conform.input(fields.quantity, {type: "text",}),
						autoComplete: 'quantity',
					}}
					errors={fields.quantity.errors}
				/>
				<SelectField
					options={quantityUnits}
					errors={fields.quantityUnit.errors}
					labelProps={{ htmlFor: fields.quantityUnit.id, children: 'Quantity Unit' }}
					selectProps={{
						...conform.select(fields.quantityUnit),

					}}
				/>

			<ErrorList errors={form.errors} id={form.errorId} />
			<div className="flex justify-end gap-4">
				<Button size="md" variant="secondary" type="reset">
					Reset
				</Button>
				<Button
					size="md"
					variant="primary"
					status={
						itemEditorFetcher.state === 'submitting'
							? 'pending'
							: itemEditorFetcher.data?.status ?? 'idle'
					}
					type="submit"
					disabled={itemEditorFetcher.state !== 'idle'}
				>
					Submit
				</Button>
			</div>
		</itemEditorFetcher.Form>
	)
}
