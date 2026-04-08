import { z } from 'zod';
import { AGE_REQUIREMENTS, EVENT_VISIBILITIES } from '@/lib/db/enums';

export const EVENT_FLYER_BUCKET = 'event-flyers';
export const MAX_FLYER_FILE_SIZE_BYTES = 5 * 1024 * 1024;

const eventBaseSchema = z
  .object({
    title: z.string().trim().min(3, 'Title must be at least 3 characters.').max(140, 'Title is too long.'),
    description: z
      .string()
      .trim()
      .min(20, 'Description must be at least 20 characters.')
      .max(5000, 'Description is too long.'),
    venue_name: z.string().trim().min(2, 'Venue name is required.').max(160, 'Venue name is too long.'),
    address_line1: z.string().trim().max(180, 'Address is too long.').optional(),
    city: z.string().trim().min(2, 'City is required.').max(120, 'City is too long.'),
    state: z.string().trim().min(2, 'State is required.').max(120, 'State is too long.'),
    postal_code: z.string().trim().max(32, 'Postal code is too long.').optional(),
    starts_at: z.string().datetime({ offset: true, message: 'Start date is required.' }),
    ends_at: z.string().datetime({ offset: true, message: 'End date is invalid.' }).optional(),
    category_id: z.string().uuid('Invalid category selected.'),
    visibility: z.enum(EVENT_VISIBILITIES),
    age_requirement: z.enum(AGE_REQUIREMENTS),
    external_url: z
      .string()
      .trim()
      .url('External URL must be a valid URL starting with http:// or https://.')
      .optional(),
    timezone: z.string().trim().min(1, 'Timezone is required.')
  })
  .superRefine((data, ctx) => {
    if (data.ends_at && new Date(data.ends_at).getTime() <= new Date(data.starts_at).getTime()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'End time must be after start time.',
        path: ['ends_at']
      });
    }
  });

export function parseEventInput(formData: FormData) {
  const parsed = eventBaseSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    venue_name: formData.get('venue_name'),
    address_line1: emptyAsUndefined(formData.get('address_line1')),
    city: formData.get('city'),
    state: formData.get('state'),
    postal_code: emptyAsUndefined(formData.get('postal_code')),
    starts_at: toIsoString(formData.get('starts_at')),
    ends_at: toIsoString(emptyAsUndefined(formData.get('ends_at'))),
    category_id: formData.get('category_id'),
    visibility: formData.get('visibility'),
    age_requirement: formData.get('age_requirement'),
    external_url: emptyAsUndefined(formData.get('external_url')),
    timezone: formData.get('timezone') ?? 'America/Los_Angeles'
  });

  return parsed;
}

export function validateFlyerFile(file: File) {
  const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

  if (!allowedTypes.has(file.type)) {
    return 'Flyer must be a JPG, PNG, or WEBP image.';
  }

  if (file.size > MAX_FLYER_FILE_SIZE_BYTES) {
    return 'Flyer image must be 5MB or smaller.';
  }

  return null;
}

export function slugifyTitle(title: string) {
  return (
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80) || 'event'
  );
}

function emptyAsUndefined(value: FormDataEntryValue | null) {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
}

function toIsoString(value: FormDataEntryValue | null | undefined) {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }

  return parsed.toISOString();
}
