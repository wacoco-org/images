import { useEffect, useMemo, useRef, useState } from "react";
import Images from "./Images";

const INDEX_URL =
    "https://hansik-dummy-images.s3.eu-north-1.amazonaws.com/index.json";

export default function Gallery({
                                    pollMs = 15000,
                                    fastFirstLoad = true,
                                    onlyIfChanged = true,
                                }) {
    const [items, setItems] = useState([]);
    const [error, setError] = useState(null);

    const lastEtagRef = useRef(null);
    const lastModifiedRef = useRef(null);
    const timerRef = useRef(null);
    const unmountedRef = useRef(false);

    async function fetchIndex({ useCacheBuster = false } = {}) {
        const url = useCacheBuster ? `${INDEX_URL}?t=${Date.now()}` : INDEX_URL;

        // lightweight check first
        if (onlyIfChanged) {
            try {
                const head = await fetch(url, { method: "HEAD", cache: "no-store" });
                if (head.ok) {
                    const etag = head.headers.get("etag");
                    const lastMod = head.headers.get("last-modified");

                    const sameEtag =
                        etag && lastEtagRef.current && etag === lastEtagRef.current;
                    const sameLastMod =
                        lastMod &&
                        lastModifiedRef.current &&
                        lastMod === lastModifiedRef.current;

                    if (sameEtag || sameLastMod) return; // no change
                }
            } catch {
                // ignore HEAD failures; fall back to GET
            }
        }

        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error(`Failed to load index (${res.status})`);

        const etag = res.headers.get("etag");
        const lastMod = res.headers.get("last-modified");
        if (etag) lastEtagRef.current = etag;
        if (lastMod) lastModifiedRef.current = lastMod;

        const data = await res.json();
        if (!Array.isArray(data)) {
            throw new Error("index.json is not an array");
        }

        setItems(data);
        setError(null);
    }

    useEffect(() => {
        unmountedRef.current = false;

        const tick = async (first = false) => {
            try {
                await fetchIndex({ useCacheBuster: first && fastFirstLoad });
            } catch (e) {
                if (!unmountedRef.current)
                    setError(e?.message || "Failed to load index");
            } finally {
                if (!unmountedRef.current) {
                    timerRef.current = setTimeout(() => tick(false), pollMs);
                }
            }
        };

        tick(true);

        return () => {
            unmountedRef.current = true;
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [pollMs, fastFirstLoad, onlyIfChanged]);

    const value = useMemo(() => items, [items]);

    return (
        <div>
            {error ? <div>Error: {error}</div> : null}
            <Images items={value} />
        </div>
    );
}
