import type { Meta, StoryObj } from "@storybook/react"
import { Badge } from "./Badge"

const meta = {
  title: "UI/Badge",
  component: Badge,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: "Badge",
  },
}

export const Success: Story = {
  args: {
    children: "200 OK",
    variant: "success",
  },
}

export const Warning: Story = {
  args: {
    children: "429 Too Many Requests",
    variant: "warning",
  },
}

export const Error: Story = {
  args: {
    children: "500 Server Error",
    variant: "error",
  },
}

export const Info: Story = {
  args: {
    children: "Info",
    variant: "info",
  },
}
