import { CollectionItem, HttpRequest, KeyValuePair, AuthSettings, RequestBody, HttpMethod } from "../types"

// Helper to generate a KeyValuePair from Postman headers/queries
const mapPostmanKeyValue = (items: any[] = []): KeyValuePair[] => {
  return items.map(item => ({
    id: crypto.randomUUID(),
    key: item.key || "",
    value: item.value || "",
    enabled: item.disabled !== true,
    description: item.description || ""
  }))
}

// Flatten nested postman items into a single request array
const extractRequests = (items: any[] = []): HttpRequest[] => {
  let requests: HttpRequest[] = []
  
  for (const item of items) {
    if (item.item) {
      // It's a folder, recurse
      requests = [...requests, ...extractRequests(item.item)]
    } else if (item.request) {
      // It's a request
      const req = item.request
      
      // Parse URL
      let urlStr = ""
      let queries: KeyValuePair[] = []
      
      if (typeof req.url === "string") {
        urlStr = req.url
      } else if (req.url && typeof req.url === "object") {
        urlStr = req.url.raw || ""
        queries = mapPostmanKeyValue(req.url.query)
      }

      // Parse Auth
      const auth: AuthSettings = { type: 'none' }
      if (req.auth) {
        if (req.auth.type === 'bearer' && req.auth.bearer) {
          auth.type = 'bearer'
          auth.bearerToken = req.auth.bearer.find((a: any) => a.key === 'token')?.value || ""
        } else if (req.auth.type === 'basic' && req.auth.basic) {
          auth.type = 'basic'
          auth.basicUsername = req.auth.basic.find((a: any) => a.key === 'username')?.value || ""
          auth.basicPassword = req.auth.basic.find((a: any) => a.key === 'password')?.value || ""
        } else if (req.auth.type === 'apikey' && req.auth.apikey) {
          auth.type = 'apikey'
          auth.apiKeyValue = req.auth.apikey.find((a: any) => a.key === 'value')?.value || ""
          auth.apiKeyName = req.auth.apikey.find((a: any) => a.key === 'key')?.value || ""
          auth.apiKeyAddTo = req.auth.apikey.find((a: any) => a.key === 'in')?.value === 'query' ? 'query' : 'header'
        }
      }

      // Parse Body
      const body: RequestBody = { type: 'none' }
      if (req.body) {
        if (req.body.mode === 'raw') {
          body.type = 'raw' // Default, might be json
          body.rawContent = req.body.raw || ""
          // Check if it's JSON via options
          if (req.body.options?.raw?.language === 'json') {
            body.type = 'json'
          }
        } else if (req.body.mode === 'formdata') {
          body.type = 'form-data'
          body.formData = mapPostmanKeyValue(req.body.formdata)
        }
      }

      requests.push({
        id: crypto.randomUUID(),
        name: item.name || urlStr,
        method: (req.method || 'GET') as HttpMethod,
        url: urlStr,
        headers: mapPostmanKeyValue(req.header),
        queryParams: queries,
        auth,
        body
      })
    }
  }
  
  return requests
}

export const parsePostmanCollection = (jsonString: string): CollectionItem => {
  try {
    const data = JSON.parse(jsonString)
    
    if (!data.info || !data.info.schema || !data.info.schema.includes("collection/v2")) {
      throw new Error("Invalid Postman Collection format. Expected v2.1.0 or v2.0.0")
    }

    const requests = extractRequests(data.item)

    return {
      id: crypto.randomUUID(),
      name: data.info.name || "Imported Collection",
      description: data.info.description || "",
      requests,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
  } catch (error) {
    console.error("Error parsing Postman collection", error)
    throw new Error("Failed to parse Postman collection. Please ensure it's a valid v2.1.0 JSON file.")
  }
}

export const exportToPostmanCollection = (collection: CollectionItem): string => {
  const postmanItems = collection.requests.map(req => {
    // Map Auth
    let authObj: any = undefined
    if (req.auth.type === 'bearer') {
      authObj = { type: 'bearer', bearer: [{ key: 'token', value: req.auth.bearerToken, type: 'string' }] }
    } else if (req.auth.type === 'basic') {
      authObj = { type: 'basic', basic: [
        { key: 'password', value: req.auth.basicPassword, type: 'string' },
        { key: 'username', value: req.auth.basicUsername, type: 'string' }
      ]}
    } else if (req.auth.type === 'apikey') {
      authObj = { type: 'apikey', apikey: [
        { key: 'value', value: req.auth.apiKeyValue, type: 'string' },
        { key: 'key', value: req.auth.apiKeyName, type: 'string' },
        { key: 'in', value: req.auth.apiKeyAddTo || 'header', type: 'string' }
      ]}
    }

    // Map Body
    let bodyObj: any = undefined
    if (req.body.type === 'raw' || req.body.type === 'json') {
      bodyObj = {
        mode: 'raw',
        raw: req.body.rawContent || "",
        options: req.body.type === 'json' ? { raw: { language: 'json' } } : undefined
      }
    } else if (req.body.type === 'form-data') {
      bodyObj = {
        mode: 'formdata',
        formdata: req.body.formData?.map(fd => ({
          key: fd.key,
          value: fd.value,
          disabled: !fd.enabled,
          description: fd.description,
          type: 'text'
        })) || []
      }
    }

    // Map URL
    const urlParts = req.url.split('?')
    const hostPath = urlParts[0].split('://')
    const protocol = hostPath.length > 1 ? hostPath[0] : undefined
    const hostAndPath = hostPath.length > 1 ? hostPath[1] : hostPath[0]
    
    const hostSplit = hostAndPath.split('/')
    const host = hostSplit[0].split('.')
    const path = hostSplit.slice(1)

    return {
      name: req.name || req.url,
      request: {
        method: req.method,
        header: req.headers.map(h => ({
          key: h.key,
          value: h.value,
          disabled: !h.enabled,
          description: h.description
        })),
        body: bodyObj,
        url: {
          raw: req.url,
          protocol,
          host,
          path,
          query: req.queryParams.map(q => ({
            key: q.key,
            value: q.value,
            disabled: !q.enabled,
            description: q.description
          }))
        },
        auth: authObj
      }
    }
  })

  const postmanCollection = {
    info: {
      name: collection.name,
      description: collection.description || "Exported from QuickPost",
      schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
    },
    item: postmanItems
  }

  return JSON.stringify(postmanCollection, null, 2)
}
