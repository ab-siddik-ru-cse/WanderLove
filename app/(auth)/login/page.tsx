'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Heart } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';

const LoginFormSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

type LoginFormValues = z.infer<typeof LoginFormSchema>;

export default function LoginPage() {
  const { login, isLoading, error } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormValues>({ resolver: zodResolver(LoginFormSchema) });

  const onSubmit = (values: LoginFormValues) => {
    void login(values);
  };

  return (
    <div>
      <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold">
        <Heart className="h-5 w-5 fill-primary text-primary" /> Welcome back
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input label="Email" type="email" placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
        <Input label="Password" type="password" placeholder="••••••••" error={errors.password?.message} {...register('password')} />
        {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}
        <Button type="submit" isLoading={isLoading} className="mt-2 w-full">
          Log in
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-ink/60">
        New to WanderLove?{' '}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
