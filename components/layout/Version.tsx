'use client';

import { useLocalStorage } from '@mantine/hooks';
import { Button, Tooltip } from 'components/core';
import { useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { RiGitBranchFill } from 'react-icons/ri';
import { version } from 'utils/version';

const RELEASE_URL = `https://github.com/nekusu/apetype/releases/tag/v${version}`;

export default function Version() {
  const [lastVersion, setLastVersion] = useLocalStorage({ key: 'lastVersion' });

  useEffect(() => {
    if (lastVersion && lastVersion !== version)
      toast(
        (t) => (
          <div className='flex flex-col gap-2'>
            New version {version}!
            <div className='flex gap-2'>
              <Button className='w-full' variant='subtle' onClick={() => toast.dismiss(t.id)}>
                dismiss
              </Button>
              <Button asChild active className='w-full' variant='filled'>
                <a href={RELEASE_URL} target='_blank' rel='noopener noreferrer'>
                  see changelog
                </a>
              </Button>
            </div>
          </div>
        ),
        { duration: Infinity },
      );
    setLastVersion(version);
  }, [lastVersion, setLastVersion]);

  return (
    <Tooltip label='See changelog' offset={8} placement='left'>
      <Button asChild className='p-0 text-sm'>
        <a href={RELEASE_URL} target='_blank' rel='noopener noreferrer'>
          <RiGitBranchFill />v{version}
        </a>
      </Button>
    </Tooltip>
  );
}
