import { View, useColorScheme, useWindowDimensions } from 'react-native';
import { useEffect, useMemo, useState, createContext } from 'react';
import { BottomNavigation, MD3DarkTheme, PaperProvider } from 'react-native-paper';
import PgPurchases from './Src/Pages/PgPurchases';
import PgSettings from './Src/Pages/PgSettings';
import { RegisterDebugAPI } from './Src/debug/debug';
import { TestASR } from './Src/Pages/TestASR';
import { PgAddOrEditRow } from './Src/Pages/PgAddOrEditRow';

export type TPages = 'purchases' | 'settings'|'addOrEditRow'|'test';
type AppContextType = {
    currPage: TPages;
    setCurrPage: (page: TPages) => void | Promise<void>;
};
export const AppContext = createContext<AppContextType | null>(null);
type AppRoute = {
    key: TPages;
    title: string;
    focusedIcon: string;
};
const APP_ROUTES: AppRoute[] = [
    { key: 'purchases', title: 'Purchases', focusedIcon: 'cart' },
    { key: 'addOrEditRow', title: 'Item', focusedIcon: 'pencil' },
    { key: 'settings', title: 'Settings', focusedIcon: 'cog-outline' },
    { key: 'test', title: 'Test', focusedIcon: 'ev-plug-chademo' }
];


export default function App() {
    const [currPage, setCurrPage] = useState<TPages>('purchases');
    const isDark = useColorScheme() === 'dark';
    const navigationIndex = useMemo(
        () => {
            const index = APP_ROUTES.findIndex(route => route.key === currPage);
            return index >= 0 ? index : 0;
        },
        [currPage],
    );
    useEffect(() => {
        RegisterDebugAPI();
    }, []);

    async function handlePageChange(nextPage: TPages) {
        if (currPage === nextPage) {
            return;
        }

        if (currPage === 'settings') {
            try {
                //await saveAppSettingsToDb();
            } catch (err) {
                console.warn('Failed to save app settings', err);
            }
        }

        setCurrPage(nextPage);
    }

    return (
        <PaperProvider theme={MD3DarkTheme}>
            <AppContext.Provider value={{ currPage, setCurrPage: handlePageChange }}>
                <View
                    style={{
                        flex: 1,
                        backgroundColor: isDark ? '#000' : '#fff',
                    }}>
                    <BottomNavigation
                        navigationState={{ index: navigationIndex, routes: APP_ROUTES }}
                        barStyle={
                            {
                                height: 64,
                                justifyContent: 'center',
                                overflow: 'hidden',
                            }
                        }
                        onIndexChange={index => {
                            const nextRoute = APP_ROUTES[index];
                            if (nextRoute) {
                                handlePageChange(nextRoute.key);
                            }
                        }}
                        renderScene={({ route }) => {
                            switch (route.key) {
                                case 'purchases':
                                    return <PgPurchases />;
                                case 'addOrEditRow':
                                    return <PgAddOrEditRow />;
                                case 'settings':
                                    return <PgSettings />;                                    
                                case 'test':
                                    return <TestASR />;
                            }
                        }}
                        sceneAnimationEnabled={false}
                    />
                </View>
            </AppContext.Provider>
        </PaperProvider>
    );
}