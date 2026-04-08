'use client';

import { useActionState } from 'react';
import type { AgeRequirement, EventVisibility } from '@/lib/db/enums';
import type { OrganizerCategory, OrganizerEventFormData } from '@/lib/organizer/queries';

type ActionState = { error: string | null };

type OrganizerEventFormProps = {
  mode: 'create' | 'edit';
  categories: OrganizerCategory[];
  initialValues?: OrganizerEventFormData;
  submitAction: (state: ActionState, formData: FormData) => Promise<ActionState>;
};

const defaultState: ActionState = { error: null };

export function OrganizerEventForm({ mode, categories, initialValues, submitAction }: OrganizerEventFormProps) {
  const [state, formAction, isPending] = useActionState(submitAction, defaultState);

  const defaultStartsAt = initialValues?.starts_at ? toDatetimeLocal(initialValues.starts_at) : '';
  const defaultEndsAt = initialValues?.ends_at ? toDatetimeLocal(initialValues.ends_at) : '';

  return (
    <form action={formAction} className="space-y-4 rounded-xl border border-border bg-card p-4">
      {state.error ? <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">{state.error}</p> : null}

      <div className="grid gap-2">
        <label htmlFor="title" className="text-sm font-medium">
          Title
        </label>
        <input id="title" name="title" required defaultValue={initialValues?.title ?? ''} className="rounded-md border border-input bg-background px-3 py-2 text-sm" />
      </div>

      <div className="grid gap-2">
        <label htmlFor="description" className="text-sm font-medium">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          required
          rows={5}
          defaultValue={initialValues?.description ?? ''}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>

      <div className="grid gap-2">
        <label htmlFor="flyer_file" className="text-sm font-medium">
          Flyer image {mode === 'create' ? '(required)' : '(optional)'}
        </label>
        <input id="flyer_file" name="flyer_file" type="file" accept="image/jpeg,image/png,image/webp" required={mode === 'create'} className="text-sm" />
        {initialValues?.flyer_url ? <p className="text-xs text-muted-foreground">Current flyer is already uploaded.</p> : null}
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <Field label="Venue name" name="venue_name" required defaultValue={initialValues?.venue_name ?? ''} />
        <Field label="Address line 1" name="address_line1" defaultValue={initialValues?.address_line1 ?? ''} />
        <Field label="City" name="city" required defaultValue={initialValues?.city ?? ''} />
        <Field label="State" name="state" required defaultValue={initialValues?.state ?? ''} />
        <Field label="Postal code" name="postal_code" defaultValue={initialValues?.postal_code ?? ''} />
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <div className="grid gap-2">
          <label htmlFor="starts_at" className="text-sm font-medium">
            Start date/time
          </label>
          <input
            id="starts_at"
            name="starts_at"
            type="datetime-local"
            required
            defaultValue={defaultStartsAt}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>

        <div className="grid gap-2">
          <label htmlFor="ends_at" className="text-sm font-medium">
            End date/time
          </label>
          <input
            id="ends_at"
            name="ends_at"
            type="datetime-local"
            defaultValue={defaultEndsAt}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
      </div>

      <input type="hidden" name="timezone" value={Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Los_Angeles'} />

      <div className="grid gap-2 sm:grid-cols-2">
        <div className="grid gap-2">
          <label htmlFor="category_id" className="text-sm font-medium">
            Category
          </label>
          <select
            id="category_id"
            name="category_id"
            required
            defaultValue={initialValues?.category_id ?? ''}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="" disabled>
              Select a category
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        <SelectField
          label="Visibility"
          name="visibility"
          options={[
            ['public', 'Public'],
            ['registered', 'Registered users'],
            ['verified_21_plus', 'Verified 21+'],
            ['admin_only', 'Admin only']
          ]}
          defaultValue={(initialValues?.visibility ?? 'public') as EventVisibility}
        />

        <SelectField
          label="Age requirement"
          name="age_requirement"
          options={[
            ['all_ages', 'All ages'],
            ['age_18_plus', '18+ only'],
            ['age_21_plus', '21+ only']
          ]}
          defaultValue={(initialValues?.age_requirement ?? 'all_ages') as AgeRequirement}
        />

        <Field label="External URL" name="external_url" type="url" defaultValue={initialValues?.external_url ?? ''} />
      </div>

      <button
        type="submit"
        disabled={isPending || categories.length === 0}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? 'Saving…' : mode === 'create' ? 'Create event submission' : 'Save event changes'}
      </button>
    </form>
  );
}

function Field({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div className="grid gap-2">
      <label htmlFor={props.name} className="text-sm font-medium">
        {label}
      </label>
      <input {...props} id={props.name} className="rounded-md border border-input bg-background px-3 py-2 text-sm" />
    </div>
  );
}

function SelectField({
  label,
  name,
  options,
  defaultValue
}: {
  label: string;
  name: string;
  options: [string, string][];
  defaultValue: string;
}) {
  return (
    <div className="grid gap-2">
      <label htmlFor={name} className="text-sm font-medium">
        {label}
      </label>
      <select id={name} name={name} defaultValue={defaultValue} className="rounded-md border border-input bg-background px-3 py-2 text-sm">
        {options.map(([value, text]) => (
          <option key={value} value={value}>
            {text}
          </option>
        ))}
      </select>
    </div>
  );
}

function toDatetimeLocal(value: string) {
  const date = new Date(value);
  const tzOffset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - tzOffset * 60_000);
  return localDate.toISOString().slice(0, 16);
}
