import type { Meta, StoryObj } from "@storybook/react"
import { fn, userEvent, expect, within } from "storybook/test"
import { Input } from "./Input"

const meta = {
  title: "UI/Input",
  component: Input,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    placeholder: "Enter value...",
  },
}

export const Disabled: Story = {
  args: {
    placeholder: "Disabled input",
    disabled: true,
  },
}

export const InteractiveTest: Story = {
  args: {
    placeholder: "Type here...",
    onChange: fn(),
  },
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText("Type here...");

    await step("Check initial state", async () => {
      await expect(input).toBeInTheDocument();
      await expect(input).toHaveValue("");
    });

    await step("User types into input", async () => {
      await userEvent.type(input, "Hello");
      await expect(input).toHaveValue("Hello");
      await expect(args.onChange).toHaveBeenCalled();
    });
  },
}
