import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { Pgstyle } from './pgStyle';
import { Appbar, TextInput } from 'react-native-paper';
import { getProperty, setProperty } from '../db/tblSettings';

export default function PgSettings() {
  const [googleDocApiUrl, setGoogleDocApiUrl] = useState('');
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    async function loadData() {
      const url = (await getProperty<string>('googleDocUrl')) ?? '';
      setGoogleDocApiUrl(url);
      setIsDirty(false);
    }

    loadData();
  }, []);

  async function applySettings() {
    await setProperty('googleDocUrl', googleDocApiUrl);
    setIsDirty(false);
  }

  return (
    <>
      <Appbar.Header>
        <Appbar.Action icon="cog-outline" accessibilityLabel="Settings" />
        <Appbar.Content title="Settings" />
        {isDirty && (
          <Appbar.Action
            icon="check-outline"
            accessibilityLabel="Apply"
            onPress={applySettings}
          />
        )}
      </Appbar.Header>
      <ScrollView style={[Pgstyle.clientArea]}>
        <Text style={styles.propLabel}>Google Doc API URL</Text>
        <TextInput
          mode="outlined"
          value={googleDocApiUrl}
          onChangeText={text => {
            setGoogleDocApiUrl(text);
            setIsDirty(true);
          }}
          placeholder="sk-..."
          autoCapitalize="none"
          autoCorrect={false}
        />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  propLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
});
