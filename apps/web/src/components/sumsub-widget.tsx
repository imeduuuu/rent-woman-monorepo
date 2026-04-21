"use client";

import { useEffect, useRef } from "react";

export function SumsubWidget({ accessToken }: { accessToken: string }): JSX.Element {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let mounted = true;

    async function mountWidget(): Promise<void> {
      if (!containerRef.current) {
        return;
      }

      const snsWebSdkModule = await import("@sumsub/websdk");
      const snsWebSdk = snsWebSdkModule.default;

      if (!mounted) {
        return;
      }

      snsWebSdk
        .init(accessToken, async () => accessToken)
        .withConf({
          lang: "en",
          email: "",
          theme: "dark"
        })
        .withOptions({
          addViewportTag: false,
          adaptIframeHeight: true
        })
        .build()
        .launch(containerRef.current);
    }

    void mountWidget();

    return () => {
      mounted = false;
    };
  }, [accessToken]);

  return <div className="min-h-[640px] w-full overflow-hidden rounded-2xl bg-white" ref={containerRef} />;
}
