import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminMap from './AdminMap';
import DisasterStatistics from './DisasterStatistics';
import EvacuationRouteForm from './EvacuationRouteForm';
import PoskoForm from './PoskoForm';
import ReportManagement from './ReportManagement';
import SendNotification from './SendNotification';
import UserManagement from './UserManagement';
import BencanaMap from './BencanaMap';

export default function AdminDashboard() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">Dashboard Admin WebGIS</h2>
                <p className="text-muted-foreground">Kelola aplikasi WebGIS untuk tanggap bencana</p>
            </div>

            <Tabs defaultValue="statistics" className="space-y-4">
                <TabsList className="grid w-full grid-cols-6">
                    <TabsTrigger value="statistics">Statistik</TabsTrigger>
                    <TabsTrigger value="map">Map</TabsTrigger>
                    <TabsTrigger value="evacuation-routes">Jalur Evakuasi</TabsTrigger>
                    <TabsTrigger value="shelters">Posko</TabsTrigger>
                    <TabsTrigger value="bencana">Bencana</TabsTrigger>
                    <TabsTrigger value="reports">Laporan Bencana</TabsTrigger>
                    <TabsTrigger value="notifications">Notifikasi</TabsTrigger>
                </TabsList>

                <TabsContent value="statistics" className="space-y-4">
                    <DisasterStatistics />
                </TabsContent>

                <TabsContent value="map" className="space-y-4">
                    <AdminMap />
                </TabsContent>

                <TabsContent value="evacuation-routes" className="space-y-4">
                    <EvacuationRouteForm />
                </TabsContent>

                <TabsContent value="shelters" className="space-y-4">
                    <PoskoForm />
                </TabsContent>

                <TabsContent value="bencana" className="space-y-4">
                    <BencanaMap />
                </TabsContent>

                <TabsContent value="reports" className="space-y-4">
                    <ReportManagement />
                </TabsContent>

                <TabsContent value="users" className="space-y-4">
                    <UserManagement />
                </TabsContent>

                <TabsContent value="notifications" className="space-y-4">
                    <SendNotification />
                </TabsContent>
            </Tabs>
        </div>
    );
}
