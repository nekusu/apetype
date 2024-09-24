import { Button } from '@/components/core/Button';
import { Modal, type ModalProps } from '@/components/core/Modal';
import { Text } from '@/components/core/Text';

export function ReadabilityModal(props: ModalProps) {
  const { onClose } = props;
  return (
    <Modal {...props}>
      <div className='flex max-w-sm flex-col gap-3.5 text-sm'>
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
            rel='noreferrer'
          >
            WCAG 2.1 accessibility guidelines
          </a>
          , which require a minimum of 4.5:1 for normal text and 3:1 for large text. To ensure
          maximum legibility, consider using a higher contrast ratio.
        </Text>
        <Button onClick={onClose}>ok</Button>
      </div>
    </Modal>
  );
}
