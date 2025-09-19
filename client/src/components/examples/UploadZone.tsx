import UploadZone from '../UploadZone';

export default function UploadZoneExample() {
  return (
    <div className="max-w-lg mx-auto p-4">
      <UploadZone 
        onUpload={(file, botName, mainFile) => {
          console.log('Upload example:', { file: file.name, botName, mainFile });
          alert(`Bot "${botName}" enviado com sucesso!\nArquivo: ${file.name}\nArquivo principal: ${mainFile}`);
        }}
      />
    </div>
  );
}