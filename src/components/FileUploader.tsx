import React, { useState, useRef } from 'react';
import { Upload, FileText, Image as ImageIcon, Check, AlertCircle } from 'lucide-react';
import { PrintJob } from '../types';

interface FileUploaderProps {
  onJobCreated: (job: PrintJob) => void;
  prices: Record<PrintJob['paperSize'], Record<PrintJob['colorMode'], number>>;
}

export default function FileUploader({ onJobCreated, prices }: FileUploaderProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Print Configuration States
  const [paperSize, setPaperSize] = useState<PrintJob['paperSize']>('A4');
  const [colorMode, setColorMode] = useState<PrintJob['colorMode']>('bw');
  const [copies, setCopies] = useState<number>(1);
  const [manualPages, setManualPages] = useState<number>(1);
  
  // Selected File details before submitting
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    size: string;
    type: string;
    dataUrl?: string;
  } | null>(null);

  // Helper to format file size
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Pricing configuration helper
  const getUnitPrice = (size: PrintJob['paperSize'], mode: PrintJob['colorMode']): number => {
    if (!prices || !prices[size]) return 3.00;
    return prices[size][mode];
  };

  const handleFiles = (files: FileList) => {
    if (files.length === 0) return;
    const file = files[0];
    
    // Allowed extensions
    const fileType = file.type;
    const isImage = fileType.startsWith('image/');
    const isPDF = fileType === 'application/pdf';
    const isDoc = fileType.includes('word') || fileType.includes('officedocument') || file.name.endsWith('.docx') || file.name.endsWith('.doc');
    const isTxt = fileType.startsWith('text/') || file.name.endsWith('.txt');

    if (!isImage && !isPDF && !isDoc && !isTxt) {
      setError('Formato não suportado. Por favor, envie um documento (PDF, Word, TXT) ou Foto (PNG, JPG).');
      return;
    }

    setError(null);
    let estimatedPages = 1;

    if (isPDF) {
      // Emulate dynamic pages for pdf based on file size, typically 1 page per 150KB
      estimatedPages = Math.max(1, Math.min(30, Math.ceil(file.size / 150000)));
    } else if (isDoc) {
      estimatedPages = Math.max(1, Math.min(10, Math.ceil(file.size / 80000)));
    } else if (isTxt) {
      estimatedPages = Math.max(1, Math.min(5, Math.ceil(file.size / 5000)));
    } else {
      // Photo is 1 page
      estimatedPages = 1;
    }

    setManualPages(estimatedPages);

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedFile({
        name: file.name,
        size: formatBytes(file.size),
        type: isImage ? 'Photo' : standsForType(file.name),
        dataUrl: reader.result as string,
      });
    };
    
    // Read only text or images for preview
    if (isImage) {
      reader.readAsDataURL(file);
    } else {
      setSelectedFile({
        name: file.name,
        size: formatBytes(file.size),
        type: standsForType(file.name),
      });
    }
  };

  const standsForType = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return 'PDF';
    if (ext === 'docx' || ext === 'doc') return 'Documento Word';
    if (ext === 'txt') return 'Arquivo de Texto';
    return 'Documento';
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const triggerInput = () => {
    fileInputRef.current?.click();
  };

  const handleConfirmJob = () => {
    if (!selectedFile) return;

    const unitPrice = getUnitPrice(paperSize, colorMode);
    const totalPrice = unitPrice * manualPages * copies;

    onJobCreated({
      id: 'JOB-' + Math.floor(100000 + Math.random() * 900000),
      fileName: selectedFile.name,
      fileSize: selectedFile.size,
      fileType: selectedFile.type,
      fileDataUrl: selectedFile.dataUrl,
      totalPages: manualPages,
      copies: copies,
      colorMode: colorMode,
      paperSize: paperSize,
      pricePerPage: unitPrice,
      totalPrice: totalPrice,
      status: 'pending_payment'
    });
  };

  const unitPrice = getUnitPrice(paperSize, colorMode);
  const totalPrice = unitPrice * manualPages * copies;

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-6" id="file-uploader-panel">
      {/* Drag & Drop Area */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={selectedFile ? undefined : triggerInput}
        className={`relative rounded-2xl border-2 border-dashed p-8 md:p-12 text-center transition-all cursor-pointer ${
          selectedFile
            ? 'border-brand-teal-light bg-brand-teal-dark/35 cursor-default'
            : isDragActive
            ? 'border-brand-orange bg-brand-teal-mid/50 scale-[1.01]'
            : 'border-brand-gold/30 hover:border-brand-gold/60 bg-brand-teal-dark/50'
        }`}
        id="drag-drop-zone"
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          accept="image/*,application/pdf,.doc,.docx,.txt"
          id="file-input"
        />

        {!selectedFile ? (
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 rounded-full bg-brand-teal-mid border border-brand-gold/20 text-brand-gold animate-pulse">
              <Upload className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-lg text-brand-gold">
                Arraste seu arquivo aqui
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                Suporta PDF, Imagens (JPG/PNG), Word (DOCX) ou TXT
              </p>
            </div>
            <button
              type="button"
              className="mt-2 px-5 py-2.5 rounded-xl bg-brand-gold text-brand-teal-deep font-sans font-semibold text-sm hover:bg-brand-gold-dark transition active:scale-95"
              id="choose-file-btn"
            >
              Selecionar no Computador
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center md:flex-row md:text-left gap-6 justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-brand-teal-mid/90 border border-brand-gold/30 text-brand-gold">
                {selectedFile.type === 'Photo' ? (
                  <ImageIcon className="w-10 h-10" />
                ) : (
                  <FileText className="w-10 h-10" />
                )}
              </div>
              <div>
                <h3 className="font-display font-medium text-base text-gray-200 break-all max-w-sm">
                  {selectedFile.name}
                </h3>
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                  <span className="px-1.5 py-0.5 rounded bg-brand-teal-mid border border-brand-teal-light text-[10px] uppercase font-mono text-brand-gold">
                    {selectedFile.type}
                  </span>
                  <span>•</span>
                  <span>{selectedFile.size}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setSelectedFile(null);
                setError(null);
              }}
              className="text-xs text-brand-red font-medium hover:underline px-4 py-2"
              id="change-file-btn"
            >
              Remover & Alterar
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-brand-red/10 border border-brand-red/30 text-brand-red text-sm" id="upload-error-msg">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Grid Settings Configuration */}
      {selectedFile && (
        <div className="glass-panel rounded-2xl p-6 flex flex-col gap-6" id="print-settings-panel">
          <h4 className="font-display font-semibold text-brand-gold text-base border-b border-brand-gold/10 pb-3 flex items-center gap-2">
            <span>⚙️</span> Configurações de Impressão e Custos
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Paper Size selector */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-brand-gold uppercase tracking-wider">
                Tamanho do Papel
              </label>
              <div className="flex flex-wrap gap-2">
                {(['A3', 'A4', 'A5', 'A6', 'Thermal'] as const).map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => {
                      setPaperSize(size);
                      if (size === 'Thermal') {
                        setColorMode('bw'); // Thermal is always black and white
                      }
                    }}
                    className={`px-3.5 py-2.5 rounded-xl font-sans text-xs font-semibold transition flex-1 min-w-[65px] ${
                      paperSize === size
                        ? 'bg-brand-gold text-brand-teal-deep shadow font-bold'
                        : 'bg-brand-teal-mid text-gray-300 hover:bg-brand-teal-light'
                    }`}
                  >
                    {size === 'Thermal' ? 'Térmico' : size}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-gray-400">
                {paperSize === 'Thermal' 
                  ? 'Impressão rápida em bobina contínua de 80mm.' 
                  : `Tamanho padrão ${paperSize} ideal para folhas avulsas.`}
              </p>
            </div>

            {/* Colors selector */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-brand-gold uppercase tracking-wider">
                Paleta de Cores
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setColorMode('bw')}
                  className={`py-2.5 rounded-xl font-sans text-xs font-semibold transition ${
                    colorMode === 'bw'
                      ? 'bg-brand-gold text-brand-teal-deep shadow'
                      : 'bg-brand-teal-mid text-gray-300 hover:bg-brand-teal-light'
                  }`}
                >
                  Preto e Branco
                </button>
                <button
                  type="button"
                  disabled={paperSize === 'Thermal'}
                  onClick={() => setColorMode('color')}
                  className={`py-2.5 rounded-xl font-sans text-xs font-semibold transition ${
                    paperSize === 'Thermal' ? 'opacity-40 cursor-not-allowed' : ''
                  } ${
                    colorMode === 'color'
                      ? 'bg-brand-gold text-brand-teal-deep shadow'
                      : 'bg-brand-teal-mid text-gray-300 hover:bg-brand-teal-light'
                  }`}
                >
                  Cores (Colorido)
                </button>
              </div>
              <p className="text-[11px] text-gray-400">
                {paperSize === 'Thermal' 
                  ? 'Impressoras térmicas suportam apenas escala de cinza/preto.' 
                  : 'Garante o brilho e contraste de cores.'}
              </p>
            </div>

            {/* Manual Page Override */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-brand-gold uppercase tracking-wider flex justify-between">
                <span>Número de Páginas</span>
                <span className="text-gray-400 font-mono">Calculado</span>
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setManualPages(Math.max(1, manualPages - 1))}
                  className="w-10 h-10 rounded-xl bg-brand-teal-mid text-brand-gold hover:bg-brand-teal-light flex items-center justify-center font-bold font-mono border border-brand-teal-light"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={manualPages}
                  onChange={(e) => setManualPages(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full text-center h-10 rounded-xl bg-brand-teal-deep border border-brand-gold/20 text-gray-100 font-mono focus:border-brand-gold outline-none"
                />
                <button
                  onClick={() => setManualPages(manualPages + 1)}
                  className="w-10 h-10 rounded-xl bg-brand-teal-mid text-brand-gold hover:bg-brand-teal-light flex items-center justify-center font-bold font-mono border border-brand-teal-light"
                >
                  +
                </button>
              </div>
              <p className="text-[11px] text-gray-400">
                Ajuste manualmente se o documento possuir mais ou menos páginas úteis.
              </p>
            </div>

            {/* Copies */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-brand-gold uppercase tracking-wider">
                Quantidade de Cópias
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCopies(Math.max(1, copies - 1))}
                  className="w-10 h-10 rounded-xl bg-brand-teal-mid text-brand-gold hover:bg-brand-teal-light flex items-center justify-center font-bold font-mono border border-brand-teal-light"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={copies}
                  onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full text-center h-10 rounded-xl bg-brand-teal-deep border border-brand-gold/20 text-gray-100 font-mono focus:border-brand-gold outline-none"
                />
                <button
                  onClick={() => setCopies(copies + 1)}
                  className="w-10 h-10 rounded-xl bg-brand-teal-mid text-brand-gold hover:bg-brand-teal-light flex items-center justify-center font-bold font-mono border border-brand-teal-light"
                >
                  +
                </button>
              </div>
              <p className="text-[11px] text-gray-400">
                Quantas vias completas deste mesmo documento deseja imprimir.
              </p>
            </div>
          </div>

          {/* Pricing breakdown summary */}
          <div className="bg-brand-teal-deep/80 rounded-xl border border-brand-gold/10 p-4 mt-2 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col">
              <div className="flex items-baseline gap-2 text-xs text-gray-400">
                <span>Taxa de Serviço por página:</span>
                <span className="font-mono text-xs text-brand-gold">{unitPrice.toFixed(2)} MT</span>
              </div>
              <div className="text-xs text-gray-400 mt-0.5">
                Cálculo: <span className="text-gray-200 font-mono">{manualPages} pág.</span> × <span className="text-gray-200 font-mono">{copies} cópias</span> × <span className="text-gray-200 font-mono">{unitPrice.toFixed(2)} MT</span>
              </div>
            </div>

            <div className="flex items-center gap-4 justify-between md:justify-end">
              <div className="text-right">
                <span className="text-xs text-gray-400 block">Total a Pagar</span>
                <span className="text-2xl font-mono text-brand-orange font-bold flex items-baseline justify-end gap-1">
                  {totalPrice.toFixed(2)} <span className="text-sm font-sans font-semibold text-gray-300">MT</span>
                </span>
              </div>

              <button
                type="button"
                onClick={handleConfirmJob}
                className="px-6 py-3 rounded-xl bg-brand-orange text-white font-sans font-semibold text-sm hover:bg-brand-orange/90 transition shadow-lg shadow-brand-orange/15 hover:shadow-brand-orange/25 active:scale-95 flex items-center gap-2"
                id="sumbit-print-job"
              >
                <span>Prosseguir para Impressão</span>
                <Check className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
