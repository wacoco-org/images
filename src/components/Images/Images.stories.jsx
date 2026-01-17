import Images from "./Images";

export default {
    title: "Components/Images",
    component: Images,
};

const mockData = [
    {
        "app": "bap-kitchen",
        "key": "bap-kitchen/bap_kitchen_01.webp",
        "url": "https://hansik-dummy-images.s3.eu-north-1.amazonaws.com/bap-kitchen/bap_kitchen_01.webp"
    },
    {
        "app": "bap-kitchen",
        "key": "bap-kitchen/bap_kitchen_02.webp",
        "url": "https://hansik-dummy-images.s3.eu-north-1.amazonaws.com/bap-kitchen/bap_kitchen_02.webp"
    },
    {
        "app": "bap-kitchen",
        "key": "bap-kitchen/bap_kitchen_ddukbokggi.webp",
        "url": "https://hansik-dummy-images.s3.eu-north-1.amazonaws.com/bap-kitchen/bap_kitchen_ddukbokggi.webp"
    },
    {
        "app": "bap-kitchen",
        "key": "bap-kitchen/bap_kitchen_drink01.webp",
        "url": "https://hansik-dummy-images.s3.eu-north-1.amazonaws.com/bap-kitchen/bap_kitchen_drink01.webp"
    },
    {
        "app": "bop-kitchen",
        "key": "bop-kitchen/bap_kitchen_01.webp",
        "url": "https://hansik-dummy-images.s3.eu-north-1.amazonaws.com/bop-kitchen/bap_kitchen_01.webp"
    },
    {
        "app": "bop-kitchen",
        "key": "bop-kitchen/bap_kitchen_02.webp",
        "url": "https://hansik-dummy-images.s3.eu-north-1.amazonaws.com/bop-kitchen/bap_kitchen_02.webp"
    },
    {
        "app": "bop-kitchen",
        "key": "bop-kitchen/bap_kitchen_ddukbokggi.webp",
        "url": "https://hansik-dummy-images.s3.eu-north-1.amazonaws.com/bop-kitchen/bap_kitchen_ddukbokggi.webp"
    },
    {
        "app": "bop-kitchen",
        "key": "bop-kitchen/bap_kitchen_drink01.webp",
        "url": "https://hansik-dummy-images.s3.eu-north-1.amazonaws.com/bop-kitchen/bap_kitchen_drink01.webp"
    },
    {
        "app": "food",
        "key": "food/bap_kitchen_01.webp",
        "url": "https://hansik-dummy-images.s3.eu-north-1.amazonaws.com/food/bap_kitchen_01.webp"
    },
    {
        "app": "food",
        "key": "food/bap_kitchen_02.webp",
        "url": "https://hansik-dummy-images.s3.eu-north-1.amazonaws.com/food/bap_kitchen_02.webp"
    },
    {
        "app": "food",
        "key": "food/bap_kitchen_drink01.webp",
        "url": "https://hansik-dummy-images.s3.eu-north-1.amazonaws.com/food/bap_kitchen_drink01.webp"
    }
];

function mockFetchOnce(data) {
    global.fetch = () =>
        Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve(data),
        });
}

export const Default = () => {
    mockFetchOnce(mockData);
    return <Images />;
};

export const Empty = () => {
    mockFetchOnce([]);
    return <Images />;
};

export const Error = () => {
    global.fetch = () =>
        Promise.resolve({
            ok: false,
            status: 500,
            json: () => Promise.resolve({}),
        });

    return <Images />;
};
