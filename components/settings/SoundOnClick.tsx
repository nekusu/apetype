'use client';

import { Button } from 'components/core';
import { useGlobal } from 'context/globalContext';
import { useSettings } from 'context/settingsContext';
import { useSound } from 'hooks/useSound';
import { RiLoaderLine, RiPlayFill, RiVolumeUpFill } from 'react-icons/ri';
import { SoundOnClick } from 'utils/settings';
import Setting from './Setting';

export interface SoundButtonProps {
  alt?: string;
  value: SoundOnClick;
}

export function SoundButton({ alt, value }: SoundButtonProps) {
  const { soundVolume, soundOnClick, setSettings } = useSettings();
  const { play, state } = useSound(value, { volume: soundVolume });

  return (
    <Button
      active={soundOnClick === value}
      className='group grid w-full grid-cols-[1fr_auto_1fr] justify-items-end'
      variant='filled'
      onClick={() => {
        setSettings((draft) => void (draft.soundOnClick = value));
        play();
      }}
    >
      <span className='col-start-2'>{alt ?? value}</span>
      {value && (
        <span className='pr-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100'>
          {soundOnClick === value &&
            (state === 'playing' ? (
              <RiVolumeUpFill />
            ) : state === 'loading' ? (
              <RiLoaderLine className='animate-spin' />
            ) : (
              <RiPlayFill />
            ))}
        </span>
      )}
    </Button>
  );
}

export default function SoundOnClick() {
  const { settingsList } = useGlobal();
  const { command, description, options } = settingsList.soundOnClick;

  return (
    <Setting title={command} description={description} options={options} gridColumns={4}>
      {options.map((option) => (
        <SoundButton key={option.value.toString()} {...option} />
      ))}
    </Setting>
  );
}
