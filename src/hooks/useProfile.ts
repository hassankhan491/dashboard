import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/authService';

interface ChangePasswordInput {
  userId: string;
  currentPassword: string;
  newPassword: string;
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (input: ChangePasswordInput) =>
      authService.changePassword(input.userId, input.currentPassword, input.newPassword),
  });
}