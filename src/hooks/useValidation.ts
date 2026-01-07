import { useState, useCallback } from 'react';
import { z } from 'zod';

type ValidationErrors<T> = {
  [K in keyof T]?: string;
};

export function useValidation<T extends z.ZodType, U extends z.infer<T>>(
  schema: T,
  initialValues: U
) {
  const [errors, setErrors] = useState<ValidationErrors<U>>({});
  const [values, setValues] = useState<U>(initialValues);

  const validate = useCallback((): boolean => {
    try {
      schema.parse(values);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: ValidationErrors<U> = {};
        error.errors.forEach((err) => {
          if (err.path.length > 0) {
            const key = err.path[0] as keyof U;
            newErrors[key] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  }, [schema, values]);

  const updateField = useCallback(<K extends keyof U>(
    field: K,
    value: U[K]
  ) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }, []);

  const validateField = useCallback(<K extends keyof U>(field: K): boolean => {
    try {
      // Try to get shape if it's a ZodObject, otherwise just validate the whole object
      const zodSchema = schema as unknown as z.ZodObject<any>;
      if ('shape' in zodSchema && zodSchema.shape[field as string]) {
        zodSchema.shape[field as string].parse(values[field]);
      }
      setErrors((prev) => ({ ...prev, [field]: undefined }));
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors((prev) => ({
          ...prev,
          [field]: error.errors[0]?.message || 'Invalid value',
        }));
      }
      return false;
    }
  }, [schema, values]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
  }, [initialValues]);

  return {
    values,
    errors,
    updateField,
    validate,
    validateField,
    reset,
    setValues,
    hasErrors: Object.keys(errors).length > 0,
  };
}
