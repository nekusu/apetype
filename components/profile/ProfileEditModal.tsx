'use client';

import { Button, Group, Input, Modal, Text, Textarea, Tooltip } from '@/components/core';
import type { ModalProps } from '@/components/core/Modal';
import { useUser } from '@/context/userContext';
import { getFirebaseFirestore } from '@/utils/firebase';
import { type Social, socialIcons, socialNames, socialURLs } from '@/utils/socials';
import type { User } from '@/utils/user';
import { valibotResolver } from '@hookform/resolvers/valibot';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import type { FirebaseError } from 'firebase/app';
import { capitalize } from 'radashi';
import { useEffect, useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { RiExternalLinkLine, RiGlobalFill } from 'react-icons/ri';
import {
  type InferInput,
  type MaxLengthAction,
  type OptionalSchema,
  type SchemaWithPipe,
  type StringSchema,
  type TrimAction,
  maxLength,
  minLength,
  nonEmpty,
  object,
  optional,
  pipe,
  regex,
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
  username: pipe(
    string(),
    nonEmpty('Username is required'),
    minLength(3, 'Username must have at least 3 characters'),
    maxLength(32, 'Username must have at most 32 characters'),
    regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  ),
  bio: optional(pipe(string(), trim(), maxLength(512, 'Bio must have at most 512 characters'))),
  keyboard: optional(
    pipe(string(), trim(), maxLength(256, 'Keyboard details must have at most 256 characters')),
  ),
  socials: object({
    website: optional(
      pipe(string(), trim(), maxLength(128, 'Website URL must have at most 128 characters')),
    ),
    ...socialNames.reduce(
      (socials, name) => {
        socials[name] = optional(
          pipe(
            string(),
            trim(),
            maxLength(64, `${capitalize(name)} username must have at most 64 characters`),
          ),
        );
        return socials;
      },
      {} as Record<
        Social,
        OptionalSchema<
          SchemaWithPipe<
            [StringSchema<undefined>, TrimAction, MaxLengthAction<string, 64, string>]
          >,
          undefined
        >
      >,
    ),
  }),
});
type ProfileInput = InferInput<typeof ProfileSchema>;

export default function ProfileEditModal(props: ModalProps) {
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

  const onSubmit: SubmitHandler<ProfileInput> = async ({
    username,
    bio,
    keyboard,
    socials: { website, ..._socials },
  }) => {
    const { getDocuments, serverTimestamp, where } = await getFirebaseFirestore();
    try {
      setIsLoading(true);
      if (user?.name !== username) {
        const usersWithSameName = await getDocuments<User>('users', where('name', '==', username));
        if (usersWithSameName.size > 0) {
          setError('username', { message: 'Username is already taken' }, { shouldFocus: true });
          return;
        }
      }
      const socials = socialNames.reduce(
        (socials, name) => {
          socials[`socials.${name}`] = _socials[name];
          return socials;
        },
        {} as Record<`socials.${Social}`, string | undefined>,
      );
      await updateUser({
        name: username,
        nameLastChangedAt: user && user.name !== username ? serverTimestamp() : null,
        bio,
        keyboard,
        'socials.website': website,
        ...socials,
      });
      onClose?.();
    } catch (e) {
      toast.error(`Something went wrong! ${(e as FirebaseError).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (opened && user)
      reset({
        username: user.name,
        bio: user.bio,
        keyboard: user.keyboard,
        socials: {
          website: user.socials?.website,
          ...user.socials,
        },
      });
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
            {socialNames.map((name) => (
              <Input
                key={name}
                error={errors.socials?.[name]?.message}
                leftNode={
                  <div className='flex items-center gap-2'>
                    {socialIcons[name]}
                    <span className='-mr-2 leading-none'>{socialURLs[name]}</span>
                  </div>
                }
                rightNode={
                  socials[name] && <SocialLink url={`${socialURLs[name]}${socials[name]}`} />
                }
                {...register(`socials.${name}`)}
              />
            ))}
            <Input
              error={errors.socials?.website?.message}
              placeholder='website'
              leftNode={
                <div className='flex items-center gap-2'>
                  <RiGlobalFill />
                  {socials.website && <span className='-mr-2 leading-none'>https://</span>}
                </div>
              }
              rightNode={socials.website && <SocialLink url={socials.website} />}
              {...register('socials.website')}
            />
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
