export default function AppLogo() {
    return (
        <>
            <div className="mr-2 flex items-center justify-center">
                <img src="/img/logo.png" alt="GeoSiaga Logo" className="h-12 w-12 object-contain" />
            </div>
            <div className="grid flex-1 text-left">
                <span className="truncate text-xl leading-tight font-bold">
                    <span className="text-black dark:text-white">Geo</span>
                    <span className="text-blue-400">Siaga</span>
                </span>
            </div>
        </>
    );
}
