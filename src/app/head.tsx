// src/app/head.tsx
export default function Head() {
    return (
      <>
        {/* === Google tag (gtag.js) === */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-7H0Y5YPLXJ"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-7H0Y5YPLXJ', { page_path: window.location.pathname });
            `,
          }}
        />
  
        {/* === Facebook Pixel === */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', 'YOUR_FACEBOOK_PIXEL_ID');
              fbq('track', 'PageView');
            `,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=YOUR_FACEBOOK_PIXEL_ID&ev=PageView&noscript=1"
          />
        </noscript>
  
        {/* === TikTok Pixel === */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function(w,d,t){
                w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
                ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];
                ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
                for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
                ttq.instance=function(t){var e=ttq._i[t]||[];for(var n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};
                ttq.load=function(e,n){
                  var i="https://analytics.tiktok.com/i18n/pixel/events.js";
                  ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=i;
                  ttq._t=ttq._t||{};ttq._t[e]=+new Date();
                  ttq._o=ttq._o||{};ttq._o[e]=n||{};
                  var o=d.createElement("script");o.type="text/javascript";o.async=!0;
                  o.src=i+"?sdkid="+e+"&lib="+t;
                  var a=d.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a);
                };
                ttq.load('YOUR_TIKTOK_PIXEL_ID');
                ttq.page();
              }(window, document, 'ttq');
            `,
          }}
        />
      </>
    );
  }
  