import { StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Collapsible } from '@/components/Collapsible';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsConfig {
  title: string;
  sections: {
    title: string;
    items: {
      label: string;
      description: string;
      type?: 'input';
      key?: string;
      defaultValue?: string;
    }[];
  }[];
}

const SETTINGS_CONFIG: SettingsConfig = {
  title: 'Settings',
  sections: [
    {
      title: 'API Configuration',
      items: [
        {
          label: 'Zhipu API Key',
          description: 'Enter your Zhipu AI API key',
          type: 'input',
          key: 'zhipu_api_key'
        }
      ]
    },
    {
      title: 'Prompt Configuration',
      items: [
        {
          label: '系统提示词',
          description: '设置AI的角色定位和行为准则',
          type: 'input',
          key: 'system_prompt',
          defaultValue: `你是一位专业的探索助手，擅长帮助用户发现和了解新事物。在回答用户问题时，请：

1. 提供准确、客观的信息
2. 用简单易懂的语言解释复杂概念
3. 适时举例说明，帮助理解
4. 鼓励用户进一步探索和学习
5. 在必要时提供相关资源或参考链接

请以友好、专业的态度回答用户的问题。`
        }
      ]
    },
    {
      title: 'Appearance',
      items: [
        {
          label: 'Dark Mode',
          description: 'Toggle between light and dark theme',
        },
        {
          label: 'Font Size',
          description: 'Adjust text size for better readability',
        }
      ]
    },
    {
      title: 'Generation',
      items: [
        {
          label: 'Image Quality',
          description: 'Choose the quality of generated wallpapers',
        },
        {
          label: 'Image Size',
          description: 'Set default resolution for wallpapers',
        }
      ]
    },
    {
      title: 'Storage',
      items: [
        {
          label: 'Clear Cache',
          description: 'Free up space by removing temporary files',
        },
        {
          label: 'Download Location',
          description: 'Choose where to save generated wallpapers',
        }
      ]
    }
  ]
};

export default function SettingsScreen() {
  const [apiKey, setApiKey] = useState('');
  const [systemPrompt, setSystemPrompt] = useState(
    SETTINGS_CONFIG.sections[1].items[0].defaultValue || ''
  );

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedKey = await AsyncStorage.getItem('zhipu_api_key');
      const savedSystemPrompt = await AsyncStorage.getItem('system_prompt');
      
      if (savedKey) setApiKey(savedKey);
      if (savedSystemPrompt) setSystemPrompt(savedSystemPrompt);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleSettingChange = async (key: string, value: string) => {
    try {
      await AsyncStorage.setItem(key, value);
      if (key === 'zhipu_api_key') setApiKey(value);
      if (key === 'system_prompt') setSystemPrompt(value);
    } catch (error) {
      console.error('Error saving setting:', error);
    }
  };

  const renderSettingItem = (item: typeof SETTINGS_CONFIG.sections[0]['items'][0]) => {
    if (item.type === 'input') {
      const value = item.key === 'zhipu_api_key' ? apiKey :
                   item.key === 'system_prompt' ? systemPrompt : '';
      
      return (
        <ThemedView style={styles.settingItem}>
          <ThemedText style={styles.settingLabel}>{item.label}</ThemedText>
          <TextInput
            style={[
              styles.input,
              (item.key === 'system_prompt') && styles.multilineInput
            ]}
            value={value}
            onChangeText={(newValue) => handleSettingChange(item.key!, newValue)}
            placeholder={item.description}
            placeholderTextColor="#666"
            secureTextEntry={item.key === 'zhipu_api_key'}
            multiline={item.key === 'system_prompt'}
            numberOfLines={item.key === 'system_prompt' ? 6 : 3}
          />
        </ThemedView>
      );
    }

    return (
      <ThemedView style={styles.settingItem}>
        <ThemedText style={styles.settingLabel}>{item.label}</ThemedText>
        <ThemedText style={styles.settingDescription}>
          {item.description}
        </ThemedText>
      </ThemedView>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ThemedView style={styles.content}>
        <ThemedView style={styles.headerContainer}>
          <ThemedText style={styles.title}>{SETTINGS_CONFIG.title}</ThemedText>
        </ThemedView>

        <ThemedView style={styles.sectionsContainer}>
          {SETTINGS_CONFIG.sections.map((section, index) => (
            <Collapsible key={index} title={section.title}>
              {section.items.map((item, itemIndex) => (
                <ThemedView key={itemIndex}>
                  {renderSettingItem(item)}
                </ThemedView>
              ))}
            </Collapsible>
          ))}
        </ThemedView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  headerContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 30,
  },
  sectionsContainer: {
    gap: 16,
  },
  settingItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
  },
  input: {
    width: '100%',
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
});
