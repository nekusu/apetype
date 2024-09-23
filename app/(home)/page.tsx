'use client';

import Loading from '@/app/loading';
import { Button } from '@/components/core/Button';
import { Tooltip } from '@/components/core/Tooltip';
import { Transition } from '@/components/core/Transition';
import { Settings } from '@/components/typing-test/Settings';
import { Test } from '@/components/typing-test/Test';
import { Tips } from '@/components/typing-test/Tips';
import { useGlobal } from '@/context/globalContext';
import { useSettings } from '@/context/settingsContext';
import { useTypingTest } from '@/context/typingTestContext';
import { AnimatePresence } from 'framer-motion';
import { RiTerminalLine } from 'react-icons/ri';

export default function HomePage() {
  const { testId, isUserTyping, commandLine } = useGlobal();
  const { language, isTestFinished } = useTypingTest();
  const { keyTips } = useSettings();

  return (
    <Transition className='relative grid w-full grid-rows-[1fr_auto_1.25fr] gap-3'>
      <AnimatePresence>
        {!(isUserTyping || isTestFinished) && <Settings key='settings' />}
        <AnimatePresence mode='wait'>
          {language ? <Test key={testId} /> : <Loading />}
        </AnimatePresence>
        {!isUserTyping && (
          <Transition key='bottom' className='row-start-3 row-end-4 h-min self-end'>
            {keyTips && <Tips key='tips' />}
            <Tooltip label='Open command line' offset={8} placement='left'>
              <Button
                className='absolute right-0 bottom-0 rounded-full p-2.5'
                active
                onClick={() => commandLine.handler.open()}
              >
                <RiTerminalLine size={18} />
              </Button>
            </Tooltip>
          </Transition>
        )}
      </AnimatePresence>
    </Transition>
  );
}
