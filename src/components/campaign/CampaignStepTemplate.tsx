import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CampaignFormData } from "../CampaignDialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StepProps {
  formData: CampaignFormData;
  updateFormData: (data: Partial<CampaignFormData>) => void;
}

const CampaignStepTemplate = ({ formData, updateFormData }: StepProps) => {
  const replacePlaceholders = (template: string, contact: any) => {
    let message = template;
    message = message.replace(/\{nome\}/gi, contact.nome || contact.name || "[Nome]");
    message = message.replace(/\{name\}/gi, contact.nome || contact.name || "[Nome]");
    message = message.replace(/\{telefone\}/gi, contact.telefone || contact.phone || "[Telefone]");
    message = message.replace(/\{phone\}/gi, contact.telefone || contact.phone || "[Telefone]");
    if (contact.email) {
      message = message.replace(/\{email\}/gi, contact.email);
    }
    return message;
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="template">Template da Mensagem</Label>
        <Textarea
          id="template"
          placeholder="Olá {nome}! 👋 Tudo bem? Sou da {empresa}..."
          value={formData.template}
          onChange={(e) => updateFormData({ template: e.target.value })}
          rows={6}
          className="resize-none"
        />
        <p className="text-xs text-muted-foreground">
          Use placeholders como <code className="px-1 py-0.5 bg-muted rounded">{"{nome}"}</code>,{" "}
          <code className="px-1 py-0.5 bg-muted rounded">{"{telefone}"}</code>,{" "}
          <code className="px-1 py-0.5 bg-muted rounded">{"{email}"}</code> para personalizar
        </p>
      </div>

      {formData.template && formData.csvPreview.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <Label>Preview da Mensagem Personalizada</Label>
          </div>
          <Alert>
            <AlertDescription>
              <p className="text-xs text-muted-foreground mb-3">
                Veja como a mensagem ficará para 3 contatos aleatórios:
              </p>
              <div className="space-y-3">
                {formData.csvPreview.slice(0, 3).map((contact, index) => (
                  <Card key={index} className="bg-muted/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">
                        {contact.nome || contact.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm whitespace-pre-wrap">
                        {replacePlaceholders(formData.template, contact)}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
};

export default CampaignStepTemplate;
