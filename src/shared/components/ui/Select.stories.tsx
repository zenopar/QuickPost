import type { Meta, StoryObj } from "@storybook/react"
import { fn, userEvent, expect, within } from "storybook/test"
import { Select } from "./Select"
import * as React from "react"

const meta = {
  title: "UI/Select",
  component: Select,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    options: [
      { value: "1", label: "Option 1" },
      { value: "2", label: "Option 2" },
      { value: "3", label: "Option 3" },
    ],
    defaultValue: "1",
  },
}

export const InteractiveTest: Story = {
  args: {
    onChange: fn(),
    "aria-label": "Select an option",
    options: [
      { value: "1", label: "Option 1" },
      { value: "2", label: "Option 2" },
      { value: "3", label: "Option 3" },
    ],
    defaultValue: "1",
  },
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);
    const selectButton = canvas.getByRole("combobox", { name: "Select an option" });

    await step("Check initial state", async () => {
      await expect(selectButton).toBeInTheDocument();
      await expect(canvas.getByText("Option 1")).toBeInTheDocument();
    });

    await step("User opens dropdown and selects Option 2", async () => {
      await userEvent.click(selectButton);
      
      // Wait for options to appear and click Option 2
      const option2 = canvas.getByText("Option 2");
      await expect(option2).toBeInTheDocument();
      await userEvent.click(option2);
      
      await expect(args.onChange).toHaveBeenCalledWith("2");
      await expect(canvas.getByText("Option 2")).toBeInTheDocument(); // button text is now Option 2
    });
  },
}
