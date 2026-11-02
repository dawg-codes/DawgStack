import { useRef, useState, type FormEvent } from 'react';
import { Button, Card, CardTitle } from '@dawg-codes/react-toolkit';
import {
  Checkbox,
  FormAlert,
  OneTimeCodeField,
  PasswordField,
  RadioGroup,
  SearchField,
  SelectField,
  Switch,
  TextArea,
  TextField,
  estimatePasswordStrength,
  type FormAlertItem,
} from '@dawg-codes/react-toolkit/form';
import { MailIcon } from './icons';

const COUNTRIES = ['Australia', 'Canada', 'India', 'Japan', 'New Zealand', 'United Kingdom'];
const PLANS = [
  { value: 'free', label: 'Free', hint: 'One project' },
  { value: 'team', label: 'Team', hint: 'Up to 10 people' },
  { value: 'business', label: 'Business', hint: 'Unlimited' },
];

type Errors = Partial<Record<'name' | 'email' | 'password' | 'country' | 'plan' | 'terms', string>>;

/** A sign-up form showing validation: messages per field plus a summary that links to them. */
function SignUpDemo() {
  const alertRef = useRef<HTMLDivElement>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<'idle' | 'invalid' | 'done'>('idle');

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const text = (name: string) => String(data.get(name) ?? '').trim();
    const next: Errors = {};
    if (!text('name')) next.name = 'Enter your name';
    if (!/^\S+@\S+\.\S+$/.test(text('email')))
      next.email = 'Enter an email address like name@example.com';
    if (estimatePasswordStrength(text('password')).score < 2) {
      next.password = 'Choose a longer password: try three or four words';
    }
    if (!text('country')) next.country = 'Choose your country';
    if (!text('plan')) next.plan = 'Choose a plan';
    if (!data.get('terms')) next.terms = 'Accept the terms to continue';
    setErrors(next);
    setStatus(Object.keys(next).length ? 'invalid' : 'done');
    // Move focus to the summary, so keyboard and screen reader users hear what to fix.
    requestAnimationFrame(() => alertRef.current?.focus());
  };

  const ids: Record<keyof Errors, string> = {
    name: 'signup-name',
    email: 'signup-email',
    password: 'signup-password',
    country: 'signup-country',
    plan: 'signup-plan',
    terms: 'signup-terms',
  };
  const items: FormAlertItem[] = (Object.keys(errors) as (keyof Errors)[]).map((key) => ({
    message: errors[key],
    fieldId: ids[key],
  }));

  return (
    <Card className="pg-form-card">
      <CardTitle as="h3">Create an account</CardTitle>
      <form className="pg-form" onSubmit={submit} noValidate>
        {status === 'invalid' && (
          <FormAlert ref={alertRef} title="There is a problem" items={items} />
        )}
        {status === 'done' && (
          <FormAlert ref={alertRef} tone="success" title="Account created">
            This demo doesn't send anything anywhere.
          </FormAlert>
        )}
        <TextField
          id={ids.name}
          name="name"
          label="Full name"
          autoComplete="name"
          error={errors.name}
          required
        />
        <TextField
          id={ids.email}
          name="email"
          type="email"
          label="Email"
          autoComplete="email"
          startIcon={<MailIcon />}
          hint="We'll send a confirmation link."
          error={errors.email}
          required
        />
        <PasswordField
          id={ids.password}
          name="password"
          label="Password"
          autoComplete="new-password"
          strength={estimatePasswordStrength}
          hint="Use 12 or more characters. A few random words work well."
          error={errors.password}
          required
        />
        <SelectField
          id={ids.country}
          name="country"
          label="Country"
          options={COUNTRIES}
          placeholder="Choose a country"
          error={errors.country}
          required
        />
        <RadioGroup
          id={ids.plan}
          name="plan"
          label="Plan"
          options={PLANS}
          variant="card"
          orientation="horizontal"
          error={errors.plan}
          required
        />
        <Checkbox
          id={ids.terms}
          name="terms"
          label="I accept the terms of service"
          error={errors.terms}
          required
        />
        <div className="pg-row">
          <Button type="submit" variant="primary">
            Create account
          </Button>
        </div>
      </form>
    </Card>
  );
}

const NOTIFY = ['Comments', 'Mentions', 'Weekly summary'];

function ControlsDemo() {
  const [query, setQuery] = useState('');
  const [notify, setNotify] = useState<string[]>(['Mentions']);
  const [code, setCode] = useState<string | null>(null);
  const all = notify.length === NOTIFY.length;
  const some = notify.length > 0 && !all;

  return (
    <div className="pg-grid pg-form-grid">
      <Card>
        <CardTitle as="h3">Text inputs</CardTitle>
        <div className="pg-form">
          <SearchField
            label="Search people"
            hideLabel
            placeholder="Search people"
            value={query}
            onValueChange={setQuery}
          />
          <TextField label="Small" size="sm" placeholder="sm" />
          <TextField label="Large" size="lg" placeholder="lg" />
          <TextField
            label="Weight"
            type="number"
            inputMode="decimal"
            endAddon="kg"
            defaultValue="72"
          />
          <TextField label="Disabled" disabled defaultValue="Can't change this" />
          <TextArea label="Bio" autoGrow rows={2} hint="Grows as you type." />
        </div>
      </Card>
      <Card>
        <CardTitle as="h3">Choices</CardTitle>
        <div className="pg-form">
          <Checkbox
            label="All notifications"
            checked={all}
            indeterminate={some}
            onChange={() => setNotify(all ? [] : NOTIFY)}
          />
          <div className="pg-indent">
            {NOTIFY.map((item) => (
              <Checkbox
                key={item}
                label={item}
                checked={notify.includes(item)}
                onChange={(e) =>
                  setNotify(e.target.checked ? [...notify, item] : notify.filter((n) => n !== item))
                }
              />
            ))}
          </div>
          <RadioGroup
            label="Digest"
            options={[
              { value: 'daily', label: 'Daily' },
              { value: 'weekly', label: 'Weekly' },
              { value: 'never', label: 'Never' },
            ]}
            defaultValue="weekly"
            orientation="horizontal"
          />
          <Switch
            label="Desktop alerts"
            hint="Only while this tab is open."
            defaultChecked
            labelPlacement="start"
          />
          <Switch label="Sound" labelPlacement="start" />
          <Switch label="Beta features" disabled labelPlacement="start" />
        </div>
      </Card>
      <Card>
        <CardTitle as="h3">Verification code</CardTitle>
        <div className="pg-form">
          <OneTimeCodeField
            label="Enter the 6-digit code"
            hint="We sent it to your phone."
            onComplete={setCode}
            onValueChange={() => setCode(null)}
          />
          <p className="pg-muted" aria-live="polite">
            {code ? `Code ${code} entered.` : 'Paste works too, e.g. "123 456".'}
          </p>
          <TextField
            label="With an error"
            defaultValue="hello@"
            error="Enter a full email address"
          />
        </div>
      </Card>
    </div>
  );
}

export function FormsDemo() {
  return (
    <>
      <SignUpDemo />
      <ControlsDemo />
    </>
  );
}
