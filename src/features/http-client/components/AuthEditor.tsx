"use client"
import { AuthSettings, AuthType } from "../types"
import { Select } from "@/shared/components/ui/Select"
import { Input } from "@/shared/components/ui/Input"

interface AuthEditorProps {
  auth: AuthSettings
  onChange: (auth: AuthSettings) => void
}

export function AuthEditor({ auth, onChange }: AuthEditorProps) {
  const handleTypeChange = (type: string) => {
    onChange({ ...auth, type: type as AuthType })
  }

  const handleFieldChange = (field: keyof AuthSettings, value: string) => {
    onChange({ ...auth, [field]: value })
  }

  return (
    <div className="flex h-full">
      <div className="w-48 border-r border-neutral-800 p-4 shrink-0">
        <label className="text-xs font-medium text-neutral-500 mb-2 block uppercase tracking-wider">Type</label>
        <Select
          value={auth.type}
          onChange={handleTypeChange}
          options={[
            { value: "none", label: "No Auth" },
            { value: "bearer", label: "Bearer Token" },
            { value: "basic", label: "Basic Auth" },
            { value: "apikey", label: "API Key" }
          ]}
        />
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        {auth.type === "none" && (
          <div className="text-sm text-neutral-500 text-center mt-10">
            This request does not use any authorization.
          </div>
        )}

        {auth.type === "bearer" && (
          <div className="max-w-md space-y-4">
            <div>
              <label className="text-xs font-medium text-neutral-400 mb-1.5 block">Token</label>
              <Input
                type="text"
                placeholder="Token"
                value={auth.bearerToken || ""}
                onChange={(e) => handleFieldChange("bearerToken", e.target.value)}
              />
            </div>
            <p className="text-xs text-neutral-500">
              The token will be sent in the <code className="text-neutral-400 bg-neutral-900 px-1 py-0.5 rounded">Authorization</code> header with the <code className="text-neutral-400 bg-neutral-900 px-1 py-0.5 rounded">Bearer</code> prefix.
            </p>
          </div>
        )}

        {auth.type === "basic" && (
          <div className="max-w-md space-y-4">
            <div>
              <label className="text-xs font-medium text-neutral-400 mb-1.5 block">Username</label>
              <Input
                type="text"
                placeholder="Username"
                value={auth.basicUsername || ""}
                onChange={(e) => handleFieldChange("basicUsername", e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-neutral-400 mb-1.5 block">Password</label>
              <Input
                type="password"
                placeholder="Password"
                value={auth.basicPassword || ""}
                onChange={(e) => handleFieldChange("basicPassword", e.target.value)}
              />
            </div>
            <p className="text-xs text-neutral-500">
              The credentials will be base64 encoded and sent in the <code className="text-neutral-400 bg-neutral-900 px-1 py-0.5 rounded">Authorization</code> header.
            </p>
          </div>
        )}

        {auth.type === "apikey" && (
          <div className="max-w-md space-y-4">
            <div>
              <label className="text-xs font-medium text-neutral-400 mb-1.5 block">Key</label>
              <Input
                type="text"
                placeholder="Key (e.g., api_key)"
                value={auth.apiKeyName || ""}
                onChange={(e) => handleFieldChange("apiKeyName", e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-neutral-400 mb-1.5 block">Value</label>
              <Input
                type="text"
                placeholder="Value"
                value={auth.apiKeyValue || ""}
                onChange={(e) => handleFieldChange("apiKeyValue", e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-neutral-400 mb-1.5 block">Add to</label>
              <div className="w-48">
                <Select
                  value={auth.apiKeyAddTo || "header"}
                  onChange={(val) => handleFieldChange("apiKeyAddTo", val)}
                  options={[
                    { value: "header", label: "Header" },
                    { value: "query", label: "Query Params" }
                  ]}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
