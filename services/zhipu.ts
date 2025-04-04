import AsyncStorage from '@react-native-async-storage/async-storage';

interface ZhipuResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
  }>;
}

const DEFAULT_SYSTEM_PROMPT = `你是一位知识渊博的百科助手。请以简洁清晰的方式回答用户的问题，确保：

1. 信息准确且来源可靠
2. 回答简明扼要
3. 适当使用举例说明
4. 避免技术术语，使用通俗易懂的语言
5. 在必要时提供进一步学习的建议`;

export const zhipuService = {
  async generateResponse(prompt: string): Promise<string> {
    const apiKey = await AsyncStorage.getItem('zhipu_api_key');
    const customSystemPrompt = await AsyncStorage.getItem('system_prompt');
    
    if (!apiKey) {
      throw new Error('API key not found');
    }

    try {
      const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "glm-4-flash",
          messages: [
            {
              role: "system",
              content: customSystemPrompt || DEFAULT_SYSTEM_PROMPT
            },
            { 
              role: "user", 
              content: prompt
            }
          ],
        }),
      });

      const data: ZhipuResponse = await response.json();
      
      if (!data.choices?.[0]?.message?.content) {
        throw new Error('Invalid API response');
      }

      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error calling Zhipu AI:', error);
      throw error;
    }
  }
}; 