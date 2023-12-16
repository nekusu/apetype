'use client';

import { valibotResolver } from '@hookform/resolvers/valibot';
import { Button, Input, Modal, Text, Textarea, Tooltip } from 'components/core';
import { useUser } from 'context/userContext';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { FirebaseError } from 'firebase/app';
import { useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { RiExternalLinkLine, RiGlobalFill, RiLoaderLine } from 'react-icons/ri';
import { twJoin } from 'tailwind-merge';
import { getFirebaseFirestore } from 'utils/firebase';
import { capitalize } from 'utils/misc';
import { Social, socialIcons, socialNames, socialURLs } from 'utils/socials';
import { User } from 'utils/user';
import {
  OptionalSchema,
  StringSchema,
  Input as ValiInput,
  maxLength,
  minLength,
  object,
  optional,
  regex,
  string,
  toTrimmed,
} from 'valibot';

dayjs.extend(relativeTime);

interface ModalProps {
  open: boolean;
  onClose: () => void;
}

function SocialLink({ url }: { url: string }) {
  return (
    <Tooltip label='Open link'>
      <Button asChild className='p-0' tabIndex={-1}>
        <a href={`https://${url}`} target='_blank' rel='noopener noreferrer'>
          <RiExternalLinkLine />
        </a>
      </Button>
    </Tooltip>
  );
}

const profileSchema = object({
  username: string([
    minLength(1, 'Username is required'),
    minLength(3, 'Username must have at least 3 characters'),
    maxLength(32, 'Username must have at most 32 characters'),
    regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  ]),
  bio: optional(string([toTrimmed(), maxLength(512, 'Bio must have at most 512 characters')])),
  keyboard: optional(
    string([toTrimmed(), maxLength(256, 'Keyboard details must have at most 256 characters')]),
  ),
  socials: object({
    website: optional(
      string([toTrimmed(), maxLength(128, 'Website URL must have at most 128 characters')]),
    ),
    ...socialNames.reduce(
      (socials, name) => {
        socials[name] = optional(
          string([
            toTrimmed(),
            maxLength(64, `${capitalize(name)} username must have at most 64 characters`),
          ]),
        );
        return socials;
      },
      {} as Record<Social, OptionalSchema<StringSchema<string>>>,
    ),
  }),
});
type ProfileForm = ValiInput<typeof profileSchema>;

export default function ProfileEditModal({ open, onClose }: ModalProps) {
  const { user, updateUser } = useUser();
  const {
    formState: { errors, isDirty },
    handleSubmit,
    register,
    reset,
    setError,
    watch,
  } = useForm<ProfileForm>({
    defaultValues: { username: '', socials: {} },
    mode: 'onChange',
    resolver: valibotResolver(profileSchema),
  });
  const socials = watch('socials');
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit: SubmitHandler<ProfileForm> = async ({
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
      onClose();
    } catch (e) {
      toast.error(`Something went wrong! ${(e as FirebaseError).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open && user)
      reset({
        username: user.name,
        bio: user.bio,
        keyboard: user.keyboard,
        socials: {
          website: user.socials?.website,
          ...user.socials,
        },
      });
  }, [open, reset, user]);

  return (
    <Modal centered open={open} onClose={onClose}>
      <form
        className={twJoin([
          'max-w-sm min-w-sm flex flex-col gap-3.5 transition',
          isLoading && '!pointer-events-none !opacity-60',
        ])}
        onSubmit={(e) => void handleSubmit(onSubmit)(e)}
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
          <div className='flex flex-col -mt-2'>
            <Text className='text-xs text-sub'>
              You can only change your username every 30 days.
            </Text>
            {user?.nameLastChangedAt && (
              <Text className='text-xs text-error'>
                Last changed {dayjs(user.nameLastChangedAt).fromNow()}.
              </Text>
            )}
          </div>
          <Textarea error={errors.bio?.message} label='bio' {...register('bio')} />
          <Textarea error={errors.keyboard?.message} label='keyboard' {...register('keyboard')} />
          <div className='flex flex-col gap-1.5'>
            <Text className='text-sm leading-none -mb-0.5' dimmed>
              socials
            </Text>
            {socialNames.map((name) => (
              <Input
                key={name}
                error={errors.socials?.[name]?.message}
                leftNode={
                  <div className='flex items-center gap-2'>
                    {socialIcons[name]}
                    <span className='leading-none -mr-2'>{socialURLs[name]}</span>
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
                  {socials.website && <span className='leading-none -mr-2'>https://</span>}
                </div>
              }
              rightNode={socials.website && <SocialLink url={socials.website} />}
              {...register('socials.website')}
            />
          </div>
        </div>
        <div className='flex gap-2'>
          <Button className='w-full' variant='filled' onClick={onClose}>
            cancel
          </Button>
          <Button active disabled={!isDirty} className='w-full' variant='filled' type='submit'>
            {isLoading ? <RiLoaderLine className='animate-spin' /> : 'save'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
