'use client';

import { Button } from '@/components/core/Button';
import { Group } from '@/components/core/Group';
import { Tooltip } from '@/components/core/Tooltip';
import { version } from '@/utils/version';
import { useLocalStorage } from '@mantine/hooks';
import { useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { RiGitBranchFill } from 'react-icons/ri';

const RELEASE_URL = `https://github.com/nekusu/apetype/releases/tag/v${version}`;

export function Version() {
  const [lastVersion, setLastVersion] = useLocalStorage({ key: 'lastVersion' });

  useEffect(() => {
    if (lastVersion && lastVersion !== version)
      toast(
        (t) => (
          <div className='flex flex-col gap-2'>
            New version {version}!
            <Group>
              <Button variant='subtle' onClick={() => toast.dismiss(t.id)}>
                dismiss
              </Button>
              <Button asChild active>
                <a href={RELEASE_URL} target='_blank' rel='noopener noreferrer'>
                  see changelog
                </a>
              </Button>
            </Group>
          </div>
        ),
        { duration: Number.POSITIVE_INFINITY },
      );
    setLastVersion(version);
  }, [lastVersion, setLastVersion]);

  return (
    <Tooltip label='See changelog' offset={8} placement='left'>
      <Button asChild className='p-0 text-sm' variant='text'>
        <a href={RELEASE_URL} target='_blank' rel='noopener noreferrer'>
          <RiGitBranchFill />v{version}
        </a>
      </Button>
    </Tooltip>
  );
}
