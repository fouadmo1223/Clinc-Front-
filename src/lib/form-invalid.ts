import { toast } from '@/hooks/use-toast';

/** Pass as the second argument to react-hook-form's handleSubmit(). */
export function onFormInvalid(message: string) {
  return () => toast.error(message);
}
