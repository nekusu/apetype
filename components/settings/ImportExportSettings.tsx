'use client';

import { useDidUpdate, useDisclosure } from '@mantine/hooks';
import { Button, Modal, Text, Tooltip } from 'components/core';
import { ButtonProps } from 'components/core/Button';
import { ModalProps } from 'components/core/Modal';
import { useSettings } from 'context/settingsContext';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { IconType } from 'react-icons';
import {
  RiAlertLine,
  RiBracesLine,
  RiErrorWarningLine,
  RiQuestionLine,
  RiSpam2Line,
} from 'react-icons/ri';
import { twJoin, twMerge } from 'tailwind-merge';
import { formatFileSize } from 'utils/misc';
import { Settings } from 'utils/settings';
import Setting from './Setting';

interface WarningProps {
  icon: IconType;
  properties?: { path: string[]; defaultValue?: unknown }[];
  type: string;
}

const COMMON_BUTTON_PROPS: Omit<ButtonProps, 'ref'> = { className: 'w-full', variant: 'filled' };

function Warning({ icon: Icon, properties, type }: WarningProps) {
  return properties?.length ? (
    <div className='flex items-center gap-1.5'>
      <Icon className='flex-shrink-0 text-error' />
      <Text className='text-sm text-sub leading-tight'>
        <Tooltip
          className='z-50 max-w-xs text-xs'
          label={
            <ul className='text-left'>
              {properties.map(({ path, defaultValue }) => {
                const pathString = path.join('.');
                const stringifiedValue = JSON.stringify(defaultValue);
                return (
                  <li key={pathString}>
                    - {pathString}{' '}
                    <span className='text-sub'>
                      {stringifiedValue && (
                        <>
                          (default: <span className='italic'>{stringifiedValue}</span>)
                        </>
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
          }
          offset={6}
          placement='bottom-start'
        >
          <span className='cursor-pointer border-b border-error border-dashed text-error transition hover:border-text hover:text-text'>
            {properties.length} {type} propert{properties.length > 1 ? 'ies' : 'y'}
          </span>
        </Tooltip>
        {['invalid', 'missing'].includes(type) ? (
          <>, default value{properties.length > 1 && 's'} will be used instead.</>
        ) : (
          ' will be ignored.'
        )}
      </Text>
    </div>
  ) : null;
}

function ImportSettingsModal({ className, ...props }: ModalProps) {
  const { open, onClose } = props;
  const { setSettings, validate } = useSettings();
  const [file, setFile] = useState<File | undefined>();
  const [[settings, validation], setValidation] = useState<ReturnType<typeof validate> | []>([]);
  const { missing, invalid, unknown } = validation ?? {};
  const [error, setError] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  const resetValues = () => {
    setFile(undefined);
    setValidation([]);
    setError('');
  };
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    resetValues();
    setFile(file);
    if (file?.type !== 'application/json') {
      setError('Invalid file type.');
      return;
    }
    void file.text().then((text) => {
      const settings = JSON.parse(text) as Settings;
      setValidation(validate(settings));
    });
  };

  useDidUpdate(() => {
    formRef.current?.reset();
    resetValues();
  }, [open]);

  return (
    <Modal className={twMerge(['w-full max-w-sm', className])} centered {...props}>
      <form
        ref={formRef}
        className='flex flex-col gap-3.5'
        onSubmit={(e) => {
          e.preventDefault();
          if (settings) setSettings(settings);
        }}
      >
        <Text asChild className='text-2xl'>
          <h3>Import settings</h3>
        </Text>
        <div className='grid grid-cols-[auto_1fr] items-center gap-x-2'>
          <Button asChild className={twJoin(['px-3', file && 'row-span-2'])} variant='filled'>
            <label tabIndex={0}>
              select file
              <RiBracesLine />
              <input accept='.json' className='hidden' onChange={handleChange} type='file' />
            </label>
          </Button>
          <Text className='line-clamp-1 text-sm' dimmed={!file}>
            {file ? file.name : 'No file selected.'}
          </Text>
          {file && (
            <Text className='text-xs' dimmed>
              {formatFileSize(file.size, true)}
            </Text>
          )}
        </div>
        <div className='flex flex-col gap-2 empty:hidden'>
          {error && (
            <div className='flex items-center gap-1.5 text-error'>
              <RiErrorWarningLine className='flex-shrink-0' />
              <Text className='text-sm text-error'>{error}</Text>
            </div>
          )}
          <Warning icon={RiAlertLine} properties={invalid} type='invalid' />
          <Warning icon={RiSpam2Line} properties={missing} type='missing' />
          <Warning icon={RiQuestionLine} properties={unknown} type='unknown' />
        </div>
        <Button
          disabled={!settings || !!error}
          onClick={onClose}
          type='submit'
          {...COMMON_BUTTON_PROPS}
        >
          apply
        </Button>
      </form>
    </Modal>
  );
}

export default function ImportExportSettings() {
  const settings = useSettings();
  const [modalOpen, modalHandler] = useDisclosure(false);
  const [settingsURL, setSettingsURL] = useState('');

  useEffect(() => {
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    setSettingsURL(URL.createObjectURL(blob));
  }, [settings]);

  return (
    <>
      <Setting id='importExportSettings'>
        <Button onClick={modalHandler.open} {...COMMON_BUTTON_PROPS}>
          import
        </Button>
        <Button asChild {...COMMON_BUTTON_PROPS}>
          <a
            href={settingsURL}
            download='settings.json'
            onClick={() => toast.success('Settings exported successfully!')}
          >
            export
          </a>
        </Button>
      </Setting>
      <ImportSettingsModal open={modalOpen} onClose={modalHandler.close} />
    </>
  );
}
