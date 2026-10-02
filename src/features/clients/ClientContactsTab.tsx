import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Phone, Plus, Trash2, User } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Dialog } from '../../components/ui/Dialog';
import { Card } from '../../components/ui/Card';
import { useAuth } from '../../hooks/AuthContext';
import { useAddContact, useRemoveContact, useUpdateContact } from '../../hooks/useClients';
import type { Client, ClientContact } from '../../types/client';

const contactSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(5, 'Phone is required'),
  role: z.string().min(2, 'Role is required'),
});

type ContactValues = z.infer<typeof contactSchema>;

interface Props {
  client: Client;
}

export function ClientContactsTab({ client }: Props) {
  const { can } = useAuth();
  const canEdit = can('clients', 'edit');
  const addContact = useAddContact();
  const updateContact = useUpdateContact();
  const removeContact = useRemoveContact();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<ClientContact | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: '', email: '', phone: '', role: '' },
  });

  const openAdd = () => {
    setEditingContact(null);
    reset({ name: '', email: '', phone: '', role: '' });
    setDialogOpen(true);
  };

  const openEdit = (contact: ClientContact) => {
    setEditingContact(contact);
    reset(contact);
    setDialogOpen(true);
  };

  const onSubmit = async (values: ContactValues) => {
    if (editingContact) {
      await updateContact.mutateAsync({
        clientId: client.id,
        contact: { ...editingContact, ...values },
      });
    } else {
      await addContact.mutateAsync({ clientId: client.id, contact: values });
    }
    setDialogOpen(false);
  };

  const handleDelete = async (contactId: string) => {
    if (window.confirm('Delete this contact?')) {
      await removeContact.mutateAsync({ clientId: client.id, contactId });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Contacts</h2>
        {canEdit && (
          <button
            onClick={openAdd}
            className="flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            <Plus size={16} /> Add Contact
          </button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {client.contacts.map((contact) => (
          <Card key={contact.id} className="relative">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <User size={18} />
                </div>
                <div>
                  <p className="font-medium">{contact.name}</p>
                  <p className="text-xs text-muted-foreground">{contact.role}</p>
                </div>
              </div>
              {canEdit && (
                <button
                  onClick={() => handleDelete(contact.id)}
                  className="rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
            <div className="mt-4 space-y-1 text-sm">
              <p className="flex items-center gap-2 text-muted-foreground">
                <Mail size={14} /> {contact.email}
              </p>
              <p className="flex items-center gap-2 text-muted-foreground">
                <Phone size={14} /> {contact.phone}
              </p>
            </div>
            {canEdit && (
              <button
                onClick={() => openEdit(contact)}
                className="mt-4 text-xs font-medium text-primary hover:underline"
              >
                Edit contact
              </button>
            )}
          </Card>
        ))}
        {client.contacts.length === 0 && (
          <Card className="flex flex-col items-center justify-center p-8 text-center md:col-span-2 lg:col-span-3">
            <p className="text-sm text-muted-foreground">No contacts added yet.</p>
          </Card>
        )}
      </div>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title={editingContact ? 'Edit Contact' : 'Add Contact'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <label className="mb-1 block text-sm font-medium">Name</label>
            <input {...register('name')} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
            {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Role / Title</label>
            <input {...register('role')} className="w-full rounded-md border bg-background px-3 py-2 text-sm" placeholder="e.g. Primary Contact" />
            {errors.role && <p className="mt-1 text-xs text-destructive">{errors.role.message}</p>}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Email</label>
              <input type="email" {...register('email')} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
              {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Phone</label>
              <input {...register('phone')} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
              {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone.message}</p>}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setDialogOpen(false)} className="rounded-md border px-4 py-2 text-sm hover:bg-accent">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving…' : editingContact ? 'Save Changes' : 'Add Contact'}
            </button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}