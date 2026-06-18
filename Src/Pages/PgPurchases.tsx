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

export default function PgPurchases(){
    return (
        <View style = {[Pgstyle.page]} >
          <Text >Purchases</Text>
        </View>    );
}