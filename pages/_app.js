import { useEffect } from 'react';
import '../styles/global.css';
import { datadogRum } from '@datadog/browser-rum';
import { datadogLogs } from '@datadog/browser-logs';
import router from "next/router";
import CookieConsent from "react-cookie-consent";


function makeid(length) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for(var i=0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}


datadogRum.init({
  applicationId: '',
  clientToken: '',
    // `site` refers to the Datadog site parameter of your organization
    // see https://docs.datadoghq.com/getting_started/site/
    site: 'datadoghq.com',
    service: '',
    env: '',
    // Specify a version number to identify the deployed version of your application in Datadog
    version: '1.0.0', 
    sessionSampleRate: 100,
    sessionReplaySampleRate: 100,
    trackUserInteractions: true,
    trackResources: true,
    trackLongTasks: true,
    defaultPrivacyLevel: 'allow',
    trackViewsManually: true,
    trackingConsent: "granted",
    beforeSend: (event, context) => {
      // collect a RUM resource's response headers
      if (event.type === 'resource' && event.resource.type === 'fetch' && context?.response?.headers) {
          event.context.responseHeaders = Object.fromEntries(context.response.headers)
      }
      return true
    }
});

export default function App({ Component, pageProps }) {
  function getGrantCookie() {
    // grant-cookie
    return window.document.cookie.includes("grant-cookie=true")
  }
  
  useEffect(() => {
    // We listen to this event to determine whether to redirect or not
    router.events.on("routeChangeStart", handleRouteChange);
    datadogRum.setTrackingConsent(getGrantCookie() ? "granted" : "not-granted")
    datadogRum.startView(window.location.pathname)
    return () => {
      router.events.off("routeChangeStart", handleRouteChange);
    };
  }, []);

  const handleRouteChange = (url) => {
    console.log("App is changing to: ", url);
    const urlParsed = new URL(`${window.location.origin}${url}`)
    datadogRum.startView(urlParsed.pathname);
  };
  
  return <>
    <CookieConsent
      enableDeclineButton
      location="bottom"
      buttonText="GRANT ME!"
      cookieName="grant-cookie"
      style={{ background: "#2B373B" }}
      buttonStyle={{ color: "#4e503b", fontSize: "13px" }}
      expires={150}
      onDecline={() => {
        datadogRum.setTrackingConsent("not-granted")
      }}
      onAccept={() => {
        datadogRum.setTrackingConsent("granted")
      }}
    >
      This website uses cookies to enhance the user experience.
    </CookieConsent>
    <Component {...pageProps} />
  </>;
}