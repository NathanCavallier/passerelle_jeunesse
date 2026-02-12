'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuthForm } from '@/hooks/use-auth-form';
import { Loader2, ArrowLeft } from 'lucide-react';

const resetPasswordSchema = z.object({
  email: z.string().email('Adresse email invalide'),
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordForm() {
  const { loading, handlePasswordReset } = useAuthForm();

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    await handlePasswordReset(data.email);
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Mot de passe oublié</h1>
        <p className="text-muted-foreground">
          Entrez votre adresse email pour recevoir un lien de réinitialisation
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="votre@email.com"
                    {...field}
                    disabled={loading}
                  />
                </FormControl>
                <FormDescription>
                  Nous vous enverrons un email avec un lien pour créer un nouveau mot de passe
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Envoi en cours...
              </>
            ) : (
              'Envoyer le lien de réinitialisation'
            )}
          </Button>

          <Button
            type="button"
            variant="ghost"
            className="w-full"
            asChild
          >
            <Link href="/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à la connexion
            </Link>
          </Button>
        </form>
      </Form>
    </div>
  );
}
