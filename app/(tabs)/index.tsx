import { StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useState } from 'react';
import { zhipuService } from '@/services/zhipu';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AppConfig {
  title: string;
  subtitle: string;
  inputPlaceholder: string;
  buttonText: string;
}

interface GenerationResult {
  prompt: string;
  response: string;
  timestamp: number;
}

const APP_CONFIG: AppConfig = {
  title: 'AI Wallpaper',
  subtitle: 'Generate beautiful wallpapers with AI',
  inputPlaceholder: 'Describe the wallpaper you want...',
  buttonText: 'Generate'
};

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<GenerationResult[]>([]);

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }

    try {
      setIsLoading(true);
      let apiKey: string | null;
      
      try {
        apiKey = await AsyncStorage.getItem('zhipu_api_key');
      } catch (storageError) {
        console.error('Storage error:', storageError);
        Alert.alert('Error', 'Failed to access storage');
        return;
      }

      if (!apiKey) {
        Alert.alert('Error', 'Please set your API key in settings');
        return;
      }

      const response = await zhipuService.generateResponse(prompt);
      console.log('Generated response:', response);
      
      // Add new result to the list
      const newResult: GenerationResult = {
        prompt,
        response,
        timestamp: Date.now()
      };
      
      setResults(prevResults => [newResult, ...prevResults]);
      setPrompt(''); // Clear input after successful generation
      
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to generate wallpaper');
    } finally {
      setIsLoading(false);
    }
  };

  // Determine if we should use desktop layout
  const isDesktop = width > 768;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          isDesktop && styles.scrollContentDesktop
        ]}
      >
        <ThemedView style={[
          styles.content,
          isDesktop && styles.contentDesktop
        ]}>
          <ThemedView style={styles.headerContainer}>
            <ThemedText style={styles.title}>{APP_CONFIG.title}</ThemedText>
            <ThemedText style={styles.subtitle}>{APP_CONFIG.subtitle}</ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder={APP_CONFIG.inputPlaceholder}
              placeholderTextColor="#666"
              multiline
              numberOfLines={3}
              value={prompt}
              onChangeText={setPrompt}
              editable={!isLoading}
            />
            
            <TouchableOpacity 
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              <ThemedText style={styles.buttonText}>
                {isLoading ? 'Generating...' : APP_CONFIG.buttonText}
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>

          {results.length > 0 && (
            <ThemedView style={styles.resultsContainer}>
              <ThemedText style={styles.resultsTitle}>Generation History</ThemedText>
              {results.map((result, index) => (
                <ThemedView key={result.timestamp} style={styles.resultCard}>
                  <ThemedText style={styles.resultPrompt}>
                    Prompt: {result.prompt}
                  </ThemedText>
                  <ThemedText style={styles.resultTimestamp}>
                    {new Date(result.timestamp).toLocaleString()}
                  </ThemedText>
                  <ThemedText style={styles.resultResponse}>
                    {result.response}
                  </ThemedText>
                </ThemedView>
              ))}
            </ThemedView>
          )}
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  scrollContentDesktop: {
    paddingHorizontal: '10%',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  contentDesktop: {
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
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
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  inputContainer: {
    width: '100%',
    gap: 16,
  },
  input: {
    width: '100%',
    minHeight: 120,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultsContainer: {
    marginTop: 32,
    gap: 16,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#eee',
    gap: 8,
  },
  resultPrompt: {
    fontSize: 16,
    fontWeight: '600',
  },
  resultTimestamp: {
    fontSize: 12,
    color: '#666',
  },
  resultResponse: {
    fontSize: 14,
    marginTop: 8,
    lineHeight: 20,
  },
});
