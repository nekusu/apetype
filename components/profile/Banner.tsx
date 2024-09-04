'use client';

import { Button, LazyImage, Tooltip } from '@/components/core';
import type { LazyImageProps } from '@/components/core/LazyImage';
import { getFirebaseAuth, getFirebaseFirestore, getFirebaseStorage } from '@/utils/firebase';
import type { User } from '@/utils/user';
import { useDisclosure } from '@mantine/hooks';
import type { ComponentPropsWithoutRef } from 'react';
import toast from 'react-hot-toast';
import { RiPencilFill } from 'react-icons/ri';
import { twMerge } from 'tailwind-merge';
import SetImageModal from './SetImageModal';

export interface BannerProps extends ComponentPropsWithoutRef<'div'> {
  editable?: boolean;
  imageProps: Optional<LazyImageProps, 'alt'>;
}

async function deleteBanner() {
  const [{ auth }, { updateDocument }, { deleteObject, ref, storage }] = await Promise.all([
    getFirebaseAuth(),
    getFirebaseFirestore(),
    getFirebaseStorage(),
  ]);
  if (!auth.currentUser) return;
  const userId = auth.currentUser.uid;
  const bannerRef = ref(storage, `users/${userId}/banner`);
  await Promise.all([
    updateDocument<User>('users', userId, { bannerURL: '' }),
    deleteObject(bannerRef),
  ]);
  toast.success('Banner deleted successfully!');
}
async function saveBanner(imageBlob: Blob | null) {
  const [{ auth }, { updateDocument }, { getDownloadURL, ref, storage, uploadBytes }] =
    await Promise.all([getFirebaseAuth(), getFirebaseFirestore(), getFirebaseStorage()]);
  if (!(auth.currentUser && imageBlob)) return;
  const userId = auth.currentUser.uid;
  const bannerRef = ref(storage, `users/${userId}/banner`);
  await uploadBytes(bannerRef, imageBlob);
  const bannerURL = await getDownloadURL(bannerRef);
  await updateDocument<User>('users', userId, { bannerURL });
  toast.success('Banner updated successfully!');
}

export default function Banner({
  className,
  editable,
  imageProps: { alt = 'Banner', src, ...imageProps },
  ...props
}: BannerProps) {
  const [changeBannerModalOpen, changeBannerModalHandler] = useDisclosure(false);

  return (
    <div
      className={twMerge('group relative w-full', src ? 'aspect-[4/1]' : 'h-[156px]', className)}
      {...props}
    >
      <LazyImage src={src} alt={alt} fill priority {...imageProps} />
      {editable && (
        <>
          <Tooltip className='bg-bg' label='Change banner'>
            <Button
              active
              className='absolute right-6 bottom-4 px-2 opacity-0 shadow-md group-hover:opacity-100 group-has-focus-visible:opacity-100'
              variant='filled'
              onClick={changeBannerModalHandler.open}
            >
              <RiPencilFill />
            </Button>
          </Tooltip>
          <SetImageModal
            open={changeBannerModalOpen}
            onClose={changeBannerModalHandler.close}
            title='Change banner'
            aspect={4}
            targetWidth={1200}
            targetHeight={300}
            onDelete={src ? deleteBanner : undefined}
            onSave={saveBanner}
          />
        </>
      )}
    </div>
  );
}
