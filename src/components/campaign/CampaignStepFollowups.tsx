import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CampaignFormData } from "../CampaignDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StepProps {
  formData: CampaignFormData;
  updateFormData: (data: Partial<CampaignFormData>) => void;
}

const CampaignStepFollowups = ({ formData, updateFormData }: StepProps) => {
  const addFollowup = () => {
    if (formData.followups.length < 3) {
      updateFormData({
        followups: [
          ...formData.followups,
          { message: "", delayHours: 24, condition: "no_response" },
        ],
      });
    }
  };

  const removeFollowup = (index: number) => {
    updateFormData({
      followups: formData.followups.filter((_, i) => i !== index),
    });
  };

  const updateFollowup = (index: number, field: string, value: any) => {
    const newFollowups = [...formData.followups];
    newFollowups[index] = { ...newFollowups[index], [field]: value };
    updateFormData({ followups: newFollowups });
  };

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base">Follow-ups Automáticos (Opcional)</Label>
        <p className="text-sm text-muted-foreground mt-1">
          Configure até 3 mensagens de acompanhamento automático
        </p>
      </div>

      {formData.followups.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-sm text-muted-foreground mb-4">
              Nenhum follow-up configurado ainda
            </p>
            <Button onClick={addFollowup} variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              Adicionar Follow-up
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {formData.followups.map((followup, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-base">Follow-up {index + 1}</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFollowup(index)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Mensagem</Label>
                  <Textarea
                    placeholder="Olá {nome}, ainda não recebi sua resposta..."
                    value={followup.message}
                    onChange={(e) => updateFollowup(index, "message", e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Delay (horas)</Label>
                    <Input
                      type="number"
                      min="1"
                      value={followup.delayHours}
                      onChange={(e) => updateFollowup(index, "delayHours", parseInt(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Condição</Label>
                    <Select
                      value={followup.condition}
                      onValueChange={(value) => updateFollowup(index, "condition", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no_response">Sem resposta</SelectItem>
                        <SelectItem value="not_opened">Não visualizado</SelectItem>
                        <SelectItem value="always">Sempre enviar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {formData.followups.length < 3 && (
            <Button onClick={addFollowup} variant="outline" className="w-full gap-2">
              <Plus className="h-4 w-4" />
              Adicionar Outro Follow-up
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default CampaignStepFollowups;
