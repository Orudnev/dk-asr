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
import { Pgstyle } from './pgStyle';


export default function PgSettings(){
    return (
        <View style = {[Pgstyle.page]} >
          <Text >Settings</Text>
        </View>    );
}