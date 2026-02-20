import { useSettingsStore } from '@/store/useSettingsStore'

export type Language = 'zh' | 'en'

export type TranslationKey =
  | 'app.title'
  | 'app.subtitle'
  | 'nav.chat'
  | 'nav.tree'
  | 'nav.settings'
  | 'sidebar.branches'
  | 'sidebar.newBranch'
  | 'sidebar.export'
  | 'sidebar.reset'
  | 'sidebar.selectNodeHint'
  | 'chat.inputPlaceholder'
  | 'chat.send'
  | 'chat.loading'
  | 'chat.error'
  | 'chat.emptyTitle'
  | 'chat.emptyDescription'
  | 'chat.branchMessages'
  | 'settings.title'
  | 'settings.llmConfig'
  | 'settings.general'
  | 'settings.addConfig'
  | 'settings.editConfig'
  | 'settings.deleteConfig'
  | 'settings.configName'
  | 'settings.provider'
  | 'settings.apiKey'
  | 'settings.baseUrl'
  | 'settings.model'
  | 'settings.theme'
  | 'settings.language'
  | 'settings.autoSave'
  | 'settings.light'
  | 'settings.dark'
  | 'settings.system'
  | 'settings.save'
  | 'settings.cancel'
  | 'settings.confirmDelete'
  | 'tree.emptyTitle'
  | 'tree.emptyDescription'
  | 'branch.createFromHere'
  | 'branch.switchTo'
  | 'roles.user'
  | 'roles.assistant'
  | 'roles.system'

type Translations = Record<Language, Record<TranslationKey, string>>

const translations: Translations = {
  zh: {
    'app.title': 'ErdTree',
    'app.subtitle': '对话分支管理',
    'nav.chat': '对话',
    'nav.tree': '图谱',
    'nav.settings': '设置',
    'sidebar.branches': '分支',
    'sidebar.newBranch': '新建分支',
    'sidebar.export': '导出',
    'sidebar.reset': '重置',
    'sidebar.selectNodeHint': '选择一个节点以创建分支',
    'chat.inputPlaceholder': '输入消息...',
    'chat.send': '发送',
    'chat.loading': '思考中...',
    'chat.error': '出错了',
    'chat.emptyTitle': '开始对话',
    'chat.emptyDescription': '在下方输入框中发送消息开始对话',
    'chat.branchMessages': '消息',
    'settings.title': '设置',
    'settings.llmConfig': '模型配置',
    'settings.general': '通用设置',
    'settings.addConfig': '添加配置',
    'settings.editConfig': '编辑配置',
    'settings.deleteConfig': '删除配置',
    'settings.configName': '配置名称',
    'settings.provider': '提供商',
    'settings.apiKey': 'API Key',
    'settings.baseUrl': 'Base URL',
    'settings.model': '模型',
    'settings.theme': '主题',
    'settings.language': '语言',
    'settings.autoSave': '自动保存对话',
    'settings.light': '浅色',
    'settings.dark': '深色',
    'settings.system': '跟随系统',
    'settings.save': '保存',
    'settings.cancel': '取消',
    'settings.confirmDelete': '确定要删除此配置吗？',
    'tree.emptyTitle': '暂无对话数据',
    'tree.emptyDescription': '在对话页面发送消息以查看树状图',
    'branch.createFromHere': '从此回复创建分支',
    'branch.switchTo': '切换到分支',
    'roles.user': '用户',
    'roles.assistant': '助手',
    'roles.system': '系统',
  },
  en: {
    'app.title': 'ErdTree',
    'app.subtitle': 'Conversation Branching',
    'nav.chat': 'Chat',
    'nav.tree': 'Graph',
    'nav.settings': 'Settings',
    'sidebar.branches': 'Branches',
    'sidebar.newBranch': 'New Branch',
    'sidebar.export': 'Export',
    'sidebar.reset': 'Reset',
    'sidebar.selectNodeHint': 'Select a node to create a branch',
    'chat.inputPlaceholder': 'Type a message...',
    'chat.send': 'Send',
    'chat.loading': 'Thinking...',
    'chat.error': 'Error',
    'chat.emptyTitle': 'Start a Conversation',
    'chat.emptyDescription': 'Type a message below to start chatting',
    'chat.branchMessages': 'messages',
    'settings.title': 'Settings',
    'settings.llmConfig': 'LLM Configuration',
    'settings.general': 'General',
    'settings.addConfig': 'Add Config',
    'settings.editConfig': 'Edit Config',
    'settings.deleteConfig': 'Delete Config',
    'settings.configName': 'Config Name',
    'settings.provider': 'Provider',
    'settings.apiKey': 'API Key',
    'settings.baseUrl': 'Base URL',
    'settings.model': 'Model',
    'settings.theme': 'Theme',
    'settings.language': 'Language',
    'settings.autoSave': 'Auto-save conversations',
    'settings.light': 'Light',
    'settings.dark': 'Dark',
    'settings.system': 'System',
    'settings.save': 'Save',
    'settings.cancel': 'Cancel',
    'settings.confirmDelete': 'Are you sure you want to delete this configuration?',
    'tree.emptyTitle': 'No conversation data',
    'tree.emptyDescription': 'Send a message in the chat view to see the tree graph',
    'branch.createFromHere': 'Create branch from this response',
    'branch.switchTo': 'Switch to branch',
    'roles.user': 'User',
    'roles.assistant': 'Assistant',
    'roles.system': 'System',
  },
}

export function t(key: TranslationKey, lang?: Language): string {
  const language = lang || useSettingsStore.getState().settings.language
  return translations[language]?.[key] || translations['en'][key] || key
}

export function useTranslation() {
  const { settings } = useSettingsStore()
  const language = settings.language

  const translate = (key: TranslationKey) => {
    return translations[language]?.[key] || translations['en'][key] || key
  }

  return {
    t: translate,
    language,
  }
}
