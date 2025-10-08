import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload, FileText, CheckCircle2 } from "lucide-react";
import { CampaignFormData } from "../CampaignDialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface StepProps {
  formData: CampaignFormData;
  updateFormData: (data: Partial<CampaignFormData>) => void;
}

const CampaignStepCSV = ({ formData, updateFormData }: StepProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      updateFormData({ csvContent: content });
      parseCSVPreview(content);
    };
    reader.readAsText(file);
  };

  const parseCSVPreview = (content: string) => {
    const lines = content.trim().split("\n");
    if (lines.length < 2) return;

    const headers = lines[0].split(",").map((h) => h.trim());
    const preview = lines.slice(1, 4).map((line) => {
      const values = line.split(",").map((v) => v.trim());
      const obj: any = {};
      headers.forEach((header, index) => {
        obj[header] = values[index];
      });
      return obj;
    });

    updateFormData({ csvPreview: preview });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === "text/csv") {
      handleFileUpload(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Upload de Contatos (CSV)</Label>
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
            isDragging ? "border-primary bg-primary/5" : "border-muted"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          {!formData.csvContent ? (
            <>
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-4">
                Arraste e solte seu arquivo CSV aqui ou clique para selecionar
              </p>
              <Button variant="outline" onClick={() => document.getElementById("csv-input")?.click()}>
                Selecionar Arquivo
              </Button>
              <input
                id="csv-input"
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileInput}
              />
              <p className="text-xs text-muted-foreground mt-4">
                O CSV deve conter as colunas: <strong>nome</strong>, <strong>telefone</strong> (obrigatórios) e opcionais: email, etc.
              </p>
            </>
          ) : (
            <>
              <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-success" />
              <p className="text-sm font-medium mb-2">Arquivo carregado com sucesso!</p>
              <p className="text-xs text-muted-foreground mb-4">
                {formData.csvPreview.length} contatos encontrados
              </p>
              <Button variant="outline" size="sm" onClick={() => document.getElementById("csv-input")?.click()}>
                Trocar Arquivo
              </Button>
              <input
                id="csv-input"
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileInput}
              />
            </>
          )}
        </div>
      </div>

      {formData.csvPreview.length > 0 && (
        <Alert>
          <FileText className="h-4 w-4" />
          <AlertDescription>
            <p className="font-medium mb-2">Preview dos primeiros contatos:</p>
            <div className="space-y-2 text-sm">
              {formData.csvPreview.map((contact, index) => (
                <div key={index} className="p-2 bg-muted rounded">
                  <strong>{contact.nome || contact.name}</strong> - {contact.telefone || contact.phone}
                  {contact.email && ` - ${contact.email}`}
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default CampaignStepCSV;
