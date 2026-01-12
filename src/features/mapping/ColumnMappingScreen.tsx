import { useState } from "react";
import { Button } from "../../components/Button";
import { ColumnMapperNotion } from "./ColumnMapperNotion";
import { isMappingValid } from "../../shared/utils/validationUtils";
import type {
  ColumnMapping,
  FileStructure,
} from "../../shared/types/fileMapping";
import { Stepper } from "../../components/Stepper";
import { ChevronLeft } from "../../components/icons";
import { BrandHeader } from "../../components/BrandHeader";

interface ColumnMappingScreenProps {
  structure: FileStructure;
  initialMapping: ColumnMapping;
  autoDetected: boolean;
  onConfirm: (mapping: ColumnMapping) => void;
  onCancel: () => void;
}

export const ColumnMappingScreen = ({
  structure,
  initialMapping,
  autoDetected,
  onCancel,
  onConfirm,
}: ColumnMappingScreenProps) => {
  const [mapping, setMapping] = useState<ColumnMapping>(initialMapping);

  const steps = ["Importar", "Asignar columnas"];
  const currentStep = 1;

  const handleConfirm = () => {
    onConfirm(mapping);
  };

  return (
    <div className="h-screen bg-white flex flex-col font-sans overflow-hidden">
      {/* Header */}
      <div className="w-full border-b border-neutral-200 bg-white">
        <div className="max-w-full mx-auto px-12 py-5">
          <div className="flex items-center justify-between">
            <BrandHeader />
            <div className="flex-1 flex justify-center">
              <Stepper steps={steps} currentStep={currentStep} />
            </div>
            <div className="w-[180px]"></div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col px-12 pt-8 pb-4 overflow-hidden">
        <div className="flex-1 min-h-0 overflow-hidden">
          <ColumnMapperNotion
            structure={structure}
            mapping={mapping}
            onMappingChange={setMapping}
            autoDetected={autoDetected}
          />
        </div>
      </div>

      {/* Footer fijo */}
      <div className="w-full border-t border-neutral-200 bg-white z-30">
        <div className="max-w-full mx-auto px-12 py-4">
          <div className="flex items-center justify-between gap-6">
            <Button
              variant="ghost"
              onClick={onCancel}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Cancelar
            </Button>
            <Button onClick={handleConfirm} disabled={!isMappingValid(mapping)}>
              Continuar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
