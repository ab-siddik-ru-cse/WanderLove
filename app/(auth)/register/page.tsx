'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Heart } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';

const RegisterFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

type RegisterFormValues = z.infer<typeof RegisterFormSchema>;

export default function RegisterPage() {
  const { register: registerUser, isLoading, error } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<RegisterFormValues>({ resolver: zodResolver(RegisterFormSchema) });

  const onSubmit = (values: RegisterFormValues) => {
    void registerUser(values);
  };

  return (
    <div>
      <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold">
        <Heart className="h-5 w-5 fill-primary text-primary" /> Start your story
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input label="Name" placeholder="Your name" error={errors.name?.message} {...register('name')} />
        <Input label="Email" type="email" placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
        <Input
          label="Password"
          type="password"
          placeholder="At least 6 characters"
          error={errors.password?.message}
          {...register('password')}
        />
        {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}
        <Button type="submit" isLoading={isLoading} className="mt-2 w-full">
          Create account
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-ink/60">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
