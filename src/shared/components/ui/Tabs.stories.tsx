import type { Meta, StoryObj } from "@storybook/react"
import { fn, userEvent, expect, within } from "storybook/test"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./Tabs"
import * as React from "react"

const meta = {
  title: "UI/Tabs",
  component: Tabs,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Tabs>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    value: "tab1",
    onValueChange: fn(),
    children: null,
  },
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [activeTab, setActiveTab] = React.useState("tab1")
    return (
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[400px]">
        <TabsList>
          <TabsTrigger value="tab1">Account</TabsTrigger>
          <TabsTrigger value="tab2">Password</TabsTrigger>
        </TabsList>
        <div className="p-4 border border-neutral-800 rounded-md mt-2">
          <TabsContent value="tab1">Make changes to your account here.</TabsContent>
          <TabsContent value="tab2">Change your password here.</TabsContent>
        </div>
      </Tabs>
    )
  },
}

export const InteractiveTest: Story = {
  args: {
    value: "tab1",
    onValueChange: fn(),
    children: null,
  },
  render: (args) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [activeTab, setActiveTab] = React.useState("tab1")
    const handleValueChange = (v: string) => {
      setActiveTab(v);
      args.onValueChange(v);
    };
    return (
      <Tabs value={activeTab} onValueChange={handleValueChange} className="w-[400px]">
        <TabsList>
          <TabsTrigger value="tab1">Account</TabsTrigger>
          <TabsTrigger value="tab2">Password</TabsTrigger>
        </TabsList>
        <div className="p-4 border border-neutral-800 rounded-md mt-2">
          <TabsContent value="tab1">Make changes to your account here.</TabsContent>
          <TabsContent value="tab2">Change your password here.</TabsContent>
        </div>
      </Tabs>
    )
  },
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);
    const tab1 = canvas.getByRole("tab", { name: "Account" });
    const tab2 = canvas.getByRole("tab", { name: "Password" });

    await step("Check initial state", async () => {
      await expect(tab1).toBeInTheDocument();
      await expect(canvas.getByText("Make changes to your account here.")).toBeInTheDocument();
      expect(canvas.queryByText("Change your password here.")).not.toBeInTheDocument();
    });

    await step("User clicks on second tab", async () => {
      await userEvent.click(tab2);
      await expect(args.onValueChange).toHaveBeenCalledWith("tab2");
      await expect(canvas.getByText("Change your password here.")).toBeInTheDocument();
      expect(canvas.queryByText("Make changes to your account here.")).not.toBeInTheDocument();
    });
  },
}
