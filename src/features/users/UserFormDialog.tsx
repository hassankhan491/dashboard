import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Dialog } from '../../components/ui/Dialog';
import {
  useClientOptions, useCreateUser, useDepartments,
  useRoles, useUpdateUser, useWarehouseOptions,
} from '../../hooks/useUsers';
import type { User } from '../../types/auth';

const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  roleId: z.string().min(1, 'Role is required'),
  departmentId: z.string(),
  clientIds: z.array(z.string()),
  warehouseIds: z.array(z.string()),
  isActive: z.boolean(),
});

type UserFormValues = z.infer<typeof userSchema>;

interface Props {
  open: boolean;
  onClose: () => void;
  user: User | null; // null = create mode
}

const inputClass =
  'w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring';

export function UserFormDialog({ open, onClose, user }: Props) {
  const { data: roles } = useRoles();
  const { data: departments } = useDepartments();
  const { data: clientOptions } = useClientOptions();
  const { data: warehouseOptions } = useWarehouseOptions();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '', email: '', roleId: '', departmentId: '',
      clientIds: [], warehouseIds: [], isActive: true,
    },
  });

  // Re-seed the form every time the dialog opens
  useEffect(() => {
    if (!open) return;
    reset(
      user
        ? {
            name: user.name,
            email: user.email,
            roleId: user.role.id,
            departmentId: user.department?.id ?? '',
            clientIds: user.clientIds,
            warehouseIds: user.warehouseIds,
            isActive: user.isActive,
          }
        : {
            name: '', email: '', roleId: '', departmentId: '',
            clientIds: [], warehouseIds: [], isActive: true,
          },
    );
  }, [open, user, reset]);

  const onSubmit = async (values: UserFormValues) => {
    const input = { ...values, departmentId: values.departmentId || undefined };
    try {
      if (user) {
        await updateUser.mutateAsync({ id: user.id, input });
      } else {
        await createUser.mutateAsync(input);
      }
      onClose();
    } catch {
      // Keep dialog open on failure; toasts come in Phase 10
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title={user ? 'Edit User' : 'Add User'} wide>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="user-name" className="mb-1 block text-sm font-medium">Full Name</label>
            <input id="user-name" className={inputClass} placeholder="e.g. Ahmed Khan" {...register('name')} />
            {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div>
            <label htmlFor="user-email" className="mb-1 block text-sm font-medium">Email</label>
            <input id="user-email" type="email" className={inputClass} placeholder="user@shariqenterprises.com" {...register('email')} />
            {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <div>
            <label htmlFor="user-role" className="mb-1 block text-sm font-medium">Role</label>
            <select id="user-role" className={inputClass} {...register('roleId')}>
              <option value="">Select role…</option>
              {roles?.map((role) => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </select>
            {errors.roleId && <p className="mt-1 text-xs text-destructive">{errors.roleId.message}</p>}
          </div>
          <div>
            <label htmlFor="user-department" className="mb-1 block text-sm font-medium">Department</label>
            <select id="user-department" className={inputClass} {...register('departmentId')}>
              <option value="">No department</option>
              {departments?.map((dep) => (
                <option key={dep.id} value={dep.id}>{dep.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <fieldset>
            <legend className="mb-2 text-sm font-medium">Client access (none = all clients)</legend>
            <div className="space-y-1 rounded-md border p-3">
              {clientOptions?.map((client) => (
                <label key={client.id} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" value={client.id} {...register('clientIds')} />
                  {client.name}
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="mb-2 text-sm font-medium">Warehouse access (none = all)</legend>
            <div className="space-y-1 rounded-md border p-3">
              {warehouseOptions?.map((wh) => (
                <label key={wh.id} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" value={wh.id} {...register('warehouseIds')} />
                  {wh.name}
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...register('isActive')} />
          Active user
        </label>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent">
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving…' : user ? 'Save Changes' : 'Create User'}
          </button>
        </div>
      </form>
    </Dialog>
  );
}