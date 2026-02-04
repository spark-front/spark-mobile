import { WebView } from "react-native-webview";
import * as MediaLibrary from "expo-media-library";
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from "react-native-safe-area-context";
import { SplashScreen } from "expo-router";
import Splash from "@/components/Splash";
import {
  StyleSheet,
  StatusBar,
  View,
  Platform,
  BackHandler,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import Constants from "expo-constants";
import OnMessage from "./helper/OnMessage";

export default function RootLayout() {
  SplashScreen.hideAsync();

  const [currentUrl, setCurrentUrl] = useState("https://example.com");
  const [status, requestPermission] = MediaLibrary.usePermissions();
  const [loading, setLoading] = useState(true);
  const webViewRef = useRef<WebView>(null);
  const imageRef = useRef<View>(null);
  const previousUrlRef = useRef("");

  if (status === null) {
    requestPermission();
  }

  const onAndroidBackPress = () => {
    if (webViewRef.current) {
      webViewRef.current.goBack();
      return true;
    }
    return false;
  };

  useEffect(() => {
    if (Platform.OS === "android") {
      BackHandler.addEventListener("hardwareBackPress", onAndroidBackPress);
      return () => {
        BackHandler.removeEventListener(
          "hardwareBackPress",
          onAndroidBackPress,
        );
      };
    }
  }, []);

  const handleNavigationStateChange = (navState: any) => {
    setCurrentUrl(navState.url); // 현재 URL을 상태로 업데이트
  };

  return loading ? (
    <>
      <Splash setFinished={() => setLoading(false)} />
    </>
  ) : (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <View style={styles.container} ref={imageRef}>
        <StatusBar barStyle={"default"} animated={true} />
        <WebView
          ref={webViewRef}
          onNavigationStateChange={handleNavigationStateChange}
          source={{
            uri: "https://www.app-spark.store/",
          }}
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          javaScriptEnabled
          bounces
          scrollEnabled
          mixedContentMode={"always"}
          allowsBackForwardNavigationGestures
          cacheEnabled={false}
          onMessage={OnMessage({ previousUrlRef, currentUrl })}
          userAgent={"SparkAgent"}
          onContentProcessDidTerminate={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.warn("Content process terminated, reloading", nativeEvent);
            webViewRef.current?.reload();
          }}
        />
      </View>
    </SafeAreaProvider>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Constants.statusBarHeight,
  },
  input: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    height: 50,
    borderWidth: 1,
    borderColor: "red",
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
  },
});
