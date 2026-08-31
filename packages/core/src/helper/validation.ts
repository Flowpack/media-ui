export const LABEL_PATTERN = /^[^\s]([\s\S]{0,253}[^\s])?$/;

export const validateLabelOrTitle = (value: string | null | undefined): boolean => LABEL_PATTERN.test(value ?? '');
