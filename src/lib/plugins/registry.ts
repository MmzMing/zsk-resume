import type { ResumePlugin, PluginAction, PluginContext, PluginUtils } from './types'

class PluginRegistry {
  private plugins: Map<string, ResumePlugin> = new Map()
  private actions: Map<string, PluginAction> = new Map()
  private context: PluginContext | null = null

  initialize(store: {
    getState: () => Record<string, unknown>
    setState: (state: Record<string, unknown>) => void
    subscribe: (listener: () => void) => () => void
  }, utils: PluginUtils) {
    this.context = {
      store,
      utils,
      registerAction: (action: PluginAction) => {
        this.actions.set(action.id, action)
      },
    }
  }

  register(plugin: ResumePlugin) {
    if (this.plugins.has(plugin.id)) {
      console.warn(`Plugin ${plugin.id} is already registered`)
      return
    }
    this.plugins.set(plugin.id, plugin)
    
    if (this.context) {
      plugin.install(this.context)
    }
  }

  unregister(pluginId: string) {
    const plugin = this.plugins.get(pluginId)
    if (plugin) {
      plugin.uninstall?.()
      this.plugins.delete(pluginId)
    }
  }

  getActions(): PluginAction[] {
    return Array.from(this.actions.values())
  }

  getAction(id: string): PluginAction | undefined {
    return this.actions.get(id)
  }

  isRegistered(pluginId: string): boolean {
    return this.plugins.has(pluginId)
  }
}

export const pluginRegistry = new PluginRegistry()
