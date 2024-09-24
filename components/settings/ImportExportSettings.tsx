'use client';

import { Button } from '@/components/core/Button';
import { Grid } from '@/components/core/Grid';
import { Modal, type ModalProps } from '@/components/core/Modal';
import { Text } from '@/components/core/Text';
import { Tooltip } from '@/components/core/Tooltip';
import { useSettings } from '@/context/settingsContext';
import { formatFileSize } from '@/utils/misc';
import type { Settings, ValidationIssue } from '@/utils/settings';
import { useDidUpdate, useDisclosure } from '@mantine/hooks';
import dayjs from 'dayjs';
import { type ChangeEvent, useRef, useState } from 'react';
import type { IconType } from 'react-icons';
import {
  RiAlertLine,
  RiErrorWarningLine,
  RiFileLine,
  RiQuestionLine,
  RiSpam2Line,
} from 'react-icons/ri';
import { twJoin, twMerge } from 'tailwind-merge';
import { Setting } from './Setting';

interface WarningProps {
  icon: IconType;
  issues?: ValidationIssue[];
  type: 'missing' | 'invalid' | 'unknown';
}

function Warning({ icon: Icon, issues, type }: WarningProps) {
  if (!issues?.length) return null;

  return (
    <div className='flex items-center gap-1.5'>
      <Icon className='shrink-0 text-error' />
      <Text className='text-sm text-sub leading-tight'>
        <Tooltip
          className='z-50 max-w-xs text-xs'
          label={
            <ul className='text-left'>
              {issues.map(({ path, defaultValue }) => (
                <li key={path}>
                  - {path}{' '}
                  {type !== 'unknown' && (
                    <span className='text-sub'>(default: {JSON.stringify(defaultValue)})</span>
                  )}
                </li>
              ))}
            </ul>
          }
          offset={6}
          placement='bottom-start'
        >
          <span className='cursor-pointer border-error border-b border-dashed text-error transition hover:border-text hover:text-text'>
            {issues.length} {type} propert{issues.length > 1 ? 'ies' : 'y'}
          </span>
        </Tooltip>
      </Text>
    </div>
  );
}

function ImportSettingsModal({ className, ...props }: ModalProps) {
  const { opened, onClose } = props;
  const { setSettings, validate } = useSettings();
  const [file, setFile] = useState<File | undefined>();
  const [[settings, issues], setValidation] = useState<ReturnType<typeof validate> | []>([]);
  const { missing, invalid, unknown } = issues ?? {};
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
        <Grid className='grid-cols-[auto_1fr] items-center gap-y-0'>
          <Button asChild className={twJoin(file && 'row-span-2')}>
            <label>
              select file
              <RiFileLine />
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
          <Warning icon={RiAlertLine} issues={invalid} type='invalid' />
          <Warning icon={RiSpam2Line} issues={missing} type='missing' />
          <Warning icon={RiQuestionLine} issues={unknown} type='unknown' />
        </div>
        {(!!invalid?.length || !!missing?.length) && (
          <Text className='text-sm' dimmed>
            Default values will be applied for invalid or missing properties.
          </Text>
        )}
        <Button disabled={!settings || !!error} onClick={onClose} type='submit'>
          apply
        </Button>
      </form>
    </Modal>
  );
}

export function ImportExportSettings() {
  const { settingsReference: _, ...settings } = useSettings();
  const [modalOpened, modalHandler] = useDisclosure(false);

  const exportSettings = () => {
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `apetype-settings-${dayjs().format('YYYY-MM-DD')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Setting id='importExportSettings'>
        <Button onClick={modalHandler.open}>import</Button>
        <Button onClick={exportSettings}>export</Button>
      </Setting>
      <ImportSettingsModal opened={modalOpened} onClose={modalHandler.close} />
    </>
  );
}
