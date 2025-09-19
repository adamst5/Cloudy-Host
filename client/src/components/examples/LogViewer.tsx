import LogViewer from '../LogViewer';

export default function LogViewerExample() {
  return (
    <div className="h-96 p-4">
      <LogViewer 
        botId="1"
        botName="Discord Bot"
        onClose={() => console.log('Close logs')}
      />
    </div>
  );
}