import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DisasterStatistics from './DisasterStatistics';
import EvacuationRouteForm from './EvacuationRouteForm';
import ReportManagement from './ReportManagement';
import SendNotification from './SendNotification';
import UserManagement from './UserManagement';

export default function AdminDashboard() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">Dashboard Admin WebGIS</h2>
                <p className="text-muted-foreground">Kelola aplikasi WebGIS untuk tanggap bencana</p>
            </div>

            <Tabs defaultValue="statistics" className="space-y-4">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="statistics">Statistik</TabsTrigger>
                    <TabsTrigger value="evacuation-routes">Jalur Evakuasi</TabsTrigger>
                    <TabsTrigger value="reports">Laporan Bencana</TabsTrigger>
                    <TabsTrigger value="users">Pengguna</TabsTrigger>
                    <TabsTrigger value="notifications">Notifikasi</TabsTrigger>
                </TabsList>

                <TabsContent value="statistics" className="space-y-4">
                    <DisasterStatistics />
                </TabsContent>

                <TabsContent value="evacuation-routes" className="space-y-4">
                    <EvacuationRouteForm />
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
