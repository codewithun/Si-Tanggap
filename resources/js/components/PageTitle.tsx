import { Head } from '@inertiajs/react';

interface PageTitleProps {
    title: string;
    includeAppName?: boolean;
}

export default function PageTitle({ title, includeAppName = true }: PageTitleProps) {
    const appName = 'GeoSiaga';

    return <Head title={includeAppName ? `${title} - ${appName}` : title} />;
}
