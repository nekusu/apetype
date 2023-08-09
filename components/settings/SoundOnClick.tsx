'use client';

import { Button } from 'components/core';
import { useSettings } from 'context/settingsContext';
import { useSound } from 'hooks/useSound';
import { RiLoaderLine, RiPlayFill, RiVolumeUpFill } from 'react-icons/ri';
import { Settings } from 'utils/settings';
import Setting from './Setting';

export interface SoundButtonProps {
  alt?: string;
  value: Settings['soundOnClick'];
}

export function SoundButton({ alt, value }: SoundButtonProps) {
  const { soundVolume, soundOnClick, setSettings } = useSettings();
  const { play, state } = useSound(value, { volume: soundVolume });

  return (
    <Button
      active={soundOnClick === value}
      className='group grid grid-cols-[1fr_auto_1fr] w-full justify-items-end'
      variant='filled'
      onClick={() => {
        setSettings((draft) => void (draft.soundOnClick = value));
        play();
      }}
    >
      <span className='col-start-2'>{alt ?? value}</span>
      {value && (
        <span className='pr-1 opacity-0 transition-opacity group-focus-visible:opacity-100 group-hover:opacity-100'>
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

export default function SoundOnClick() {
  return (
    <Setting
      id='soundOnClick'
      customButtons={({ alt, value }) => (
        <SoundButton key={value.toString()} alt={alt} value={value as Settings['soundOnClick']} />
      )}
      columns={4}
      fullWidth
    />
  );
}
