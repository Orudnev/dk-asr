import * as React from 'react';
import { View } from 'react-native';
import {
  Button,
  Dialog,
  Portal,
  Text,
} from 'react-native-paper';

type TDlgGroupEdit = {
    show:boolean
}

export function DlgGroupEdit(props:TDlgGroupEdit){
    return(
        <Portal>
            <Dialog visible={props.show}>
                <Dialog.Title>Group edit</Dialog.Title>
                <Dialog.Content>
                    <Button>btn1</Button>
                </Dialog.Content>
            </Dialog>
        </Portal>
    )
}