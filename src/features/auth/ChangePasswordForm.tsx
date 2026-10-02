import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useAuth } from '../../hooks/AuthContext';
import { useChangePassword } from '../../hooks/useProfile';

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type PasswordValues = z.infer<typeof passwordSchema>;

const inputClass =
  'w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring';

export function ChangePasswordForm() {
  const { user } = useAuth();
  const changePassword = useChangePassword();
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  if (!user) return null;

  const onSubmit = async (values: PasswordValues) => {
    setSuccess(false);
    try {
      await changePassword.mutateAsync({
        userId: user.id,
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      setSuccess(true);
      reset();
    } catch {
      // error shown via changePassword.isError below
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {success && (
        <div className="flex items-center gap-2 rounded-md bg-green-100 px-3 py-2 text-sm text-green-700">
          <CheckCircle2 size={16} /> Password updated successfully.
        </div>
      )}
      {changePassword.isError && (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {changePassword.error instanceof Error
            ? changePassword.error.message
            : 'Failed to update password'}
        </div>
      )}
      <div>
        <label htmlFor="current-password" className="mb-1 block text-sm font-medium">
          Current password
        </label>
        <input id="current-password" type="password" className={inputClass} {...register('currentPassword')} />
        {errors.currentPassword && (
          <p className="mt-1 text-xs text-destructive">{errors.currentPassword.message}</p>
        )}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="new-password" className="mb-1 block text-sm font-medium">
            New password
          </label>
          <input id="new-password" type="password" className={inputClass} {...register('newPassword')} />
          {errors.newPassword && (
            <p className="mt-1 text-xs text-destructive">{errors.newPassword.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="confirm-password" className="mb-1 block text-sm font-medium">
            Confirm new password
          </label>
          <input id="confirm-password" type="password" className={inputClass} {...register('confirmPassword')} />
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-destructive">{errors.confirmPassword.message}</p>
          )}
        </div>
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
      >
        {isSubmitting ? 'Updating…' : 'Update Password'}
      </button>
    </form>
  );
}