import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Send } from "lucide-react";
import CampaignStepBasicInfo from "./campaign/CampaignStepBasicInfo";
import CampaignStepCSV from "./campaign/CampaignStepCSV";
import CampaignStepTemplate from "./campaign/CampaignStepTemplate";
import CampaignStepFollowups from "./campaign/CampaignStepFollowups";
import CampaignStepReview from "./campaign/CampaignStepReview";

interface CampaignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export interface CampaignFormData {
  name: string;
  clientId: string;
  agentId: string;
  scheduledAt: Date | undefined;
  csvContent: string;
  csvPreview: any[];
  template: string;
  followups: Array<{
    message: string;
    delayHours: number;
    condition: string;
  }>;
}

const CampaignDialog = ({ open, onOpenChange, onSuccess }: CampaignDialogProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CampaignFormData>({
    name: "",
    clientId: "",
    agentId: "",
    scheduledAt: undefined,
    csvContent: "",
    csvPreview: [],
    template: "",
    followups: [],
  });

  const totalSteps = 5;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    setFormData({
      name: "",
      clientId: "",
      agentId: "",
      scheduledAt: undefined,
      csvContent: "",
      csvPreview: [],
      template: "",
      followups: [],
    });
    onOpenChange(false);
  };

  const updateFormData = (data: Partial<CampaignFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.name && formData.clientId && formData.agentId && formData.scheduledAt;
      case 2:
        return formData.csvContent && formData.csvPreview.length > 0;
      case 3:
        return formData.template.length > 0;
      case 4:
        return true; // Followups are optional
      case 5:
        return true;
      default:
        return false;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Nova Campanha WhatsApp
          </DialogTitle>
          <div className="flex items-center gap-2 mt-4">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div
                key={index}
                className={`h-2 flex-1 rounded-full transition-all ${
                  index + 1 <= currentStep ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </DialogHeader>

        <div className="py-6">
          {currentStep === 1 && (
            <CampaignStepBasicInfo formData={formData} updateFormData={updateFormData} />
          )}
          {currentStep === 2 && (
            <CampaignStepCSV formData={formData} updateFormData={updateFormData} />
          )}
          {currentStep === 3 && (
            <CampaignStepTemplate formData={formData} updateFormData={updateFormData} />
          )}
          {currentStep === 4 && (
            <CampaignStepFollowups formData={formData} updateFormData={updateFormData} />
          )}
          {currentStep === 5 && (
            <CampaignStepReview 
              formData={formData} 
              onSuccess={() => {
                handleClose();
                onSuccess();
              }}
            />
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>

          {currentStep < totalSteps ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="gap-2"
            >
              Próximo
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={() => {
                // The review step handles submission
              }}
              className="gap-2"
              disabled={!canProceed()}
            >
              <Send className="h-4 w-4" />
              Agendar Envio
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CampaignDialog;
