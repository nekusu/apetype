import { Button, Modal, Text } from 'components/core';

interface ModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ReadabilityModal({ open, onClose }: ModalProps) {
  return (
    <Modal centered open={open} onClose={onClose}>
      <div className='max-w-sm flex flex-col gap-3.5 text-sm'>
        <Text asChild className='text-2xl'>
          <h3>Readability</h3>
        </Text>
        <Text className='text-[length:inherit]' dimmed>
          This color may have a negative impact on readability. For optimal results, make sure the
          main, sub, and text colors have a contrast ratio of at least 2:1 with the background
          color.
        </Text>
        <Text className='text-[length:inherit]' dimmed>
          While a 2:1 contrast ratio is recommended, this does not meet the{' '}
          <a
            className='text-main hover:underline'
            href='https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html'
            target='_blank'
          >
            WCAG 2.1 accessibility guidelines
          </a>
          , which require a minimum of 4.5:1 for normal text and 3:1 for large text. To ensure
          maximum legibility, consider using a higher contrast ratio.
        </Text>
        <Button className='w-full' variant='filled' onClick={onClose}>
          ok
        </Button>
      </div>
    </Modal>
  );
}
