import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, File, X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadZoneProps {
  onUpload?: (file: File, botName: string, mainFile: string) => void;
  className?: string;
}

export default function UploadZone({ onUpload, className }: UploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [botName, setBotName] = useState("");
  const [mainFile, setMainFile] = useState("");
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const zipFile = files.find(file => file.name.endsWith('.zip'));
    
    if (zipFile) {
      setSelectedFile(zipFile);
      if (!botName) {
        setBotName(zipFile.name.replace('.zip', ''));
      }
      setError("");
    } else {
      setError("Por favor, envie apenas arquivos .zip");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.name.endsWith('.zip')) {
        setSelectedFile(file);
        if (!botName) {
          setBotName(file.name.replace('.zip', ''));
        }
        setError("");
      } else {
        setError("Por favor, selecione apenas arquivos .zip");
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile || !botName.trim() || !mainFile.trim()) {
      setError("Preencha todos os campos obrigatórios");
      return;
    }

    onUpload?.(selectedFile, botName.trim(), mainFile.trim());
    
    // Reset form
    setSelectedFile(null);
    setBotName("");
    setMainFile("");
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    
    console.log('Upload triggered:', { file: selectedFile.name, botName, mainFile });
  };

  const clearFile = () => {
    setSelectedFile(null);
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="bot-name">Nome do Bot *</Label>
            <Input
              id="bot-name"
              type="text"
              placeholder="Ex: Discord Bot"
              value={botName}
              onChange={(e) => setBotName(e.target.value)}
              data-testid="input-bot-name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="main-file">Arquivo Principal *</Label>
            <Input
              id="main-file"
              type="text"
              placeholder="Ex: bot.js, index.py, main.js"
              value={mainFile}
              onChange={(e) => setMainFile(e.target.value)}
              data-testid="input-main-file"
            />
            <p className="text-xs text-muted-foreground">
              O arquivo que será executado para iniciar o bot
            </p>
          </div>

          <div className="space-y-2">
            <Label>Arquivo do Bot (.zip) *</Label>
            
            {selectedFile ? (
              <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                <File className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium flex-1">{selectedFile.name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={clearFile}
                  data-testid="button-clear-file"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer hover-elevate",
                  isDragOver ? "border-primary bg-primary/5" : "border-border",
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                data-testid="zone-upload"
              >
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-1">
                  Arraste e solte seu arquivo .zip aqui
                </p>
                <p className="text-xs text-muted-foreground">
                  ou clique para selecionar
                </p>
              </div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".zip"
              onChange={handleFileSelect}
              className="hidden"
              data-testid="input-file-upload"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-md">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={!selectedFile || !botName.trim() || !mainFile.trim()}
            data-testid="button-upload-bot"
          >
            <Upload className="h-4 w-4 mr-2" />
            Hospedar Bot
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}