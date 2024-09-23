'use client';

import {
  FloatingFocusManager,
  FloatingPortal,
  type Placement,
  autoPlacement,
  autoUpdate,
  hide,
  offset as offsetMiddleware,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useMergeRefs,
} from '@floating-ui/react';
import { Slot } from '@radix-ui/react-slot';
import {
  type ComponentPropsWithoutRef,
  type ElementRef,
  type ReactNode,
  createContext,
  forwardRef,
  useContext,
  useMemo,
  useState,
} from 'react';

export interface PopoverOptions {
  disabled?: boolean;
  offset?: number;
  placement?: Placement;
  modal?: boolean;
  initialOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function usePopover({
  disabled,
  offset = 4,
  placement = 'bottom',
  modal,
  initialOpen = false,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: PopoverOptions) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(initialOpen);
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = setControlledOpen ?? setUncontrolledOpen;
  const data = useFloating({
    placement,
    open,
    onOpenChange: setOpen,
    whileElementsMounted: autoUpdate,
    middleware: [
      offsetMiddleware(offset),
      autoPlacement({ allowedPlacements: ['top', 'bottom'] }),
      shift(),
      hide(),
    ],
  });
  const { context } = data;
  const click = useClick(context, { enabled: controlledOpen == null });
  const dismiss = useDismiss(context);
  const interactions = useInteractions([click, dismiss]);

  return useMemo(
    () => ({ disabled, modal, open, setOpen, ...interactions, ...data }),
    [disabled, modal, open, setOpen, interactions, data],
  );
}

export const PopoverContext = createContext<ReturnType<typeof usePopover> | null>(null);

export const usePopoverContext = () => {
  const context = useContext(PopoverContext);

  if (!context) {
    throw new Error('Popover components must be wrapped in <Popover.Root />');
  }

  return context;
};

function Root({
  children,
  modal = false,
  ...restOptions
}: PopoverOptions & { children: ReactNode }) {
  const popover = usePopover({ modal, ...restOptions });
  return <PopoverContext.Provider value={popover}>{children}</PopoverContext.Provider>;
}

const Trigger = forwardRef<
  ElementRef<'button'>,
  ComponentPropsWithoutRef<'button'> & { asChild?: boolean }
>(function Trigger({ asChild, ...props }, ref) {
  const { refs, getReferenceProps } = usePopoverContext();
  const mergedRef = useMergeRefs([refs.setReference, ref]);
  const Component = asChild ? Slot : 'button';

  return <Component ref={mergedRef} type='button' {...getReferenceProps(props)} />;
});

const Content = forwardRef<ElementRef<'div'>, ComponentPropsWithoutRef<'div'>>(
  function Content(props, propRef) {
    const { context, open, modal, refs, strategy, x, y, getFloatingProps } = usePopoverContext();
    const ref = useMergeRefs([refs.setFloating, propRef]);

    return (
      <FloatingPortal>
        {open && (
          <FloatingFocusManager context={context} modal={modal}>
            <div
              ref={ref}
              style={{
                position: strategy,
                top: y ?? 0,
                left: x ?? 0,
                width: 'max-content',
                ...props.style,
              }}
              {...getFloatingProps(props)}
            >
              {props.children}
            </div>
          </FloatingFocusManager>
        )}
      </FloatingPortal>
    );
  },
);

export const Popover = { Root, Trigger, Content };
