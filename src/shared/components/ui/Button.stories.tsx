import type { Meta, StoryObj } from '@storybook/react';
import { fn, userEvent, expect, within } from 'storybook/test';
import { Button } from './Button';

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// --- Vizuální stavy ---

export const Default: Story = {
  args: {
    children: 'Default Button',
  },
};

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline Button',
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Ghost Button',
  },
};

export const Danger: Story = {
  args: {
    variant: 'danger',
    children: 'Danger Button',
  },
};

export const Disabled: Story = {
  args: {
    variant: 'primary',
    disabled: true,
    children: 'Disabled Button',
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Small Button',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Large Button',
  },
};

export const Icon: Story = {
  args: {
    size: 'icon',
    children: '🔍',
  },
};

// --- Interakční a A11y testy ---

export const ClickAndKeyboardTest: Story = {
  args: {
    variant: 'primary',
    children: 'Interactive Button',
    onClick: fn(),
  },
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Interactive Button' });

    await step('Ověření výchozího stavu v DOMu', async () => {
      await expect(button).toBeInTheDocument();
      await expect(button).not.toBeDisabled();
    });

    await step('Interakce myší', async () => {
      await userEvent.click(button);
      await expect(args.onClick).toHaveBeenCalledTimes(1);
    });

    await step('Interakce klávesnicí (A11y - Enter a Space)', async () => {
      // 1. Explicitně zativujeme focus pro testovací prostředí
      button.focus();
      await expect(button).toHaveFocus();

      // 2. Pro spolehlivé vyvolání click události přes Space/Enter v userEvent
      await userEvent.keyboard('{Enter}');
      await userEvent.keyboard(' ');

      // 1x z předchozího kroku (myš) + 2x klávesnice = 3
      await expect(args.onClick).toHaveBeenCalledTimes(3);
    });
  },
};

export const DisabledTest: Story = {
  args: {
    variant: 'danger',
    disabled: true,
    children: 'Disabled Action',
    onClick: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Disabled Action' });

    await expect(button).toBeDisabled();

    // Obejití CSS kontroly pointer-events pro test nativního zablokování
    await userEvent.click(button, { pointerEventsCheck: 0 });

    await expect(args.onClick).not.toHaveBeenCalled();
  },
};