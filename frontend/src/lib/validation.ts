// Input validation constants and utilities

export const VALIDATION_LIMITS = {
  TITLE_MAX_LENGTH: 200,
  CONTENT_MAX_LENGTH: 50000,
  DESCRIPTION_MAX_LENGTH: 500,
  TAG_MAX_LENGTH: 50,
  TAG_MAX_COUNT: 10,
} as const;

export interface ValidationError {
  field: string;
  message: string;
}

export function validatePromptInput(data: {
  title?: string;
  content?: string;
  tags?: string[];
}): ValidationError[] {
  const errors: ValidationError[] = [];

  // Validate title
  if (data.title !== undefined) {
    const trimmedTitle = data.title.trim();
    if (trimmedTitle.length === 0) {
      errors.push({ field: 'title', message: 'Title is required' });
    } else if (trimmedTitle.length > VALIDATION_LIMITS.TITLE_MAX_LENGTH) {
      errors.push({
        field: 'title',
        message: `Title must be ${VALIDATION_LIMITS.TITLE_MAX_LENGTH} characters or less`,
      });
    }
  }

  // Validate content
  if (data.content !== undefined) {
    const trimmedContent = data.content.trim();
    if (trimmedContent.length === 0) {
      errors.push({ field: 'content', message: 'Content is required' });
    } else if (trimmedContent.length > VALIDATION_LIMITS.CONTENT_MAX_LENGTH) {
      errors.push({
        field: 'content',
        message: `Content must be ${VALIDATION_LIMITS.CONTENT_MAX_LENGTH} characters or less`,
      });
    }
  }

  // Validate tags
  if (data.tags !== undefined) {
    if (data.tags.length > VALIDATION_LIMITS.TAG_MAX_COUNT) {
      errors.push({
        field: 'tags',
        message: `Maximum ${VALIDATION_LIMITS.TAG_MAX_COUNT} tags allowed`,
      });
    }

    for (const tag of data.tags) {
      if (tag.length > VALIDATION_LIMITS.TAG_MAX_LENGTH) {
        errors.push({
          field: 'tags',
          message: `Each tag must be ${VALIDATION_LIMITS.TAG_MAX_LENGTH} characters or less`,
        });
        break; // Only report once
      }
    }
  }

  return errors;
}

export function validateDescription(description: string): ValidationError | null {
  const trimmed = description.trim();

  if (trimmed.length === 0) {
    return { field: 'description', message: 'Description is required' };
  }

  if (trimmed.length > VALIDATION_LIMITS.DESCRIPTION_MAX_LENGTH) {
    return {
      field: 'description',
      message: `Description must be ${VALIDATION_LIMITS.DESCRIPTION_MAX_LENGTH} characters or less`,
    };
  }

  return null;
}
