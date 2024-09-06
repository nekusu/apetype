'use client';

import { Button, Grid, Modal, Text, Tooltip } from '@/components/core';
import type { ModalProps } from '@/components/core/Modal';
import { useSettings } from '@/context/settingsContext';
import { formatFileSize } from '@/utils/misc';
import type { Settings } from '@/utils/settings';
import { useDidUpdate, useDisclosure } from '@mantine/hooks';
import { type ChangeEvent, useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import type { IconType } from 'react-icons';
import {
  RiAlertLine,
  RiBracesLine,
  RiErrorWarningLine,
  RiQuestionLine,
  RiSpam2Line,
} from 'react-icons/ri';
import { twJoin, twMerge } from 'tailwind-merge';
import Setting from './Setting';

interface WarningProps {
  icon: IconType;
  properties?: { path: string[]; defaultValue?: unknown }[];
  type: string;
}

function Warning({ icon: Icon, properties, type }: WarningProps) {
  return properties?.length ? (
    <div className='flex items-center gap-1.5'>
      <Icon className='shrink-0 text-error' />
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
          <span className='cursor-pointer border-error border-b border-dashed text-error transition hover:border-text hover:text-text'>
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
  const { opened, onClose } = props;
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
    file.text().then((text) => {
      const settings = JSON.parse(text) as Settings;
      setValidation(validate(settings));
    });
  };

  useDidUpdate(() => {
    formRef.current?.reset();
    resetValues();
  }, [opened]);

  return (
    <Modal className={twMerge('w-full max-w-sm', className)} {...props}>
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
        <Grid className='grid-cols-[auto_1fr] items-center'>
          <Button asChild className={twJoin(file && 'row-span-2')}>
            <label>
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
        </Grid>
        <div className='flex flex-col gap-2 empty:hidden'>
          {error && (
            <div className='flex items-center gap-1.5 text-error'>
              <RiErrorWarningLine className='shrink-0' />
              <Text className='text-error text-sm'>{error}</Text>
            </div>
          )}
          <Warning icon={RiAlertLine} properties={invalid} type='invalid' />
          <Warning icon={RiSpam2Line} properties={missing} type='missing' />
          <Warning icon={RiQuestionLine} properties={unknown} type='unknown' />
        </div>
        <Button disabled={!settings || !!error} onClick={onClose} type='submit'>
          apply
        </Button>
      </form>
    </Modal>
  );
}

export default function ImportExportSettings() {
  const settings = useSettings();
  const [modalOpened, modalHandler] = useDisclosure(false);
  const [settingsURL, setSettingsURL] = useState('');

  useEffect(() => {
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    setSettingsURL(URL.createObjectURL(blob));
  }, [settings]);

  return (
    <>
      <Setting id='importExportSettings'>
        <Button onClick={modalHandler.open}>import</Button>
        <Button asChild>
          <a
            href={settingsURL}
            download='settings.json'
            onClick={() => toast.success('Settings exported successfully!')}
          >
            export
          </a>
        </Button>
      </Setting>
      <ImportSettingsModal opened={modalOpened} onClose={modalHandler.close} />
    </>
  );
}
