'use client';

import { Button, LazyImage, Modal, Tooltip } from '@/components/core';
import type { LazyImageProps } from '@/components/core/LazyImage';
import { getFirebaseAuth, getFirebaseFirestore, getFirebaseStorage } from '@/utils/firebase';
import type { User } from '@/utils/user';
import { useDisclosure } from '@mantine/hooks';
import type { UpdateData } from 'firebase/firestore';
import type { ComponentPropsWithoutRef } from 'react';
import toast from 'react-hot-toast';
import { RiGhostLine, RiPencilFill } from 'react-icons/ri';
import { twJoin, twMerge } from 'tailwind-merge';
import SetImageModal from './SetImageModal';

export interface ProfilePictureProps extends ComponentPropsWithoutRef<'div'> {
  editable?: boolean;
  expandable?: boolean;
  imageProps: Optional<LazyImageProps, 'alt'>;
  shape?: 'rect' | 'round';
  wrapperClassName?: string;
}

async function deleteProfilePicture() {
  const [{ auth }, { updateDocument }, { deleteObject, ref, storage }] = await Promise.all([
    getFirebaseAuth(),
    getFirebaseFirestore(),
    getFirebaseStorage(),
  ]);
  if (!auth.currentUser) return;
  const userId = auth.currentUser.uid;
  const profilePictureRef = ref(storage, `users/${userId}/profilePicture`);
  await Promise.all([
    updateDocument<User>('users', userId, { 'profilePicture.url': '' }),
    deleteObject(profilePictureRef),
  ]);
  toast.success('Profile picture deleted successfully!');
}
async function saveProfilePicture(imageBlob: Blob | null, shape?: 'rect' | 'round') {
  const [{ auth }, { updateDocument }] = await Promise.all([
    getFirebaseAuth(),
    getFirebaseFirestore(),
  ]);
  if (!auth.currentUser) return;
  const userId = auth.currentUser.uid;
  const userDetails: UpdateData<User> = { 'profilePicture.shape': shape };
  if (imageBlob) {
    const { getDownloadURL, ref, storage, uploadBytes } = await getFirebaseStorage();
    const profilePictureRef = ref(storage, `users/${userId}/profilePicture`);
    await uploadBytes(profilePictureRef, imageBlob);
    userDetails['profilePicture.url'] = await getDownloadURL(profilePictureRef);
  }
  await updateDocument<User>('users', userId, userDetails);
  toast.success('Profile picture updated successfully!');
}

export default function ProfilePicture({
  className,
  editable,
  expandable = true,
  imageProps: { alt = 'Profile picture', src, ...imageProps },
  shape = 'rect',
  wrapperClassName,
  ...props
}: ProfilePictureProps) {
  const [imageModalOpened, imageModalHandler] = useDisclosure(false);
  const [changePictureModalOpened, changePictureModalHandler] = useDisclosure(false);

  return (
    <div className={twMerge('group relative', wrapperClassName)}>
      <div
        className={twMerge(
          'relative aspect-square w-48 overflow-hidden border-4 border-sub-alt bg-bg transition-all',
          src ? 'cursor-pointer active:scale-[.925]' : 'flex items-center justify-center',
          shape === 'rect' ? 'rounded-xl' : 'rounded-[50%]',
          className,
        )}
        onClick={() => expandable && src && imageModalHandler.open()}
        {...props}
      >
        {!src && <RiGhostLine className='h-3/5 w-3/5 text-sub transition-colors' />}
        <LazyImage src={src} alt={alt} fill {...imageProps} />
      </div>
      {editable && (
        <>
          <Tooltip className='bg-bg' label='Change profile picture'>
            <Button
              active
              className={twJoin(
                'absolute px-2 opacity-0 shadow-md group-hover:opacity-100 group-has-focus-visible:opacity-100',
                shape === 'rect' ? 'right-3 bottom-3' : 'right-4 bottom-4 rounded-full',
              )}
              onClick={changePictureModalHandler.open}
            >
              <RiPencilFill />
            </Button>
          </Tooltip>
          <SetImageModal
            opened={changePictureModalOpened}
            onClose={changePictureModalHandler.close}
            title='Change profile picture'
            enableShapeSelection
            initialShape={shape}
            targetWidth={500}
            targetHeight={500}
            onDelete={src ? deleteProfilePicture : undefined}
            onSave={saveProfilePicture}
          />
        </>
      )}
      {expandable && (
        <Modal
          className='relative aspect-square w-xl select-none overflow-hidden bg-transparent p-0 shadow-none'
          opened={imageModalOpened}
          onClose={imageModalHandler.close}
          trapFocus={false}
          overflow='outside'
        >
          <LazyImage src={src} alt={alt} fill />
        </Modal>
      )}
    </div>
  );
}
