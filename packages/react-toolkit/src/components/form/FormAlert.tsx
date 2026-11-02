import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { focusField } from './focus';
import { AlertIcon, CheckCircleIcon, InfoIcon } from './icons';

export type FormAlertTone = 'danger' | 'warning' | 'info' | 'success';

export interface FormAlertItem {
  message: ReactNode;
  /** Id of the field this message is about. The message becomes a link that focuses it. */
  fieldId?: string;
}

export interface FormAlertProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Short summary, e.g. "There is a problem" or "Your changes were saved". */
  title: ReactNode;
  /** One entry per problem. Each links to its field when `fieldId` is given. */
  items?: readonly FormAlertItem[];
  /** Default `danger`. */
  tone?: FormAlertTone;
}

const ICONS: Record<FormAlertTone, ReactNode> = {
  danger: <AlertIcon />,
  warning: <AlertIcon />,
  info: <InfoIcon />,
  success: <CheckCircleIcon />,
};

/**
 * A message at the top of a form: a summary of errors with links to each field, or the
 * result of submitting. Errors and warnings are announced at once (`role="alert"`); info and
 * success politely (`role="status"`). It can receive focus (`tabIndex={-1}`), so you can move
 * focus to it after a failed submit.
 */
export const FormAlert = forwardRef<HTMLDivElement, FormAlertProps>(function FormAlert(
  { title, items, tone = 'danger', className, children, ...rest },
  ref,
) {
  const urgent = tone === 'danger' || tone === 'warning';
  return (
    <div
      role={urgent ? 'alert' : 'status'}
      tabIndex={-1}
      {...rest}
      ref={ref}
      className={cx('dawg-form-alert', className)}
      data-tone={tone}
    >
      <span className="dawg-form-alert__icon" aria-hidden="true">
        {ICONS[tone]}
      </span>
      <div className="dawg-form-alert__body">
        <p className="dawg-form-alert__title">{title}</p>
        {children && <div className="dawg-form-alert__content">{children}</div>}
        {items && items.length > 0 && (
          <ul className="dawg-form-alert__list">
            {items.map((item, index) => (
              <li key={item.fieldId ?? index}>
                {item.fieldId ? (
                  <a
                    href={`#${item.fieldId}`}
                    onClick={(event) => {
                      if (focusField(document.getElementById(item.fieldId!))) {
                        event.preventDefault();
                      }
                    }}
                  >
                    {item.message}
                  </a>
                ) : (
                  item.message
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
});
