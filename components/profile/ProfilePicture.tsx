'use client';

import { useDisclosure } from '@mantine/hooks';
import { Button, LazyImage, Modal, Tooltip } from 'components/core';
import { LazyImageProps } from 'components/core/LazyImage';
import { User } from 'context/userContext';
import { UpdateData } from 'firebase/firestore';
import { ComponentPropsWithoutRef } from 'react';
import toast from 'react-hot-toast';
import { RiGhostLine, RiPencilFill } from 'react-icons/ri';
import { twJoin, twMerge } from 'tailwind-merge';
import { getFirebaseAuth, getFirebaseFirestore, getFirebaseStorage } from 'utils/firebase';
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
  const [imageModalOpen, imageModalHandler] = useDisclosure(false);
  const [changePictureModalOpen, changePictureModalHandler] = useDisclosure(false);

  return (
    <div className={twMerge(['group relative', wrapperClassName])}>
      <div
        className={twMerge([
          'relative aspect-square w-48 bg-bg border-4 border-sub-alt overflow-hidden transition-all',
          src ? 'active:scale-[.925] cursor-pointer' : 'flex items-center justify-center',
          shape === 'rect' ? 'rounded-xl' : 'rounded-[50%]',
          className,
        ])}
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
              className={twJoin([
                'absolute px-2 opacity-0 group-has-focus-visible:opacity-100 group-hover:opacity-100 shadow-md',
                shape === 'rect' ? 'bottom-3 right-3' : 'bottom-4 right-4 rounded-full',
              ])}
              variant='filled'
              onClick={changePictureModalHandler.open}
            >
              <RiPencilFill />
            </Button>
          </Tooltip>
          <SetImageModal
            open={changePictureModalOpen}
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
          className='relative aspect-square w-xl select-none overflow-hidden bg-transparent p-0'
          open={imageModalOpen}
          onClose={imageModalHandler.close}
          centered
          trapFocus={false}
          overflow='outside'
        >
          <LazyImage src={src} alt={alt} fill />
        </Modal>
      )}
    </div>
  );
}
