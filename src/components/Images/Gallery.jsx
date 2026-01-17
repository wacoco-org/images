import { useEffect, useMemo, useRef, useState } from "react";
import Images from "./Images";

const INDEX_URL = "https://hansik-dummy-images.s3.eu-north-1.amazonaws.com/index.json";

export default function Gallery({pollMs = 15000, fastFirstLoad = true, onlyIfChanged = true,}) {

    const [items, setItems] = useState([]);
    const [error, setError] = useState(null);

    const lastEtagRef = useRef(null);
    const lastModifiedRef = useRef(null);

    async function fetchIndex({ useCacheBuster = false } = {}) {
        const url = useCacheBuster ? `${INDEX_URL}?t=${Date.now()}` : INDEX_URL;

        // lightweight check first
        if (onlyIfChanged) {
            try {
                const head = await fetch(url, { method: "HEAD" });
                if (head.ok) {
                    const etag = head.headers.get("etag");
                    const lastMod = head.headers.get("last-modified");

                    const sameEtag = etag && lastEtagRef.current && etag === lastEtagRef.current;
                    const sameLastMod =
                        lastMod && lastModifiedRef.current && lastMod === lastModifiedRef.current;

                    if (sameEtag || sameLastMod) return; // no change
                }
            } catch {
                // ignore HEAD failures; fall back to GET
            }
        }

        const res = await fetch(`${INDEX_URL}?t=${Date.now()}`);
        if (!res.ok) throw new Error(`Failed to load index (${res.status})`);

        const etag = res.headers.get("etag");
        const lastMod = res.headers.get("last-modified");
        if (etag) lastEtagRef.current = etag;
        if (lastMod) lastModifiedRef.current = lastMod;

        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
        setError(null);
    }

    useEffect(() => {
        let cancelled = false;
        let timer = null;

        const tick = async (first = false) => {
            try {
                await fetchIndex({ useCacheBuster: first && fastFirstLoad });
            } catch (e) {
                if (!cancelled) setError(e?.message || "Failed to load index");
            } finally {
                if (!cancelled) timer = setTimeout(() => tick(false), pollMs);
            }
        };

        tick(true);

        return () => {
            cancelled = true;
            if (timer) clearTimeout(timer);
        };
    }, [pollMs, fastFirstLoad, onlyIfChanged]);

    // pass-through, but keep it stable
    const value = useMemo(() => items, [items]);

    return (
        <div>
            {error ? <div>Error: {error}</div> : null}
            <Images items={value} />
        </div>
    );
}
