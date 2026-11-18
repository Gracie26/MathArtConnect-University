import { LoadingButton, type LoadingButtonProps } from './LoadingButton';

/** The single main action of a screen (teal, full width). */
export function PrimaryButton(props: Omit<LoadingButtonProps, 'variant'>) {
  return <LoadingButton {...props} variant="primary" />;
}
