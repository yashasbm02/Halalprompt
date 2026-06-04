import { Controller, type UseFormReturn } from 'react-hook-form'
import type { Field } from '../schema/types'
import type { Answers } from '../schema/types'
import { Input } from './ui/Input'
import { Textarea } from './ui/Textarea'
import { NativeSelect } from './ui/NativeSelect'
import { MultiSelect } from './ui/MultiSelect'
import { Label } from './ui/Label'

interface FormFieldProps {
  field: Field
  form: UseFormReturn<Answers>
}

export function FormField({ field, form }: FormFieldProps) {
  const {
    register,
    control,
    watch,
    formState: { errors },
  } = form

  const errorMsg = errors[field.id]?.message as string | undefined
  const currentValue = watch(field.id)
  const isTextLike = field.kind === 'text' || field.kind === 'textarea'
  const charCount =
    isTextLike &&
    field.maxLength != null &&
    typeof currentValue === 'string'
      ? currentValue.length
      : null

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <Label htmlFor={field.id} required={field.required}>
          {field.label}
        </Label>
        {charCount !== null && isTextLike && field.maxLength != null && (
          <span
            className={`text-xs tabular-nums ${
              charCount > field.maxLength * 0.9
                ? 'text-amber-500'
                : 'text-gray-400'
            }`}
          >
            {charCount}/{field.maxLength}
          </span>
        )}
      </div>

      {field.kind === 'text' && (
        <Input
          id={field.id}
          placeholder={field.placeholder}
          error={!!errorMsg}
          {...register(field.id)}
        />
      )}

      {field.kind === 'textarea' && (
        <Textarea
          id={field.id}
          placeholder={field.placeholder}
          rows={field.rows ?? 3}
          error={!!errorMsg}
          {...register(field.id)}
        />
      )}

      {field.kind === 'select' && (
        <Controller
          name={field.id}
          control={control}
          render={({ field: f }) => (
            <NativeSelect
              id={field.id}
              options={field.options}
              value={typeof f.value === 'string' ? f.value : ''}
              onChange={f.onChange}
              error={!!errorMsg}
            />
          )}
        />
      )}

      {field.kind === 'multiselect' && (
        <Controller
          name={field.id}
          control={control}
          render={({ field: f }) => (
            <MultiSelect
              options={field.options}
              value={Array.isArray(f.value) ? f.value : []}
              onChange={f.onChange}
            />
          )}
        />
      )}

      {field.hint && !errorMsg && (
        <p className="text-xs text-gray-400">{field.hint}</p>
      )}
      {errorMsg && <p className="text-xs text-red-500">{errorMsg}</p>}
    </div>
  )
}
