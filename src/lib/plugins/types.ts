export interface PluginAction {
  id: string
  name: string
  icon?: string
  execute: () => Promise<void> | void
}

export interface PluginContext {
  store: {
    getState: () => Record<string, unknown>
    setState: (state: Record<string, unknown>) => void
    subscribe: (listener: () => void) => () => void
  }
  utils: PluginUtils
  registerAction: (action: PluginAction) => void
}

export interface PluginUtils {
  generateId: () => string
  sanitizeHTML: (html: string) => string
  stripHTML: (html: string) => string
}

export interface ResumePlugin {
  id: string
  name: string
  version: string
  description: string
  install: (context: PluginContext) => void
  uninstall?: () => void
}
