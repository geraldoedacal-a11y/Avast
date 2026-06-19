import React, { useState, useEffect, useRef } from 'react';
import { PrintJob, PrinterConfig } from '../types';
import { Printer, Wifi, WifiOff, RefreshCw, Layers, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';

interface ThermalPrinterProps {
  job: PrintJob;
  onCompleted: () => void;
}

export default function ThermalPrinter({ job, onCompleted }: ThermalPrinterProps) {
  const [printingProgress, setPrintingProgress] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentCopy, setCurrentCopy] = useState(1);
  const [isRealPrinterConnected, setIsRealPrinterConnected] = useState(false);
  const [usbDevice, setUsbDevice] = useState<any | null>(null);
  const [statusText, setStatusText] = useState('Pronto para imprimir automaticamente...');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Auto print trigger on mount
  useEffect(() => {
    let active = true;
    
    // Synthesize physical motor noise for maximum sensory realism using Web Audio API
    const startAudioSynthesizer = () => {
      try {
        if (!audioCtxRef.current) {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          audioCtxRef.current = new AudioContextClass();
        }
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') {
          ctx.resume();
        }

        // Loop motor ticks
        let count = 0;
        const interval = setInterval(() => {
          if (!active || printingProgress >= 100) {
            clearInterval(interval);
            return;
          }
          
          // Printhead motor tone
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          
          // High pitch pulse representing thermal burning pins and stepper motor steps
          osc.frequency.setValueAtTime(count % 2 === 0 ? 120 : 180, ctx.currentTime);
          gain.gain.setValueAtTime(0.012, ctx.currentTime); // low volume
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);
          
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.start();
          osc.stop(ctx.currentTime + 0.09);
          count++;
        }, 110);

        return () => clearInterval(interval);
      } catch (err) {
        console.warn("Web Audio API blocked or not supported", err);
      }
    };

    // Auto connect real printer if previously paired and authorized
    const checkPairedUsbDevices = async () => {
      const anyNavigator = navigator as any;
      if (anyNavigator.usb) {
        try {
          const paired = await anyNavigator.usb.getDevices();
          if (paired.length > 0) {
            // Find possible printer candidate
            setIsRealPrinterConnected(true);
            setUsbDevice(paired[0]);
            setStatusText(`Impressora USB ${paired[0].productName || 'Térmica'} emparelhada.`);
          }
        } catch (e) {
          console.log('Error verifying USB status', e);
        }
      }
    };

    checkPairedUsbDevices();
    const cleanAudio = startAudioSynthesizer();

    // Run printing simulation (Fast thermal printer speed - 1 page per 1.5 seconds)
    const totalSteps = job.totalPages * job.copies;
    let stepCount = 0;

    setStatusText('Processando dados de impressão...');
    
    // Transfer USB real bytes if connected directly via WebUSB
    if (isRealPrinterConnected && usbDevice) {
      sendDataToUsbPrinter();
    }

    // Trigger local background Printing Agent running on Totem's host computer (Port 3001)
    fetch('http://localhost:3001/imprimir-recibo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors',
      body: JSON.stringify({
        via: 'CLIENTE',
        servico: `${job.paperSize} (${job.colorMode === 'bw' ? 'P&B' : 'Colorido'})`,
        total: job.totalPrice,
        fileName: job.fileName,
        copies: job.copies,
        pages: job.totalPages,
        id: job.id,
        nuit: '400189422'
      })
    })
    .then((res) => {
      if (res.ok) {
        console.log('Agente de Impressão local processou o bilhete!');
        setStatusText('Comando enviado com sucesso ao Agente Local (Porta 3001)...');
      }
    })
    .catch((err) => {
      console.log('Agente local 3001 offline ou inativo. Emulação visual prosssegue regularmente.', err);
    });

    const runSimulation = () => {
      if (stepCount >= totalSteps) {
        setPrintingProgress(100);
        setStatusText('Corte automático do papel efetuado.');
        
        // Final cutter click sound
        playCutterSound();

        setTimeout(() => {
          if (active) {
            onCompleted();
          }
        }, 1800);
        return;
      }

      // Calculate state details
      stepCount++;
      const computedCopy = Math.ceil(stepCount / job.totalPages);
      const computedPage = stepCount - (computedCopy - 1) * job.totalPages;
      
      setCurrentCopy(computedCopy);
      setCurrentPage(computedPage);
      setPrintingProgress(Math.floor((stepCount / totalSteps) * 100));
      setStatusText(`Imprimindo: Página ${computedPage} de ${job.totalPages} (Cópia ${computedCopy}/${job.copies})`);

      // Trigger next step
      setTimeout(runSimulation, 1300);
    };

    // Begin loop immediately
    setTimeout(runSimulation, 1200);

    return () => {
      active = false;
      if (cleanAudio) cleanAudio();
    };
  }, []);

  const playCutterSound = () => {
    try {
      if (!audioCtxRef.current) return;
      const ctx = audioCtxRef.current;
      
      // Dual burst for cutter blade slide and snap
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(80, ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.15);
      gain1.gain.setValueAtTime(0.08, ctx.currentTime);
      gain1.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.2);

      // Metallic snap
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(2500, ctx.currentTime + 0.15);
      gain2.gain.setValueAtTime(0.02, ctx.currentTime + 0.15);
      gain2.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.22);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start();
      osc2.stop(ctx.currentTime + 0.24);
    } catch (e) {
      console.warn(e);
    }
  };

  // WebUSB Connection & Raw Printing Handler
  const connectUsbPrinter = async () => {
    setErrorMessage(null);
    const anyNavigator = navigator as any;
    if (!anyNavigator.usb) {
      setErrorMessage('O seu navegador não suporta a API WebUSB. Por favor use o Google Chrome ou Edge.');
      return;
    }

    try {
      // 0x416 is Posiflex, 0x1ffb is Epson, commonly we let the user select any device generic filter
      const device = await anyNavigator.usb.requestDevice({ filters: [] });
      setUsbDevice(device);
      
      await device.open();
      // Select configuration & claim first interface
      if (device.configuration === null) {
        await device.selectConfiguration(1);
      }
      await device.claimInterface(0);
      
      setIsRealPrinterConnected(true);
      setStatusText(`Emparelhado com: ${device.productName || 'Impressora USB'}`);
      
      // Trigger instant print job transfer
      sendDataToUsbPrinter(device);
    } catch (e: any) {
      console.error(e);
      setErrorMessage(`Erro ao emparelhar dispositivo USB: ${e.message || 'Controlo recusado.'}`);
    }
  };

  const sendDataToUsbPrinter = async (deviceSource = usbDevice) => {
    if (!deviceSource) return;

    try {
      const e = new TextEncoder();
      
      // ESC/POS Command sequences
      const ESC = '\x1b';
      const GS = '\x1d';
      const InitPrinter = ESC + '@';
      const AlignCenter = ESC + 'a' + '\x01';
      const AlignLeft = ESC + 'a' + '\x00';
      const DoubleSizeOn = ESC + '!' + '\x38'; // Double height + double width font
      const FontNormal = ESC + '!' + '\x00';
      const CutPaper = GS + 'V' + '\x42' + '\x00'; // Cut feed 66

      // Build text receipt load
      let cmd = InitPrinter;
      cmd += AlignCenter;
      cmd += DoubleSizeOn + 'AVAST GRAFICA\n' + FontNormal;
      cmd += '--------------------------------\n';
      cmd += `FICHEIRO: ${job.fileName}\n`;
      cmd += `PAGINAS: ${job.totalPages} | COPIAS: ${job.copies}\n`;
      cmd += `TAMANHO: ${job.paperSize} | MENS.: ${job.colorMode === 'bw' ? 'P&B' : 'Colorido'}\n`;
      cmd += '--------------------------------\n';
      cmd += `PRECO TOTAL: ${job.totalPrice.toFixed(2)} MT\n`;
      cmd += '--------------------------------\n';
      cmd += 'STATUS: PAGO E AUTORIZADO\n';
      cmd += 'IMPRES. AUTOMATICA REALIZADA\n';
      cmd += '\n\n\n\n';
      cmd += CutPaper; // Hardware cutter paper

      const binaryBytes = e.encode(cmd);
      
      // Find bulk transfer endpoint for output
      const endpoint = deviceSource.configuration?.interfaces[0]?.alternates[0]?.endpoints.find(
        ep => ep.direction === 'out' && ep.type === 'bulk'
      );

      if (endpoint) {
        await deviceSource.transferOut(endpoint.endpointNumber, binaryBytes);
        console.log('ESC/POS Command sent to real USB thermal printer!');
      } else {
        throw new Error('Não foi possível localizar o endpoint BULK OUT da impressora.');
      }
    } catch (err: any) {
      console.warn('Physical block sending raw ESC/POS commands:', err);
      // Fail silently to keep simulated printing rolling
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6" id="thermal-printer-stage">
      
      {/* Printer hardware simulator graphic */}
      <div className="glass-panel rounded-3xl p-6 md:p-8 flex flex-col items-center gap-6 relative overflow-hidden" id="printer-device-frame">
        
        {/* Glow rings */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-brand-orange/5 filter blur-3xl" />
        
        {/* Top header & connectivity state */}
        <div className="w-full flex justify-between items-center z-10">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-brand-gold" />
            <h3 className="font-display font-bold text-base text-brand-gold uppercase tracking-wider">
              Impressora Térmica
            </h3>
          </div>

          <button
            onClick={connectUsbPrinter}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition ${
              isRealPrinterConnected 
                ? 'bg-brand-green/10 text-brand-green border border-brand-green/30' 
                : 'bg-brand-teal-mid border border-brand-gold/15 text-brand-gold hover:border-brand-gold/40'
            }`}
            id="usb-handshake-btn"
          >
            {isRealPrinterConnected ? (
              <>
                <Wifi className="w-3.5 h-3.5 animate-pulse" />
                <span>USB Ligado</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5" />
                <span>Conectar USB Real</span>
              </>
            )}
          </button>
        </div>

        {/* 3D-like physical thermal printer simulator */}
        <div className="relative w-72 h-44 bg-gradient-to-b from-[#181d24] to-[#0f1115] border-4 border-[#292f39] rounded-2xl shadow-2xl flex flex-col items-center justify-between p-3 box-border overflow-hidden" id="3d-printer-box">
          
          {/* LEDs Panel */}
          <div className="absolute top-4 left-4 flex gap-2">
            {/* Status LED */}
            <div className="flex flex-col items-center">
              <span className={`w-2.5 h-2.5 rounded-full shadow transition-all duration-300 ${
                printingProgress === 100 
                  ? 'bg-brand-green animate-pulse shadow-brand-green/80' 
                  : 'bg-brand-blue animate-ping shadow-brand-blue/80'
              }`} />
              <span className="text-[7px] text-gray-500 font-mono mt-1">STATUS</span>
            </div>
            
            {/* Error LED */}
            {errorMessage && (
              <div className="flex flex-col items-center">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-red animate-bounce" />
                <span className="text-[7px] text-gray-500 font-mono mt-1">ERROR</span>
              </div>
            )}
          </div>

          {/* Paper Slit - from here the paper scrolls out */}
          <div className="w-[84%] h-3.5 bg-[#08090d] rounded-md border-b-2 border-[#1c222a] mt-1 relative overflow-visible z-10">
            
            {/* Paper feed roll (Animated piece of printed receipts) */}
            <div 
              className="absolute left-1/2 -translate-x-1/2 bg-white text-black font-mono shadow-md flex flex-col px-3 py-4 transition-all duration-100 ease-linear rounded-t-xs"
              style={{
                width: '90%',
                top: `${-15 - (printingProgress * 1.55)}px`, // Paper moves upwards
                height: `${40 + (printingProgress * 2.1)}px`,
                fontSize: '8px',
                lineHeight: '1.2',
                borderRadius: '1px'
              }}
              id="simulated-rolling-paper"
            >
              {/* Paper textures and torn edges effect */}
              <div className="w-full flex flex-col items-start gap-1 p-1 opacity-90 overflow-hidden select-none select-all-none pointer-events-none">
                <div className="text-center w-full font-black text-[9px] tracking-wider text-brand-teal-deep pb-1 border-b border-gray-400">
                  *** AVAST GRAFICA ***
                </div>
                <div className="flex justify-between w-full mt-1">
                  <span>DOC: {job.fileName.substring(0, 16)}...</span>
                  <span>{job.id}</span>
                </div>
                <div className="w-full h-[0.5px] bg-dashed bg-gray-400 border-t border-dashed my-0.5" />
                
                {/* Print content details lines */}
                <span>Copia: {currentCopy} / {job.copies}</span>
                <span>Pagina: {currentPage} / {job.totalPages}</span>
                <span>Formato: Papel {job.paperSize}</span>
                <span>Modo: {job.colorMode === 'bw' ? 'PR-BR' : 'CORES'}</span>
                
                <div className="w-full h-[0.5px] bg-dashed bg-gray-400 border-t border-dashed my-0.5" />
                <div className="flex justify-between w-full font-bold">
                  <span>VALOR PAGO:</span>
                  <span>{job.totalPrice.toFixed(2)} MT</span>
                </div>
                <div className="text-center w-full text-[6px] text-gray-500 mt-4 font-sans font-semibold">
                  SISTEMA DE PROCESSAMENTO RAPIDO USB
                </div>
                
                {/* Visual block mock graphics representing printed content page */}
                {printingProgress > 20 && (
                  <div className="w-full mt-2 border border-gray-400 p-1 rounded flex items-center justify-center gap-1.5 h-16 bg-gray-50">
                    {job.fileType === 'Photo' || (job.fileDataUrl && job.fileDataUrl.startsWith('data:image')) ? (
                      <img src={job.fileDataUrl} className="max-h-12 w-auto object-contain brightness-95 contrast-125" alt="Preview" />
                    ) : (
                      <div className="flex flex-col gap-1 w-full text-center items-center">
                        <FileText className="w-4 h-4 text-brand-teal-mid" />
                        <span className="text-[6px] text-gray-500 text-center truncate w-full px-1">{job.fileName}</span>
                      </div>
                    )}
                  </div>
                )}
                
              </div>
            </div>

            {/* Cutter metal blade simulation */}
            <div className="absolute inset-x-2 -bottom-1 h-1 bg-gray-600 rounded-b-xs border-t border-gray-900" />
          </div>

          {/* Printer control branding text */}
          <div className="w-full text-center mt-auto flex flex-col items-center">
            <span className="text-[9px] tracking-[0.2em] font-sans font-black text-brand-gold uppercase">AVAST</span>
            <span className="text-[7px] text-gray-500 font-mono">SERIE T58-USB PRO</span>
          </div>

        </div>

        {/* Progress feedback bar */}
        <div className="w-full flex flex-col gap-2 z-10" id="progress-meter">
          <div className="flex justify-between text-xs font-semibold text-gray-300">
            <span className={printingProgress === 100 ? 'text-brand-green font-bold flex items-center gap-1' : 'animate-pulse'}>
              {printingProgress === 100 ? '✓ Concluido' : '⚙️ ' + statusText}
            </span>
            <span className="font-mono text-brand-gold">{printingProgress}%</span>
          </div>
          
          <div className="h-2 w-full bg-brand-teal-deep rounded-full border border-brand-gold/15 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-brand-red via-brand-orange to-brand-green rounded-full transition-all duration-100 ease-out"
              style={{ width: `${printingProgress}%` }}
            />
          </div>
        </div>

        {/* Errors details panel if any */}
        {errorMessage && (
          <div className="z-10 w-full p-3 rounded-lg bg-brand-red/10 border border-brand-red/30 gap-2 text-xs text-brand-red flex items-start" id="printer-error-box">
            <AlertTriangle className="w-4 h-4 text-brand-red flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Informação de Hardware</p>
              <p className="text-gray-400 mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
