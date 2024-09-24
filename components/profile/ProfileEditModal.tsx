'use client';

import { checkUsername } from '@/app/@auth/actions';
import { UsernameSchema } from '@/app/@auth/schemas';
import { Button } from '@/components/core/Button';
import { Group } from '@/components/core/Group';
import { Input } from '@/components/core/Input';
import { Modal, type ModalProps } from '@/components/core/Modal';
import { Text } from '@/components/core/Text';
import { Textarea } from '@/components/core/Textarea';
import { Tooltip } from '@/components/core/Tooltip';
import { useUser } from '@/context/userContext';
import { type SocialKey, socialsData } from '@/utils/socials';
import supabase from '@/utils/supabase/browser';
import { valibotResolver } from '@hookform/resolvers/valibot';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { capitalize } from 'radashi';
import { useEffect, useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { RiExternalLinkLine } from 'react-icons/ri';
import {
  type InferInput,
  type MaxLengthAction,
  type SchemaWithPipe,
  type StringSchema,
  type TrimAction,
  maxLength,
  object,
  pipe,
  string,
  trim,
} from 'valibot';

dayjs.extend(relativeTime);

function SocialLink({ url }: { url: string }) {
  return (
    <Tooltip label='Open link'>
      <Button asChild className='p-0' tabIndex={-1} variant='text'>
        <a href={`https://${url}`} target='_blank' rel='noopener noreferrer'>
          <RiExternalLinkLine />
        </a>
      </Button>
    </Tooltip>
  );
}

const ProfileSchema = object({
  username: UsernameSchema,
  bio: pipe(string(), trim(), maxLength(512, 'Bio must have at most 512 characters')),
  keyboard: pipe(
    string(),
    trim(),
    maxLength(256, 'Keyboard details must have at most 256 characters'),
  ),
  socials: object({
    ...Object.keys(socialsData).reduce(
      (socials, name) => {
        const maxCharacters = name === 'website' ? 128 : 64;
        socials[name as SocialKey] = pipe(
          string(),
          trim(),
          maxLength(
            maxCharacters,
            `${name === 'website' ? 'Website URL' : capitalize(name)} username must have at most ${maxCharacters} characters`,
          ),
        );
        return socials;
      },
      {} as Record<
        SocialKey,
        SchemaWithPipe<
          [StringSchema<undefined>, TrimAction, MaxLengthAction<string, 128 | 64, string>]
        >
      >,
    ),
  }),
});
type ProfileInput = InferInput<typeof ProfileSchema>;

export function ProfileEditModal(props: ModalProps) {
  const { opened, onClose } = props;
  const { user, updateUser } = useUser();
  const {
    formState: { errors, isDirty },
    handleSubmit,
    register,
    reset,
    setError,
    watch,
  } = useForm<ProfileInput>({
    defaultValues: { username: '', socials: {} },
    mode: 'onChange',
    resolver: valibotResolver(ProfileSchema),
  });
  const socials = watch('socials');
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit: SubmitHandler<ProfileInput> = async ({ username, bio, keyboard, socials }) => {
    if (!user) return;
    setIsLoading(true);
    try {
      if (user.name !== username) {
        const { data: usernameExists } = await checkUsername(username);
        if (usernameExists) {
          setError('username', { message: 'Username is already taken' }, { shouldFocus: true });
          return;
        }
        await supabase.auth.updateUser({ data: { name: username } });
      }
      await updateUser({
        name: username,
        nameLastChangedAt: user.name !== username ? dayjs().format() : null,
        bio,
        keyboard,
        socials,
      });
      onClose?.();
    } catch (e) {
      toast.error(`Failed to update profile! ${(e as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (opened && user) {
      const { name: username, bio, keyboard, socials } = user;
      reset({ username, bio, keyboard, socials });
    }
  }, [opened, reset, user]);

  return (
    <Modal {...props}>
      <form
        className='flex min-w-sm max-w-sm flex-col gap-3.5 transition'
        onSubmit={handleSubmit(onSubmit)}
      >
        <Text asChild className='text-2xl'>
          <h3>Edit profile</h3>
        </Text>
        <div className='flex flex-col gap-3'>
          <Input
            disabled={
              !!user?.nameLastChangedAt &&
              dayjs().diff(dayjs(user.nameLastChangedAt), 'days', true) < 30
            }
            error={errors.username?.message}
            label='username'
            {...register('username')}
          />
          <div className='-mt-2 flex flex-col'>
            <Text className='text-sub text-xs'>
              You can only change your username every 30 days.
            </Text>
            {user?.nameLastChangedAt && (
              <Text className='text-error text-xs'>
                Last changed {dayjs(user.nameLastChangedAt).fromNow()}.
              </Text>
            )}
          </div>
          <Textarea error={errors.bio?.message} label='bio' {...register('bio')} />
          <Textarea error={errors.keyboard?.message} label='keyboard' {...register('keyboard')} />
          <div className='flex flex-col gap-1.5'>
            <Text className='-mb-0.5 text-sm leading-none' dimmed>
              socials
            </Text>
            {Object.entries(socialsData).map(([key, { icon, url }]) => {
              const name = key as SocialKey;
              return (
                <Input
                  key={name}
                  error={errors.socials?.[name]?.message}
                  placeholder={name === 'website' ? 'website' : ''}
                  leftNode={
                    <div className='flex items-center gap-2'>
                      {icon}
                      <span className='-mr-2 leading-none'>
                        {!url && socials[name] ? 'https://' : url}
                      </span>
                    </div>
                  }
                  rightNode={socials[name] && <SocialLink url={`${url}${socials[name]}`} />}
                  {...register(`socials.${name}`)}
                />
              );
            })}
          </div>
        </div>
        <Group>
          <Button disabled={isLoading} onClick={onClose}>
            cancel
          </Button>
          <Button active disabled={!isDirty} loading={isLoading} type='submit'>
            save
          </Button>
        </Group>
      </form>
    </Modal>
  );
}
