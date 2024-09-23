'use client';

import { Button } from '@/components/core/Button';
import { useSettings } from '@/context/settingsContext';
import { useSound } from '@/hooks/useSound';
import type { Settings } from '@/utils/settings';
import { RiLoaderLine, RiPlayFill, RiVolumeUpFill } from 'react-icons/ri';
import { Setting } from './Setting';

interface SoundButtonProps {
  alt?: string;
  value: Settings['soundOnClick'];
}

export function SoundButton({ alt, value }: SoundButtonProps) {
  const { soundVolume, soundOnClick, setSettings } = useSettings();
  const { play, state } = useSound(value, { volume: soundVolume });

  return (
    <Button
      active={soundOnClick === value}
      className='group grid w-full grid-cols-[1fr_auto_1fr] justify-items-end'
      onClick={() => {
        setSettings({ soundOnClick: value });
        play();
      }}
    >
      <span className='col-start-2'>{alt ?? value}</span>
      {value && (
        <span className='pr-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100'>
          {state === 'playing' ? (
            <RiVolumeUpFill />
          ) : state === 'loading' ? (
            <RiLoaderLine className='animate-spin' />
          ) : (
            <RiPlayFill />
          )}
        </span>
      )}
    </Button>
  );
}

export function SoundOnClick() {
  return (
    <Setting
      id='soundOnClick'
      customButtons={({ alt, value }) => <SoundButton key={alt} alt={alt} value={value} />}
      columns={4}
      fullWidth
    />
  );
}
