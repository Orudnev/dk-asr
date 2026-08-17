import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import VoskAsr from 'react-native-vosk-asr';

type Language = 'ru' | 'en';
type EventType = 'partial' | 'final';

type AsrEvent = {
  language: Language;
  type: EventType;
  text: string;
};

export function TestASR(): React.JSX.Element {
  const [activeLanguage, setActiveLanguage] = useState<Language | null>(null);
  const [status, setStatus] = useState('Idle');
  const [partialText, setPartialText] = useState('');
  const [finalText, setFinalText] = useState('');

  useEffect(() => {
    VoskAsr.configure({
      models: {
        ru: 'vosk-model-small-ru-0.22',
        // en: 'vosk-model-small-en-us-0.15',
      },
    }).catch(error => {
      setStatus(`Configure failed: ${String(error)}`);
    });

    const unsubscribe = VoskAsr.subscribeResults((event: AsrEvent) => {
      if (event.type === 'partial') {
        setPartialText(event.text);
      } else {
        setFinalText(current =>
          current ? `${current}\n${event.language}: ${event.text}` : `${event.language}: ${event.text}`,
        );
        setPartialText('');
      }
    });

    return unsubscribe;
  }, []);

  async function startRecognition(language: Language) {
    try {
      setStatus(`Requesting permission for ${language}...`);
      const granted = await VoskAsr.requestPermission();
      if (!granted) {
        setStatus('Microphone permission denied');
        return;
      }

      setStatus(`Starting ${language} recognition...`);
      setPartialText('');
      await VoskAsr.startRecognition(language);
      setActiveLanguage(language);
      setStatus(`Listening (${language})`);
    } catch (error) {
      setStatus(`Start failed: ${String(error)}`);
    }
  }

  async function stopRecognition() {
    try {
      await VoskAsr.stopRecognition();
      setActiveLanguage(null);
      setPartialText('');
      setStatus('Stopped');
    } catch (error) {
      setStatus(`Stop failed: ${String(error)}`);
    }
  }

  return ( 
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={styles.root.backgroundColor} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>dk-asr</Text>
        <Text style={styles.subtitle}>React Native host app for local Vosk library verification</Text>

        <View style={styles.panel}>
          <Text style={styles.label}>Status</Text>
          <Text style={styles.value}>{status}</Text>
        </View>

        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.button, activeLanguage === 'ru' && styles.buttonActive]}
            onPress={() => startRecognition('ru')}>
            <Text style={styles.buttonText}>Start RU</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, activeLanguage === 'en' && styles.buttonActive]}
            onPress={() => startRecognition('en')}>
            <Text style={styles.buttonText}>Start EN</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={[styles.button, styles.stopButton]} onPress={stopRecognition}>
          <Text style={styles.buttonText}>Stop</Text>
        </TouchableOpacity>

        <View style={styles.panel}>
          <Text style={styles.label}>Partial</Text>
          <Text style={styles.value}>{partialText || '...'}</Text>
        </View>

        <View style={styles.panel}>
          <Text style={styles.label}>Final</Text>
          <Text style={styles.value}>{finalText || '...'}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f2efe8',
  },
  content: {
    padding: 24,
    gap: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#162521',
  },
  subtitle: {
    fontSize: 15,
    color: '#4a5b55',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    backgroundColor: '#1f6f5f',
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 14,
    alignItems: 'center',
  },
  buttonActive: {
    backgroundColor: '#c96b2c',
  },
  stopButton: {
    backgroundColor: '#7a2f2f',
  },
  buttonText: {
    color: '#fffaf2',
    fontSize: 16,
    fontWeight: '700',
  },
  panel: {
    backgroundColor: '#fffaf2',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd2bf',
  },
  label: {
    fontSize: 13,
    textTransform: 'uppercase',
    color: '#7b6f5c',
    marginBottom: 8,
    letterSpacing: 0.8,
  },
  value: {
    fontSize: 17,
    lineHeight: 24,
    color: '#162521',
  },
});

