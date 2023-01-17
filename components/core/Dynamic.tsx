import { forwardRef, ReactNode } from 'react';
import { createPolymorphicComponent, PolymorphicComponentProps } from 'utils/polymorphicComponent';

const Dynamic = forwardRef<HTMLDivElement, PolymorphicComponentProps<'div'>>(function Dynamic(
  { component, ...props },
  ref
) {
  const Component = component || 'div';

  return <Component ref={ref} {...props} />;
});

export default createPolymorphicComponent<'div', { children?: ReactNode }>(Dynamic);
