import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../../test/a11y';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  cardLinkClassName,
  type CardVariant,
} from './Card';

describe('Card', () => {
  it('renders a bordered div with medium padding by default', () => {
    render(<Card data-testid="card">Content</Card>);
    const card = screen.getByTestId('card');
    expect(card.tagName).toBe('DIV');
    expect(card).toHaveClass('dawg-card');
    expect(card).toHaveAttribute('data-variant', 'bordered');
    expect(card).toHaveAttribute('data-padding', 'md');
    expect(card).not.toHaveAttribute('data-interactive');
  });

  it.each<CardVariant>(['basic', 'bordered', 'elevated'])('supports the %s variant', (variant) => {
    render(<Card variant={variant} data-testid="card" />);
    expect(screen.getByTestId('card')).toHaveAttribute('data-variant', variant);
  });

  it('renders the requested element, e.g. a list item inside a list', () => {
    render(
      <ul>
        <Card as="li">One</Card>
      </ul>,
    );
    expect(screen.getByRole('listitem')).toHaveClass('dawg-card');
  });

  it('renders header, title at the chosen level, description and footer', () => {
    render(
      <Card as="section" aria-labelledby="t">
        <CardHeader>
          <CardTitle id="t" as="h2">
            Monthly report
          </CardTitle>
        </CardHeader>
        <CardDescription>Updated daily.</CardDescription>
        <CardFooter>
          <button type="button">Open</button>
        </CardFooter>
      </Card>,
    );
    expect(screen.getByRole('heading', { level: 2, name: 'Monthly report' })).toHaveClass(
      'dawg-card__title',
    );
    expect(screen.getByRole('region', { name: 'Monthly report' })).toBeInTheDocument();
    expect(screen.getByText('Updated daily.')).toHaveClass('dawg-card__description');
    expect(screen.getByRole('button', { name: 'Open' }).parentElement).toHaveClass(
      'dawg-card__footer',
    );
  });

  it('defaults the title to an h3', () => {
    render(<CardTitle>Title</CardTitle>);
    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
  });

  it('makes an interactive card navigable through its stretched link', async () => {
    const onOpen = vi.fn((e: React.MouseEvent) => e.preventDefault());
    render(
      <Card interactive data-testid="card">
        <CardTitle>
          <a href="/projects/1" className={cardLinkClassName} onClick={onOpen}>
            Project one
          </a>
        </CardTitle>
        <CardDescription>Three open tasks.</CardDescription>
      </Card>,
    );
    expect(screen.getByTestId('card')).toHaveAttribute('data-interactive', 'true');
    const link = screen.getByRole('link', { name: 'Project one' });
    await userEvent.tab();
    expect(link).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it('forwards refs and props on every part', () => {
    const cardRef = createRef<HTMLElement>();
    const titleRef = createRef<HTMLHeadingElement>();
    render(
      <Card ref={cardRef} className="mine" padding="lg" data-testid="card">
        <CardTitle ref={titleRef}>T</CardTitle>
      </Card>,
    );
    expect(cardRef.current).toBe(screen.getByTestId('card'));
    expect(cardRef.current).toHaveClass('dawg-card', 'mine');
    expect(cardRef.current).toHaveAttribute('data-padding', 'lg');
    expect(titleRef.current).toBe(screen.getByRole('heading'));
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <div>
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Static card</CardTitle>
          </CardHeader>
          <CardDescription>Description</CardDescription>
        </Card>
        <Card interactive>
          <CardTitle>
            <a href="/x" className={cardLinkClassName}>
              Linked card
            </a>
          </CardTitle>
          <CardFooter>
            <button type="button">Secondary action</button>
          </CardFooter>
        </Card>
      </div>,
    );
    expect(await axeViolations(container)).toEqual([]);
  });
});
