import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from '../AppSidebar';

export default function AppSidebarExample() {
  const style = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex-1 p-4">
          <div className="h-full bg-muted/20 rounded-md flex items-center justify-center">
            <p className="text-muted-foreground">Conteúdo principal apareceria aqui</p>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}